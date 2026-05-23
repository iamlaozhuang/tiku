# Evidence: phase-10-local-db-rebuild-seed-rehearsal

## Metadata

- Task id: `phase-10-local-db-rebuild-seed-rehearsal`
- Branch: `codex/phase-10-local-db-rebuild-seed-rehearsal`
- Base: `master`
- Evidence created at: `2026-05-23T00:00:00+08:00`
- Task plan: `docs/05-execution-logs/task-plans/2026-05-23-phase-10-local-db-rebuild-seed-rehearsal.md`
- Human approval: user explicitly replied `好，继续推进` after the next task was identified as local DB rebuild and seed rehearsal. Approval was limited to local `dev` Docker/PostgreSQL rebuild and seed rehearsal.
- Security review: evaluated; no separate security review file required because this task only rebuilds the local `dev` Docker PostgreSQL database, applies existing migrations, runs existing seed scripts, and records evidence. It does not modify auth, session, authorization, AI/RAG, database schema, migrations, runtime source, dependencies, environment files, deployment, staging, prod, real provider configuration, or production resources.

## Scope

Allowed files followed:

- `docs/05-execution-logs/task-plans/2026-05-23-phase-10-local-db-rebuild-seed-rehearsal.md`
- `docs/05-execution-logs/evidence/2026-05-23-phase-10-local-db-rebuild-seed-rehearsal.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`

Blocked files respected:

- `package.json`
- `pnpm-lock.yaml`
- `package-lock.json`
- `.env.example`
- `.env.local`
- `src/**`
- `drizzle/**`

No dependency, lockfile, runtime source, database schema, migration file, environment example, local secret file, real provider call, real content import, deployment, PR, staging, prod, cloud resource, or production-resource change was made.

## Local Database Rebuild And Seed Rehearsal

Pre-rebuild state:

- `docker compose ps`: `tiku-postgres-dev` was `Up 29 hours (healthy)`.

Local rebuild:

- `docker compose down --volumes`: stopped and removed `tiku-postgres-dev`, removed the local Docker network, and removed the local `tiku_tiku-postgres-data` volume.
- `docker compose up -d`: recreated the local Docker network, recreated the local PostgreSQL volume, and started `tiku-postgres-dev`.
- First immediate `docker compose ps`: container was `health: starting`.
- Follow-up `docker compose ps`: container was `Up 28 seconds (healthy)`.
- Final declared `docker compose ps`: container was `Up 56 seconds (healthy)`.

Migration rehearsal:

- `.\node_modules\.bin\drizzle-kit.cmd migrate`: pass.
- Drizzle Kit used `drizzle.config.ts`, read the existing local environment configuration without printing it, used the `postgres` driver, and reported `migrations applied successfully`.
- Existing migration files applied; no migration files were generated or modified.

Seed rehearsal:

- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\db\Seed-DevDatabase.ps1`: pass.
- First seed summary:
  - `auth_user_count`: `2`
  - `admin_count`: `1`
  - `student_user_count`: `1`
  - `organization_count`: `1`
  - `personal_auth_count`: `1`
  - `paper_count`: `1`
  - `paper_question_count`: `1`
  - `model_config_count`: `1`
- Second seed summary was identical to the first summary, proving the current dev seed script is idempotent for the tracked Phase 10 local dataset.

## Validation Commands

Required commands:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-TaskClaimReadiness.ps1 -TaskId phase-10-local-db-rebuild-seed-rehearsal
docker compose ps
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-AgentSystemReadiness.ps1
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Invoke-QualityGate.ps1
npm.cmd run build
npm.cmd run test:e2e
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-NamingConventions.ps1
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master
```

Results on `codex/phase-10-local-db-rebuild-seed-rehearsal`:

- `Test-TaskClaimReadiness.ps1 -TaskId phase-10-local-db-rebuild-seed-rehearsal`: pass; task was pending, dependency `phase-10-local-fresh-checkout-readiness` was complete, `taskPlanPolicy: required`, and allowed/blocked files were confirmed. Risk types included `local_database`, `seed_idempotent`, `evidence_integrity`, and `destructive_data_operation`.
- `docker compose ps`: pass after rebuild; local `tiku-postgres-dev` was healthy.
- `Test-AgentSystemReadiness.ps1`: pass.
- `Invoke-QualityGate.ps1`: pass.
  - lint: pass.
  - typecheck: pass.
  - test:unit: pass, `103` files and `379` tests passed.
  - format:check: pass.
- `npm.cmd run build`: pass; Next.js `16.2.6` production build compiled successfully and listed the current `/api/v1/` REST surface and app routes.
- `npm.cmd run test:e2e`: pass; `2` Chromium tests passed:
  - `e2e\home.spec.ts`: loaded root navigation page.
  - `e2e\local-business-flow.spec.ts`: ran the local student, admin, audit, and mock AI business flow against the rebuilt and seeded local database.
- `Test-NamingConventions.ps1`: pass; banned business terms absent, standalone risky `section`/`option` absent, route folders kebab-case/public-id params, DTO fields camelCase.
- `Test-GitCompletionReadiness.ps1 -BaseBranch master`: pass inventory; at that point only the new task plan was untracked and no tracked file differed from `origin/master`.

## Readiness Conclusion

Local DB rebuild and seed rehearsal conclusion: Phase 10 local `dev` PostgreSQL can be rebuilt from a clean Docker volume, migrated with existing tracked migrations, seeded with the existing dev seed script, and validated by quality gate, production build, E2E, naming scan, and git readiness inventory.

This conclusion is local-only:

- It does not claim staging, production, Tencent Cloud, public object storage, customer-network, managed-browser, WeChat Mini Program, real content, real provider, or production credential readiness.
- It does not validate real `model_provider` credentials.
- It does not import real `paper`, `material`, or `resource` files.

## Residual Risk

- The rehearsal used the current local `.env.local` indirectly through existing project tooling, but no environment file content was read, modified, committed, or recorded.
- The task proves the current tracked migrations and seed script work locally; it does not introduce or review new schema changes.
- The E2E run is local Chromium-based; broader workplace browser/network coverage remains outside this task.
- Real content and real provider tasks remain pending and require their own redaction and approval evidence.

## Git Closeout

- implementationCommit: `16ec4bf docs(agent): record phase 10 db rebuild seed rehearsal`.
- metadataCommit: pending.
- merge: pending.
- postMergeValidation on `master`: pending.
- push: pending.
- cleanup: pending.

## Taste Compliance Self-Check

- Frontend visual taste: no UI or styling changes; no pure black, unreviewed gradient, token, Tailwind, or typography changes.
- Loading/empty/error: no runtime state handling changed.
- Interaction feedback: no interactive component behavior changed.
- Tailwind formatting: no Tailwind classes changed; format gate passed.
- Backend/API contract: no API runtime changed; build preserved the `/api/v1/` route surface under ADR-002.
- Naming discipline: naming convention gate passed.
- Data privacy: no session token, password, secret, API key, database URL, raw prompt, raw answer, raw model response, provider payload, real content excerpt, or production data was recorded.
- Environment isolation: all database work stayed inside local `dev`; no staging, prod, cloud, deployment, or production-resource operation was performed.
- Dependency/schema isolation: no dependency, lockfile, environment, schema, migration file, runtime, or production-resource change was made.
