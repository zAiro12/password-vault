#!/usr/bin/env node

/**
 * Database Reset Script
 * 
 * ⚠️  CAUTION: This script drops all tables and data!
 * Only use in development/testing environments.
 * 
 * Features:
 * - Drops all tables in reverse order
 * - Optionally re-runs migrations and seeds
 * - Requires user confirmation
 * - Prevents accidental data loss
 */

import readline from 'readline';
import pool from '../src/config/database.js';
import { runMigrations } from './migrate.js';
import { runSeeds } from './seed.js';

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
};

/**
 * Print colored console output
 */
function log(message, color = '') {
  console.log(`${color}${message}${colors.reset}`);
}

/**
 * Prompt user for confirmation
 */
function askQuestion(question) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer);
    });
  });
}

/**
 * Drop all tables
 */
async function dropAllTables(connection) {
  // Disable foreign key checks temporarily
  await connection.query('SET FOREIGN_KEY_CHECKS = 0');
  
  // Tables to drop (in reverse order of dependencies)
  const tables = [
    'credentials',
    'resources',
    'clients',
    'users',
    'migrations',
    'user_client_permissions',
    'audit_log'
  ];
  
  log('Dropping tables...', colors.yellow);
  
  for (const table of tables) {
    try {
      await connection.query(`DROP TABLE IF EXISTS ${table}`);
      log(`✓ Dropped table: ${table}`, colors.green);
    } catch (error) {
      log(`⚠️  Warning: Could not drop table ${table}: ${error.message}`, colors.yellow);
    }
  }
  
  // Re-enable foreign key checks
  await connection.query('SET FOREIGN_KEY_CHECKS = 1');
  
  log('✓ All tables dropped successfully', colors.green);
}

/**
 * Reset database
 */
async function resetDatabase() {
  let connection;
  
  try {
    // Print warning header
    log('', '');
    log('⚠️  DATABASE RESET SCRIPT', colors.bright + colors.red);
    log('═'.repeat(40), colors.red);
    log('', '');
    log('This will DROP ALL TABLES and DATA!', colors.red);
    log('This action cannot be undone.', colors.red);
    log('', '');
    
    // Check environment
    const env = process.env.NODE_ENV || 'development';
    if (env === 'production') {
      log('❌ This script cannot be run in production!', colors.bright + colors.red);
      log('Set NODE_ENV to "development" or "testing" to proceed.', colors.red);
      log('', '');
      process.exit(1);
    }
    
    // Ask for confirmation
    const answer = await askQuestion('Are you sure? Type "yes" to continue: ');
    
    if (answer.toLowerCase() !== 'yes') {
      log('', '');
      log('❌ Operation cancelled', colors.yellow);
      log('', '');
      process.exit(0);
    }
    
    log('', '');
    log('🗑️  Starting database reset...', colors.cyan);
    log('', '');
    
    // Get connection from pool
    connection = await pool.getConnection();
    log('✓ Connected to database', colors.green);
    log('', '');
    
    // Drop all tables
    await dropAllTables(connection);
    log('', '');
    
    // Release connection
    connection.release();
    connection = null;
    
    // Ask if user wants to re-run migrations
    const runMig = await askQuestion('Re-run migrations? (yes/no): ');
    
    if (runMig.toLowerCase() === 'yes') {
      log('', '');
      await runMigrations();
      
      // Ask if user wants to seed data
      const runSeed = await askQuestion('\nSeed database? (yes/no): ');
      
      if (runSeed.toLowerCase() === 'yes') {
        log('', '');
        await runSeeds();
      }
    }
    
    log('', '');
    log('═'.repeat(40), colors.cyan);
    log('✅ Database reset completed!', colors.bright + colors.green);
    log('', '');
    
  } catch (error) {
    log('', '');
    log('═'.repeat(40), colors.red);
    log('❌ Database reset failed!', colors.bright + colors.red);
    log('═'.repeat(40), colors.red);
    log('', '');
    log('Error details:', colors.red);
    log(error.message, colors.red);
    log('', '');
    
    process.exit(1);
  } finally {
    if (connection) {
      connection.release();
    }
    // Close pool to allow script to exit
    await pool.end();
  }
}

// Main execution
if (import.meta.url === `file://${process.argv[1]}`) {
  resetDatabase()
    .then(() => {
      process.exit(0);
    })
    .catch(error => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
}

export { resetDatabase };
