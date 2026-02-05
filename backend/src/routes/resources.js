import express from 'express';
import { getAllResources, getResourceById, createResource, updateResource, deleteResource } from '../controllers/resourcesController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// GET /api/resources - Get all resources
router.get('/', authenticate, getAllResources);

// GET /api/resources/:id - Get resource by ID
router.get('/:id', authenticate, getResourceById);

// POST /api/resources - Create new resource
router.post('/', authenticate, createResource);

// PUT /api/resources/:id - Update resource
router.put('/:id', authenticate, updateResource);

// DELETE /api/resources/:id - Delete resource
router.delete('/:id', authenticate, deleteResource);

export default router;
