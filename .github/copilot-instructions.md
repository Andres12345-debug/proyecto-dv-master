<!-- Copilot / AI agent instructions for the ProyectoVd repository -->

# Copilot Instructions — ProyectoVd

Purpose: give an AI coding agent the minimal, actionable knowledge to be productive in this repo.

**Big Picture**
- **Frontend:** Angular app in `src/` (Angular CLI v20). Entry point is `src/main.ts`, views under `src/app`. Material theming files live in `material-theming/`.
- **Backend:** Node.js + Express API in `backend/`. The server entry is `backend/server.js`. Database is MySQL and configured in `backend/config/database.js`.
- **Data flow:** Frontend calls backend REST endpoints under `/api/*`. Backend uses JWT auth and MySQL; DB migrations and seeds are in `backend/scripts/`.

**Key files & directories (quick reference)**
- Frontend routes/services: `src/app/app.routes.ts`, `src/app/core/services/` and feature modules in `src/app/features/`.
- Frontend interceptors/guards: `src/app/core/interceptors/auth.interceptor.ts`, `src/app/core/interceptors/error.interceptor.ts`, `src/app/core/guards/auth.guard.ts`.
- Backend routes & middleware: `backend/routes/*.js` (e.g. `users.js`, `auth.js`, `admin.js`), `backend/middleware/auth.js`, `backend/middleware/resetAuth.js`.
- DB & scripts: `backend/scripts/migrate.js`, `backend/scripts/seed.js`, SQL files in `backend/scripts/*.sql`.
- Utilities: `backend/utils/logger.js`, `backend/utils/validation.js`, `backend/utils/helpers.js`.
- Logs: `backend/logs/`.

**How to run (developer workflows)**
- Frontend dev: `ng serve` (serves at `http://localhost:4200`).
- Backend dev: from `backend/` run `npm run dev` (nodemon) or `npm start` for production.
- DB setup: copy `.env.example` to `.env`, then run `npm run migrate` and `npm run seed` from `backend/`.
- Tests: frontend `ng test`, backend `npm test` (see `backend/README.md` for coverage scripts).

Examples (use these exact paths/commands in suggestions):
- Protect API calls on frontend: the `auth.interceptor.ts` adds `Authorization: Bearer <token>` header.
- To add a new backend route, place it in `backend/routes/`, export the router, and wire it in `backend/server.js`.

**Project-specific conventions & patterns**
- JWT-based auth is global: prefer `Authorization` header and follow token refresh flow used in `backend/routes/auth.js`.
- Backend input validation is done with `express-validator`; follow patterns in `backend/utils/validation.js`.
- Logging uses `backend/utils/logger.js` and writes to `backend/logs/` — keep log messages structured: `[timestamp] LEVEL: message | metadata`.
- Database changes must be accompanied by updates to `backend/scripts/migrate.js` or SQL files under `backend/scripts/` and tested locally with `npm run migrate`.
- Frontend uses Angular services under `src/app/core/services/` for API communication; re-use those rather than direct `HttpClient` calls in components.

**When editing code**
- Prefer minimal, focused changes that preserve public APIs. Avoid sweeping style-only reformatting.
- If changing backend authentication, update both `backend/middleware/auth.js` and frontend `auth.interceptor.ts`.
- If you modify entity shapes (DB schema), update SQL migration files and seed data, then run migrations locally.

**Testing & validation**
- Run `ng test` for frontend unit tests and `npm test` inside `backend/` for backend tests.
- After DB-related changes run `npm run migrate` and `npm run seed` in `backend/` and exercise endpoints (e.g., `POST /api/auth/login`).

**PR / commit guidance for AI-generated changes**
- Keep commits small and focused: one feature/bugfix per PR.
- Include which commands you ran to validate (build/test/migrate) in the PR description.

**Do not assume**
- There is no existing `.github/copilot-instructions.md`; do not remove or rewrite `backend/README.md` content — reference it instead.

If anything here is unclear or you want more examples (typical API request/response shapes, common component patterns, or a checklist for DB migrations), tell me which section to expand.
