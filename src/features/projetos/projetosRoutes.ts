import { Router } from 'express';
import { body, param } from 'express-validator';
import multer from 'multer';
import ProjetosController from './projetosController';

const router = Router();
const controller = new ProjetosController();

// Configuração do Multer para armazenar em memória
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Apenas arquivos PDF são permitidos'));
    }
  }
});

// Validações
const validateCreateProjeto = [
  body('nome_projeto')
    .notEmpty()
    .withMessage('Nome do projeto é obrigatório')
    .trim()
    .isLength({ min: 3 })
    .withMessage('Nome do projeto deve ter pelo menos 3 caracteres'),
  body('descricao')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Descrição deve ter no máximo 1000 caracteres')
];

const validateUpdateProjeto = [
  body('nome_projeto')
    .optional()
    .trim()
    .isLength({ min: 3 })
    .withMessage('Nome do projeto deve ter pelo menos 3 caracteres'),
  body('descricao')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Descrição deve ter no máximo 1000 caracteres')
];

const validateId = [
  param('id')
    .notEmpty()
    .withMessage('ID é obrigatório')
    .isUUID()
    .withMessage('ID inválido')
];

// Rotas
router.get('/', controller.list);

router.get('/:id', validateId, controller.getById);

router.post(
  '/',
  upload.single('pdf_file'),
  validateCreateProjeto,
  controller.create
);

router.patch(
  '/:id',
  upload.single('pdf_file'),
  [...validateId, ...validateUpdateProjeto],
  controller.update
);

router.delete('/:id', validateId, controller.delete);

export default router;

