/**
 * Common validation utilities
 */

/**
 * Validate email format
 * @param {string} email - Email address to validate
 * @returns {boolean} - True if email is valid
 */
export function isValidEmail(email) {
  if (!email) return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate port number
 * @param {number} port - Port number to validate
 * @returns {boolean} - True if port is valid (1-65535)
 */
export function isValidPort(port) {
  return port >= 1 && port <= 65535;
}

/**
 * Validate that required fields are present
 * @param {Object} data - Object containing fields to validate
 * @param {string[]} requiredFields - Array of required field names
 * @returns {Object} - { valid: boolean, missing: string[] }
 */
export function validateRequiredFields(data, requiredFields) {
  const missing = [];
  
  for (const field of requiredFields) {
    // Check if field is missing, null, or empty string
    const value = data[field];
    if (value === undefined || value === null || value === '') {
      missing.push(field);
    }
  }
  
  return {
    valid: missing.length === 0,
    missing
  };
}

/**
 * Validate that a value is in an allowed set
 * @param {string} value - Value to validate
 * @param {string[]} allowedValues - Array of allowed values
 * @returns {boolean} - True if value is in allowedValues
 */
export function isValidEnum(value, allowedValues) {
  return allowedValues.includes(value);
}

/**
 * Password strength validation
 * @param {string} password - Password to validate
 * @returns {Object} - { valid: boolean, errors: string[] }
 */
export function validatePasswordStrength(password) {
  const errors = [];
  
  if (!password || password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  
  // Only check complexity if password exists
  if (password && password.length >= 8) {
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    
    if (!hasUpperCase) errors.push('Password must contain at least one uppercase letter');
    if (!hasLowerCase) errors.push('Password must contain at least one lowercase letter');
    if (!hasNumber) errors.push('Password must contain at least one number');
    if (!hasSpecialChar) errors.push('Password must contain at least one special character');
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}
