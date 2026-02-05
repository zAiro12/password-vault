import { verifyToken } from '../utils/jwt.js';

/**
 * Authentication middleware
 * Verifies JWT token from Authorization header
 * Attaches decoded user data to req.user
 */
export function authenticateToken(req, res, next) {
  try {
    // Get token from Authorization header
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.startsWith('Bearer ') 
      ? authHeader.substring(7) 
      : null;

    if (!token) {
      return res.status(401).json({ 
        error: 'Access denied. No token provided.' 
      });
    }

    // Verify token
    const decoded = verifyToken(token);
    
    // Attach user data to request
    req.user = decoded;
    
    next();
  } catch (error) {
    return res.status(401).json({ 
      error: error.message || 'Invalid or expired token' 
    });
  }
}

/**
 * Optional authentication middleware
 * Verifies token if present, but doesn't require it
 */
export function optionalAuth(req, res, next) {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.startsWith('Bearer ') 
      ? authHeader.substring(7) 
      : null;

    if (token) {
      const decoded = verifyToken(token);
      req.user = decoded;
    }
    
    next();
  } catch (error) {
    // Don't fail on invalid token for optional auth
    next();
  }
}

/**
 * Role-based authorization middleware
 * Requires user to have specific role(s)
 */
export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        error: 'Authentication required' 
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        error: 'Insufficient permissions' 
      });
    }

    next();
  };
}

export default {
  authenticateToken,
  optionalAuth,
  requireRole
};
