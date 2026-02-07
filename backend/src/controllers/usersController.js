import pool from '../config/database.js';
import bcrypt from 'bcrypt';

const BCRYPT_ROUNDS = parseInt(process.env.BCRYPT_ROUNDS || '10');

/**
 * Get all pending users (admin only)
 * GET /api/users/pending
 */
export async function getPendingUsers(req, res) {
  try {
    const [users] = await pool.execute(
      `SELECT id, username, email, full_name, role, created_at 
       FROM users 
       WHERE is_verified = false 
       ORDER BY created_at DESC`
    );
    
    res.json({
      message: 'Pending users retrieved successfully',
      users
    });
  } catch (error) {
    console.error('Get pending users error:', error.message);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to retrieve pending users'
    });
  }
}

/**
 * Get all users (admin only)
 * GET /api/users
 */
export async function getAllUsers(req, res) {
  try {
    const [users] = await pool.execute(
      `SELECT id, username, email, full_name, role, is_active, is_verified, 
              approved_by, approved_at, created_at, updated_at
       FROM users 
       ORDER BY created_at DESC`
    );
    
    res.json({
      message: 'Users retrieved successfully',
      users
    });
  } catch (error) {
    console.error('Get all users error:', error.message);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to retrieve users'
    });
  }
}

/**
 * Approve a user (admin only)
 * PUT /api/users/:id/approve
 */
export async function approveUser(req, res) {
  try {
    const userId = parseInt(req.params.id);
    const adminId = req.user.id;
    
    if (isNaN(userId)) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Invalid user ID'
      });
    }
    
    // Check if user exists
    const [users] = await pool.execute(
      'SELECT id, username, email, role, is_verified FROM users WHERE id = ?',
      [userId]
    );
    
    if (users.length === 0) {
      return res.status(404).json({
        error: 'Not found',
        message: 'User not found'
      });
    }
    
    const user = users[0];
    
    if (user.is_verified) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'User is already approved'
      });
    }
    
    // Approve user
    await pool.execute(
      'UPDATE users SET is_active = true, is_verified = true, approved_by = ?, approved_at = NOW() WHERE id = ?',
      [adminId, userId]
    );
    
    res.json({
      message: 'User approved successfully',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        is_verified: true,
        is_active: true
      }
    });
  } catch (error) {
    console.error('Approve user error:', error.message);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to approve user'
    });
  }
}

/**
 * Reject a user (admin only)
 * DELETE /api/users/:id/reject
 */
export async function rejectUser(req, res) {
  try {
    const userId = parseInt(req.params.id);
    
    if (isNaN(userId)) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Invalid user ID'
      });
    }
    
    // Check if user exists and is pending
    const [users] = await pool.execute(
      'SELECT id, username, email, is_verified FROM users WHERE id = ?',
      [userId]
    );
    
    if (users.length === 0) {
      return res.status(404).json({
        error: 'Not found',
        message: 'User not found'
      });
    }
    
    const user = users[0];
    
    if (user.is_verified) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Cannot reject an already approved user. Use deactivate instead.'
      });
    }
    
    // Delete the pending user
    await pool.execute('DELETE FROM users WHERE id = ?', [userId]);
    
    res.json({
      message: 'User registration rejected and deleted successfully',
      user: {
        id: user.id,
        username: user.username,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Reject user error:', error.message);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to reject user'
    });
  }
}

/**
 * Create a new user (admin only)
 * POST /api/users
 */
export async function createUser(req, res) {
  try {
    const { username, email, password, full_name, role } = req.body;
    const adminId = req.user.id;
    
    // Validate required fields
    if (!username || !email || !password) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Username, email, and password are required'
      });
    }
    
    // Validate role
    const validRoles = ['admin', 'technician', 'viewer'];
    const userRole = role || 'technician';
    if (!validRoles.includes(userRole)) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Invalid role. Must be admin, technician, or viewer'
      });
    }
    
    // Hash password
    const password_hash = await bcrypt.hash(password, BCRYPT_ROUNDS);
    
    // Insert user into database - admin-created users are automatically verified and active
    try {
      const [result] = await pool.execute(
        `INSERT INTO users (username, email, password_hash, full_name, role, is_active, is_verified, approved_by, approved_at) 
         VALUES (?, ?, ?, ?, ?, true, true, ?, NOW())`,
        [username, email, password_hash, full_name || null, userRole, adminId]
      );
      
      res.status(201).json({
        message: 'User created successfully',
        user: {
          id: result.insertId,
          username,
          email,
          full_name: full_name || null,
          role: userRole,
          is_verified: true,
          is_active: true
        }
      });
    } catch (dbError) {
      if (dbError.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({
          error: 'Duplicate entry',
          message: 'Username or email already exists'
        });
      }
      throw dbError;
    }
  } catch (error) {
    console.error('Create user error:', error.message);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to create user'
    });
  }
}

/**
 * Deactivate a user (admin only)
 * PUT /api/users/:id/deactivate
 */
export async function deactivateUser(req, res) {
  try {
    const userId = parseInt(req.params.id);
    const adminId = req.user.id;
    
    if (isNaN(userId)) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Invalid user ID'
      });
    }
    
    // Prevent admin from deactivating themselves
    if (userId === adminId) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'You cannot deactivate your own account'
      });
    }
    
    // Check if user exists
    const [users] = await pool.execute(
      'SELECT id, username, email, is_active FROM users WHERE id = ?',
      [userId]
    );
    
    if (users.length === 0) {
      return res.status(404).json({
        error: 'Not found',
        message: 'User not found'
      });
    }
    
    const user = users[0];
    
    if (!user.is_active) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'User is already inactive'
      });
    }
    
    // Deactivate user
    await pool.execute(
      'UPDATE users SET is_active = false WHERE id = ?',
      [userId]
    );
    
    res.json({
      message: 'User deactivated successfully',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        is_active: false
      }
    });
  } catch (error) {
    console.error('Deactivate user error:', error.message);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to deactivate user'
    });
  }
}

/**
 * Reactivate a user (admin only)
 * PUT /api/users/:id/reactivate
 */
export async function reactivateUser(req, res) {
  try {
    const userId = parseInt(req.params.id);
    
    if (isNaN(userId)) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Invalid user ID'
      });
    }
    
    // Check if user exists
    const [users] = await pool.execute(
      'SELECT id, username, email, is_active, is_verified FROM users WHERE id = ?',
      [userId]
    );
    
    if (users.length === 0) {
      return res.status(404).json({
        error: 'Not found',
        message: 'User not found'
      });
    }
    
    const user = users[0];
    
    if (user.is_active) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'User is already active'
      });
    }
    
    if (!user.is_verified) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'User must be approved first before reactivation'
      });
    }
    
    // Reactivate user
    await pool.execute(
      'UPDATE users SET is_active = true WHERE id = ?',
      [userId]
    );
    
    res.json({
      message: 'User reactivated successfully',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        is_active: true
      }
    });
  } catch (error) {
    console.error('Reactivate user error:', error.message);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to reactivate user'
    });
  }
}
