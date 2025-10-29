## Setup de Desenvolvimento

### Requisitos
- Node.js 18+
- Conta Supabase (PostgreSQL + Storage)

### Variáveis de ambiente (`.env` na raiz)
```env
PORT=3000
NODE_ENV=development

JWT_SECRET=dev-secret

STATIC_AUTH_EMAIL=admin@atende.bot
STATIC_AUTH_PASSWORD=123123

SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...

SESSION_SECRET=swagger-session
```

### Instalar e rodar
```bash
npm install
npm run dev
```

### URLs úteis
- API Docs (Swagger): `http://localhost:3000/api/docs`
- Health: `http://localhost:3000/health`

### Observações
- Autenticação de rotas está temporariamente desabilitada (ver `docs/AUTH_TEMP_DISABLED.md`).


