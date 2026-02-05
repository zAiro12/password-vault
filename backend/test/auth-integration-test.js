#!/usr/bin/env node

/**
 * Integration tests for authentication API endpoints
 * Tests the complete authentication flow including database operations
 * 
 * These tests require a running MySQL database with proper configuration
 */

import crypto from 'crypto';
import pool from '../src/config/database.js';
import bcrypt from 'bcrypt';

console.log('═'.repeat(70));
console.log('Authentication API - Integration Tests');
console.log('═'.repeat(70));
console.log();

let passed = 0;
let failed = 0;

const BASE_URL = `http://localhost:${process.env.PORT || 3000}`;

/**
 * Wait for server to be ready
 */
async function waitForServer(maxAttempts = 10) {
  for (let i = 0; i < maxAttempts; i++) {
    try {
      const response = await fetch(`${BASE_URL}/health`);
      if (response.ok) {
        console.log('✓ Server is ready\n');
        return true;
      }
    } catch (error) {
      // Server not ready yet
    }
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  return false;
}

/**
 * Test database connection
 */
async function testDatabaseConnection() {
  console.log('Test 1: Database Connection');
  console.log('─'.repeat(70));
  
  try {
    const connection = await pool.getConnection();
    await connection.ping();
    connection.release();
    console.log('✓ Database connection successful');
    console.log(`  Host: ${process.env.DB_HOST || 'localhost'}`);
    console.log(`  Database: ${process.env.DB_NAME || 'password_vault'}`);
    passed++;
  } catch (error) {
    console.log('✗ Database connection failed:', error.message);
    failed++;
  }
  console.log();
}

/**
 * Test environment variables
 */
function testEnvironmentVariables() {
  console.log('Test 2: Required Environment Variables');
  console.log('─'.repeat(70));
  
  const requiredVars = ['JWT_SECRET', 'ENCRYPTION_KEY', 'DB_HOST', 'DB_USER', 'DB_NAME'];
  let allPresent = true;
  
  for (const varName of requiredVars) {
    if (process.env[varName]) {
      const displayValue = varName.includes('SECRET') || varName.includes('KEY') ? '***' : process.env[varName];
      console.log(`✓ ${varName} = ${displayValue}`);
    } else {
      console.log(`✗ ${varName} is not set`);
      allPresent = false;
    }
  }
  
  if (allPresent) {
    passed++;
  } else {
    failed++;
  }
  console.log();
}

/**
 * Setup test user in database
 */
async function setupTestUser() {
  // Use crypto.randomUUID() for better uniqueness and avoid race conditions
  const uniqueId = crypto.randomUUID().split('-')[0];
  const testUser = {
    username: `test_user_${uniqueId}`,
    email: `test_${uniqueId}@example.com`,
    password: 'TestPassword123!',
    full_name: 'Test User',
    role: 'technician'
  };
  
  const password_hash = await bcrypt.hash(testUser.password, 10);
  
  try {
    const [result] = await pool.execute(
      'INSERT INTO users (username, email, password_hash, full_name, role, is_active) VALUES (?, ?, ?, ?, ?, true)',
      [testUser.username, testUser.email, password_hash, testUser.full_name, testUser.role]
    );
    
    return {
      ...testUser,
      id: result.insertId
    };
  } catch (error) {
    console.error('Failed to create test user:', error.message);
    throw error;
  }
}

/**
 * Cleanup test user from database
 */
async function cleanupTestUser(userId) {
  try {
    await pool.execute('DELETE FROM users WHERE id = ?', [userId]);
  } catch (error) {
    console.error('Failed to cleanup test user:', error.message);
  }
}

/**
 * Test successful login
 */
async function testSuccessfulLogin() {
  console.log('Test 3: Successful Login');
  console.log('─'.repeat(70));
  
  let testUser;
  try {
    // Create test user
    testUser = await setupTestUser();
    console.log(`  Created test user: ${testUser.email}`);
    
    // Attempt login
    const response = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testUser.email,
        password: testUser.password
      })
    });
    
    const data = await response.json();
    
    if (response.ok && data.token && data.user) {
      console.log('✓ Login successful');
      console.log(`  Token received: ${data.token.substring(0, 20)}...`);
      console.log(`  User ID: ${data.user.id}`);
      console.log(`  Username: ${data.user.username}`);
      console.log(`  Role: ${data.user.role}`);
      passed++;
    } else {
      console.log('✗ Login failed:', data.message || 'Unknown error');
      console.log(`  Status: ${response.status}`);
      failed++;
    }
  } catch (error) {
    console.log('✗ Test failed:', error.message);
    failed++;
  } finally {
    if (testUser) {
      await cleanupTestUser(testUser.id);
    }
  }
  console.log();
}

/**
 * Test failed login with wrong password
 */
async function testFailedLoginWrongPassword() {
  console.log('Test 4: Failed Login - Wrong Password');
  console.log('─'.repeat(70));
  
  let testUser;
  try {
    // Create test user
    testUser = await setupTestUser();
    console.log(`  Created test user: ${testUser.email}`);
    
    // Attempt login with wrong password
    const response = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testUser.email,
        password: 'WrongPassword123!'
      })
    });
    
    const data = await response.json();
    
    if (response.status === 401 && data.error) {
      console.log('✓ Login correctly rejected');
      console.log(`  Error: ${data.message}`);
      passed++;
    } else {
      console.log('✗ Login should have been rejected');
      console.log(`  Status: ${response.status}`);
      failed++;
    }
  } catch (error) {
    console.log('✗ Test failed:', error.message);
    failed++;
  } finally {
    if (testUser) {
      await cleanupTestUser(testUser.id);
    }
  }
  console.log();
}

