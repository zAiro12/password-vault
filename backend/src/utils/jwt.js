import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

/**
 * Generate JWT token for a user
 * @param {Object} payload - User data to encode in token
 * @returns {string} JWT token
 */
export function generateToken(payload) {
  if (!JWT_SECRET) {
    throw new Error('JWT_SECRET is not configured in environment variables');
  }

  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN
  });
}

/**
 * Verify and decode JWT token
 * @param {string} token - JWT token to verify
 * @returns {Object} Decoded token payload
 */
export function verifyToken(token) {
  if (!JWT_SECRET) {
    throw new Error('JWT_SECRET is not configured in environment variables');
  }

  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
}

/**
 * Decode JWT token without verification (use with caution)
 * @param {string} token - JWT token to decode
 * @returns {Object} Decoded token payload
 */
export function decodeToken(token) {
  return jwt.decode(token);
}
