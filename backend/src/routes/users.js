import express from 'express';
import {
  getPendingUsers,
  getAllUsers,
  approveUser,
  rejectUser,
  createUser,
  deactivateUser,
  reactivateUser
} from '../controllers/usersController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication and admin role
router.use(authenticate);
router.use(authorize('admin'));

// GET /api/users/pending - Get all pending users
router.get('/pending', getPendingUsers);

// GET /api/users - Get all users
router.get('/', getAllUsers);

// POST /api/users - Create a new user
router.post('/', createUser);

// PUT /api/users/:id/approve - Approve a pending user
router.put('/:id/approve', approveUser);

// DELETE /api/users/:id/reject - Reject a pending user
router.delete('/:id/reject', rejectUser);

// PUT /api/users/:id/deactivate - Deactivate a user
router.put('/:id/deactivate', deactivateUser);

// PUT /api/users/:id/reactivate - Reactivate a user
router.put('/:id/reactivate', reactivateUser);

export default router;
