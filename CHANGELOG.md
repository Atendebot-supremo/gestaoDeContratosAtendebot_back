# Changelog

All notable changes to this project will be documented in this file.

## [0.1.1] - 2025-10-29
### Changed
- Temporarily disabled authentication on routes by removing `authMiddleware` from `clientes`, `contratos`, `projetos` and `auth` (`/logout`, `/me`).

### Fixed
- Standardized Supabase table names to lowercase to fix relation errors:
  - `clientesLabfy` → `clienteslabfy`
  - `contratosLabfy` → `contratoslabfy`
  - `projetosLabfy` → `projetoslabfy`

### Docs
- Added `docs/PROGRESS_LOG.md`, `docs/AUTH_TEMP_DISABLED.md`, `docs/DATABASE_NAMING.md`, `docs/SETUP_DEV.md`, `docs/TROUBLESHOOTING.md`.

## [0.1.0] - 2025-10-28
### Added
- Initial project structure with Express, Supabase integration and CRUD endpoints for `clientes`, `projetos` and `contratos`.


