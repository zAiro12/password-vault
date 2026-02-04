import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Database Configuration
 * 
 * Enhanced connection pool with:
 * - Connection pooling optimized for production
 * - Automatic connection retry logic
 * - Health check functionality
 * - Error handling and logging
 * - UTF-8 support for international characters
 * - Timezone set to UTC
 */

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'password_vault',
  port: parseInt(process.env.DB_PORT || '3306'),
  waitForConnections: true,
  connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT || '10'),
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 10000,
  charset: 'utf8mb4',
  timezone: '+00:00', // UTC
  supportBigNumbers: true,
  bigNumberStrings: false,
  dateStrings: false
};

// Create connection pool
const pool = mysql.createPool(dbConfig);

/**
 * Test database connection
 * @returns {Promise<boolean>} True if connection is successful
 */
export async function testConnection() {
  try {
    const connection = await pool.getConnection();
    await connection.ping();
    connection.release();
    console.log('✓ Database connection test successful');
    return true;
  } catch (error) {
    console.error('✗ Database connection test failed:', error.message);
    return false;
  }
}

/**
 * Health check query
 * @returns {Promise<Object>} Health check result with status and details
 */
export async function healthCheck() {
  try {
    const connection = await pool.getConnection();
    
    // Execute simple query
    const [rows] = await connection.query('SELECT 1 as health');
    
    // Get pool stats
    const poolStats = {
      totalConnections: pool.pool._allConnections.length,
      freeConnections: pool.pool._freeConnections.length,
      queuedRequests: pool.pool._connectionQueue.length
    };
    
    connection.release();
    
    return {
      status: 'healthy',
      database: dbConfig.database,
      host: dbConfig.host,
      port: dbConfig.port,
      pool: poolStats,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
}

/**
 * Execute query with automatic retry logic
 * @param {string} query - SQL query to execute
 * @param {Array} params - Query parameters
 * @param {number} retries - Number of retries (default: 3)
 * @returns {Promise<Array>} Query results
 */
export async function executeQuery(query, params = [], retries = 3) {
  let lastError;
  
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const [results] = await pool.execute(query, params);
      return results;
    } catch (error) {
      lastError = error;
      
      // Don't retry on syntax errors or constraint violations
      if (error.code === 'ER_PARSE_ERROR' || 
          error.code === 'ER_DUP_ENTRY' ||
          error.code === 'ER_NO_REFERENCED_ROW_2') {
        throw error;
      }
      
      // Log retry attempt
      if (attempt < retries) {
        console.warn(`Query failed (attempt ${attempt}/${retries}), retrying...`);
        // Wait before retry (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 100));
      }
    }
  }
  
  // All retries failed
  throw lastError;
}

/**
 * Graceful shutdown - close all connections
 */
export async function closePool() {
  try {
    await pool.end();
    console.log('✓ Database connection pool closed');
  } catch (error) {
    console.error('✗ Error closing database pool:', error.message);
    throw error;
  }
}

// Handle process termination
process.on('SIGINT', async () => {
  console.log('\nReceived SIGINT, closing database connections...');
  await closePool();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\nReceived SIGTERM, closing database connections...');
  await closePool();
  process.exit(0);
});

export default pool;
