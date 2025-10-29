import { Router } from 'express';
import { body, param, query } from 'express-validator';
import ContratosController from './contratosController';

const router = Router();
const controller = new ContratosController();

// Validações
const validateCreateContrato = [
  body('cliente_id')
    .notEmpty()
    .withMessage('Cliente é obrigatório')
    .isUUID()
    .withMessage('ID do cliente inválido'),
  body('projeto_id')
    .notEmpty()
    .withMessage('Projeto é obrigatório')
    .isUUID()
    .withMessage('ID do projeto inválido'),
  body('valor_mensalidade')
    .notEmpty()
    .withMessage('Valor da mensalidade é obrigatório')
    .matches(/^\d+(\.\d{1,2})?$/)
    .withMessage('Valor da mensalidade inválido'),
  body('valor_setup')
    .notEmpty()
    .withMessage('Valor do setup é obrigatório')
    .matches(/^\d+(\.\d{1,2})?$/)
    .withMessage('Valor do setup inválido'),
  body('plano_nome')
    .notEmpty()
    .withMessage('Nome do plano é obrigatório')
    .trim()
    .isLength({ min: 3 })
    .withMessage('Nome do plano deve ter pelo menos 3 caracteres'),
  body('prazo_implementacao_dias')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Prazo de implementação deve ser um número positivo'),
  body('assinante_venda_email')
    .optional()
    .isEmail()
    .withMessage('Email do assinante inválido')
    .normalizeEmail()
];

const validateUpdateContrato = [
  body('cliente_id')
    .optional()
    .isUUID()
    .withMessage('ID do cliente inválido'),
  body('projeto_id')
    .optional()
    .isUUID()
    .withMessage('ID do projeto inválido'),
  body('valor_mensalidade')
    .optional()
    .matches(/^\d+(\.\d{1,2})?$/)
    .withMessage('Valor da mensalidade inválido'),
  body('valor_setup')
    .optional()
    .matches(/^\d+(\.\d{1,2})?$/)
    .withMessage('Valor do setup inválido'),
  body('status')
    .optional()
    .isIn([
      'Aguardando Geração',
      'Aguardando Revisão',
      'Enviado',
      'Ativo',
      'Cancelado'
    ])
    .withMessage('Status inválido'),
  body('assinante_venda_email')
    .optional()
    .isEmail()
    .withMessage('Email do assinante inválido')
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
    query('status')
      .optional()
      .isIn([
        'Aguardando Geração',
        'Aguardando Revisão',
        'Enviado',
        'Ativo',
        'Cancelado'
      ]),
    query('cliente_id').optional().isUUID(),
    query('projeto_id').optional().isUUID()
  ],
  controller.list
);

router.get('/:id', validateId, controller.getById);

router.post(
  '/',
  validateCreateContrato,
  controller.create
);

router.patch(
  '/:id',
  [...validateId, ...validateUpdateContrato],
  controller.update
);

router.delete('/:id', validateId, controller.delete);

export default router;

