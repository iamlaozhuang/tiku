# Local PostgreSQL pgvector Baseline Evidence

## Scope

Local-only PostgreSQL + pgvector + Drizzle migration baseline for development on this machine.

Branch: `codex-local-handoff-readiness-prep`

## Human Approval

The user approved the strategy to:

- build a local complete validation baseline first;
- use local Docker PostgreSQL + pgvector;
- create local-only `.env.local`;
- create Drizzle config;
- generate and review migrations;
- apply migrations locally;
- define `dev`, `staging`, and `prod` environment isolation before Tencent Cloud deployment.

No remote database, Tencent Cloud deployment, push, merge, or PR action is approved by this evidence.

## Files Added Or Updated

Added:

- `docs/02-architecture/adr/adr-004-environment-isolation-and-release-boundaries.md`
- `docs/05-execution-logs/task-plans/2026-05-21-local-postgres-pgvector-baseline.md`
- `compose.yaml`
- `scripts/db/init/001-enable-pgvector.sql`
- `drizzle.config.ts`
- `drizzle/0000_nebulous_sugar_man.sql`
- `drizzle/meta/**`

Local-only ignored file:

- `.env.local`

Existing previous readiness files are still part of the same preparation branch.

## Environment Isolation ADR

Created ADR-004 to define:

- `dev`
- `staging`
- `prod`

Key boundaries:

- separate databases;
- separate auth secrets;
- separate object storage prefixes or buckets;
- separate AI credentials or quotas;
- separate domains and callback URLs;
- future WeChat Mini Program API base URL separation.

## Local Database Configuration

### `compose.yaml`

Defines local service:

- image: `pgvector/pgvector:pg16`
- service: `tiku-postgres`
- container: `tiku-postgres-dev`
- database: `tiku`
- user: `tiku`
- local bind: `127.0.0.1:5432`
- named volume: `tiku-postgres-data`

### pgvector init SQL

`scripts/db/init/001-enable-pgvector.sql`:

```sql
CREATE EXTENSION IF NOT EXISTS vector;
```

### `.env.local`

Created as a local-only ignored file.

Validation:

```powershell
git check-ignore -v .env.local
```

Result:

```text
.gitignore:54:.env.* .env.local
```

The file content is intentionally not recorded here.

## Docker Startup

Command:

```powershell
docker compose up -d tiku-postgres
```

Result: pass after approved Docker/network access.

Summary:

```text
Image pgvector/pgvector:pg16 Pulled
Network tiku_default Created
Volume tiku_tiku-postgres-data Created
Container tiku-postgres-dev Started
```

## Database Health Checks

### `docker compose ps`

Result: pass.

Summary:

```text
tiku-postgres-dev Up ... (healthy) 127.0.0.1:5432->5432/tcp
```

### PostgreSQL Version

Command:

```powershell
docker compose exec tiku-postgres psql -U tiku -d tiku -c "SELECT version();"
```

Result: pass.

Summary:

```text
PostgreSQL 16.14
```

### pgvector Extension

Command:

```powershell
docker compose exec tiku-postgres psql -U tiku -d tiku -c "SELECT extname, extversion FROM pg_extension WHERE extname = 'vector';"
```

Result: pass.

Summary:

```text
vector 0.8.2
```

## Drizzle Migration Generation

Command:

```powershell
npm.cmd exec -- drizzle-kit generate
```

Result: pass.

Summary:

```text
36 tables
[✓] Your SQL migration file ➜ drizzle\0000_nebulous_sugar_man.sql
```

## Generated SQL Review

Reviewed generated migration:

- creates enum types;
- creates baseline tables;
- creates indexes;
- adds foreign keys;
- does not create vector columns;
- does not include `DROP`, `TRUNCATE`, or `DELETE` data operations.

Observed `ON DELETE` clauses are foreign-key behavior declarations, not data deletion commands.

Migration was accepted for local application.

## Drizzle Migration Application

Command:

```powershell
npm.cmd exec -- drizzle-kit migrate
```

Result: pass.

Summary:

```text
[✓] migrations applied successfully!
```

## Post-Migration Verification

### Public Table Count

