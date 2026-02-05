import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import clientsRoutes from './routes/clients.js';
import resourcesRoutes from './routes/resources.js';
import credentialsRoutes from './routes/credentials.js';
import auditLogRoutes from './routes/audit-log.js';
import { validateEnvironment, printValidationResults } from './utils/env-validator.js';

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
  /^https:\/\/zairo12\.github\.io\/password-vault\/?$/  // GitHub Pages
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

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Password Vault API is running' });
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
    endpoints: {
      health: '/health',
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
