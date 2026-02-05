import pool from '../config/database.js';
import { encryptPassword, decryptPassword } from '../utils/crypto.js';

/**
 * Get all credentials with optional client filter
 * GET /api/credentials?client_id=X
 */
export async function getAllCredentials(req, res) {
  try {
    const { client_id } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    
    let query = `
      SELECT cr.id, cr.resource_id, cr.credential_type, cr.username, cr.notes, 
             cr.expires_at, cr.last_rotated_at, cr.is_active, cr.created_at, cr.updated_at,
             r.name as resource_name, r.client_id, c.name as client_name, 
             u.username as created_by_username
      FROM credentials cr 
      LEFT JOIN resources r ON cr.resource_id = r.id 
      LEFT JOIN clients c ON r.client_id = c.id
      LEFT JOIN users u ON cr.created_by = u.id 
      WHERE cr.is_active = true
    `;
    const params = [];
    
    if (client_id) {
      query += ' AND r.client_id = ?';
      params.push(client_id);
    }
    
    // Get total count
    const countQuery = query.replace(
      'SELECT cr.id, cr.resource_id, cr.credential_type, cr.username, cr.notes, cr.expires_at, cr.last_rotated_at, cr.is_active, cr.created_at, cr.updated_at, r.name as resource_name, r.client_id, c.name as client_name, u.username as created_by_username',
      'SELECT COUNT(*) as total'
    );
    const [countResult] = await pool.execute(countQuery, params);
    const total = countResult[0].total;
    
    // Get credentials (without decrypted passwords)
    query += ' ORDER BY cr.created_at DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);
    
    const [credentials] = await pool.execute(query, params);
    
    // Remove sensitive fields from list view
    const sanitizedCredentials = credentials.map(cred => ({
      ...cred,
      has_password: true,
      has_ssh_key: !!cred.ssh_key
    }));
    
    res.json({
      data: sanitizedCredentials,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get all credentials error:', error.message);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to fetch credentials'
    });
  }
}

/**
 * Get credential by ID with decrypted password
 * GET /api/credentials/:id
 */
export async function getCredentialById(req, res) {
  try {
    const { id } = req.params;
    
    const [credentials] = await pool.execute(
      `SELECT cr.*, r.name as resource_name, r.client_id, c.name as client_name, 
              u.username as created_by_username
       FROM credentials cr 
       LEFT JOIN resources r ON cr.resource_id = r.id 
       LEFT JOIN clients c ON r.client_id = c.id
       LEFT JOIN users u ON cr.created_by = u.id 
       WHERE cr.id = ? AND cr.is_active = true`,
      [id]
    );
    
    if (credentials.length === 0) {
      return res.status(404).json({
        error: 'Not found',
        message: 'Credential not found'
      });
    }
    
    const credential = credentials[0];
    
    // Decrypt password
    try {
      credential.password = decryptPassword(credential.encrypted_password, credential.encryption_iv);
    } catch (decryptError) {
      console.error('Decryption error:', decryptError.message);
      return res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to decrypt password'
      });
    }
    
    // Remove encrypted fields from response
    delete credential.encrypted_password;
    delete credential.encryption_iv;
    
    res.json({ data: credential });
  } catch (error) {
    console.error('Get credential by ID error:', error.message);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to fetch credential'
    });
  }
}

/**
 * Create new credential
 * POST /api/credentials
 */
