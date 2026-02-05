import bcrypt from 'bcrypt';
import pool from '../config/database.js';
import { generateToken } from '../utils/jwt.js';

const BCRYPT_ROUNDS = parseInt(process.env.BCRYPT_ROUNDS || '10');

/**
 * Register a new user
 * POST /api/auth/register
 */
export async function register(req, res) {
  try {
    const { username, email, password, full_name, role } = req.body;
    
    // Validate required fields
    if (!username || !email || !password) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Username, email, and password are required'
      });
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Invalid email format'
      });
    }
    
    // Validate password strength (minimum 6 characters)
    if (password.length < 6) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Password must be at least 6 characters long'
      });
    }
    
    // Validate role if provided
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
    
    // Insert user into database
    try {
      const [result] = await pool.execute(
        'INSERT INTO users (username, email, password_hash, full_name, role) VALUES (?, ?, ?, ?, ?)',
        [username, email, password_hash, full_name || null, userRole]
      );
      
      // Generate JWT token
      const token = generateToken({
        userId: result.insertId,
        username,
        email,
        role: userRole
      });
      
      res.status(201).json({
        message: 'User registered successfully',
        user: {
          id: result.insertId,
          username,
          email,
          full_name: full_name || null,
          role: userRole
        },
        token
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
    console.error('Registration error:', error.message);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to register user'
    });
  }
}

/**
 * Login user
 * POST /api/auth/login
 */
export async function login(req, res) {
  try {
    const { email, password } = req.body;
    
    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Email and password are required'
      });
    }
    
    // Get user from database
    const [users] = await pool.execute(
      'SELECT id, username, email, password_hash, full_name, role, is_active FROM users WHERE email = ?',
      [email]
    );
    
    if (users.length === 0) {
      return res.status(401).json({
        error: 'Authentication failed',
        message: 'Invalid email or password'
      });
    }
    
    const user = users[0];
    
    // Check if user is active
    if (!user.is_active) {
      return res.status(401).json({
        error: 'Authentication failed',
        message: 'User account is inactive'
      });
    }
    
    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    
    if (!isValidPassword) {
      return res.status(401).json({
        error: 'Authentication failed',
        message: 'Invalid email or password'
      });
    }
    
    // Generate JWT token
    const token = generateToken({
      userId: user.id,
      username: user.username,
      email: user.email,
      role: user.role
    });
    
    res.json({
      message: 'Login successful',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        full_name: user.full_name,
        role: user.role
      },
      token
    });
  } catch (error) {
    console.error('Login error:', error.message);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to login'
    });
  }
}

/**
 * Get current user
 * GET /api/auth/me
 */
export async function getCurrentUser(req, res) {
  try {
    // User is already attached to request by auth middleware
    res.json({
      user: {
        id: req.user.id,
        username: req.user.username,
        email: req.user.email,
        full_name: req.user.full_name,
        role: req.user.role
      }
    });
  } catch (error) {
    console.error('Get current user error:', error.message);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to get current user'
    });
  }
}

/**
 * Logout user (client-side token removal)
 * POST /api/auth/logout
 */
export async function logout(req, res) {
  // JWT tokens are stateless, so logout is handled client-side
  res.json({
    message: 'Logout successful. Please remove the token from client storage.'
  });
}
