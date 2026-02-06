import express from 'express';
import { getAllClients, getClientById, createClient, updateClient, deleteClient } from '../controllers/clientsController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// GET /api/clients - Get all clients
router.get('/', getAllClients);

// GET /api/clients/:id - Get client by ID
router.get('/:id', getClientById);

// POST /api/clients - Create new client (protected)
router.post('/', authenticate, createClient);

// PUT /api/clients/:id - Update client (protected)
router.put('/:id', authenticate, updateClient);

// DELETE /api/clients/:id - Delete client (protected)
router.delete('/:id', authenticate, deleteClient);

export default router;
