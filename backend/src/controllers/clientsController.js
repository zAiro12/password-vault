import pool from '../config/database.js';

/**
 * Get all clients with pagination
 * GET /api/clients
 */
export async function getAllClients(req, res) {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    
    // Get total count
    const [countResult] = await pool.execute(
      'SELECT COUNT(*) as total FROM clients WHERE is_active = true'
    );
    const total = countResult[0].total;
    
    // Get clients
    const [clients] = await pool.execute(
      `SELECT c.*, u.username as created_by_username 
       FROM clients c 
       LEFT JOIN users u ON c.created_by = u.id 
       WHERE c.is_active = true 
       ORDER BY c.created_at DESC 
       LIMIT ? OFFSET ?`,
      [limit, offset]
    );
    
    res.json({
      data: clients,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get all clients error:', error.message);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to fetch clients'
    });
  }
}

/**
 * Get client by ID
 * GET /api/clients/:id
 */
export async function getClientById(req, res) {
  try {
    const { id } = req.params;
    
    const [clients] = await pool.execute(
      `SELECT c.*, u.username as created_by_username 
       FROM clients c 
       LEFT JOIN users u ON c.created_by = u.id 
       WHERE c.id = ? AND c.is_active = true`,
      [id]
    );
    
    if (clients.length === 0) {
      return res.status(404).json({
        error: 'Not found',
        message: 'Client not found'
      });
    }
    
    res.json({ data: clients[0] });
  } catch (error) {
    console.error('Get client by ID error:', error.message);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to fetch client'
    });
  }
}

/**
 * Create new client
 * POST /api/clients
 */
export async function createClient(req, res) {
  try {
    const { name, company_name, description, email, phone, address } = req.body;
    
    // Validate required fields
    if (!name) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Name is required'
      });
    }
    
    // Validate email format if provided
    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({
          error: 'Validation error',
          message: 'Invalid email format'
        });
      }
    }
    
    const created_by = req.user ? req.user.id : null;
    
    const [result] = await pool.execute(
      `INSERT INTO clients (name, company_name, description, email, phone, address, created_by) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [name, company_name || null, description || null, email || null, phone || null, address || null, created_by]
    );
    
    // Fetch the created client
    const [clients] = await pool.execute(
      `SELECT c.*, u.username as created_by_username 
       FROM clients c 
       LEFT JOIN users u ON c.created_by = u.id 
       WHERE c.id = ?`,
      [result.insertId]
    );
    
    res.status(201).json({
      message: 'Client created successfully',
      data: clients[0]
    });
  } catch (error) {
    console.error('Create client error:', error.message);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to create client'
    });
  }
}

/**
 * Update client
 * PUT /api/clients/:id
 */
export async function updateClient(req, res) {
  try {
    const { id } = req.params;
    const { name, company_name, description, email, phone, address } = req.body;
    
    // Check if client exists
    const [existingClients] = await pool.execute(
      'SELECT id FROM clients WHERE id = ? AND is_active = true',
      [id]
    );
    
    if (existingClients.length === 0) {
      return res.status(404).json({
        error: 'Not found',
        message: 'Client not found'
      });
    }
    
    // Validate email format if provided
    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({
          error: 'Validation error',
          message: 'Invalid email format'
        });
      }
    }
    
    // Build update query dynamically
    const updates = [];
    const values = [];
    
    if (name !== undefined) {
      updates.push('name = ?');
      values.push(name);
    }
    if (company_name !== undefined) {
      updates.push('company_name = ?');
      values.push(company_name);
    }
    if (description !== undefined) {
      updates.push('description = ?');
      values.push(description);
    }
    if (email !== undefined) {
      updates.push('email = ?');
      values.push(email);
    }
    if (phone !== undefined) {
      updates.push('phone = ?');
      values.push(phone);
    }
    if (address !== undefined) {
      updates.push('address = ?');
      values.push(address);
    }
    
    if (updates.length === 0) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'No fields to update'
      });
    }
    
    values.push(id);
    
    await pool.execute(
      `UPDATE clients SET ${updates.join(', ')} WHERE id = ?`,
      values
    );
    
    // Fetch the updated client
    const [clients] = await pool.execute(
      `SELECT c.*, u.username as created_by_username 
       FROM clients c 
       LEFT JOIN users u ON c.created_by = u.id 
       WHERE c.id = ?`,
      [id]
    );
    
    res.json({
      message: 'Client updated successfully',
      data: clients[0]
    });
  } catch (error) {
    console.error('Update client error:', error.message);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to update client'
    });
  }
}

/**
 * Delete client (soft delete)
 * DELETE /api/clients/:id
 */
export async function deleteClient(req, res) {
  try {
    const { id } = req.params;
    
    // Check if client exists
    const [existingClients] = await pool.execute(
      'SELECT id FROM clients WHERE id = ? AND is_active = true',
      [id]
    );
    
    if (existingClients.length === 0) {
      return res.status(404).json({
        error: 'Not found',
        message: 'Client not found'
      });
    }
    
    // Soft delete by setting is_active to false
    await pool.execute(
      'UPDATE clients SET is_active = false WHERE id = ?',
      [id]
    );
    
    res.json({
      message: 'Client deleted successfully'
    });
  } catch (error) {
    console.error('Delete client error:', error.message);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to delete client'
    });
  }
}
