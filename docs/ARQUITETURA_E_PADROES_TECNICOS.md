# Arquitetura e Padrões Técnicos - Barbeiro Inteligente Backend

## Visão Geral da Arquitetura

- **Backend**: Node.js com TypeScript e Express
- **Modularização**: Por domínio dentro de `src/features` (ex.: `auth`, `barbershop`, `whatsapp`)
- **Documentação**: Swagger com proteção por sessão e anotações JSDoc nos controllers
- **Autenticação**: JWT + verificação de token persistido no banco (Supabase)
- **Sessão**: HTTP-only apenas para acesso ao Swagger
- **Tempo Real**: Socket.IO acoplado ao servidor HTTP para eventos WhatsApp
- **Segurança**: Helmet, CORS restrito por domínio em produção, Rate Limiting por IP
- **Observabilidade**: Health/Ready/Live endpoints
- **Build**: Compilação para `dist/` e assets estáticos em `public/`

## Estrutura de Pastas (Padrão a Replicar)

```
src/
├── config/
│   ├── email.ts           # Validação/config de email (SMTP/Resend)
│   ├── evolutionApi.ts    # Logs e conf da Evolution API (WhatsApp)
│   └── supabase.ts        # Factory do client do Supabase + validações de env
├── features/
│   ├── auth/
│   │   ├── authRoutes.ts
│   │   ├── authController.ts
│   │   ├── authService.ts
│   │   ├── adminAuthService.ts
│   │   ├── passwordResetService.ts
│   │   └── types.ts
│   ├── barbershop/
│   │   ├── barbershopRoutes.ts
│   │   ├── barbershopController.ts
│   │   ├── barbershopService.ts
│   │   └── types.ts
│   ├── barber/
│   ├── barberProduct/
│   ├── barberSchedule/
│   ├── barberAppointment/
│   ├── client/
│   ├── subscription/
│   └── whatsapp/
├── middleware/
│   ├── auth.middleware.ts     # Extrai usuário do JWT e carrega contexto
│   └── session.middleware.ts  # Protege rota do Swagger (sessão)
├── types/
│   ├── index.ts               # Tipos utilitários (APIResponse, ErrorCode, etc.)
│   └── express-session.d.ts   # Extensão de tipos para sessão
├── utils/
│   └── emailTemplates.ts      # Templates e helpers de email
└── server.ts                  # Bootstrap do app, middlewares globais, swagger, sockets e rotas
```

## Fluxo Técnico

### 1. Inicialização (`src/server.ts`)
- Carrega `.env` e logs de configuração
- Sobe `express`, aplica `helmet`, `cors` (origens permitidas), `rateLimit`, `express.json`
- Configura `express-session` exclusivamente para proteger o Swagger
- Prepara `httpServer` + `Socket.IO` e expõe `SocketManager` global
- Registra rotas por domínio sob `/api/...`
- Swagger UI em `/api/docs` com proteção `requireAdminSession`
- Health endpoints (`/health`, `/ready`, `/live`)

### 2. Autenticação (`src/middleware/auth.middleware.ts`)
- Lê `Authorization: Bearer <token>`, valida com `JWT_SECRET`
- Com credenciais estáticas: não valida no banco, usa apenas o JWT
- Anexa `req.context.user` com `id` e `email` do token

### 3. Padrão por Domínio
- **Routes**: Define endpoints, validação com `express-validator`, e limitações (rate limit)
- **Controller**: Valida inputs e padroniza respostas via `types/index.ts`, chama serviços
- **Service**: Concentra regra de negócio, persistência (Supabase) e integrações externas
- **types.ts**: Por domínio para requests/responses específicos

## Convenções Importantes

- **Nomes de campos**: camelCase com letras maiúsculas internas quando necessário (ex.: `idBarbershop`, `instanceZapi`)
- **Respostas padronizadas**: `success`, `data` (quando ok), `error` (quando falha), `ErrorCode`
- **Swagger**: Com tags por domínio e schemas definidos nos controllers
- **Segurança**: Helmet CSP customizada, CORS com allowlist, Rate Limit por IP, sessão httpOnly para Swagger

## Variáveis de Ambiente Mínimas

```env
PORT=3000
NODE_ENV=development
JWT_SECRET=seu-jwt-secret-super-seguro
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SESSION_SECRET=seu-session-secret-para-swagger
```

## Como Replicar o Padrão em um Novo Projeto