/**
 * Test failed login with non-existent user
 */
async function testFailedLoginUserNotFound() {
  console.log('Test 5: Failed Login - User Not Found');
  console.log('─'.repeat(70));
  
  try {
    const nonExistentEmail = 'nonexistent' + crypto.randomUUID() + '@example.com';
    
    const response = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: nonExistentEmail,
        password: 'SomePassword123!'
      })
    });
    
    const data = await response.json();
    
    if (response.status === 401 && data.error) {
      console.log('✓ Login correctly rejected');
      console.log(`  Error: ${data.message}`);
      passed++;
    } else {
      console.log('✗ Login should have been rejected');
      console.log(`  Status: ${response.status}`);
      failed++;
    }
  } catch (error) {
    console.log('✗ Test failed:', error.message);
    failed++;
  }
  console.log();
}

/**
 * Test login with missing credentials
 */
async function testLoginMissingCredentials() {
  console.log('Test 6: Failed Login - Missing Credentials');
  console.log('─'.repeat(70));
  
  try {
    const response = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'test@example.com'
        // Missing password
      })
    });
    
    const data = await response.json();
    
    if (response.status === 400 && data.error) {
      console.log('✓ Request correctly rejected');
      console.log(`  Error: ${data.message}`);
      passed++;
    } else {
      console.log('✗ Request should have been rejected');
      console.log(`  Status: ${response.status}`);
      failed++;
    }
  } catch (error) {
    console.log('✗ Test failed:', error.message);
    failed++;
  }
  console.log();
}

/**
 * Test protected endpoint with valid token
 */
async function testProtectedEndpointWithToken() {
  console.log('Test 7: Protected Endpoint - Valid Token');
  console.log('─'.repeat(70));
  
  let testUser;
  try {
    // Create test user
    testUser = await setupTestUser();
    
    // Login to get token
    const loginResponse = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testUser.email,
        password: testUser.password
      })
    });
    
    const loginData = await loginResponse.json();
    const token = loginData.token;
    
    // Access protected endpoint
    const response = await fetch(`${BASE_URL}/api/auth/me`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    const data = await response.json();
    
    if (response.ok && data.user) {
      console.log('✓ Protected endpoint accessible with valid token');
      console.log(`  User: ${data.user.username}`);
      console.log(`  Email: ${data.user.email}`);
      passed++;
    } else {
      console.log('✗ Protected endpoint access failed');
      console.log(`  Status: ${response.status}`);
      failed++;
    }
  } catch (error) {
    console.log('✗ Test failed:', error.message);
    failed++;
  } finally {
    if (testUser) {
      await cleanupTestUser(testUser.id);
    }
  }
  console.log();
}

/**
 * Test protected endpoint without token
 */
async function testProtectedEndpointWithoutToken() {
  console.log('Test 8: Protected Endpoint - No Token');
  console.log('─'.repeat(70));
  
  try {
    const response = await fetch(`${BASE_URL}/api/auth/me`);
    const data = await response.json();
    
    if (response.status === 401 && data.error) {
      console.log('✓ Protected endpoint correctly rejected request without token');
      console.log(`  Error: ${data.message}`);
      passed++;
    } else {
      console.log('✗ Protected endpoint should have rejected request');
      console.log(`  Status: ${response.status}`);
      failed++;
    }
  } catch (error) {
    console.log('✗ Test failed:', error.message);
    failed++;
  }
  console.log();
}

/**
 * Test inactive user login
 */
async function testInactiveUserLogin() {
  console.log('Test 9: Failed Login - Inactive User');
  console.log('─'.repeat(70));
  
  let testUser;
  try {
    // Create test user
    testUser = await setupTestUser();
    
    // Deactivate user
    await pool.execute('UPDATE users SET is_active = false WHERE id = ?', [testUser.id]);
    console.log(`  Deactivated test user: ${testUser.email}`);
    
    // Attempt login
    const response = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testUser.email,
        password: testUser.password
      })
    });
    
    const data = await response.json();
    
    if (response.status === 401 && data.error) {
      console.log('✓ Inactive user login correctly rejected');
      console.log(`  Error: ${data.message}`);
      passed++;
    } else {
      console.log('✗ Inactive user login should have been rejected');
      console.log(`  Status: ${response.status}`);
      failed++;
    }
  } catch (error) {
    console.log('✗ Test failed:', error.message);
    failed++;
  } finally {
    if (testUser) {
      await cleanupTestUser(testUser.id);
    }
  }
  console.log();
}

/**
 * Run all tests
 */
async function runTests() {
  // Check if server is running
  console.log('Checking server availability...');
  const serverReady = await waitForServer();
  
  if (!serverReady) {
    console.error('✗ Server is not responding. Please start the server first with: npm start');
    process.exit(1);
  }
  
  // Run tests that don't require server
  testEnvironmentVariables();
  await testDatabaseConnection();
  
  // Run API tests
  await testSuccessfulLogin();
  await testFailedLoginWrongPassword();
  await testFailedLoginUserNotFound();
  await testLoginMissingCredentials();
  await testProtectedEndpointWithToken();
  await testProtectedEndpointWithoutToken();
  await testInactiveUserLogin();
  
  // Print summary
  console.log('═'.repeat(70));
  console.log('Test Summary');
  console.log('═'.repeat(70));
  console.log(`Passed: ${passed}`);
  console.log(`Failed: ${failed}`);
  console.log(`Total:  ${passed + failed}`);
  console.log();
  
  // Close database connection
  await pool.end();
  
  if (failed === 0) {
    console.log('✓ All tests passed!');
    process.exit(0);
  } else {
    console.log('✗ Some tests failed');
    process.exit(1);
  }
}

// Run tests
runTests().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
