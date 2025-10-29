import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { AuthRequest } from '../../middleware/auth.middleware';
import { AuthService } from './authService';
import {
  createSuccessResponse,
  createErrorResponse,
  ErrorCode
} from '../../types';

export default class AuthController {
  private service = new AuthService();

  /**
   * @swagger
   * /api/auth/login:
   *   post:
   *     summary: Login do usuário
   *     tags: [Auth]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required: [email, password]
   *             properties:
   *               email:
   *                 type: string
   *                 format: email
   *                 example: usuario@exemplo.com
   *               password:
   *                 type: string
   *                 format: password
   *                 example: senha123
   *           example:
   *             email: "admin@atende.bot"
   *             password: "123123"
   *     responses:
   *       200:
   *         description: Login realizado com sucesso
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                 data:
   *                   type: object
   *                   properties:
   *                     token:
   *                       type: string
   *                     user:
   *                       type: object
   *                       properties:
   *                         id:
   *                           type: string
   *                         email:
   *                           type: string
   *       401:
   *         description: Credenciais inválidas
   */
  login = async (req: Request, res: Response): Promise<void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json(
        createErrorResponse(
          'Dados inválidos',
          ErrorCode.INVALID_INPUT,
          errors.array()[0].msg
        )
      );
      return;
    }

    const result = await this.service.login(req.body);

    if (!result.success) {
      res.status(401).json(result);
      return;
    }

    res.status(200).json(
      createSuccessResponse(result.data, 'Login realizado com sucesso')
    );
  };

  /**
   * @swagger
   * /api/auth/logout:
   *   post:
   *     summary: Logout do usuário
   *     tags: [Auth]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Logout realizado com sucesso
   */
  logout = async (req: AuthRequest, res: Response): Promise<void> => {
    // Em um sistema mais complexo, poderia invalidar o token no banco
    // Por enquanto, apenas retorna sucesso (a invalidação fica no frontend)
    res.status(200).json(
      createSuccessResponse(null, 'Logout realizado com sucesso')
    );
  };

  /**
   * @swagger
   * /api/auth/me:
   *   get:
   *     summary: Retorna dados do usuário autenticado
   *     tags: [Auth]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Dados do usuário
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                 data:
   *                   type: object
   *                   properties:
   *                     id:
   *                       type: string
   *                     email:
   *                       type: string
   *                     created_at:
   *                       type: string
   *       401:
   *         description: Não autenticado
   */
  me = async (req: AuthRequest, res: Response): Promise<void> => {
    if (!req.context?.user) {
      res.status(401).json(
        createErrorResponse(
          'Usuário não autenticado',
          ErrorCode.UNAUTHORIZED
        )
      );
      return;
    }

    const result = await this.service.getCurrentUser(req.context.user.id);

    if (!result.success) {
      res.status(404).json(result);
      return;
    }

    res.status(200).json(createSuccessResponse(result.data));
  };
}

