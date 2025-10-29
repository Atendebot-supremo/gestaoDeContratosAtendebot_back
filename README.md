# API Gestão de Contratos

API REST desenvolvida em Node.js + TypeScript para gestão de contratos, clientes e projetos. Segue o padrão arquitetural estabelecido no projeto Barbeiro Inteligente.

## Stack Tecnológica

- **Node.js** + **TypeScript**
- **Express** - Framework web
- **Supabase** - Banco de dados PostgreSQL + Storage
- **JWT** - Autenticação
- **Swagger** - Documentação da API
- **Multer** - Upload de arquivos
- **pdf-parse** - Processamento de PDFs

## Estrutura do Projeto

```
src/
├── config/          # Configurações (Supabase, Storage)
├── features/        # Features por domínio
│   ├── auth/       # Autenticação
│   ├── clientes/   # CRUD de clientes
│   ├── projetos/   # CRUD de projetos + upload PDF
│   ├── contratos/  # CRUD de contratos
│   └── webhooks/   # Endpoints para n8n
├── middleware/      # Middlewares (auth, session)
├── types/          # Tipos TypeScript compartilhados
├── utils/          # Utilitários (validação CNPJ, parser PDF)
└── server.ts       # Bootstrap da aplicação
```

## Configuração

### 1. Instalar Dependências

```bash
npm install
```

### 2. Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto:

```env
# Servidor
PORT=3000
NODE_ENV=development

# JWT
JWT_SECRET=seu-jwt-secret-super-seguro-aqui

# Auth estático (opcional, com defaults)
STATIC_AUTH_EMAIL=admin@atende.bot
STATIC_AUTH_PASSWORD=123123

# Supabase
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.ewogICJyb2xlIjogImFub24iLAogICJpc3MiOiAic3VwYWJhc2UiLAogICJpYXQiOiAxNzE1MDUwODAwLAogICJleHAiOiAxODcyODE3MjAwCn0.Qr2fGyFI-WEKM2sQKLJCihNMWUdBX51lBo0HnDY-m70
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.ewogICJyb2xlIjogInNlcnZpY2Vfcm9sZSIsCiAgImlzcyI6ICJzdXBhYmFzZSIsCiAgImlhdCI6IDE3MTUwNTA4MDAsCiAgImV4cCI6IDE4NzI4MTcyMDAKfQ.T7VUorp4oxw1SIJ1Uh5eQVZmbeH0K4XB1BoIugUxVxY

# Sessão (para Swagger)
SESSION_SECRET=seu-session-secret-para-swagger
```

### 3. Banco de Dados

Certifique-se de que as seguintes tabelas existem no Supabase:

- `clientesLabfy` - Clientes
- `projetosLabfy` - Projetos/modelos de contrato
- `contratosLabfy` - Contratos

**Nota**: Não é necessária tabela de usuários, pois a autenticação é estática.

### 4. Storage Buckets

Crie os seguintes buckets no Supabase Storage:

- `templates` - Para PDFs modelo de contratos
- `contratos-gerados` - Para PDFs finais gerados (gerenciado pelo n8n)

## Executando

### Desenvolvimento

```bash
npm run dev
```

### Build para Produção

```bash
npm run build
npm start
```

## Endpoints Principais

### Autenticação
- `POST /api/auth/login` - Login e obtenção de JWT
- `GET /api/auth/me` - Dados do usuário autenticado

### Clientes
- `GET /api/clientes` - Lista clientes (com filtros)
- `GET /api/clientes/:id` - Detalhes do cliente
- `POST /api/clientes` - Cria cliente
- `PATCH /api/clientes/:id` - Atualiza cliente
- `DELETE /api/clientes/:id` - Deleta cliente
- `GET /api/clientes/:id/contratos` - Contratos do cliente

### Projetos
- `GET /api/projetos` - Lista projetos
- `GET /api/projetos/:id` - Detalhes do projeto
- `POST /api/projetos` - Cria projeto (multipart/form-data com PDF)
- `PATCH /api/projetos/:id` - Atualiza projeto
- `DELETE /api/projetos/:id` - Deleta projeto

