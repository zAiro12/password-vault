#!/usr/bin/env node

/**
 * Simple API test script for authentication endpoints
 * This tests the backend without requiring a database
 */

import { generateToken, verifyToken } from '../src/utils/jwt.js';
import bcrypt from 'bcrypt';

console.log('='.repeat(60));
console.log('Authentication System - Unit Tests');
console.log('='.repeat(60));
console.log();

let passed = 0;
let failed = 0;

/**
 * Test JWT token generation and verification
 */
async function testJWT() {
  console.log('Test 1: JWT Token Generation and Verification');
  console.log('-'.repeat(60));
  
  try {
    const payload = {
      userId: 1,
      email: 'test@example.com',
      username: 'testuser',
      role: 'technician'
    };
    
    // Generate token
    const token = generateToken(payload);
    console.log('✓ Token generated successfully');
    console.log(`  Token length: ${token.length}`);
    
    // Verify token
    const decoded = verifyToken(token);
    console.log('✓ Token verified successfully');
    console.log(`  Decoded userId: ${decoded.userId}`);
    console.log(`  Decoded email: ${decoded.email}`);
    console.log(`  Decoded username: ${decoded.username}`);
    console.log(`  Decoded role: ${decoded.role}`);
    
    // Verify payload matches
    if (decoded.userId === payload.userId && 
        decoded.email === payload.email &&
        decoded.username === payload.username &&
        decoded.role === payload.role) {
      console.log('✓ Payload matches');
      passed++;
    } else {
      console.log('✗ Payload mismatch');
      failed++;
    }
  } catch (error) {
    console.log('✗ Test failed:', error.message);
    failed++;
  }
  console.log();
}

/**
 * Test invalid JWT token
 */
async function testInvalidJWT() {
  console.log('Test 2: Invalid JWT Token Handling');
  console.log('-'.repeat(60));
  
  try {
    const invalidToken = 'invalid.token.here';
    
    try {
      verifyToken(invalidToken);
      console.log('✗ Should have thrown error for invalid token');
      failed++;
    } catch (error) {
      console.log('✓ Correctly rejected invalid token');
      console.log(`  Error: ${error.message}`);
      passed++;
    }
  } catch (error) {
    console.log('✗ Test failed:', error.message);
    failed++;
  }
  console.log();
}

/**
 * Test password hashing
 */
async function testPasswordHashing() {
  console.log('Test 3: Password Hashing with bcrypt');
  console.log('-'.repeat(60));
  
  try {
    const password = 'TestPassword123';
    
    // Hash password
    const hash = await bcrypt.hash(password, 10);
    console.log('✓ Password hashed successfully');
    console.log(`  Hash length: ${hash.length}`);
    
    // Verify correct password
    const isValid = await bcrypt.compare(password, hash);
    if (isValid) {
      console.log('✓ Correct password verified');
    } else {
      console.log('✗ Password verification failed');
      failed++;
      return;
    }
    
    // Verify incorrect password
    const isInvalid = await bcrypt.compare('WrongPassword', hash);
    if (!isInvalid) {
      console.log('✓ Incorrect password rejected');
      passed++;
    } else {
      console.log('✗ Incorrect password accepted');
      failed++;
    }
  } catch (error) {
    console.log('✗ Test failed:', error.message);
    failed++;
  }
  console.log();
}

/**
 * Test password validation
 */
function testPasswordValidation() {
  console.log('Test 4: Password Validation Rules');
  console.log('-'.repeat(60));
  
  const testCases = [
    { password: 'short', valid: false, reason: 'too short' },
    { password: 'nouppercase123', valid: false, reason: 'no uppercase' },
    { password: 'NONUMBERS', valid: false, reason: 'no numbers' },
    { password: 'ValidPass123', valid: true, reason: 'valid' },
  ];
  
  let localPassed = 0;
  for (const test of testCases) {
    const hasLength = test.password.length >= 8;
    const hasNumber = /[0-9]/.test(test.password);
    const hasUppercase = /[A-Z]/.test(test.password);
    const isValid = hasLength && hasNumber && hasUppercase;
    
    if (isValid === test.valid) {
      console.log(`✓ "${test.password}" - ${test.reason}`);
      localPassed++;
    } else {
      console.log(`✗ "${test.password}" - expected ${test.valid ? 'valid' : 'invalid'}`);
    }
  }
  
  if (localPassed === testCases.length) {
    console.log('✓ All password validation tests passed');
    passed++;
  } else {
    console.log(`✗ ${testCases.length - localPassed} password validation tests failed`);
    failed++;
  }
  console.log();
}

/**
 * Run all tests
 */
async function runTests() {
  await testJWT();
  await testInvalidJWT();
  await testPasswordHashing();
  testPasswordValidation();
  
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
}

// Run tests
runTests().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
