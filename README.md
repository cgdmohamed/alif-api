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

4. **Run migrations**:
   ```bash
   npm run migration:run
   ```
   Real migrations live in `src/database/migrations` — `DB_SYNCHRONIZE` defaults to `false` (see Production notes below), so this is how the schema actually gets created. Whenever you change an entity, regenerate one: `npm run migration:generate -- src/database/migrations/DescriptiveName`, then re-run this command. (For quick throwaway prototyping only, you can set `DB_SYNCHRONIZE=true` in `.env` instead — never against a database with real data.)

5. **Run the API**:
   ```bash
   npm run start:dev
   ```
   Swagger docs at `http://localhost:3000/docs`.

6. **Seed one user per role** (admin/school-admin/teacher/support all use password `Passw0rd!`; student/parent log in via OTP — the dev `ConsoleOtpSender` logs the code to the server console instead of sending a real SMS):
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

- **Migrations run automatically on boot** — the Dockerfile's `CMD` runs `npm run migration:run:prod` (plain `typeorm` CLI against the compiled `dist/config/typeorm.datasource.js` — no `ts-node`, which is dev-only) before starting the server. They're idempotent (TypeORM tracks applied ones in the `migrations` table), so this is safe on every restart, not just the first deploy. `DB_SYNCHRONIZE` defaults to `false` everywhere; only flip it on for disposable local prototyping.
- Swap the stubbed providers for real ones before going live: `AgoraProvider` (meetings module — see `AGORA_APP_ID`/`AGORA_APP_CERTIFICATE`), `StorageProvider` (content-library module — `LocalStorageProvider` writes to `./uploads`, served at `/uploads/*` and persisted via the `alef_uploads` volume in `docker-compose.yaml`; fine for a single instance, but swap for a real object store — S3-compatible — before scaling to multiple API replicas or wanting off-server backups), `EmailProvider`/`SmsProvider` (settings module) and the separate `OtpSender` (auth module, currently `ConsoleOtpSender` — logs the code instead of texting it) — each has a single provider binding in its module file.
- Deploying with Docker/Coolify? See `docker-compose.yaml` (production) — the local-dev-only `docker-compose.yml` (Postgres alone) is unrelated to it.
