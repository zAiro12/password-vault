import dotenv from 'dotenv';

dotenv.config();

/**
 * Environment variable validation utility
 * Ensures all required environment variables are set before the application starts
 */

// Constants
const ENCRYPTION_KEY_HEX_LENGTH = 64; // 32 bytes (256 bits) in hex format
const ENCRYPTION_KEY_GEN_COMMAND = "node -e \"console.log(require('crypto').randomBytes(32).toString('hex'))\"";

const REQUIRED_ENV_VARS = {
  // Database configuration
  DB_HOST: 'Database host (e.g., localhost)',
  DB_USER: 'Database user',
  DB_NAME: 'Database name',
  
  // Security configuration
  JWT_SECRET: 'JWT secret for token signing (must be a strong, random string)',
  ENCRYPTION_KEY: `Encryption key for credential storage (must be ${ENCRYPTION_KEY_HEX_LENGTH} hex characters)`,
};

const OPTIONAL_ENV_VARS = {
  DB_PASSWORD: 'Database password (defaults to empty string)',
  DB_PORT: 'Database port (defaults to 3306)',
  DB_CONNECTION_LIMIT: 'Database connection pool limit (defaults to 10)',
  PORT: 'Server port (defaults to 3000)',
  NODE_ENV: 'Node environment (defaults to development)',
  JWT_EXPIRES_IN: 'JWT token expiration time (defaults to 24h)',
  BCRYPT_ROUNDS: 'Bcrypt hashing rounds (defaults to 10)',
  CORS_ORIGINS: 'Comma-separated list of allowed CORS origins',
  ADMIN_DEFAULT_USERNAME: 'Default admin username for first migration',
  ADMIN_DEFAULT_PASSWORD: 'Default admin password for first migration',
  ADMIN_DEFAULT_EMAIL: 'Default admin email for first migration',
};

/**
 * Validate that all required environment variables are set
 * @throws {Error} If any required environment variable is missing
 * @returns {Object} Validation result with warnings
 */
export function validateEnvironment() {
  const missing = [];
  const warnings = [];
  
  // Check required variables
  for (const [key, description] of Object.entries(REQUIRED_ENV_VARS)) {
    if (!process.env[key] || process.env[key].trim() === '') {
      missing.push({ key, description });
    }
  }
  
  // Validate JWT_SECRET strength if present
  if (process.env.JWT_SECRET) {
    if (process.env.JWT_SECRET.length < 32) {
      warnings.push({
        key: 'JWT_SECRET',
        message: 'JWT_SECRET should be at least 32 characters for security'
      });
    }
  }
  
  // Validate ENCRYPTION_KEY format if present and not already missing
  if (process.env.ENCRYPTION_KEY && process.env.ENCRYPTION_KEY.trim() !== '') {
    const encryptionKey = process.env.ENCRYPTION_KEY.trim();
    const hexPattern = new RegExp(`^[0-9a-fA-F]{${ENCRYPTION_KEY_HEX_LENGTH}}$`);
    
    if (!hexPattern.test(encryptionKey)) {
      // Remove the entry added by the empty check and replace with format error
      const emptyCheckIndex = missing.findIndex(m => m.key === 'ENCRYPTION_KEY');
      if (emptyCheckIndex !== -1) {
        missing.splice(emptyCheckIndex, 1);
      }
      missing.push({
        key: 'ENCRYPTION_KEY',
        description: `Encryption key must be exactly ${ENCRYPTION_KEY_HEX_LENGTH} hexadecimal characters (32 bytes). Generate with: ${ENCRYPTION_KEY_GEN_COMMAND}`
      });
    }
  }
  
  // Check optional variables and warn if missing in production
  if (process.env.NODE_ENV === 'production') {
    if (!process.env.DB_PASSWORD || process.env.DB_PASSWORD === '') {
      warnings.push({
        key: 'DB_PASSWORD',
        message: 'DB_PASSWORD is not set. Using empty password in production is not recommended.'
      });
    }
    
    if (!process.env.ADMIN_DEFAULT_PASSWORD || process.env.ADMIN_DEFAULT_PASSWORD === 'change-me-immediately') {
      warnings.push({
        key: 'ADMIN_DEFAULT_PASSWORD',
        message: 'ADMIN_DEFAULT_PASSWORD should be changed from the default value in production.'
      });
    }
  }
  
  // If there are missing required variables, throw error
  if (missing.length > 0) {
    const errorMessage = [
      '',
      '❌ ENVIRONMENT CONFIGURATION ERROR',
      '═'.repeat(60),
      '',
      'The following required environment variables are missing or invalid:',
      '',
      ...missing.map(({ key, description }) => `  ❌ ${key}\n     ${description}`),
      '',
      '═'.repeat(60),
      '',
      'Please set these variables in your .env file or environment.',
      'See .env.example for a template.',
      ''
    ].join('\n');
    
    throw new Error(errorMessage);
  }
  
  return {
    valid: true,
    warnings
  };
}

/**
 * Print environment validation results
 */
export function printValidationResults() {
  try {
    const result = validateEnvironment();
    
    console.log('');
    console.log('✅ Environment Configuration Valid');
    console.log('═'.repeat(60));
    console.log('');
    console.log('Required variables:');
    for (const key of Object.keys(REQUIRED_ENV_VARS)) {
      console.log(`  ✓ ${key}`);
    }
    
    if (result.warnings.length > 0) {
      console.log('');
      console.log('⚠️  Warnings:');
      for (const warning of result.warnings) {
        console.log(`  ⚠️  ${warning.key}: ${warning.message}`);
      }
    }
    
    console.log('');
    console.log('Optional variables set:');
    for (const key of Object.keys(OPTIONAL_ENV_VARS)) {
      if (process.env[key]) {
        console.log(`  ✓ ${key} = ${key.includes('PASSWORD') || key.includes('SECRET') || key.includes('KEY') ? '***' : process.env[key]}`);
      }
    }
    
    console.log('');
    console.log('═'.repeat(60));
    console.log('');
    
    return true;
  } catch (error) {
    console.error(error.message);
    return false;
  }
}

/**
 * Get a safe representation of environment variables (without sensitive data)
 */
export function getSafeEnvInfo() {
  const info = {};
  
  // Add required vars (mask sensitive ones)
  for (const key of Object.keys(REQUIRED_ENV_VARS)) {
    if (process.env[key]) {
      if (key.includes('SECRET') || key.includes('PASSWORD') || key.includes('KEY')) {
        info[key] = '***';
      } else {
        info[key] = process.env[key];
      }
    } else {
      info[key] = '[MISSING]';
    }
  }
  
  // Add some optional vars
  info.PORT = process.env.PORT || '3000';
  info.NODE_ENV = process.env.NODE_ENV || 'development';
  
  return info;
}
