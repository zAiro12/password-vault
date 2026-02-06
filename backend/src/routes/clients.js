import express from 'express';
import { getAllClients, getClientById, createClient, updateClient, deleteClient } from '../controllers/clientsController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

/**
 * @swagger
 * /api/clients:
 *   get:
 *     tags: [Clients]
 *     summary: Elenco tutti i clienti
 *     description: Ottiene la lista di tutti i clienti con paginazione
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: active_only
 *         schema:
 *           type: boolean
 *           default: false
 *     responses:
 *       200:
 *         description: Lista clienti con paginazione
 */
router.get('/', getAllClients);

/**
 * @swagger
 * /api/clients/{id}:
 *   get:
 *     tags: [Clients]
 *     summary: Dettagli cliente specifico
 *     description: Ottiene i dettagli di un cliente tramite ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Dati del cliente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ClientRecord'
 *       404:
 *         description: Cliente non trovato
 */
router.get('/:id', getClientById);

/**
 * @swagger
 * /api/clients:
 *   post:
 *     tags: [Clients]
 *     summary: Crea nuovo cliente
 *     description: Crea un nuovo cliente nel sistema (richiede autenticazione)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 example: Acme Corp
 *               description:
 *                 type: string
 *                 example: Cliente importante
 *               contact_email:
 *                 type: string
 *                 format: email
 *                 example: contact@acme.com
 *               contact_phone:
 *                 type: string
 *                 example: "+39 123 456 7890"
 *     responses:
 *       201:
 *         description: Cliente creato con successo
 *       400:
 *         description: Nome mancante
 *       401:
 *         description: Autenticazione richiesta
 */
router.post('/', authenticate, createClient);

/**
 * @swagger
 * /api/clients/{id}:
 *   put:
 *     tags: [Clients]
 *     summary: Aggiorna cliente esistente
 *     description: Modifica i dati di un cliente esistente (richiede autenticazione)
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
 *               description:
 *                 type: string
 *               contact_email:
 *                 type: string
 *                 format: email
 *               contact_phone:
 *                 type: string
 *               is_active:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Cliente aggiornato con successo
 *       404:
 *         description: Cliente non trovato
 *       401:
 *         description: Autenticazione richiesta
 */
router.put('/:id', authenticate, updateClient);

/**
 * @swagger
 * /api/clients/{id}:
 *   delete:
 *     tags: [Clients]
 *     summary: Elimina cliente
 *     description: Elimina un cliente dal sistema (richiede autenticazione)
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
 *         description: Cliente eliminato con successo
 *       404:
 *         description: Cliente non trovato
 *       401:
 *         description: Autenticazione richiesta
 */
router.delete('/:id', authenticate, deleteClient);

export default router;
