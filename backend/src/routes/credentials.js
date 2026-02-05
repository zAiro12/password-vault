import express from 'express';
import { getAllCredentials, getCredentialById, createCredential, updateCredential, deleteCredential } from '../controllers/credentialsController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// GET /api/credentials - Get all credentials
router.get('/', authenticate, getAllCredentials);

// GET /api/credentials/:id - Get credential by ID
router.get('/:id', authenticate, getCredentialById);

// POST /api/credentials - Create new credential
router.post('/', authenticate, createCredential);

// PUT /api/credentials/:id - Update credential
router.put('/:id', authenticate, updateCredential);

// DELETE /api/credentials/:id - Delete credential
router.delete('/:id', authenticate, deleteCredential);

export default router;
