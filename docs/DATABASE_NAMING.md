## Convenção de Nomes de Tabelas (Supabase)

As tabelas devem estar em minúsculas no schema `public`:

- `clienteslabfy`
- `projetoslabfy`
- `contratoslabfy`

### Por que?
PostgreSQL trata identificadores sem aspas como case-insensitive e normaliza para minúsculas. Criar tabelas com maiúsculas exige aspas em todas as consultas. Adotamos apenas minúsculas para evitar erros do tipo:

```
relation "public.clientesLabfy" does not exist
```

### Locais no código que consultam as tabelas
- `src/features/clientes/clientesService.ts`
- `src/features/contratos/contratosService.ts`
- `src/features/projetos/projetosService.ts`

### Buckets de Storage (Supabase)
- `templates` (PDFs modelo)
- `contratos-gerados` (PDFs finais)


