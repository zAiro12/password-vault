import express from 'express';
import { register, login, getCurrentUser, logout } from '../controllers/authController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     tags: [Authentication]
 *     summary: Registrazione nuovo utente
 *     description: Crea un nuovo account utente nel sistema
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - email
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *                 example: mario.rossi
 *               email:
 *                 type: string
 *                 format: email
 *                 example: mario@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: SecureP@ss123!
 *               full_name:
 *                 type: string
 *                 example: Mario Rossi
 *               role:
 *                 type: string
 *                 enum: [admin, technician, viewer]
 *                 default: technician
 *     responses:
 *       201:
 *         description: Utente creato con successo
 *       400:
 *         description: Dati non validi
 *       409:
 *         description: Username o email già esistenti
 */
router.post('/register', register);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     tags: [Authentication]
 *     summary: Autenticazione utente esistente
 *     description: Login con email e password, restituisce JWT token
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: lucaairoldi92@gmail.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: Admin2026!SecureP@ss
 *     responses:
 *       200:
 *         description: Login effettuato con successo
 *       400:
 *         description: Email o password mancanti
 *       401:
 *         description: Credenziali non valide o utente disattivato
 *       500:
 *         description: Errore del server
 */
router.post('/login', login);

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     tags: [Authentication]
 *     summary: Ottieni profilo utente corrente
 *     description: Restituisce i dati dell'utente autenticato
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profilo utente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserProfile'
 *       401:
 *         description: Token mancante o non valido
 */
router.get('/me', authenticate, getCurrentUser);

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     tags: [Authentication]
 *     summary: Logout utente
 *     description: Logout (gestito lato client rimuovendo il token)
 *     responses:
 *       200:
 *         description: Logout effettuato
 */
router.post('/logout', logout);

export default router;
