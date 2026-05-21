# Local PostgreSQL pgvector Baseline Plan

## Status

Approved for local baseline implementation on 2026-05-21.

## Purpose

Establish a reproducible local PostgreSQL + pgvector development baseline for Tiku on this Windows 11 + Codex desktop machine.

This plan is approved for the first local development baseline:

- Docker Compose PostgreSQL + pgvector.
- Local-only `.env.local`.
- Drizzle config.
- Drizzle migration generation.
- Generated SQL review.
- Local-only migration application.
- Local validation gates.

This plan does not approve remote databases, Tencent Cloud resource creation, production deployment, PR creation, merge, push, or production secret configuration.

## Current State

- The project uses Drizzle ORM schema definitions under `src/db/schema/`.
- Existing schema modules:
  - `auth.ts`
  - `paper.ts`
  - `student-experience.ts`
  - `ai-rag.ts`
- `src/db/schema/index.ts` exports the current schema modules.
- `package.json` already includes `drizzle-kit`, `drizzle-orm`, and `postgres`.
- `.env.example` declares:
  - `DATABASE_URL`
  - `BETTER_AUTH_SECRET`
  - optional AI provider keys
- No `.env.local` is present on this machine.
- No local database startup scaffold was found:
  - no `compose.yaml`
  - no `docker-compose.yml`
  - no `Dockerfile`
  - no `drizzle.config.*`
  - no `drizzle/**` migration directory
- Project standards forbid `drizzle-kit push` and require `drizzle-kit generate` / `migrate` for schema changes.

## Approved Phase 1 Architecture

Use Docker Compose for a local-only PostgreSQL 16 instance with pgvector available.

Proposed local service:

- service name: `tiku-postgres`
- database: `tiku`
- user: `tiku`
- password: local-only development password
- exposed port: `5432`
- volume: named Docker volume for local persistence
- extension: `vector` enabled through an initialization SQL script

The local database is for development only. It must not represent production topology, Tencent Cloud deployment, backup strategy, or production migration policy.

Deployment environment isolation will be governed separately by `docs/02-architecture/adr/adr-004-environment-isolation-and-release-boundaries.md`.

## Approved Files

### `compose.yaml`

Purpose:

- Start a local PostgreSQL + pgvector service.
- Keep database state in a named Docker volume.
- Avoid requiring developers to install PostgreSQL directly on Windows.

Proposed constraints:

- Use a pgvector-enabled PostgreSQL 16 image after verifying the tag during implementation.
- Bind only localhost when practical.
- Do not embed production credentials.

### `scripts/db/init/001-enable-pgvector.sql`

Purpose:

- Enable pgvector for the local database.

Expected content:

```sql
CREATE EXTENSION IF NOT EXISTS vector;
```

### `drizzle.config.ts`

Purpose:

- Point Drizzle Kit at `src/db/schema/index.ts`.
- Generate migration files into `drizzle/`.
- Read the database URL from `DATABASE_URL`.

Constraints:

- Do not hardcode secrets.
- Do not call `drizzle-kit push`.

### `.env.local`

Purpose:

- Local-only runtime configuration.

Important:

- `.env.local` is ignored by Git and must not be committed.
- Codex should create it only after explicit approval of local values.
- The initial local-only values can be generated from the approved Compose database settings.

Minimum local content:

```env
DATABASE_URL=postgresql://tiku:<local-password>@localhost:5432/tiku
BETTER_AUTH_SECRET=<generated-local-development-secret>
ALIBABA_API_KEY=
OPENAI_API_KEY=
```

### Documentation / Evidence

Add implementation evidence under:

- `docs/05-execution-logs/evidence/YYYY-MM-DD-local-postgres-pgvector-baseline.md`

Record:

- exact Docker image used;
- exact commands run;
- database startup result;
- pgvector extension check result;
- Drizzle config validation result;
- any accepted residual risk.

## Approved Commands

These commands are approved for this local-only baseline. Commands that need network, Docker daemon access, or non-sandbox file access still use the Codex approval flow.

### Start Local Database

```powershell
docker compose up -d tiku-postgres
```

### Confirm Container Health

```powershell
docker compose ps
```

### Confirm pgvector Extension

Use a non-secret command through Docker Compose, for example:

```powershell
docker compose exec tiku-postgres psql -U tiku -d tiku -c "SELECT extname FROM pg_extension WHERE extname = 'vector';"
```

### Generate Drizzle Migration

```powershell
npm.cmd exec -- drizzle-kit generate
```

### Apply Drizzle Migration

Only after generated SQL review confirms the migration targets the local baseline and does not include destructive or unexpected SQL:

```powershell
npm.cmd exec -- drizzle-kit migrate
```

## Explicitly Forbidden In This Baseline

- Do not use `drizzle-kit push`.
- Do not connect to production or shared remote databases.
- Do not put real production secrets in `.env.local`.
- Do not commit `.env.local`.
- Do not modify existing business logic, route handlers, services, validators, mappers, or UI.
- Do not add, remove, or upgrade npm dependencies.
- Do not run destructive SQL.
- Do not push, merge, deploy, or create a PR without separate approval.

## Implementation Sequence

1. Confirm the working branch and Git status.
2. Confirm Docker can run containers despite the current Docker config warning.
3. Create `compose.yaml` and local pgvector init SQL.
4. Create `drizzle.config.ts`.
5. Create `.env.local` with local-only values.
6. Start the database.
7. Verify PostgreSQL accepts connections.
8. Verify `vector` extension is installed.
9. Run `npm.cmd exec -- drizzle-kit generate`.
10. Review generated migration SQL before applying.
11. Run `npm.cmd exec -- drizzle-kit migrate` only if the generated SQL is acceptable.
12. Run project gates:
    - `npm.cmd run typecheck`
    - `npm.cmd run lint`
    - `npm.cmd run test:unit`
    - `npm.cmd run format:check`
    - `npm.cmd run test:e2e` when frontend/dev-server impact needs confirmation
13. Record evidence.
14. Confirm no accidental changes to `package.json`, `pnpm-lock.yaml`, or `.env.local` tracking.

## Approved Decisions

- Codex may create local-only `.env.local` values for `DATABASE_URL` and `BETTER_AUTH_SECRET`.
- Docker Compose is the approved local database path for this machine.
- The local database volume should persist across sessions by default.
- Migration generation is approved for the current schema.
- Local migration application is approved after generated SQL review.

## Risk Review

### Data Safety

Risk: accidental connection to a real database.

Mitigation:

- Use only local `localhost` connection strings.
- Do not accept copied production or shared database URLs.
- Print only redacted connection information in evidence.

### Migration Safety

Risk: generated migration creates unexpected SQL.

Mitigation:

- Generate first.
- Review SQL before migrate.
- Never use `drizzle-kit push`.

### Tooling Safety

Risk: Docker config warning blocks image pulls or container startup.

Mitigation:

- Test Docker startup separately.
- If Docker cannot run, stop and record blocker instead of changing project architecture.

### Repository Safety

Risk: local secret file or generated artifacts accidentally become tracked.

Mitigation:

- Confirm `.env.local` remains ignored.
- Confirm `git status --short --branch` after every major step.
- Keep generated migration files reviewed before acceptance.

## Self-Check

- This plan does not introduce business logic changes.
- This plan does not authorize dependency changes.
- This plan does not authorize production configuration.
- This plan keeps `.env.local` untracked.
- This plan separates migration generation from migration application.
- This plan keeps pgvector local and verifiable before RAG runtime work depends on it.
- This plan follows ADR-001 by using PostgreSQL 16+, pgvector, Drizzle ORM, and pnpm.
