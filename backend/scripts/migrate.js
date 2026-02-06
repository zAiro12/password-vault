#!/usr/bin/env node

/**
 * Database Migration System
 * 
 * Automatically runs SQL migrations from database/migrations/ directory
 * Features:
 * - Executes migrations in alphabetical order
 * - Tracks executed migrations to prevent re-running
 * - Uses transactions for safety (rollback on error)
 * - Provides detailed console output
 * - Idempotent (safe to run multiple times)
 */

import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pool from '../src/config/database.js';

// Get current directory in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Paths
const MIGRATIONS_DIR = path.join(__dirname, '../../database/migrations');

// ANSI color codes for better console output
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
 * Ensure migrations table exists
 */
async function ensureMigrationsTable(connection) {
  const query = `
    CREATE TABLE IF NOT EXISTS migrations (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL UNIQUE,
      executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_name (name)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `;
  
  await connection.query(query);
}

/**
 * Get list of executed migrations
 */
async function getExecutedMigrations(connection) {
  const [rows] = await connection.query(
    'SELECT name FROM migrations ORDER BY executed_at'
  );
  return rows.map(row => row.name);
}

/**
 * Get list of migration files
 */
async function getMigrationFiles() {
  try {
    const files = await fs.readdir(MIGRATIONS_DIR);
    return files
      .filter(file => file.endsWith('.sql'))
      .sort(); // Alphabetical order ensures correct execution
  } catch (error) {
    if (error.code === 'ENOENT') {
      throw new Error(`Migrations directory not found: ${MIGRATIONS_DIR}`);
    }
    throw error;
  }
}

/**
 * Read migration file content
 */
async function readMigrationFile(filename) {
  const filepath = path.join(MIGRATIONS_DIR, filename);
  return await fs.readFile(filepath, 'utf-8');
}

/**
 * Execute a single migration
 */
async function executeMigration(connection, filename) {
  try {
    // Read migration file
    const sql = await readMigrationFile(filename);
    
    // Execute migration
    await connection.query(sql);
    
    // Record migration as executed
    await connection.query(
      'INSERT INTO migrations (name) VALUES (?)',
      [filename]
    );
    
    return true;
  } catch (error) {
    throw error;
  }
}

/**
 * Run all pending migrations
 */
async function runMigrations() {
  let connection;
  
  try {
    // Print header
    log('\n🗄️  Database Migration System', colors.bright + colors.cyan);
    log('═'.repeat(40), colors.cyan);
    log('');
    
    // Get connection from pool
    connection = await pool.getConnection();
    log('✓ Connected to database', colors.green);
    
    // Ensure migrations table exists
    await ensureMigrationsTable(connection);
    log('✓ Migrations table ready', colors.green);
    log('');
    
    // Get all migration files
    const files = await getMigrationFiles();
    log(`📋 Found ${files.length} migration files`, colors.blue);
    files.forEach(file => {
      log(`   - ${file}`);
    });
    log('');
    
    // Get executed migrations
    const executed = await getExecutedMigrations(connection);
    
    // Filter pending migrations
    const pending = files.filter(file => !executed.includes(file));
    
    if (pending.length === 0) {
      log('✅ All migrations already executed!', colors.green);
      log('   Database is up to date.', colors.green);
      log('');
      log('═'.repeat(40), colors.cyan);
      return;
    }
    
    // Execute pending migrations
    let successCount = 0;
    let skipCount = executed.length;
    
    for (const file of files) {
      if (executed.includes(file)) {
        log(`⏭️  Skipping: ${file} (already executed)`, colors.yellow);
      } else {
        try {
          // Use transaction for safety
          await connection.beginTransaction();
          await executeMigration(connection, file);
          await connection.commit();
          
          log(`✓ Executed: ${file}`, colors.green);
          successCount++;
        } catch (error) {
          // Rollback on error
          await connection.rollback();
          throw new Error(`Failed to execute ${file}: ${error.message}`);
        }
      }
    }
    
    log('');
    log('═'.repeat(40), colors.cyan);
    log('✅ Migration completed successfully!', colors.bright + colors.green);
    log(`   Executed: ${successCount} new migrations`, colors.green);
    log(`   Skipped: ${skipCount} already executed`, colors.yellow);
    log('');
    
  } catch (error) {
    log('');
    log('═'.repeat(40), colors.red);
    log('❌ Migration failed!', colors.bright + colors.red);
    log('═'.repeat(40), colors.red);
    log('');
    log('Error details:', colors.red);
    log(error.message, colors.red);
    log('');
    
    if (error.sql) {
      log('SQL Query:', colors.red);
      log(error.sql, colors.red);
      log('');
    }
    
    process.exit(1);
  } finally {
    if (connection) {
      connection.release();
    }
  }
}

// Main execution
if (import.meta.url === `file://${process.argv[1]}`) {
  runMigrations()
    .then(() => {
      process.exit(0);
    })
    .catch(error => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
}

export { runMigrations };
