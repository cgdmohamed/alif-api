# Alef Future API

NestJS + TypeORM + PostgreSQL backend for the Alef Future admin panel and mobile app.

## Local setup

1. **Start Postgres** (needs Docker Desktop installed and running):
   ```bash
   docker compose -f docker-compose.dev.yml up -d
   ```
   This starts Postgres on `localhost:5432` with user/password/db `alef`/`alef`/`alef_dev` (matches `.env.example`). (`docker-compose.yaml` — no `.dev` — is the separate production/Coolify file that also builds and runs the API itself; don't use it for local dev.)

   No Docker? Install PostgreSQL directly and create a database/user matching `.env.example`, or point `DB_*` env vars at any reachable Postgres instance.

2. **Configure env**:
   ```bash
   cp .env.example .env
   ```
   Defaults work out of the box with the docker-compose Postgres.

3. **Install deps** (already done if you're continuing this session):
   ```bash
   npm install
   ```

4. **Run the API**:
   ```bash
   npm run start:dev
   ```
   Schema auto-syncs from entities in development (`synchronize: true` in `src/config/typeorm.config.ts`) — no migration step needed for local dev. Swagger docs at `http://localhost:3000/docs`.

5. **Seed one user per role** (admin/school-admin/teacher/support all use password `Passw0rd!`; student/parent log in via OTP — the dev `ConsoleOtpSender` logs the code to the server console instead of sending a real SMS):
   ```bash
   npm run seed
   ```

## Smoke test

```bash
curl http://localhost:3000/health
curl -X POST http://localhost:3000/auth/login -H "Content-Type: application/json" \
  -d '{"email":"admin@alef.dev","password":"Passw0rd!"}'
```

The login response includes `accessToken` — pass it as `Authorization: Bearer <token>` on subsequent requests, or use the "Authorize" button in Swagger UI at `/docs`.

## Production notes

- **No migrations exist yet** — schema is created entirely by TypeORM's `synchronize`, which stays on by default in every environment (`DB_SYNCHRONIZE` env var, default `true`) specifically so this doesn't silently break in production. Once real migrations are generated (`npm run migration:generate` / `migration:run`), set `DB_SYNCHRONIZE=false` and switch to running migrations on deploy instead — `synchronize` can drop/alter columns based on entity changes and is not safe to run against a database with real data long-term.
- Swap the stubbed providers for real ones before going live: `ZoomProvider` (meetings module — see `ZOOM_SDK_KEY`/`ZOOM_SDK_SECRET`), `StorageProvider` (content-library module), `EmailProvider`/`SmsProvider` (settings + auth modules) — each has a single provider binding in its module file.
- Deploying with Docker/Coolify? See `docker-compose.yaml` (production) — the local-dev-only `docker-compose.yml` (Postgres alone) is unrelated to it.
