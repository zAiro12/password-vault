import { verifyToken } from '../utils/jwt.js';
import pool from '../config/database.js';

/**
 * Authentication middleware
 * Verifies JWT token and attaches user to request object
 */
export async function authenticate(req, res, next) {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'Authentication required',
        message: 'No token provided'
      });
    }
    
    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    
    // Verify token
    let decoded;
    try {
      decoded = verifyToken(token);
    } catch (error) {
      return res.status(401).json({
        error: 'Authentication failed',
        message: 'Invalid or expired token'
      });
    }
    
    // Get user from database
    const [users] = await pool.execute(
      'SELECT id, username, email, full_name, role, is_active FROM users WHERE id = ? AND is_active = true',
      [decoded.userId]
    );
    
    if (users.length === 0) {
      return res.status(401).json({
        error: 'Authentication failed',
        message: 'User not found or inactive'
      });
    }
    
    // Attach user to request
    req.user = users[0];
    next();
  } catch (error) {
    console.error('Authentication error:', error.message);
    return res.status(500).json({
      error: 'Internal server error',
      message: 'Authentication failed'
    });
  }
}

/**
 * Authorization middleware - check if user has required role
 * @param {Array<string>} allowedRoles - Array of allowed roles
 */
export function authorize(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Authentication required',
        message: 'User not authenticated'
      });
    }
    
    if (allowedRoles.length > 0 && !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        error: 'Authorization failed',
        message: 'Insufficient permissions'
      });
    }
    
    next();
  };
}
