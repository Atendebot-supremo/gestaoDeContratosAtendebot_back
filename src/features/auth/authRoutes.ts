import { Router } from 'express';
import { body } from 'express-validator';
import rateLimit from 'express-rate-limit';
import AuthController from './authController';

const router = Router();
const controller = new AuthController();

// Rate limiter para login (evitar brute force)
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // máximo 5 tentativas
  message: 'Muitas tentativas de login. Tente novamente em 15 minutos.',
  standardHeaders: true,
  legacyHeaders: false
});

// Validações
const validateLogin = [
  body('email')
    .isEmail()
    .withMessage('Email inválido')
    .normalizeEmail()
    .notEmpty()
    .withMessage('Email é obrigatório'),
  body('password')
    .notEmpty()
    .withMessage('Senha é obrigatória')
    .isLength({ min: 1 })
    .withMessage('Senha deve ter pelo menos 1 caractere')
];

// Rotas
router.post('/login', loginLimiter, validateLogin, controller.login);
router.post('/logout', controller.logout);
router.get('/me', controller.me);

export default router;