Command:

```powershell
docker compose exec tiku-postgres psql -U tiku -d tiku -c "SELECT count(*) AS table_count FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE';"
```

Result: pass.

Summary:

```text
table_count: 36
```

### pgvector Extension Re-Check

Command:

```powershell
docker compose exec tiku-postgres psql -U tiku -d tiku -c "SELECT extname, extversion FROM pg_extension WHERE extname = 'vector';"
```

Result: pass.

Summary:

```text
vector 0.8.2
```

### Drizzle Migration Record

Command:

```powershell
docker compose exec tiku-postgres psql -U tiku -d tiku -c "SELECT id, hash, created_at FROM drizzle.__drizzle_migrations ORDER BY id;"
```

Result: pass.

Summary:

```text
id: 1
hash: 429f4f84ae1534dd6edddac5c622bb6e54530bcef58d3b975dc149d5e7d1e91f
created_at: 1779347323411
```

## Project Quality Gates

### Typecheck

Command:

```powershell
npm.cmd run typecheck
```

Result: pass.

Summary:

```text
tsc --noEmit
```

### Lint

Command:

```powershell
npm.cmd run lint
```

Result: pass.

Summary:

```text
eslint
```

### Unit Tests

Command:

```powershell
npm.cmd run test:unit
```

Result: pass.

Summary:

```text
Test Files 79 passed
Tests 267 passed
```

### Format Check

Command:

```powershell
npm.cmd run format:check
```

Result: pass.

Summary:

```text
All matched files use Prettier code style.
```

### Build

Command:

```powershell
npm.cmd run build
```

Result: pass.

Summary:

```text
Next.js 16.2.6 (Turbopack)
Environments: .env.local
Compiled successfully.
```

### End-To-End Test

Command:

```powershell
npm.cmd run test:e2e
```

Result: pass.

Summary:

```text
1 passed in Chromium
```

## Final Safety Checks

### Docker Container State

Command:

```powershell
docker compose ps
```

Result: pass.

Summary:

```text
tiku-postgres-dev Up (healthy) 127.0.0.1:5432->5432/tcp
```

### `.env.local` Ignore Check

Command:

```powershell
git check-ignore -v .env.local
```

Result: pass.

Summary:

```text
.gitignore:54:.env.* .env.local
```

### Dependency Lockfile Check

Command:

```powershell
git diff -- package.json pnpm-lock.yaml
```

Result: pass.

Summary:

```text
package.json contains only the approved packageManager pin: pnpm@10.33.4
pnpm-lock.yaml has no diff
```

### Agent System Readiness

Command:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-AgentSystemReadiness.ps1
```

Result: pass with residual recommended-skill gaps.

Summary:

```text
Required repository files: OK
Required npm scripts: OK
Superpowers plugin and active workflow skills: OK
Installed local specialist skills: playwright, security-best-practices, security-threat-model
Residual recommended-skill gaps remain for specialist areas such as Drizzle, PostgreSQL, Next.js, shadcn, Tailwind, Vercel AI SDK, RAG, and testing patterns.
```

### Git Completion Readiness Inventory

Command:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master
```

Result: pass.

Summary:

```text
branch: codex-local-handoff-readiness-prep
staged changes: none
upstream: none
remote push/PR/deploy action: none
```

## Git Status Snapshot

```text
## codex-local-handoff-readiness-prep
 M .husky/pre-commit
 M package.json
 M scripts/agent-system/Test-AgentSystemReadiness.ps1
?? compose.yaml
?? docs/02-architecture/adr/adr-004-environment-isolation-and-release-boundaries.md
?? docs/05-execution-logs/evidence/2026-05-21-local-handoff-readiness-prep.md
?? docs/05-execution-logs/evidence/2026-05-21-local-postgres-pgvector-baseline.md
?? docs/05-execution-logs/task-plans/2026-05-21-local-handoff-readiness-prep.md
?? docs/05-execution-logs/task-plans/2026-05-21-local-postgres-pgvector-baseline.md
?? drizzle.config.ts
?? drizzle/
?? scripts/db/
```

`.env.local` is intentionally absent from Git status because it is ignored.
