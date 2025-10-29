## Autenticação Temporariamente Desabilitada

Para acelerar testes, a exigência de JWT foi removida de rotas de domínio.

### O que foi alterado
- Removido `authMiddleware` dos seguintes arquivos:
  - `src/features/clientes/clientesRoutes.ts`
  - `src/features/contratos/contratosRoutes.ts`
  - `src/features/projetos/projetosRoutes.ts`
  - `src/features/auth/authRoutes.ts` (rotas `/logout` e `/me`)

O middleware `src/middleware/auth.middleware.ts` permanece no projeto e pode ser reativado a qualquer momento.

### Como reativar
1. Reintroduza o import nas rotas:
   ```ts
   import { authMiddleware } from '../../middleware/auth.middleware';
   ```
2. Adicione `authMiddleware` entre o path e os handlers, por exemplo:
   ```ts
   router.get('/', authMiddleware, controller.list);
   ```
3. No `authRoutes.ts`, reative também em `/logout` e `/me`.

### Impactos
- Todas as rotas ficam públicas enquanto este estado estiver ativo.
- Use este modo apenas em ambientes de desenvolvimento.


