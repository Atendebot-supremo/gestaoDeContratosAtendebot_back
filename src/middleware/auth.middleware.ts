import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { createErrorResponse, ErrorCode } from '../types';

export interface AuthRequest extends Request {
  context?: {
    user?: {
      id: string;
      email: string;
    };
  };
}

export const authMiddleware = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader?.startsWith('Bearer ')) {
      res.status(401).json(
        createErrorResponse(
          'Token de autenticação não fornecido',
          ErrorCode.UNAUTHORIZED
        )
      );
      return;
    }

    const token = authHeader.substring(7);
    const secret = process.env.JWT_SECRET;

    if (!secret) {
      res.status(500).json(
        createErrorResponse(
          'Configuração de autenticação inválida',
          ErrorCode.INTERNAL_SERVER_ERROR
        )
      );
      return;
    }

    // Verifica e decodifica o JWT
    const decoded = jwt.verify(token, secret) as {
      id: string;
      email: string;
      iat?: number;
      exp?: number;
    };

    // Como o login é estático, basta o JWT ser válido
    req.context = {
      user: {
        id: decoded.id,
        email: decoded.email
      }
    };

    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json(
        createErrorResponse(
          'Token inválido',
          ErrorCode.UNAUTHORIZED
        )
      );
      return;
    }

    if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json(
        createErrorResponse(
          'Token expirado',
          ErrorCode.UNAUTHORIZED
        )
      );
      return;
    }

    console.error('Erro no middleware de autenticação:', error);
    res.status(500).json(
      createErrorResponse(
        'Erro ao processar autenticação',
        ErrorCode.INTERNAL_SERVER_ERROR
      )
    );
  }
};

