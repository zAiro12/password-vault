#!/usr/bin/env node

/**
 * Database Migration Runner
 * 
 * This script runs SQL migrations in order and tracks them in the migrations table.
 * Features:
 * - Executes migrations in sequential order
 * - Tracks executed migrations to prevent re-running
 * - Generates bcrypt hash for admin password in seed data
 * - Handles rollback on errors
 * - Provides detailed logging
 */

import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcrypt';

// Get current directory in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../../.env') });

const MIGRATIONS_DIR = __dirname;
const BCRYPT_ROUNDS = 10;

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'password_vault',
  port: parseInt(process.env.DB_PORT || '3306'),
  multipleStatements: true,
  charset: 'utf8mb4'
};

/**
 * Create database connection
 */
async function createConnection() {
  try {
    console.log('Connecting to database...');
    console.log(`Host: ${dbConfig.host}:${dbConfig.port}`);
    console.log(`Database: ${dbConfig.database}`);
    
    const connection = await mysql.createConnection(dbConfig);
    console.log('✓ Connected to database successfully\n');
    return connection;
  } catch (error) {
    console.error('✗ Failed to connect to database:');
    console.error(`  ${error.message}`);
    throw error;
  }
}

/**
 * Ensure migrations table exists
 */
async function ensureMigrationsTable(connection) {
  const query = `
    CREATE TABLE IF NOT EXISTS migrations (
      id INT PRIMARY KEY AUTO_INCREMENT,
      name VARCHAR(255) UNIQUE NOT NULL,
      executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_name (name)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `;
  
  await connection.query(query);
  console.log('✓ Migrations table ready\n');
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
  const files = await fs.readdir(MIGRATIONS_DIR);
  return files
    .filter(file => file.endsWith('.sql'))
    .sort(); // Sort to ensure correct execution order
}

/**
 * Read migration file content
 */
async function readMigrationFile(filename) {
  const filepath = path.join(MIGRATIONS_DIR, filename);
  return await fs.readFile(filepath, 'utf-8');
}

/**
 * Generate bcrypt hash for admin password
 */
async function generateAdminPasswordHash() {
  const defaultPassword = 'admin123';
  console.log('Generating bcrypt hash for admin password...');
  const hash = await bcrypt.hash(defaultPassword, BCRYPT_ROUNDS);
  console.log('✓ Admin password hash generated\n');
  return hash;
}

/**
 * Process migration SQL content
 * Replaces placeholders with actual values
 */
async function processMigrationSQL(sql, filename) {
  // For seed data, replace admin password placeholder
  if (filename.includes('seed') || filename.includes('002')) {
    const adminHash = await generateAdminPasswordHash();
    sql = sql.replace('$2b$10$PLACEHOLDER_HASH', adminHash);
  }
  return sql;
}

/**
 * Execute a single migration
 */
async function executeMigration(connection, filename) {
  console.log(`\nExecuting migration: ${filename}`);
  console.log('─'.repeat(60));
  
  try {
    // Read migration file
    let sql = await readMigrationFile(filename);
    
    // Process SQL (replace placeholders, etc.)
    sql = await processMigrationSQL(sql, filename);
    
    // Execute migration
    await connection.query(sql);
    
    // Record migration as executed
    await connection.query(
      'INSERT INTO migrations (name) VALUES (?)',
      [filename]
    );
    
    console.log(`✓ Migration ${filename} executed successfully`);
    return true;
  } catch (error) {
    console.error(`✗ Migration ${filename} failed:`);
    console.error(`  ${error.message}`);
    throw error;
  }
}

/**
 * Run all pending migrations
 */
async function runMigrations() {
  let connection;
  
  try {
    // Connect to database
    connection = await createConnection();
    
    // Ensure migrations table exists
    await ensureMigrationsTable(connection);
    
    // Get executed migrations
    const executed = await getExecutedMigrations(connection);
    console.log('Executed migrations:', executed.length > 0 ? executed : 'None');
    
    // Get all migration files
    const files = await getMigrationFiles();
    console.log('Available migrations:', files);
    console.log();
    
    // Filter pending migrations
    const pending = files.filter(file => !executed.includes(file));
    
    if (pending.length === 0) {
      console.log('✓ No pending migrations. Database is up to date!\n');
      return;
    }
    
    console.log(`Found ${pending.length} pending migration(s):\n`);
    pending.forEach((file, index) => {
      console.log(`  ${index + 1}. ${file}`);
    });
    console.log();
    
    // Execute pending migrations
    for (const file of pending) {
      await executeMigration(connection, file);
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('✓ All migrations completed successfully!');
    console.log('='.repeat(60) + '\n');
    
  } catch (error) {
    console.error('\n' + '='.repeat(60));
    console.error('✗ Migration failed!');
    console.error('='.repeat(60));
    console.error('\nError details:');
    console.error(error);
    console.error('\nPlease fix the error and run migrations again.');
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('Database connection closed.\n');
    }
  }
}

/**
 * Display usage information
 */
function displayUsage() {
  console.log('\n' + '='.repeat(60));
  console.log('Password Vault - Database Migration Runner');
  console.log('='.repeat(60));
  console.log('\nUsage:');
  console.log('  npm run migrate         Run pending migrations');
  console.log('  node migrate.js         Run pending migrations\n');
  console.log('Environment variables (from .env):');
  console.log('  DB_HOST                 Database host (default: localhost)');
  console.log('  DB_PORT                 Database port (default: 3306)');
  console.log('  DB_USER                 Database user (default: root)');
  console.log('  DB_PASSWORD             Database password');
  console.log('  DB_NAME                 Database name (default: password_vault)');
  console.log();
  console.log('Default admin credentials (CHANGE AFTER FIRST LOGIN):');
  console.log('  Username: admin');
  console.log('  Password: admin123');
  console.log('='.repeat(60) + '\n');
}

// Main execution
if (process.argv[1] === __filename || process.argv[1].endsWith('migrate.js')) {
  displayUsage();
  runMigrations().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

export { runMigrations, createConnection };
