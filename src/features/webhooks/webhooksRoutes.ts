import { Router } from 'express';
import { body } from 'express-validator';
import WebhooksController from './webhooksController';

const router = Router();
const controller = new WebhooksController();

// Validações para callback
const validateCallback = [
  body('contrato_id')
    .optional()
    .isUUID()
    .withMessage('ID do contrato inválido'),
  body('status')
    .optional()
    .isString()
    .withMessage('Status deve ser uma string')
];

// Rotas
router.get('/status', controller.status);

router.post('/callback', validateCallback, controller.callback);

export default router;

