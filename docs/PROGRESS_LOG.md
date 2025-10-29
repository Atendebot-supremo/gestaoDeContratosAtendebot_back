## Registro de Progresso

Data: 2025-10-29

### Alterações aplicadas
- Autenticação temporariamente desabilitada nas rotas (remoção do `authMiddleware`).
  - Arquivos alterados:
    - `src/features/auth/authRoutes.ts` (rotas `/logout` e `/me` agora públicas)
    - `src/features/clientes/clientesRoutes.ts`
    - `src/features/contratos/contratosRoutes.ts`
    - `src/features/projetos/projetosRoutes.ts`

- Correção de nomes de tabelas no Supabase para minúsculas (compatível com a base existente).
  - `clientesLabfy` → `clienteslabfy`
  - `contratosLabfy` → `contratoslabfy`
  - `projetosLabfy` → `projetoslabfy`
  - Arquivos alterados:
    - `src/features/clientes/clientesService.ts`
    - `src/features/contratos/contratosService.ts`
    - `src/features/projetos/projetosService.ts`

### Motivações
- Facilitar testes rápidos sem necessidade de token.
- Corrigir erro de runtime: relation "public.clientesLabfy" does not exist.

### Planos de reversão
- Reativar autenticação quando necessário:
  1. Recolocar `authMiddleware` nas rotas mencionadas acima.
  2. Restaurar import: `import { authMiddleware } from '../../middleware/auth.middleware';` nos arquivos de rotas.

### Observações
- O middleware `src/middleware/auth.middleware.ts` foi mantido sem mudanças para rápida reativação.


