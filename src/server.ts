import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import session from 'express-session';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { createServer } from 'http';
import authRoutes from './features/auth/authRoutes';
import clientesRoutes from './features/clientes/clientesRoutes';
import projetosRoutes from './features/projetos/projetosRoutes';
import contratosRoutes from './features/contratos/contratosRoutes';
import webhooksRoutes from './features/webhooks/webhooksRoutes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

const httpServer = createServer(app);

// Middlewares globais
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", 'https://cdn.jsdelivr.net'],
      scriptSrc: ["'self'", "'unsafe-inline'", 'https://cdn.jsdelivr.net'],
      imgSrc: ["'self'", 'data:', 'https:'],
      connectSrc: ["'self'"],
      fontSrc: ["'self'", 'https://cdn.jsdelivr.net'],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: []
    }
  }
}));

app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? [process.env.FRONTEND_URL || 'http://localhost:5173']
    : ['http://localhost:3000', 'http://localhost:5173', 'http://localhost:5174'],
  credentials: true
}));

app.use(rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutos
  max: 150, // máximo de 150 requisições por IP
  message: 'Muitas requisições deste IP, tente novamente mais tarde.'
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Sessão para Swagger
app.use(session({
  secret: process.env.SESSION_SECRET || 'change-me-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000 // 24 horas
  }
}));

// Swagger configuration
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API Gestão de Contratos',
      version: '1.0.0',
      description: 'API REST para gestão de contratos, clientes e projetos',
      contact: {
        name: 'Suporte API'
      }
    },
    servers: [
      {
        url: `http://localhost:${PORT}`,
        description: 'Servidor de desenvolvimento'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    }
  },
  apis: ['./src/features/**/*.ts', './src/server.ts']
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

// Swagger UI
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'API Gestão de Contratos - Documentação'
}));

// Health endpoints
app.get('/health', (_, res) => res.json({ status: 'OK' }));
app.get('/ready', (_, res) => res.json({ status: 'ready' }));
app.get('/live', (_, res) => res.json({ status: 'alive' }));

// Rotas por domínio
app.use('/api/auth', authRoutes);
app.use('/api/clientes', clientesRoutes);
app.use('/api/projetos', projetosRoutes);
app.use('/api/contratos', contratosRoutes);
app.use('/api/webhooks', webhooksRoutes);

// 404 handler
app.use((_, res) => {
  res.status(404).json({
    success: false,
    error: 'Rota não encontrada',
    code: 'NOT_FOUND'
  });
});

// Error handler global
app.use((err: Error, _: express.Request, res: express.Response, __: express.NextFunction) => {
  console.error('Erro não tratado:', err);
  res.status(500).json({
    success: false,
    error: 'Erro interno do servidor',
    code: 'INTERNAL_SERVER_ERROR'
  });
});

httpServer.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`📚 Documentação: http://localhost:${PORT}/api/docs`);
  console.log(`🏥 Health check: http://localhost:${PORT}/health`);
  console.log(`🌍 Ambiente: ${process.env.NODE_ENV || 'development'}`);
});

