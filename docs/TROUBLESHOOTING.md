## Troubleshooting

### 1) relation "public.clientesLabfy" does not exist
**Causa**: consultas usavam nomes com maiúsculas.

**Solução aplicada**:
- Padronização para minúsculas nos services:
  - `clienteslabfy`, `projetoslabfy`, `contratoslabfy`.

**Onde conferir**:
- `src/features/*/*Service.ts`.

### 2) 401 Unauthorized nas rotas
**Causa**: `authMiddleware` ativo.

**Solução temporária**:
- Autenticação desabilitada nas rotas. Veja `docs/AUTH_TEMP_DISABLED.md`.

**Como reativar**:
- Reintroduza `authMiddleware` nas rotas desejadas.

### 3) Falha ao subir servidor (variáveis ausentes)
**Causa**: `.env` incompleto.

**Solução**:
- Preencha as variáveis conforme `docs/SETUP_DEV.md`.


