import { swaggerPaths } from '../docs/swagger-paths.js';

/**
 * Password Vault API Documentation Configuration
 * Centralized OpenAPI 3.0 specification
 */

// Define the base API documentation structure
const apiDocumentation = {
  openapi: '3.0.0',
  info: {
    title: 'Password Vault Backend API',
    version: '1.0.0',
    description: 'REST API per la gestione sicura di credenziali e risorse clienti. Include autenticazione JWT, crittografia AES-256 e audit logging.',
  },
  servers: [
    {
      url: 'https://password-vault-wqj8.onrender.com',
      description: 'Server di produzione (Render.com)'
    },
    {
      url: 'http://localhost:3000',
      description: 'Server locale di sviluppo'
    }
  ]
};

// JWT Bearer authentication configuration
const jwtAuthScheme = {
  bearerAuth: {
    type: 'http',
    scheme: 'bearer',
    bearerFormat: 'JWT',
    description: 'Inserisci il token JWT ottenuto dal login (senza "Bearer" prefix)'
  }
};

// Reusable data models for the API
const dataModels = {
  ErrorResponse: {
    type: 'object',
    required: ['error', 'message'],
    properties: {
      error: { type: 'string', example: 'Validation error' },
      message: { type: 'string', example: 'Email and password are required' }
    }
  },
  UserProfile: {
    type: 'object',
    required: ['id', 'username', 'email', 'role'],
    properties: {
      id: { type: 'integer', example: 1 },
      username: { type: 'string', example: 'admin' },
      email: { type: 'string', format: 'email', example: 'admin@example.com' },
      full_name: { type: 'string', nullable: true, example: 'Admin User' },
      role: { type: 'string', enum: ['admin', 'technician', 'viewer'], example: 'admin' }
    }
  },
  ClientRecord: {
    type: 'object',
    required: ['id', 'name', 'is_active'],
    properties: {
      id: { type: 'integer', example: 1 },
      name: { type: 'string', example: 'Acme Corp' },
      description: { type: 'string', nullable: true, example: 'Client description' },
      contact_email: { type: 'string', format: 'email', nullable: true, example: 'contact@acme.com' },
      contact_phone: { type: 'string', nullable: true, example: '+39 123 456 7890' },
      is_active: { type: 'boolean', example: true },
      created_at: { type: 'string', format: 'date-time' },
      updated_at: { type: 'string', format: 'date-time' }
    }
  },
  ResourceRecord: {
    type: 'object',
    required: ['id', 'client_id', 'name', 'type'],
    properties: {
      id: { type: 'integer', example: 1 },
      client_id: { type: 'integer', example: 1 },
      name: { type: 'string', example: 'Website Production' },
      type: { type: 'string', enum: ['website', 'server', 'database', 'email', 'ftp', 'vpn', 'other'], example: 'website' },
      url: { type: 'string', nullable: true, example: 'https://example.com' },
      description: { type: 'string', nullable: true, example: 'Production website' },
      is_active: { type: 'boolean', example: true },
      created_at: { type: 'string', format: 'date-time' },
      updated_at: { type: 'string', format: 'date-time' }
    }
  },
  EncryptedCredential: {
    type: 'object',
    required: ['id', 'resource_id'],
    properties: {
      id: { type: 'integer', example: 1 },
      resource_id: { type: 'integer', example: 1 },
      username: { type: 'string', description: 'Username cifrato', example: 'encrypted_base64_string' },
      password: { type: 'string', description: 'Password cifrata', example: 'encrypted_base64_string' },
      notes: { type: 'string', nullable: true, description: 'Note cifrate', example: 'encrypted_base64_string' },
      created_at: { type: 'string', format: 'date-time' },
      updated_at: { type: 'string', format: 'date-time' },
      created_by: { type: 'integer', example: 1 }
    }
  }
};

// API endpoint categories
const endpointTags = [
  { name: 'Authentication', description: 'Gestione autenticazione utenti (register, login, logout)' },
  { name: 'Clients', description: 'CRUD operations per clienti' },
  { name: 'Resources', description: 'CRUD operations per risorse' },
  { name: 'Credentials', description: 'Gestione credenziali cifrate' },
  { name: 'Audit Log', description: 'Registro attività di sistema' },
  { name: 'Health', description: 'Controllo stato del sistema' }
];

// Build complete OpenAPI specification with all path definitions
const openapiSpecification = {
  ...apiDocumentation,
  paths: swaggerPaths,
  components: {
    securitySchemes: jwtAuthScheme,
    schemas: dataModels
  },
  tags: endpointTags
};

export default openapiSpecification;
