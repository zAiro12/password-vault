import pool from '../config/database.js';

/**
 * Get all resources with optional client filter
 * GET /api/resources?client_id=X
 */
export async function getAllResources(req, res) {
  try {
    const { client_id } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    
    let whereClause = 'WHERE r.is_active = true';
    const params = [];
    
    if (client_id) {
      whereClause += ' AND r.client_id = ?';
      params.push(client_id);
    }
    
    // Get total count
    const countQuery = `
      SELECT COUNT(*) as total 
      FROM resources r 
      ${whereClause}
    `;
    const [countResult] = await pool.execute(countQuery, params);
    const total = countResult[0].total;
    
    // Get resources - build query with safe LIMIT/OFFSET
    const query = `
      SELECT r.*, c.name as client_name, u.username as created_by_username 
      FROM resources r 
      LEFT JOIN clients c ON r.client_id = c.id 
      LEFT JOIN users u ON r.created_by = u.id 
      ${whereClause}
      ORDER BY r.created_at DESC 
      LIMIT ${limit} OFFSET ${offset}
    `;
    
    const [resources] = await pool.execute(query, params);
    
    res.json({
      data: resources,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get all resources error:', error.message);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to fetch resources'
    });
  }
}

/**
 * Get resource by ID
 * GET /api/resources/:id
 */
export async function getResourceById(req, res) {
  try {
    const { id } = req.params;
    
    const [resources] = await pool.execute(
      `SELECT r.*, c.name as client_name, u.username as created_by_username 
       FROM resources r 
       LEFT JOIN clients c ON r.client_id = c.id 
       LEFT JOIN users u ON r.created_by = u.id 
       WHERE r.id = ? AND r.is_active = true`,
      [id]
    );
    
    if (resources.length === 0) {
      return res.status(404).json({
        error: 'Not found',
        message: 'Resource not found'
      });
    }
    
    res.json({ data: resources[0] });
  } catch (error) {
    console.error('Get resource by ID error:', error.message);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to fetch resource'
    });
  }
}

/**
 * Create new resource
 * POST /api/resources
 */
export async function createResource(req, res) {
  try {
    const { client_id, name, resource_type, description, hostname, ip_address, port, url, notes } = req.body;
    
    // Validate required fields
    if (!client_id || !name || !resource_type) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'client_id, name, and resource_type are required'
      });
    }
    
    // Validate resource_type
    const validTypes = ['server', 'vm', 'database', 'saas', 'other'];
    if (!validTypes.includes(resource_type)) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Invalid resource_type. Must be server, vm, database, saas, or other'
      });
    }
    
    // Validate port if provided
    if (port && (port < 1 || port > 65535)) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Port must be between 1 and 65535'
      });
    }
    
    // Check if client exists
    const [clients] = await pool.execute(
      'SELECT id FROM clients WHERE id = ? AND is_active = true',
      [client_id]
    );
    
    if (clients.length === 0) {
      return res.status(404).json({
        error: 'Not found',
        message: 'Client not found'
      });
    }
    
    const created_by = req.user ? req.user.id : null;
    
    const [result] = await pool.execute(
      `INSERT INTO resources (client_id, name, resource_type, description, hostname, ip_address, port, url, notes, created_by) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [client_id, name, resource_type, description || null, hostname || null, ip_address || null, port || null, url || null, notes || null, created_by]
    );
    
    // Fetch the created resource
    const [resources] = await pool.execute(
      `SELECT r.*, c.name as client_name, u.username as created_by_username 
       FROM resources r 
       LEFT JOIN clients c ON r.client_id = c.id 
       LEFT JOIN users u ON r.created_by = u.id 
       WHERE r.id = ?`,
      [result.insertId]
    );
    
    res.status(201).json({
      message: 'Resource created successfully',
      data: resources[0]
    });
  } catch (error) {
    console.error('Create resource error:', error.message);
    
    if (error.code === 'ER_NO_REFERENCED_ROW_2') {
      return res.status(404).json({
        error: 'Not found',
        message: 'Client not found'
      });
    }
    
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to create resource'
    });
  }
}

/**
 * Update resource
 * PUT /api/resources/:id
 */
export async function updateResource(req, res) {
  try {
    const { id } = req.params;
    const { name, resource_type, description, hostname, ip_address, port, url, notes } = req.body;
    
    // Check if resource exists
    const [existingResources] = await pool.execute(
      'SELECT id FROM resources WHERE id = ? AND is_active = true',
      [id]
    );
    
    if (existingResources.length === 0) {
      return res.status(404).json({
        error: 'Not found',
        message: 'Resource not found'
      });
    }
    
    // Validate resource_type if provided
    if (resource_type) {
      const validTypes = ['server', 'vm', 'database', 'saas', 'other'];
      if (!validTypes.includes(resource_type)) {
        return res.status(400).json({
          error: 'Validation error',
          message: 'Invalid resource_type. Must be server, vm, database, saas, or other'
        });
      }
    }
    
    // Validate port if provided
    if (port && (port < 1 || port > 65535)) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Port must be between 1 and 65535'
      });
    }
    
    // Build update query dynamically
    const updates = [];
    const values = [];
    
    if (name !== undefined) {
      updates.push('name = ?');
      values.push(name);
    }
    if (resource_type !== undefined) {
      updates.push('resource_type = ?');
      values.push(resource_type);
    }
    if (description !== undefined) {
      updates.push('description = ?');
      values.push(description);
    }
    if (hostname !== undefined) {
      updates.push('hostname = ?');
      values.push(hostname);
    }
    if (ip_address !== undefined) {
      updates.push('ip_address = ?');
      values.push(ip_address);
    }
    if (port !== undefined) {
      updates.push('port = ?');
      values.push(port);
    }
    if (url !== undefined) {
      updates.push('url = ?');
      values.push(url);
    }
    if (notes !== undefined) {
      updates.push('notes = ?');
      values.push(notes);
    }
    
    if (updates.length === 0) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'No fields to update'
      });
    }
    
    values.push(id);
    
    await pool.execute(
      `UPDATE resources SET ${updates.join(', ')} WHERE id = ?`,
      values
    );
    
    // Fetch the updated resource
    const [resources] = await pool.execute(
      `SELECT r.*, c.name as client_name, u.username as created_by_username 
       FROM resources r 
       LEFT JOIN clients c ON r.client_id = c.id 
       LEFT JOIN users u ON r.created_by = u.id 
       WHERE r.id = ?`,
      [id]
    );
    
    res.json({
      message: 'Resource updated successfully',
      data: resources[0]
    });
  } catch (error) {
    console.error('Update resource error:', error.message);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to update resource'
    });
  }
}

/**
 * Delete resource (soft delete)
 * DELETE /api/resources/:id
 */
export async function deleteResource(req, res) {
  try {
    const { id } = req.params;
    
    // Check if resource exists
    const [existingResources] = await pool.execute(
      'SELECT id FROM resources WHERE id = ? AND is_active = true',
      [id]
    );
    
    if (existingResources.length === 0) {
      return res.status(404).json({
        error: 'Not found',
        message: 'Resource not found'
      });
    }
    
    // Soft delete by setting is_active to false
    await pool.execute(
      'UPDATE resources SET is_active = false WHERE id = ?',
      [id]
    );
    
    res.json({
      message: 'Resource deleted successfully'
    });
  } catch (error) {
    console.error('Delete resource error:', error.message);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to delete resource'
    });
  }
}
