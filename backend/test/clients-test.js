#!/usr/bin/env node

/**
 * Client CRUD API Integration Tests
 * 
 * This test suite validates all client management endpoints:
 * - GET /api/clients - List all clients with pagination
 * - GET /api/clients/:id - Get client by ID
 * - POST /api/clients - Create new client (protected)
 * - PUT /api/clients/:id - Update client (protected)
 * - DELETE /api/clients/:id - Delete client (protected)
 * 
 * Prerequisites:
 * - Database must be running and migrations executed
 * - Environment variables configured in .env
 * - At least one user account for authentication
 */

import pool from '../src/config/database.js';
import { generateToken } from '../src/utils/jwt.js';
import bcrypt from 'bcrypt';

// Test configuration
const BASE_URL = `http://localhost:${process.env.PORT || 3000}`;
let authToken = null;
let testUserId = null;
let testClientId = null;

// Test counters
let passed = 0;
let failed = 0;

/**
 * Helper function to make HTTP requests
 */
async function request(method, path, body = null, headers = {}) {
  const url = `${BASE_URL}${path}`;
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers
    }
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(url, options);
    const data = await response.json();
    return { status: response.status, data };
  } catch (error) {
    return { status: 0, error: error.message };
  }
}

/**
 * Setup: Create test user and generate auth token
 */
async function setupTestUser() {
  console.log('Setup: Creating test user and auth token');
  console.log('-'.repeat(60));
  
  try {
    // Create a test user directly in database
    const passwordHash = await bcrypt.hash('TestPassword123', 10);
    const [result] = await pool.execute(
      `INSERT INTO users (username, email, password_hash, full_name, role) 
       VALUES (?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE id=LAST_INSERT_ID(id)`,
      ['testuser_client_api', 'testuser_client@example.com', passwordHash, 'Test User', 'technician']
    );
    
    testUserId = result.insertId || result.lastInsertId;
    
    // If the user already existed, get the ID
    if (testUserId === 0) {
      const [users] = await pool.execute(
        'SELECT id FROM users WHERE username = ?',
        ['testuser_client_api']
      );
      testUserId = users[0].id;
    }
    
    // Generate auth token
    authToken = generateToken({
      userId: testUserId,
      email: 'testuser_client@example.com',
      username: 'testuser_client_api',
      role: 'technician'
    });
    
    console.log('✓ Test user created successfully');
    console.log(`  User ID: ${testUserId}`);
    console.log(`  Auth token generated`);
    console.log();
  } catch (error) {
    console.error('✗ Failed to create test user:', error.message);
    throw error;
  }
}

/**
 * Cleanup: Remove test data
 */
async function cleanup() {
  console.log('\nCleanup: Removing test data');
  console.log('-'.repeat(60));
  
  try {
    // Delete test clients
    await pool.execute(
      'DELETE FROM clients WHERE created_by = ?',
      [testUserId]
    );
    
    // Delete test user
    await pool.execute(
      'DELETE FROM users WHERE id = ?',
      [testUserId]
    );
    
    console.log('✓ Test data cleaned up successfully');
    console.log();
  } catch (error) {
    console.error('✗ Cleanup failed:', error.message);
  }
}

/**
 * Test 1: Create new client (POST /api/clients)
 */
async function testCreateClient() {
  console.log('Test 1: Create New Client (POST /api/clients)');
  console.log('-'.repeat(60));
  
  try {
    const clientData = {
      name: 'Test Corporation',
      company_name: 'Test Corp',
      description: 'A test company for API testing',
      email: 'contact@testcorp.com',
      phone: '+1-555-0100',
      address: '123 Test Street, Test City, TC 12345'
    };
    
    const response = await request('POST', '/api/clients', clientData, {
      'Authorization': `Bearer ${authToken}`
    });
    
    if (response.status === 201) {
      console.log('✓ Client created successfully');
      console.log(`  Status: ${response.status}`);
      console.log(`  Client ID: ${response.data.data.id}`);
      console.log(`  Client Name: ${response.data.data.name}`);
      
      // Store the client ID for later tests
      testClientId = response.data.data.id;
      
      // Verify response structure
      if (response.data.data.name === clientData.name &&
          response.data.data.email === clientData.email) {
        console.log('✓ Response data matches input');
        passed++;
      } else {
        console.log('✗ Response data does not match input');
        failed++;
      }
    } else {
      console.log(`✗ Failed to create client: Status ${response.status}`);
      console.log(`  Error: ${JSON.stringify(response.data)}`);
      failed++;
    }
  } catch (error) {
    console.log('✗ Test failed:', error.message);
    failed++;
  }
  console.log();
}

