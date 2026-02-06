import express from 'express';

const router = express.Router();

/**
 * @swagger
 * /api/audit-log:
 *   get:
 *     tags: [Audit Log]
 *     summary: Elenco audit log
 *     description: Ottiene la lista di tutte le voci del registro attività
 *     responses:
 *       200:
 *         description: Lista voci audit log
 */
router.get('/', (req, res) => {
  res.json({ message: 'Get audit log - to be implemented', data: [] });
});

/**
 * @swagger
 * /api/audit-log/{id}:
 *   get:
 *     tags: [Audit Log]
 *     summary: Dettagli voce audit log
 *     description: Ottiene i dettagli di una voce del registro attività tramite ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Dati della voce audit log
 */
router.get('/:id', (req, res) => {
  res.json({ message: 'Get audit log entry - to be implemented', id: req.params.id });
});

/**
 * @swagger
 * /api/audit-log:
 *   post:
 *     tags: [Audit Log]
 *     summary: Crea voce audit log
 *     description: Crea una nuova voce nel registro attività
 *     responses:
 *       201:
 *         description: Voce audit log creata
 */
router.post('/', (req, res) => {
  res.json({ message: 'Create audit log entry - to be implemented' });
});

export default router;
