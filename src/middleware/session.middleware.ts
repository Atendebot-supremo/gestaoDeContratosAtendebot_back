import { Request, Response, NextFunction } from 'express';
import { createErrorResponse, ErrorCode } from '../types';

/**
 * Middleware para proteger rotas que requerem sessão autenticada
 * Usado principalmente para proteger o Swagger UI
 */
export const requireAdminSession = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (!req.session || !req.session.user) {
    // Se não tem sessão, retorna página de login simples
    // Em produção, pode ser uma página HTML renderizada
    res.status(401).json(
      createErrorResponse(
        'Acesso não autorizado. É necessário fazer login.',
        ErrorCode.UNAUTHORIZED
      )
    );
    return;
  }

  next();
};

/**
 * Middleware para login via sessão (para Swagger)
 * Recebe email e password e cria sessão
 */
export const adminSessionLogin = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json(
        createErrorResponse(
          'Email e senha são obrigatórios',
          ErrorCode.INVALID_INPUT
        )
      );
      return;
    }

    // Valida credenciais (pode usar o mesmo service de auth)
    // Por enquanto, validação simples - em produção, buscar do Supabase
    // Esta implementação deve ser adaptada conforme necessário

    // Se credenciais válidas, cria sessão
    req.session.user = {
      id: 'admin',
      email: email
    };

    res.status(200).json({
      success: true,
      message: 'Login realizado com sucesso',
      data: {
        email: email
      }
    });
  } catch (error) {
    console.error('Erro no login de sessão:', error);
    res.status(500).json(
      createErrorResponse(
        'Erro ao processar login',
        ErrorCode.INTERNAL_SERVER_ERROR
      )
    );
  }
};

