import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

/**
 * Generate JWT token for user
 * @param {Object} payload - User data to encode in token
 * @param {number} payload.userId - User ID
 * @param {string} payload.email - User email
 * @param {string} payload.username - Username
 * @param {string} payload.role - User role
 * @returns {string} JWT token
 */
export function generateToken(payload) {
  if (!payload.userId || !payload.email || !payload.username) {
    throw new Error('Missing required payload fields for JWT token');
  }

  return jwt.sign(
    {
      userId: payload.userId,
      email: payload.email,
      username: payload.username,
      role: payload.role || 'technician'
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

/**
 * Verify and decode JWT token
 * @param {string} token - JWT token to verify
 * @returns {Object} Decoded token payload
 * @throws {Error} If token is invalid or expired
 */
export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new Error('Token has expired');
    }
    if (error.name === 'JsonWebTokenError') {
      throw new Error('Invalid token');
    }
    throw error;
  }
}

/**
 * Decode JWT token without verification (for debugging)
 * @param {string} token - JWT token to decode
 * @returns {Object} Decoded token payload
 */
export function decodeToken(token) {
  return jwt.decode(token);
}

export default {
  generateToken,
  verifyToken,
  decodeToken
};