/**
 * Test 2: Create client with validation error (missing name)
 */
async function testCreateClientValidationError() {
  console.log('Test 2: Create Client with Validation Error');
  console.log('-'.repeat(60));
  
  try {
    const invalidData = {
      company_name: 'Invalid Corp',
      email: 'invalid@test.com'
      // Missing required 'name' field
    };
    
    const response = await request('POST', '/api/clients', invalidData, {
      'Authorization': `Bearer ${authToken}`
    });
    
    if (response.status === 400) {
      console.log('✓ Validation error handled correctly');
      console.log(`  Status: ${response.status}`);
      console.log(`  Error message: ${response.data.message}`);
      passed++;
    } else {
      console.log(`✗ Expected status 400, got ${response.status}`);
      failed++;
    }
  } catch (error) {
    console.log('✗ Test failed:', error.message);
    failed++;
  }
  console.log();
}

/**
 * Test 3: Create client with invalid email
 */
async function testCreateClientInvalidEmail() {
  console.log('Test 3: Create Client with Invalid Email');
  console.log('-'.repeat(60));
  
  try {
    const invalidData = {
      name: 'Email Test Corp',
      email: 'invalid-email-format'
    };
    
    const response = await request('POST', '/api/clients', invalidData, {
      'Authorization': `Bearer ${authToken}`
    });
    
    if (response.status === 400) {
      console.log('✓ Invalid email rejected correctly');
      console.log(`  Status: ${response.status}`);
      console.log(`  Error message: ${response.data.message}`);
      passed++;
    } else {
      console.log(`✗ Expected status 400, got ${response.status}`);
      failed++;
    }
  } catch (error) {
    console.log('✗ Test failed:', error.message);
    failed++;
  }
  console.log();
}

/**
 * Test 4: Get all clients with pagination (GET /api/clients)
 */
async function testGetAllClients() {
  console.log('Test 4: Get All Clients with Pagination (GET /api/clients)');
  console.log('-'.repeat(60));
  
  try {
    const response = await request('GET', '/api/clients?page=1&limit=10');
    
    if (response.status === 200) {
      console.log('✓ Clients retrieved successfully');
      console.log(`  Status: ${response.status}`);
      console.log(`  Total clients: ${response.data.pagination.total}`);
      console.log(`  Current page: ${response.data.pagination.page}`);
      console.log(`  Clients on page: ${response.data.data.length}`);
      
      // Verify pagination structure
      if (response.data.pagination && 
          response.data.pagination.page === 1 &&
          Array.isArray(response.data.data)) {
        console.log('✓ Response structure is correct');
        passed++;
      } else {
        console.log('✗ Response structure is invalid');
        failed++;
      }
    } else {
      console.log(`✗ Failed to retrieve clients: Status ${response.status}`);
      failed++;
    }
  } catch (error) {
    console.log('✗ Test failed:', error.message);
    failed++;
  }
  console.log();
}

/**
 * Test 5: Get client by ID (GET /api/clients/:id)
 */
async function testGetClientById() {
  console.log('Test 5: Get Client by ID (GET /api/clients/:id)');
  console.log('-'.repeat(60));
  
  try {
    const response = await request('GET', `/api/clients/${testClientId}`);
    
    if (response.status === 200) {
      console.log('✓ Client retrieved successfully');
      console.log(`  Status: ${response.status}`);
      console.log(`  Client ID: ${response.data.data.id}`);
      console.log(`  Client Name: ${response.data.data.name}`);
      
      // Verify it's the correct client
      if (response.data.data.id === testClientId &&
          response.data.data.name === 'Test Corporation') {
        console.log('✓ Correct client data retrieved');
        passed++;
      } else {
        console.log('✗ Incorrect client data');
        failed++;
      }
    } else {
      console.log(`✗ Failed to retrieve client: Status ${response.status}`);
      failed++;
    }
  } catch (error) {
    console.log('✗ Test failed:', error.message);
    failed++;
  }
  console.log();
}

/**
 * Test 6: Get non-existent client (404 error)
 */
