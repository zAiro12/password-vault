#!/usr/bin/env node

/**
 * Database Seeding Script
 * 
 * Seeds the database with initial data
 * Features:
 * - Reads seed files from database/seeds/
 * - Hashes admin password with bcrypt
 * - Checks if data already exists before inserting
 * - Idempotent (safe to run multiple times)
 */

import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcrypt';
import pool from '../src/config/database.js';

// Get current directory in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Paths
const SEEDS_DIR = path.join(__dirname, '../../database/seeds');
const BCRYPT_ROUNDS = parseInt(process.env.BCRYPT_ROUNDS || '10');

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
 * Get list of seed files
 */
async function getSeedFiles() {
  try {
    const files = await fs.readdir(SEEDS_DIR);
    return files
      .filter(file => file.endsWith('.sql'))
      .sort(); // Alphabetical order
  } catch (error) {
    if (error.code === 'ENOENT') {
      throw new Error(`Seeds directory not found: ${SEEDS_DIR}`);
    }
    throw error;
  }
}

/**
 * Read seed file content
 */
async function readSeedFile(filename) {
  const filepath = path.join(SEEDS_DIR, filename);
  return await fs.readFile(filepath, 'utf-8');
}

/**
 * Process seed SQL with replacements
 */
async function processSeedSQL(sql) {
  // Generate bcrypt hash for admin password
  const adminPassword = process.env.ADMIN_DEFAULT_PASSWORD || 'Admin2026!SecureP@ss';
  const passwordHash = await bcrypt.hash(adminPassword, BCRYPT_ROUNDS);
  
  // Replace placeholder with actual hash
  sql = sql.replace('PLACEHOLDER_HASH', passwordHash);
  
  return sql;
}

/**
 * Execute seed file
 */
async function executeSeed(connection, filename) {
  try {
    // Read seed file
    let sql = await readSeedFile(filename);
    
    // Process SQL (replace placeholders)
    sql = await processSeedSQL(sql);
    
    // Execute seed
    const [result] = await connection.query(sql);
    
    // Check if any rows were inserted
    const inserted = result.affectedRows > 0;
    
    return inserted;
  } catch (error) {
    throw error;
  }
}

/**
 * Run all seed files
 */
async function runSeeds() {
  let connection;
  
  try {
    // Print header
    log('\n🌱 Database Seeding', colors.bright + colors.cyan);
    log('═'.repeat(40), colors.cyan);
    log('');
    
    // Get connection from pool
    connection = await pool.getConnection();
    log('✓ Connected to database', colors.green);
    log('');
    
    // Get all seed files
    const files = await getSeedFiles();
    
    if (files.length === 0) {
      log('⚠️  No seed files found', colors.yellow);
      log('');
      log('═'.repeat(40), colors.cyan);
      return;
    }
    
    log(`📋 Found ${files.length} seed file(s)`, colors.blue);
    files.forEach(file => {
      log(`   - ${file}`);
    });
    log('');
    
    // Execute seed files
    let insertedCount = 0;
    let skippedCount = 0;
    
    for (const file of files) {
      try {
        log(`Processing: ${file}`, colors.blue);
        
        const inserted = await executeSeed(connection, file);
        
        if (inserted) {
          log(`✓ Seeded: ${file}`, colors.green);
          insertedCount++;
        } else {
          log(`⏭️  Skipped: ${file} (data already exists)`, colors.yellow);
          skippedCount++;
        }
      } catch (error) {
        throw new Error(`Failed to seed ${file}: ${error.message}`);
      }
    }
    
    log('');
    log('═'.repeat(40), colors.cyan);
    log('✅ Seeding completed successfully!', colors.bright + colors.green);
    log(`   Inserted: ${insertedCount} seed(s)`, colors.green);
    log(`   Skipped: ${skippedCount} (already exists)`, colors.yellow);
    log('');
    
    // Show default credentials if admin was seeded
    if (insertedCount > 0) {
      log('📝 Default Admin Credentials:', colors.cyan);
      log('   Username: admin', colors.cyan);
      log('   Password: (set via ADMIN_DEFAULT_PASSWORD env variable)', colors.cyan);
      log('   ⚠️  Change password immediately after first login!', colors.yellow);
      log('');
    }
    
  } catch (error) {
    log('');
    log('═'.repeat(40), colors.red);
    log('❌ Seeding failed!', colors.bright + colors.red);
    log('═'.repeat(40), colors.red);
    log('');
    log('Error details:', colors.red);
    log(error.message, colors.red);
    log('');
    
    process.exit(1);
  } finally {
    if (connection) {
      connection.release();
    }
  }
}

// Main execution
if (import.meta.url === `file://${process.argv[1]}`) {
  runSeeds()
    .then(() => {
      process.exit(0);
    })
    .catch(error => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
}

export { runSeeds };
