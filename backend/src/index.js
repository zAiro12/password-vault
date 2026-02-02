import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import clientsRoutes from './routes/clients.js';
import resourcesRoutes from './routes/resources.js';
import credentialsRoutes from './routes/credentials.js';
import auditLogRoutes from './routes/audit-log.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
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