### 1. Inicialização do Projeto

```bash
# Criar projeto
mkdir meu-backend && cd meu-backend
npm init -y

# Dependências principais
npm i express cors helmet express-rate-limit express-session jsonwebtoken swagger-jsdoc swagger-ui-express @supabase/supabase-js dotenv socket.io

# Dependências de desenvolvimento
npm i -D typescript ts-node-dev @types/express @types/cors @types/helmet @types/express-rate-limit @types/express-session @types/jsonwebtoken @types/node @types/swagger-ui-express @types/dotenv @types/http @types/socket.io eslint

# TypeScript
npx tsc --init
```

### 2. Scripts `package.json`

```json
{
  "scripts": {
    "dev": "ts-node-dev --transpile-only --exit-child src/server.ts",
    "build": "tsc",
    "start": "node dist/server.js"
  }
}
```

### 3. `tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020"],
    "module": "commonjs",
    "rootDir": "src",
    "outDir": "dist",
    "strict": true,
    "esModuleInterop": true,
    "resolveJsonModule": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  },
  "include": ["src"]
}
```

### 4. Estrutura de Diretórios

```bash
mkdir -p src/{config,features,features/auth,features/barbershop,middleware,types,utils}
mkdir public
```

### 5. Bootstrap do Servidor (Modelo Reduzido)

```typescript
// src/server.ts
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import session from 'express-session';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

const httpServer = createServer(app);
const io = new SocketIOServer(httpServer, {
  cors: { origin: '*', methods: ['GET', 'POST'] }
});

// Middlewares globais
app.use(helmet());
app.use(cors({ 
  origin: ['http://localhost:3000', 'http://localhost:5173'], 
  credentials: true 
}));
app.use(rateLimit({ 
  windowMs: 5 * 60 * 1000, 
  max: 150 
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Sessão para Swagger
app.use(session({
  secret: process.env.SESSION_SECRET || 'change-me',
  resave: false,
  saveUninitialized: false,
  cookie: { 
    httpOnly: true, 
    sameSite: 'lax', 
    secure: false 
  }
}));

// Swagger
const swaggerSpec = swaggerJsdoc({
  definition: { 
    openapi: '3.0.0', 
    info: { title: 'API', version: '1.0.0' } 
  },
  apis: ['./src/features/**/*.ts']
});
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Rotas por domínio
// app.use('/api/auth', authRoutes);
// app.use('/api/barbershop', barbershopRoutes);

// Health endpoints
app.get('/health', (_, res) => res.json({ status: 'OK' }));
app.get('/ready', (_, res) => res.json({ status: 'ready' }));
app.get('/live', (_, res) => res.json({ status: 'alive' }));

httpServer.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
  console.log(`Documentação: http://localhost:${PORT}/api/docs`);
});
```

### 6. Middleware de Auth (Padrão Fiel)

```typescript
// src/middleware/auth.middleware.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { supabase } from '../config/supabase';

export interface AuthRequest extends Request {
  context?: { 
    user?: { 
      id: string; 
      email: string; 
      role: string; 
      barbershop_id: string 
    } 
  };
}

export const authMiddleware = async (
  req: AuthRequest, 
  res: Response, 
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ 
        success: false, 
        error: 'Token de autenticação não fornecido' 
      });
    }

    const token = authHeader.substring(7);
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      return res.status(500).json({ 
        success: false, 
        error: 'Configuração de autenticação inválida' 
      });
    }

    const decoded = jwt.verify(token, secret) as any;

    // Token de agente (não persiste no banco)
    if (decoded.type === 'agent') {
      req.context = { 
        user: { 
          id: decoded.id, 
          email: decoded.email, 
          role: decoded.role, 
          barbershop_id: decoded.barbershop_id 
        } 
      };
      return next();
    }

    // Token normal: validar no banco
    const { data: barbershop, error } = await supabase
      .from('barbershop')
      .select('idBarbershop, email, barbershop, token')
      .eq('token', token)
      .single();

    if (error || !barbershop || barbershop.token !== token) {
      return res.status(401).json({ 
        success: false, 
        error: 'Token inválido ou expirado' 
      });
    }

    req.context = { 
      user: { 
        id: barbershop.idBarbershop, 
        email: barbershop.email, 
        role: decoded.role, 
        barbershop_id: barbershop.idBarbershop 
      } 
    };
    next();
  } catch (e) {
    return res.status(401).json({ 
      success: false, 
      error: 'Token inválido' 
    });
  }
};
```

### 7. Roteamento por Domínio (Padrão)

```typescript
// src/features/auth/authRoutes.ts
import { Router } from 'express';
import { body } from 'express-validator';
import rateLimit from 'express-rate-limit';
import AuthController from './authController';
import { authMiddleware } from '../../middleware/auth.middleware';

