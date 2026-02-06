import express from 'express';
import { getAllCredentials, getCredentialById, createCredential, updateCredential, deleteCredential } from '../controllers/credentialsController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

/**
 * @swagger
 * /api/credentials:
 *   get:
 *     tags: [Credentials]
 *     summary: Elenco credenziali
 *     description: Ottiene la lista di tutte le credenziali cifrate (richiede autenticazione)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: resource_id
 *         schema:
 *           type: integer
 *         description: Filtra per ID risorsa
 *     responses:
 *       200:
 *         description: Lista credenziali cifrate
 *       401:
 *         description: Autenticazione richiesta
 */
router.get('/', authenticate, getAllCredentials);

/**
 * @swagger
 * /api/credentials/{id}:
 *   get:
 *     tags: [Credentials]
 *     summary: Dettagli credenziale specifica
 *     description: Ottiene i dettagli di una credenziale cifrata tramite ID (richiede autenticazione)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Dati della credenziale
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/EncryptedCredential'
 *       404:
 *         description: Credenziale non trovata
 *       401:
 *         description: Autenticazione richiesta
 */
router.get('/:id', authenticate, getCredentialById);

/**
 * @swagger
 * /api/credentials:
 *   post:
 *     tags: [Credentials]
 *     summary: Crea nuova credenziale
 *     description: Crea una nuova credenziale cifrata per una risorsa (richiede autenticazione)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - resource_id
 *               - username
 *               - password
 *             properties:
 *               resource_id:
 *                 type: integer
 *                 example: 1
 *               username:
 *                 type: string
 *                 example: admin
 *               password:
 *                 type: string
 *                 format: password
 *                 example: MySecurePassword123!
 *               notes:
 *                 type: string
 *                 example: Accesso amministrativo
 *     responses:
 *       201:
 *         description: Credenziale creata con successo
 *       400:
 *         description: Dati mancanti
 *       401:
 *         description: Autenticazione richiesta
 */
router.post('/', authenticate, createCredential);

/**
 * @swagger
 * /api/credentials/{id}:
 *   put:
 *     tags: [Credentials]
 *     summary: Aggiorna credenziale esistente
 *     description: Modifica i dati di una credenziale cifrata esistente (richiede autenticazione)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *                 format: password
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Credenziale aggiornata con successo
 *       404:
 *         description: Credenziale non trovata
 *       401:
 *         description: Autenticazione richiesta
 */
router.put('/:id', authenticate, updateCredential);

/**
 * @swagger
 * /api/credentials/{id}:
 *   delete:
 *     tags: [Credentials]
 *     summary: Elimina credenziale
 *     description: Elimina una credenziale dal sistema (richiede autenticazione)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Credenziale eliminata con successo
 *       404:
 *         description: Credenziale non trovata
 *       401:
 *         description: Autenticazione richiesta
 */
router.delete('/:id', authenticate, deleteCredential);

export default router;