### Contratos
- `GET /api/contratos` - Lista contratos (com filtros por status, cliente, projeto)
- `GET /api/contratos/:id` - Detalhes do contrato
- `POST /api/contratos` - Cria contrato (status inicial: 'Aguardando Geração')
- `PATCH /api/contratos/:id` - Atualiza contrato (só permite edição se status = 'Aguardando Geração')
- `DELETE /api/contratos/:id` - Deleta contrato

### Webhooks
- `GET /api/webhooks/status` - Health check para n8n
- `POST /api/webhooks/callback` - Callback opcional do n8n

## Documentação e Guias

### Swagger
Accesso à documentação interativa da API:

```
http://localhost:3000/api/docs
```

### Documentos (docs/)
- `docs/SETUP_DEV.md` — Setup de desenvolvimento e variáveis de ambiente
- `docs/AUTH_TEMP_DISABLED.md` — Estado atual da autenticação (temporariamente desabilitada) e como reativar
- `docs/DATABASE_NAMING.md` — Convenções de nomes das tabelas (Supabase)
- `docs/TROUBLESHOOTING.md` — Guia de resolução de problemas
- `docs/PROGRESS_LOG.md` — Registro de progresso com alterações recentes

### Changelog
- Consulte o `CHANGELOG.md` na raiz para histórico semântico de alterações.

## Autenticação

Todas as rotas (exceto `/api/auth/login` e `/api/webhooks/*`) requerem autenticação via JWT. As credenciais são estáticas na API:

Credenciais padrão:

- Email: `admin@atende.bot`
- Senha: `123123`

Podem ser sobrescritas por variáveis de ambiente:

```
STATIC_AUTH_EMAIL=admin@atende.bot
STATIC_AUTH_PASSWORD=123123
```

Fluxo:

1) Faça login em `POST /api/auth/login` com `{ "email", "password" }`.
2) Use o token retornado no header:

```
Authorization: Bearer <token>
```

Observação: não há tabela de usuários; a validação é totalmente local via JWT.

## Status de Contratos

Os contratos podem ter os seguintes status:

- `Aguardando Geração` - Contrato criado, aguardando geração pelo n8n
- `Aguardando Revisão` - Contrato gerado, aguardando revisão
- `Enviado` - Contrato enviado para assinatura (Clicksign)
- `Ativo` - Contrato ativo e com cobrança configurada (Asaas)
- `Cancelado` - Contrato cancelado

**Importante**: A API é responsável apenas pelo CRUD. As operações assíncronas (geração de contratos, integração com Clicksign/Asaas) são gerenciadas pelo n8n.

## Integração com n8n

O frontend React pode chamar os webhooks do n8n diretamente. A API fornece endpoints opcionais (`/api/webhooks/*`) apenas para monitoramento e callbacks.

## Desenvolvimento

### Estrutura de uma Feature

Cada feature segue o padrão:

- `*Routes.ts` - Define rotas e validações (express-validator)
- `*Controller.ts` - Valida inputs e padroniza respostas
- `*Service.ts` - Lógica de negócio e persistência (Supabase)
- `types.ts` - Tipos TypeScript específicos da feature

### Padrão de Resposta

Todas as respostas seguem o formato:

```typescript
{
  success: boolean;
  data?: T;
  error?: string;
  code?: ErrorCode;
  message?: string;
}
```

## Comandos Úteis

```bash
# Verificar tipos TypeScript
npm run type-check

# Desenvolvimento com hot-reload
npm run dev

# Build para produção
npm run build
```

## Observações

- A API não atualiza status de contratos automaticamente. O n8n é responsável por atualizar o status após operações assíncronas.
- Upload de PDF é feito apenas na criação/edição de projetos. Contratos gerados são salvos pelo n8n diretamente no Storage.
- Validação de token JWT é feita no middleware, mas também verificada no Supabase para permitir revogação.