const router = Router();
const controller = new AuthController();

const passwordResetLimiter = rateLimit({ 
  windowMs: 60 * 60 * 1000, 
  max: 10 
});

// Validações
const validateLogin = [
  body('email').isEmail().notEmpty(),
  body('password').isLength({ min: 1 })
];

// Rotas
router.post('/login', validateLogin, controller.login);
router.post('/logout', authMiddleware, controller.logout);

export default router;
```

### 8. Controller com Swagger e Respostas Padronizadas

```typescript
// src/features/auth/authController.ts
import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { 
  createSuccessResponse, 
  createErrorResponse, 
  ErrorCode 
} from '../../types';
import { AuthService } from './authService';

export default class AuthController {
  private service = new AuthService();

  /**
   * @swagger
   * /api/auth/login:
   *   post:
   *     summary: Login da barbearia
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
   *               password:
   *                 type: string
   */
  login = async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json(
        createErrorResponse('Dados inválidos', ErrorCode.INVALID_INPUT)
      );
    }

    const result = await this.service.login(req.body);
    if (!result.success) {
      return res.status(401).json(
        createErrorResponse('Credenciais inválidas', ErrorCode.UNAUTHORIZED)
      );
    }

    return res.status(200).json(
      createSuccessResponse(result.data, 'Login realizado com sucesso')
    );
  };

  logout = async (req: Request, res: Response) => {
    return res.status(200).json({ 
      success: true, 
      message: 'Logout realizado com sucesso' 
    });
  };
}
```

### 9. Configuração do Supabase

```typescript
// src/config/supabase.ts
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 
                   process.env.SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('SUPABASE_URL e SUPABASE_ANON_KEY são obrigatórios');
}

export const supabase = createClient(supabaseUrl, supabaseKey);
```

### 10. Tipos Utilitários

```typescript
// src/types/index.ts
export enum ErrorCode {
  INVALID_INPUT = 'INVALID_INPUT',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  NOT_FOUND = 'NOT_FOUND',
  INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR'
}

export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export const createSuccessResponse = <T>(
  data: T, 
  message?: string
): APIResponse<T> => ({
  success: true,
  data,
  message
});

export const createErrorResponse = (
  error: string, 
  code: ErrorCode
): APIResponse => ({
  success: false,
  error,
  code
});
```

## Segurança e Boas Práticas (Replicar)

- **Helmet**: Com CSP customizada, bloqueando `objectSrc`, restringindo `scriptSrc`
- **CORS**: Com lista de domínios permitidos por ambiente
- **Rate Limiting**: Global e por rota sensível (senha, login)
- **Sessão**: Apenas para Swagger com cookie httpOnly e `sameSite=lax`
- **JWT**: Com `JWT_SECRET` forte e rotação controlada via logout
- **Logs**: De configuração nas inicializações críticas (email, supabase, sockets)

## Deploy/Operação

- **Build**: Compilado em `dist/`
- **Assets**: `public/` para arquivos estáticos
- **Documentação**: Em `docs/` (Railway, Evolution API, WebSocket events, JWT, Swagger)
- **Docker**: Dockerfile existente pode ser espelhado

## Exemplo de .env

```env
# Servidor
PORT=3000
NODE_ENV=development

# JWT
JWT_SECRET=seu-jwt-secret-super-seguro-aqui

# Supabase
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Sessão (para Swagger)
SESSION_SECRET=seu-session-secret-para-swagger

# Email (opcional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=seu-email@gmail.com
SMTP_PASS=sua-senha-app
```

## Comandos Úteis

```bash
# Desenvolvimento
npm run dev

# Build para produção
npm run build

# Executar em produção
npm start

# Verificar tipos
npx tsc --noEmit

# Lint (se configurado)
npx eslint src/
```

---

**Nota**: Este documento serve como guia completo para replicar a arquitetura e padrões técnicos do projeto Barbeiro Inteligente em novos projetos, mantendo consistência e boas práticas estabelecidas.
