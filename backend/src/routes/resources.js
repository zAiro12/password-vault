import express from 'express';
import { getAllResources, getResourceById, createResource, updateResource, deleteResource } from '../controllers/resourcesController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

/**
 * @swagger
 * /api/resources:
 *   get:
 *     tags: [Resources]
 *     summary: Elenco risorse per cliente
 *     description: Ottiene la lista di tutte le risorse (richiede autenticazione)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: client_id
 *         schema:
 *           type: integer
 *         description: Filtra per ID cliente
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [website, server, database, email, ftp, vpn, other]
 *         description: Filtra per tipo di risorsa
 *     responses:
 *       200:
 *         description: Lista risorse
 *       401:
 *         description: Autenticazione richiesta
 */
router.get('/', authenticate, getAllResources);

/**
 * @swagger
 * /api/resources/{id}:
 *   get:
 *     tags: [Resources]
 *     summary: Dettagli risorsa specifica
 *     description: Ottiene i dettagli di una risorsa tramite ID (richiede autenticazione)
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
 *         description: Dati della risorsa
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ResourceRecord'
 *       404:
 *         description: Risorsa non trovata
 *       401:
 *         description: Autenticazione richiesta
 */
router.get('/:id', authenticate, getResourceById);

/**
 * @swagger
 * /api/resources:
 *   post:
 *     tags: [Resources]
 *     summary: Crea nuova risorsa
 *     description: Crea una nuova risorsa per un cliente (richiede autenticazione)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - client_id
 *               - name
 *               - type
 *             properties:
 *               client_id:
 *                 type: integer
 *                 example: 1
 *               name:
 *                 type: string
 *                 example: Website Production
 *               type:
 *                 type: string
 *                 enum: [website, server, database, email, ftp, vpn, other]
 *                 example: website
 *               url:
 *                 type: string
 *                 example: https://example.com
 *               description:
 *                 type: string
 *                 example: Sito web di produzione
 *     responses:
 *       201:
 *         description: Risorsa creata con successo
 *       400:
 *         description: Dati mancanti
 *       401:
 *         description: Autenticazione richiesta
 */
router.post('/', authenticate, createResource);

/**
 * @swagger
 * /api/resources/{id}:
 *   put:
 *     tags: [Resources]
 *     summary: Aggiorna risorsa esistente
 *     description: Modifica i dati di una risorsa esistente (richiede autenticazione)
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
 *               name:
 *                 type: string
 *               type:
 *                 type: string
 *                 enum: [website, server, database, email, ftp, vpn, other]
 *               url:
 *                 type: string
 *               description:
 *                 type: string
 *               is_active:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Risorsa aggiornata con successo
 *       404:
 *         description: Risorsa non trovata
 *       401:
 *         description: Autenticazione richiesta
 */
router.put('/:id', authenticate, updateResource);

/**
 * @swagger
 * /api/resources/{id}:
 *   delete:
 *     tags: [Resources]
 *     summary: Elimina risorsa
 *     description: Elimina una risorsa dal sistema (richiede autenticazione)
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
 *         description: Risorsa eliminata con successo
 *       404:
 *         description: Risorsa non trovata
 *       401:
 *         description: Autenticazione richiesta
 */
router.delete('/:id', authenticate, deleteResource);

export default router;
