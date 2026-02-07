#!/usr/bin/env node

/**
 * Test Script for User Approval Workflow
 * 
 * This script demonstrates and tests the user registration approval workflow.
 * 
 * Prerequisites:
 * - Backend server running on http://localhost:3000
 * - Database migrated with the latest schema
 * - Default admin user seeded (username: admin)
 * 
 * Run: node test-approval-workflow.js
 */

import fetch from 'node-fetch';

const API_BASE = 'http://localhost:3000';
let adminToken = null;
let testUserId = null;

// Helper function for API calls
async function apiCall(method, endpoint, body = null, token = null) {
  const headers = {
    'Content-Type': 'application/json'
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const options = {
    method,
    headers
  };
  
  if (body) {
    options.body = JSON.stringify(body);
  }
  
  try {
    const response = await fetch(`${API_BASE}${endpoint}`, options);
    const data = await response.json();
    return { status: response.status, data };
  } catch (error) {
    return { error: error.message };
  }
}

// Test steps
async function runTests() {
  console.log('\n🧪 Testing User Approval Workflow\n');
  console.log('='.repeat(60));
  
  // Step 1: Admin login
  console.log('\n1️⃣  Admin Login');
  console.log('-'.repeat(60));
  const loginResult = await apiCall('POST', '/api/auth/login', {
    email: 'admin@password-vault.local',
    password: process.env.ADMIN_DEFAULT_PASSWORD || 'Admin123!'
  });
  
  if (loginResult.status === 200) {
    adminToken = loginResult.data.token;
    console.log('✅ Admin login successful');
    console.log(`   Token: ${adminToken.substring(0, 20)}...`);
  } else {
    console.log('❌ Admin login failed:', loginResult.data);
    return;
  }
  
  // Step 2: Register new user
  console.log('\n2️⃣  Register New User (Self-Registration)');
  console.log('-'.repeat(60));
  const registerResult = await apiCall('POST', '/api/auth/register', {
    username: 'testuser',
    email: 'testuser@example.com',
    password: 'TestUser123!',
    full_name: 'Test User',
    role: 'technician'
  });
  
  if (registerResult.status === 201) {
    testUserId = registerResult.data.user.id;
    console.log('✅ User registered successfully');
    console.log(`   User ID: ${testUserId}`);
    console.log(`   Status: Pending approval (is_verified: ${registerResult.data.user.is_verified})`);
    console.log(`   Message: ${registerResult.data.message}`);
  } else {
    console.log('❌ User registration failed:', registerResult.data);
    return;
  }
  
  // Step 3: Try to login as unverified user
  console.log('\n3️⃣  Try Login as Unverified User');
  console.log('-'.repeat(60));
  const loginUnverifiedResult = await apiCall('POST', '/api/auth/login', {
    email: 'testuser@example.com',
    password: 'TestUser123!'
  });
  
  if (loginUnverifiedResult.status === 401) {
    console.log('✅ Login correctly blocked for unverified user');
    console.log(`   Message: ${loginUnverifiedResult.data.message}`);
  } else {
    console.log('❌ Unexpected result - unverified user should not be able to login');
  }
  
  // Step 4: Admin views pending users
  console.log('\n4️⃣  Admin Views Pending Users');
  console.log('-'.repeat(60));
  const pendingResult = await apiCall('GET', '/api/users/pending', null, adminToken);
  
  if (pendingResult.status === 200) {
    console.log('✅ Pending users retrieved');
    console.log(`   Count: ${pendingResult.data.users.length}`);
    if (pendingResult.data.users.length > 0) {
      console.log(`   Users: ${pendingResult.data.users.map(u => u.username).join(', ')}`);
    }
  } else {
    console.log('❌ Failed to retrieve pending users:', pendingResult.data);
  }
  
  // Step 5: Admin approves user
  console.log('\n5️⃣  Admin Approves User');
  console.log('-'.repeat(60));
  const approveResult = await apiCall('PUT', `/api/users/${testUserId}/approve`, null, adminToken);
  
  if (approveResult.status === 200) {
    console.log('✅ User approved successfully');
    console.log(`   User: ${approveResult.data.user.username}`);
    console.log(`   Status: Active (is_verified: ${approveResult.data.user.is_verified})`);
  } else {
    console.log('❌ Failed to approve user:', approveResult.data);
    return;
  }
  
  // Step 6: Approved user can now login
  console.log('\n6️⃣  Approved User Login');
  console.log('-'.repeat(60));
  const loginApprovedResult = await apiCall('POST', '/api/auth/login', {
    email: 'testuser@example.com',
    password: 'TestUser123!'
  });
  
  if (loginApprovedResult.status === 200) {
    console.log('✅ Approved user login successful');
    console.log(`   User: ${loginApprovedResult.data.user.username}`);
    console.log(`   Role: ${loginApprovedResult.data.user.role}`);
  } else {
    console.log('❌ Approved user login failed:', loginApprovedResult.data);
  }
  
  // Step 7: Admin creates user directly
  console.log('\n7️⃣  Admin Creates User Directly');
  console.log('-'.repeat(60));
  const createResult = await apiCall('POST', '/api/users', {
    username: 'directuser',
    email: 'directuser@example.com',
    password: 'DirectUser123!',
    full_name: 'Direct User',
    role: 'viewer'
  }, adminToken);
  
  if (createResult.status === 201) {
    console.log('✅ User created by admin successfully');
    console.log(`   User: ${createResult.data.user.username}`);
    console.log(`   Status: Active & Verified (is_verified: ${createResult.data.user.is_verified})`);
  } else {
    console.log('❌ Failed to create user:', createResult.data);
  }
  
  // Step 8: Admin-created user can login immediately
  console.log('\n8️⃣  Admin-Created User Login');
  console.log('-'.repeat(60));
  const loginDirectResult = await apiCall('POST', '/api/auth/login', {
    email: 'directuser@example.com',
    password: 'DirectUser123!'
  });
  
  if (loginDirectResult.status === 200) {
    console.log('✅ Admin-created user login successful');
    console.log(`   User: ${loginDirectResult.data.user.username}`);
    console.log(`   No approval needed!`);
  } else {
    console.log('❌ Admin-created user login failed:', loginDirectResult.data);
  }
  
  // Step 9: Admin deactivates user
  console.log('\n9️⃣  Admin Deactivates User');
  console.log('-'.repeat(60));
  const deactivateResult = await apiCall('PUT', `/api/users/${testUserId}/deactivate`, null, adminToken);
  
  if (deactivateResult.status === 200) {
    console.log('✅ User deactivated successfully');
    console.log(`   User: ${deactivateResult.data.user.username}`);
  } else {
    console.log('❌ Failed to deactivate user:', deactivateResult.data);
  }
  
  // Step 10: Try to login as deactivated user
  console.log('\n🔟 Try Login as Deactivated User');
  console.log('-'.repeat(60));
  const loginDeactivatedResult = await apiCall('POST', '/api/auth/login', {
    email: 'testuser@example.com',
    password: 'TestUser123!'
  });
  
  if (loginDeactivatedResult.status === 401) {
    console.log('✅ Login correctly blocked for deactivated user');
    console.log(`   Message: ${loginDeactivatedResult.data.message}`);
  } else {
    console.log('❌ Unexpected result - deactivated user should not be able to login');
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('✅ All tests completed!\n');
}

// Run tests
runTests().catch(error => {
  console.error('\n❌ Test script error:', error);
  process.exit(1);
});
