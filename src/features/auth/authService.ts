import jwt from 'jsonwebtoken';
import { LoginRequest, LoginResponse, UserResponse } from './types';
import { APIResponse } from '../../types';

export class AuthService {
  async login(credentials: LoginRequest): Promise<APIResponse<LoginResponse>> {
    try {
      const email = credentials.email.toLowerCase().trim();
      const password = credentials.password;

      // Credenciais estáticas (podem ser sobrescritas por env)
      const STATIC_EMAIL = process.env.STATIC_AUTH_EMAIL || 'admin@atende.bot';
      const STATIC_PASSWORD = process.env.STATIC_AUTH_PASSWORD || '123123';

      if (email !== STATIC_EMAIL || password !== STATIC_PASSWORD) {
        return {
          success: false,
          error: 'Credenciais inválidas',
          code: 'UNAUTHORIZED' as any
        };
      }

      // Gera JWT
      const jwtSecret = process.env.JWT_SECRET;
      if (!jwtSecret) {
        throw new Error('JWT_SECRET não configurado');
      }

      const token = jwt.sign(
        {
          id: 'admin',
          email: email
        },
        jwtSecret,
        {
          expiresIn: '7d' // Token válido por 7 dias
        }
      );

      return {
        success: true,
        data: {
          token,
          user: {
            id: 'admin',
            email: email
          }
        }
      };
    } catch (error) {
      console.error('Erro no serviço de autenticação:', error);
      return {
        success: false,
        error: 'Erro ao processar login',
        code: 'INTERNAL_SERVER_ERROR' as any
      };
    }
  }

  async getCurrentUser(userId: string): Promise<APIResponse<UserResponse>> {
    try {
      // Para autenticação estática, retornamos o usuário fixo
      if (userId !== 'admin') {
        return { success: false, error: 'Usuário não encontrado', code: 'NOT_FOUND' as any };
      }

      return {
        success: true,
        data: {
          id: 'admin',
          email: process.env.STATIC_AUTH_EMAIL || 'admin@atende.bot',
          created_at: new Date().toISOString()
        }
      };
    } catch (error) {
      console.error('Erro ao buscar usuário:', error);
      return {
        success: false,
        error: 'Erro ao buscar dados do usuário',
        code: 'INTERNAL_SERVER_ERROR' as any
      };
    }
  }
}