async function testGetNonExistentClient() {
  console.log('Test 6: Get Non-Existent Client (404 Error)');
  console.log('-'.repeat(60));
  
  try {
    const response = await request('GET', '/api/clients/999999');
    
    if (response.status === 404) {
      console.log('✓ Non-existent client handled correctly');
      console.log(`  Status: ${response.status}`);
      console.log(`  Error message: ${response.data.message}`);
      passed++;
    } else {
      console.log(`✗ Expected status 404, got ${response.status}`);
      failed++;
    }
  } catch (error) {
    console.log('✗ Test failed:', error.message);
    failed++;
  }
  console.log();
}

/**
 * Test 7: Update client (PUT /api/clients/:id)
 */
async function testUpdateClient() {
  console.log('Test 7: Update Client (PUT /api/clients/:id)');
  console.log('-'.repeat(60));
  
  try {
    const updateData = {
      name: 'Test Corporation Updated',
      description: 'Updated description for testing',
      phone: '+1-555-0200'
    };
    
    const response = await request('PUT', `/api/clients/${testClientId}`, updateData, {
      'Authorization': `Bearer ${authToken}`
    });
    
    if (response.status === 200) {
      console.log('✓ Client updated successfully');
      console.log(`  Status: ${response.status}`);
      console.log(`  Updated Name: ${response.data.data.name}`);
      console.log(`  Updated Phone: ${response.data.data.phone}`);
      
      // Verify updates were applied
      if (response.data.data.name === updateData.name &&
          response.data.data.phone === updateData.phone) {
        console.log('✓ Updates applied correctly');
        passed++;
      } else {
        console.log('✗ Updates not applied correctly');
        failed++;
      }
    } else {
      console.log(`✗ Failed to update client: Status ${response.status}`);
      failed++;
    }
  } catch (error) {
    console.log('✗ Test failed:', error.message);
    failed++;
  }
  console.log();
}

/**
 * Test 8: Update client with no fields (validation error)
 */
async function testUpdateClientNoFields() {
  console.log('Test 8: Update Client with No Fields (Validation Error)');
  console.log('-'.repeat(60));
  
  try {
    const emptyUpdate = {};
    
    const response = await request('PUT', `/api/clients/${testClientId}`, emptyUpdate, {
      'Authorization': `Bearer ${authToken}`
    });
    
    if (response.status === 400) {
      console.log('✓ Empty update rejected correctly');
      console.log(`  Status: ${response.status}`);
      console.log(`  Error message: ${response.data.message}`);
      passed++;
    } else {
      console.log(`✗ Expected status 400, got ${response.status}`);
      failed++;
    }
  } catch (error) {
    console.log('✗ Test failed:', error.message);
    failed++;
  }
  console.log();
}

/**
 * Test 9: Update non-existent client (404 error)
 */
async function testUpdateNonExistentClient() {
  console.log('Test 9: Update Non-Existent Client (404 Error)');
  console.log('-'.repeat(60));
  
  try {
    const updateData = { name: 'Does Not Exist' };
    
    const response = await request('PUT', '/api/clients/999999', updateData, {
      'Authorization': `Bearer ${authToken}`
    });
    
    if (response.status === 404) {
      console.log('✓ Non-existent client update handled correctly');
      console.log(`  Status: ${response.status}`);
      console.log(`  Error message: ${response.data.message}`);
      passed++;
    } else {
      console.log(`✗ Expected status 404, got ${response.status}`);
      failed++;
    }
  } catch (error) {
    console.log('✗ Test failed:', error.message);
    failed++;
  }
  console.log();
}

/**
 * Test 10: Delete client (DELETE /api/clients/:id)
 */
async function testDeleteClient() {
  console.log('Test 10: Delete Client (DELETE /api/clients/:id)');
  console.log('-'.repeat(60));
  
  try {
    const response = await request('DELETE', `/api/clients/${testClientId}`, null, {
      'Authorization': `Bearer ${authToken}`
    });
    
    if (response.status === 200) {
      console.log('✓ Client deleted successfully');
      console.log(`  Status: ${response.status}`);
      console.log(`  Message: ${response.data.message}`);
      
      // Verify the client is soft-deleted (is_active = false)
      const [clients] = await pool.execute(
        'SELECT is_active FROM clients WHERE id = ?',
        [testClientId]
      );
      
      if (clients.length > 0 && clients[0].is_active === 0) {
        console.log('✓ Client soft-deleted correctly (is_active = false)');
        passed++;
      } else {
        console.log('✗ Client not soft-deleted correctly');
        failed++;
      }
    } else {
      console.log(`✗ Failed to delete client: Status ${response.status}`);
      failed++;
    }
  } catch (error) {
    console.log('✗ Test failed:', error.message);
    failed++;
  }
  console.log();
}

