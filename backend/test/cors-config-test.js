#!/usr/bin/env node

/**
 * CORS Configuration Validation Test
 * This test validates that the CORS configuration includes all required origins
 * without needing to start the server or connect to the database
 */

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('═'.repeat(70));
console.log('CORS Configuration Validation Test');
console.log('═'.repeat(70));
console.log();

let passed = 0;
let failed = 0;

/**
 * Read and parse the index.js file to extract allowedOrigins
 */
function extractAllowedOrigins() {
  const indexPath = join(__dirname, '..', 'src', 'index.js');
  const content = readFileSync(indexPath, 'utf-8');
  
  // Extract the allowedOrigins array
  const match = content.match(/const allowedOrigins = \[([\s\S]*?)\];/);
  if (!match) {
    throw new Error('Could not find allowedOrigins array in index.js');
  }
  
  const originsText = match[1];
  
  // Parse string origins and regex patterns
  const stringOrigins = [];
  const regexPatterns = [];
  
  // Extract string origins
  const stringMatches = originsText.matchAll(/'([^']+)'/g);
  for (const match of stringMatches) {
    stringOrigins.push(match[1]);
  }
  
  // Extract regex patterns
  const regexMatches = originsText.matchAll(/\/\^(.+?)\$\//g);
  for (const match of regexMatches) {
    regexPatterns.push(match[1]);
  }
  
  return { stringOrigins, regexPatterns };
}

/**
 * Test required origins are present
 */
function testRequiredOrigins() {
  console.log('Test 1: Required Origins Configuration');
  console.log('─'.repeat(70));
  
  try {
    const { stringOrigins, regexPatterns } = extractAllowedOrigins();
    
    // Required string origins
    const requiredStringOrigins = [
      'http://localhost:5173',
      'http://127.0.0.1:5173',
      'http://localhost:3000',
      'http://127.0.0.1:3000',
      'https://zairo12.github.io'  // Critical for production
    ];
    
    // Required regex patterns (simplified check)
    const requiredRegexSubstrings = [
      'zairo12\\.github\\.io',
      'password-vault'
    ];
    
    console.log('String Origins:');
    let allStringOriginsPresent = true;
    for (const origin of requiredStringOrigins) {
      if (stringOrigins.includes(origin)) {
        console.log(`  ✓ ${origin}`);
      } else {
        console.log(`  ✗ ${origin} - MISSING`);
        allStringOriginsPresent = false;
      }
    }
    
    console.log('\nRegex Patterns:');
    let allRegexPatternsPresent = true;
    for (const substring of requiredRegexSubstrings) {
      const found = regexPatterns.some(pattern => pattern.includes(substring));
      if (found) {
        console.log(`  ✓ Pattern contains: ${substring}`);
      } else {
        console.log(`  ✗ Pattern missing: ${substring}`);
        allRegexPatternsPresent = false;
      }
    }
    
    if (allStringOriginsPresent && allRegexPatternsPresent) {
      console.log('\n✓ All required origins are configured');
      passed++;
    } else {
      console.log('\n✗ Some required origins are missing');
      failed++;
    }
  } catch (error) {
    console.log('✗ Test failed:', error.message);
    failed++;
  }
  console.log();
}

/**
 * Test GitHub Pages origins specifically
 */
function testGitHubPagesOrigins() {
  console.log('Test 2: GitHub Pages Origins (Critical Fix)');
  console.log('─'.repeat(70));
  
  try {
    const { stringOrigins, regexPatterns } = extractAllowedOrigins();
    
    // Check for root GitHub Pages origin (the fix)
    const hasRootOrigin = stringOrigins.includes('https://zairo12.github.io');
    
    // Check for repository path pattern
    const hasRepoPattern = regexPatterns.some(pattern => 
      pattern.includes('zairo12\\.github\\.io') && 
      pattern.includes('password-vault')
    );
    
    console.log('GitHub Pages Configuration:');
    console.log(`  Root origin (https://zairo12.github.io): ${hasRootOrigin ? '✓' : '✗'}`);
    console.log(`  Repository pattern (.../password-vault): ${hasRepoPattern ? '✓' : '✗'}`);
    
    if (hasRootOrigin && hasRepoPattern) {
      console.log('\n✓ Both GitHub Pages origins configured correctly');
      console.log('  This fixes the CORS error: "No Access-Control-Allow-Origin header"');
      passed++;
    } else {
      console.log('\n✗ GitHub Pages origins not fully configured');
      if (!hasRootOrigin) {
        console.log('  Missing: https://zairo12.github.io (root origin)');
      }
      if (!hasRepoPattern) {
        console.log('  Missing: pattern for /password-vault path');
      }
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
async function runTests() {
  testRequiredOrigins();
  testGitHubPagesOrigins();
  
  // Summary
  console.log('═'.repeat(70));
  console.log('Test Summary');
  console.log('═'.repeat(70));
  console.log(`Passed: ${passed}`);
  console.log(`Failed: ${failed}`);
  console.log();
  
  if (failed === 0) {
    console.log('✅ All CORS configuration tests passed!');
    process.exit(0);
  } else {
    console.log('❌ Some CORS configuration tests failed');
    process.exit(1);
  }
}

// Run tests
runTests().catch(error => {
  console.error('Test execution failed:', error);
  process.exit(1);
});