export async function createCredential(req, res) {
  try {
    const { resource_id, credential_type, username, password, ssh_key, notes, expires_at } = req.body;
    
    // Validate required fields
    if (!resource_id || !credential_type || !password) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'resource_id, credential_type, and password are required'
      });
    }
    
    // Validate credential_type
    const validTypes = ['ssh', 'database', 'admin', 'api', 'ftp', 'other'];
    if (!validTypes.includes(credential_type)) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Invalid credential_type. Must be ssh, database, admin, api, ftp, or other'
      });
    }
    
    // Check if resource exists
    const [resources] = await pool.execute(
      'SELECT id FROM resources WHERE id = ? AND is_active = true',
      [resource_id]
    );
    
    if (resources.length === 0) {
      return res.status(404).json({
        error: 'Not found',
        message: 'Resource not found'
      });
    }
    
    // Encrypt password
    let encryptedData;
    try {
      encryptedData = encryptPassword(password);
    } catch (encryptError) {
      console.error('Encryption error:', encryptError.message);
      return res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to encrypt password. Check ENCRYPTION_KEY configuration.'
      });
    }
    
    const created_by = req.user ? req.user.id : null;
    const last_rotated_at = new Date();
    
    const [result] = await pool.execute(
      `INSERT INTO credentials (resource_id, credential_type, username, encrypted_password, encryption_iv, 
                                ssh_key, notes, expires_at, last_rotated_at, created_by) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        resource_id, 
        credential_type, 
        username || null, 
        encryptedData.encryptedPassword, 
        encryptedData.iv, 
        ssh_key || null, 
        notes || null, 
        expires_at || null, 
        last_rotated_at, 
        created_by
      ]
    );
    
    // Fetch the created credential
    const [credentials] = await pool.execute(
      `SELECT cr.id, cr.resource_id, cr.credential_type, cr.username, cr.notes, 
              cr.expires_at, cr.last_rotated_at, cr.is_active, cr.created_at, cr.updated_at,
              r.name as resource_name, r.client_id, c.name as client_name, 
              u.username as created_by_username
       FROM credentials cr 
       LEFT JOIN resources r ON cr.resource_id = r.id 
       LEFT JOIN clients c ON r.client_id = c.id
       LEFT JOIN users u ON cr.created_by = u.id 
       WHERE cr.id = ?`,
      [result.insertId]
    );
    
    res.status(201).json({
      message: 'Credential created successfully',
      data: credentials[0]
    });
  } catch (error) {
    console.error('Create credential error:', error.message);
    
    if (error.code === 'ER_NO_REFERENCED_ROW_2') {
      return res.status(404).json({
        error: 'Not found',
        message: 'Resource not found'
      });
    }
    
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to create credential'
    });
  }
}

/**
 * Update credential
 * PUT /api/credentials/:id
 */
export async function updateCredential(req, res) {
  try {
    const { id } = req.params;
    const { credential_type, username, password, ssh_key, notes, expires_at } = req.body;
    
    // Check if credential exists
    const [existingCredentials] = await pool.execute(
      'SELECT id FROM credentials WHERE id = ? AND is_active = true',
      [id]
    );
    
    if (existingCredentials.length === 0) {
      return res.status(404).json({
        error: 'Not found',
        message: 'Credential not found'
      });
    }
    
    // Validate credential_type if provided
    if (credential_type) {
      const validTypes = ['ssh', 'database', 'admin', 'api', 'ftp', 'other'];
      if (!validTypes.includes(credential_type)) {
        return res.status(400).json({
          error: 'Validation error',
          message: 'Invalid credential_type. Must be ssh, database, admin, api, ftp, or other'
        });
      }
    }
    
    // Build update query dynamically
    const updates = [];
    const values = [];
    
    if (credential_type !== undefined) {
      updates.push('credential_type = ?');
      values.push(credential_type);
    }
    if (username !== undefined) {
      updates.push('username = ?');
      values.push(username);
    }
    if (password !== undefined) {
      // Encrypt new password
      try {
        const encryptedData = encryptPassword(password);
        updates.push('encrypted_password = ?', 'encryption_iv = ?', 'last_rotated_at = ?');
        values.push(encryptedData.encryptedPassword, encryptedData.iv, new Date());
      } catch (encryptError) {
        console.error('Encryption error:', encryptError.message);
        return res.status(500).json({
          error: 'Internal server error',
          message: 'Failed to encrypt password. Check ENCRYPTION_KEY configuration.'
        });
      }
    }
    if (ssh_key !== undefined) {
      updates.push('ssh_key = ?');
      values.push(ssh_key);
    }
    if (notes !== undefined) {
      updates.push('notes = ?');
      values.push(notes);
    }
    if (expires_at !== undefined) {
      updates.push('expires_at = ?');
      values.push(expires_at);
    }
    
    if (updates.length === 0) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'No fields to update'
      });
    }
    
    values.push(id);
    
    await pool.execute(
      `UPDATE credentials SET ${updates.join(', ')} WHERE id = ?`,
      values
    );
    
    // Fetch the updated credential
    const [credentials] = await pool.execute(
      `SELECT cr.id, cr.resource_id, cr.credential_type, cr.username, cr.notes, 
              cr.expires_at, cr.last_rotated_at, cr.is_active, cr.created_at, cr.updated_at,
              r.name as resource_name, r.client_id, c.name as client_name, 
              u.username as created_by_username
       FROM credentials cr 
       LEFT JOIN resources r ON cr.resource_id = r.id 
       LEFT JOIN clients c ON r.client_id = c.id
       LEFT JOIN users u ON cr.created_by = u.id 
       WHERE cr.id = ?`,
      [id]
    );
    
    res.json({
      message: 'Credential updated successfully',
      data: credentials[0]
    });
  } catch (error) {
    console.error('Update credential error:', error.message);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to update credential'
    });
  }
}

/**
 * Delete credential (soft delete)
 * DELETE /api/credentials/:id
 */
export async function deleteCredential(req, res) {
  try {
    const { id } = req.params;
    
    // Check if credential exists
    const [existingCredentials] = await pool.execute(
      'SELECT id FROM credentials WHERE id = ? AND is_active = true',
      [id]
    );
    
    if (existingCredentials.length === 0) {
      return res.status(404).json({
        error: 'Not found',
        message: 'Credential not found'
      });
    }
    
    // Soft delete by setting is_active to false
    await pool.execute(
      'UPDATE credentials SET is_active = false WHERE id = ?',
      [id]
    );
    
    res.json({
      message: 'Credential deleted successfully'
    });
  } catch (error) {
    console.error('Delete credential error:', error.message);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to delete credential'
    });
  }
}