/**
 * Test 11: Delete non-existent client (404 error)
 */
async function testDeleteNonExistentClient() {
  console.log('Test 11: Delete Non-Existent Client (404 Error)');
  console.log('-'.repeat(60));
  
  try {
    const response = await request('DELETE', '/api/clients/999999', null, {
      'Authorization': `Bearer ${authToken}`
    });
    
    if (response.status === 404) {
      console.log('✓ Non-existent client deletion handled correctly');
      console.log(`  Status: ${response.status}`);
      console.log(`  Error message: ${response.data.message}`);
      passed++;
    } else {
      console.log(`✗ Expected status 404, got ${response.status}`);
      failed++;
    }
  } catch (error) {
    console.log('✗ Test failed:', error.message);
    failed++;
  }
  console.log();
}

/**
 * Test 12: Attempt to create client without authentication (401 error)
 */
async function testCreateClientNoAuth() {
  console.log('Test 12: Create Client without Authentication (401 Error)');
  console.log('-'.repeat(60));
  
  try {
    const clientData = {
      name: 'Unauthorized Corp',
      email: 'unauth@test.com'
    };
    
    const response = await request('POST', '/api/clients', clientData);
    
    if (response.status === 401) {
      console.log('✓ Unauthorized request rejected correctly');
      console.log(`  Status: ${response.status}`);
      passed++;
    } else {
      console.log(`✗ Expected status 401, got ${response.status}`);
      failed++;
    }
  } catch (error) {
    console.log('✗ Test failed:', error.message);
    failed++;
  }
  console.log();
}

/**
 * Test 13: Pagination validation (invalid parameters)
 */
async function testPaginationValidation() {
  console.log('Test 13: Pagination Validation (Invalid Parameters)');
  console.log('-'.repeat(60));
  
  try {
    // Test with invalid limit (too large)
    const response = await request('GET', '/api/clients?page=1&limit=1000');
    
    // The API should clamp to max 100, not return an error
    if (response.status === 200) {
      console.log('✓ Pagination handled correctly');
      console.log(`  Status: ${response.status}`);
      console.log(`  Limit applied: ${response.data.pagination.limit}`);
      
      // Verify limit is clamped to 100
      if (response.data.pagination.limit <= 100) {
        console.log('✓ Limit clamped to maximum (100)');
        passed++;
      } else {
        console.log('✗ Limit not clamped correctly');
        failed++;
      }
    } else {
      console.log(`✗ Unexpected status: ${response.status}`);
      failed++;
    }
  } catch (error) {
    console.log('✗ Test failed:', error.message);
    failed++;
  }
  console.log();
}

/**
 * Run all tests
 */
async function runAllTests() {
  console.log('='.repeat(60));
  console.log('Client CRUD API - Integration Tests');
  console.log('='.repeat(60));
  console.log();
  
  try {
    // Setup
    await setupTestUser();
    
    // Run tests in sequence
    await testCreateClient();
    await testCreateClientValidationError();
    await testCreateClientInvalidEmail();
    await testGetAllClients();
    await testGetClientById();
    await testGetNonExistentClient();
    await testUpdateClient();
    await testUpdateClientNoFields();
    await testUpdateNonExistentClient();
    await testDeleteClient();
    await testDeleteNonExistentClient();
    await testCreateClientNoAuth();
    await testPaginationValidation();
    
    // Cleanup
    await cleanup();
    
    // Summary
    console.log('='.repeat(60));
    console.log('Test Summary');
    console.log('='.repeat(60));
    console.log(`Passed: ${passed}`);
    console.log(`Failed: ${failed}`);
    console.log(`Total:  ${passed + failed}`);
    console.log();
    
    if (failed === 0) {
      console.log('✓ All tests passed!');
      process.exit(0);
    } else {
      console.log('✗ Some tests failed');
      process.exit(1);
    }
  } catch (error) {
    console.error('Fatal error:', error);
    await cleanup();
    process.exit(1);
  } finally {
    // Close database connection
    await pool.end();
  }
}

// Run tests
runAllTests().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
