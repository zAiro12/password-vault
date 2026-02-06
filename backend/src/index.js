import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './config/swagger.js';
import { generateHtmlDocs, apiEndpoints } from './utils/api-docs.js';
import authRoutes from './routes/auth.js';
import clientsRoutes from './routes/clients.js';
import resourcesRoutes from './routes/resources.js';
import credentialsRoutes from './routes/credentials.js';
import auditLogRoutes from './routes/audit-log.js';
import { printValidationResults } from './utils/env-validator.js';
import { healthCheck } from './config/database.js';

dotenv.config();

// Validate environment variables before starting the server
if (!printValidationResults()) {
  console.error('\n❌ Server cannot start due to missing environment variables.\n');
  process.exit(1);
}

const app = express();
const PORT = process.env.PORT || 3000;

// CORS configuration - allow frontend origins
const allowedOrigins = [
  'http://localhost:5173',      // Vite dev server
  'http://127.0.0.1:5173',      // Vite dev server (alternative)
  'http://localhost:3000',      // Backend server
  'http://127.0.0.1:3000',      // Backend server (alternative)
  'https://zairo12.github.io',  // GitHub Pages (root)
  /^https:\/\/zairo12\.github\.io\/password-vault\/?$/  // GitHub Pages (repository)
];

// Add custom origins from environment variable if provided
if (process.env.CORS_ORIGINS) {
  const customOrigins = process.env.CORS_ORIGINS.split(',').map(origin => origin.trim());
  allowedOrigins.push(...customOrigins);
}

const corsOptions = {
  origin: allowedOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Documentation - can be disabled in production via ENABLE_API_DOCS=false
const apiDocsEnabled = process.env.ENABLE_API_DOCS !== 'false';

if (apiDocsEnabled) {
  console.log('📚 API Documentation enabled at /swagger (Swagger UI)');
  
  // Redirect /api-docs to /swagger (Swagger UI)
  app.get('/api-docs', (req, res) => {
    res.redirect('/swagger');
  });

  // API Documentation (JSON format) - kept for programmatic access
  app.get('/api-docs/json', (req, res) => {
    res.json(apiEndpoints);
  });

  // Swagger UI with custom options
  const swaggerUiOptions = {
    swaggerOptions: {
      docExpansion: 'list', // Expand tags by default to show endpoints
      defaultModelsExpandDepth: 1, // Show models
      defaultModelExpandDepth: 3, // Expand model details
      displayRequestDuration: true, // Show request duration
      filter: true, // Enable search/filter
      tryItOutEnabled: true // Enable "Try it out" by default
    }
  };
  
  app.use('/swagger', swaggerUi.serve, swaggerUi.setup(swaggerSpec, swaggerUiOptions));
} else {
  console.log('📚 API Documentation disabled (set ENABLE_API_DOCS=true to enable)');
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Password Vault API is running' });
});

// Database health check
app.get('/health/db', async (req, res) => {
  try {
    const dbStatus = await healthCheck();
    const statusCode = dbStatus.status === 'healthy' ? 200 : 500;
    res.status(statusCode).json(dbStatus);
  } catch (error) {
    res.status(500).json({
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/clients', clientsRoutes);
app.use('/api/resources', resourcesRoutes);
app.use('/api/credentials', credentialsRoutes);
app.use('/api/audit-log', auditLogRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Password Vault API',
    version: '1.0.0',
    documentation: {
      interactive: '/api-docs',
      swagger: '/swagger',
      json: '/api-docs/json'
    },
    endpoints: {
      health: '/health',
      healthDb: '/health/db',
      auth: '/api/auth',
      clients: '/api/clients',
      resources: '/api/resources',
      credentials: '/api/credentials',
      auditLog: '/api/audit-log'
    }
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});
