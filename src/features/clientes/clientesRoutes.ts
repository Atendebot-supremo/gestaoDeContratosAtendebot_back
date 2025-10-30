import { Router } from 'express';
import { body, param, query } from 'express-validator';
import ClientesController from './clientesController';
import { validateCNPJ } from '../../utils/cnpjValidator';

const router = Router();
const controller = new ClientesController();

// Validação customizada de CNPJ
const validateCNPJField = (value: string) => {
  if (!value) {
    throw new Error('CNPJ é obrigatório');
  }
  if (!validateCNPJ(value)) {
    throw new Error('CNPJ inválido');
  }
  return true;
};

// Validações
const validateCreateCliente = [
  body('razao_social')
    .notEmpty()
    .withMessage('Razão social é obrigatória')
    .trim()
    .isLength({ min: 3 })
    .withMessage('Razão social deve ter pelo menos 3 caracteres'),
  body('cnpj')
    .custom(validateCNPJField),
  body('assinante_email')
    .optional()
    .isEmail()
    .withMessage('Email do assinante inválido')
    .normalizeEmail(),
  body('financeiro_email')
    .optional()
    .isEmail()
    .withMessage('Email financeiro inválido')
    .normalizeEmail()
];

const validateUpdateCliente = [
  body('razao_social')
    .optional()
    .trim()
    .isLength({ min: 3 })
    .withMessage('Razão social deve ter pelo menos 3 caracteres'),
  body('cnpj')
    .optional()
    .custom(validateCNPJField),
  body('assinante_email')
    .optional()
    .isEmail()
    .withMessage('Email do assinante inválido')
    .normalizeEmail(),
  body('financeiro_email')
    .optional()
    .isEmail()
    .withMessage('Email financeiro inválido')
    .normalizeEmail()
];

const validateId = [
  param('id')
    .notEmpty()
    .withMessage('ID é obrigatório')
    .isUUID()
    .withMessage('ID inválido')
];

// Rotas
router.get(
  '/',
  [
    query('cnpj').optional().isString(),
    query('razao_social').optional().isString()
  ],
  controller.list
);

router.get(
  '/:id',
  validateId,
  controller.getById
);

router.post(
  '/',
  validateCreateCliente,
  controller.create
);

router.patch(
  '/:id',
  [...validateId, ...validateUpdateCliente],
  controller.update
);

router.put(
  '/:id',
  [...validateId, ...validateCreateCliente],
  controller.replace
);

router.delete(
  '/:id',
  validateId,
  controller.delete
);

router.get(
  '/:id/contratos',
  validateId,
  controller.getContratos
);

export default router;

