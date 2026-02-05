import crypto from 'crypto';
import dotenv from 'dotenv';

dotenv.config();

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY;
const ALGORITHM = 'aes-256-cbc';

/**
 * Validate encryption key
 */
function validateEncryptionKey() {
  if (!ENCRYPTION_KEY) {
    throw new Error('ENCRYPTION_KEY is not configured in environment variables');
  }
  
  // Ensure key is 32 bytes (64 hex characters)
  if (ENCRYPTION_KEY.length !== 64) {
    throw new Error('ENCRYPTION_KEY must be 64 hex characters (32 bytes)');
  }
}

/**
 * Encrypt a password using AES-256-CBC
 * @param {string} password - Plain text password to encrypt
 * @returns {Object} Object containing encrypted password and IV
 */
export function encryptPassword(password) {
  validateEncryptionKey();
  
  // Generate random initialization vector
  const iv = crypto.randomBytes(16);
  
  // Convert hex key to buffer
  const key = Buffer.from(ENCRYPTION_KEY, 'hex');
  
  // Create cipher
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  
  // Encrypt password
  let encrypted = cipher.update(password, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  return {
    encryptedPassword: encrypted,
    iv: iv.toString('hex')
  };
}

/**
 * Decrypt a password using AES-256-CBC
 * @param {string} encryptedPassword - Encrypted password in hex format
 * @param {string} ivHex - Initialization vector in hex format
 * @returns {string} Decrypted plain text password
 */
export function decryptPassword(encryptedPassword, ivHex) {
  validateEncryptionKey();
  
  // Convert hex strings to buffers
  const key = Buffer.from(ENCRYPTION_KEY, 'hex');
  const iv = Buffer.from(ivHex, 'hex');
  
  // Create decipher
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  
  // Decrypt password
  let decrypted = decipher.update(encryptedPassword, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
}

/**
 * Generate a secure random encryption key (for setup)
 * @returns {string} 64-character hex string (32 bytes)
 */
export function generateEncryptionKey() {
  return crypto.randomBytes(32).toString('hex');
}
