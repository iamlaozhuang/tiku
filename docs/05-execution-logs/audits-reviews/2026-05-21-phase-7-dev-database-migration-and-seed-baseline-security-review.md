# Security Review: Phase 7 Dev Database Migration And Seed Baseline

## Metadata

- Task id: `phase-7-dev-database-migration-and-seed-baseline`
- Branch: `codex/phase-7-dev-database-migration-and-seed-baseline`
- Base: `master`
- Reviewer: Codex
- Review date: 2026-05-21
- Verdict: `APPROVE`

## Files Reviewed

- `src/db/dev-seed.ts`
- `src/db/dev-seed.test.ts`
- `scripts/db/Seed-DevDatabase.ps1`
- `drizzle/0000_nebulous_sugar_man.sql`
- `scripts/db/init/001-enable-pgvector.sql`
- `docs/05-execution-logs/task-plans/2026-05-21-phase-7-dev-database-migration-and-seed-baseline.md`
- `docs/05-execution-logs/evidence/2026-05-21-phase-7-dev-database-migration-and-seed-baseline.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`

## Risk Types Reviewed

- `schema`
- `migration`
- `seed`
- `local_runtime`
- `evidence_integrity`

## Abuse Cases Considered

- Accidentally applying destructive schema sync: `drizzle-kit push` was not used; migration path used `drizzle-kit migrate`.
- Seed rerun duplicating accounts or paper content: upserts use stable Better Auth IDs, `public_id`, or natural seed keys, and repeated seed output kept row counts stable.
- Seed leaking production credentials: credentials use `*.tiku.local` emails and local-only passwords documented as dev fixtures.
- Seed enabling real AI provider cost: `provider_key` is `mock`, no API key reference is persisted, and `base_url` is `null`.
- Exposing numeric database IDs externally: seed uses stable `public_id` values; numeric IDs remain internal FK values only.

## Data Exposure Review

- No `.env.example`, `.env.local`, package, lockfile, or production environment file changed.
- Seed password hashes correspond to local dev fixture passwords only; they are not production secrets.
- `model_provider.api_key_secret_ref` and `api_key_last_four` remain `null`.
- Seed snapshots contain only fixture question/paper content and no user answers, prompts, session tokens, API keys, or provider payloads.

## Authorization Boundary Review

- The seed creates one active student `personal_auth` for `profession: monopoly`, `level: 3`, matching the published paper scope.
- No runtime authorization service is enabled by this task.
- Future route tasks must still enforce session, role, ownership, and authorization filtering; public IDs are lookup handles only.

## API Contract Review

- No API route, DTO, or response envelope changed.
- JSON-like snapshots use camelCase keys.
- Optional absent values are represented with `null`, not empty strings.

## Migration Review

- Existing generated migration remains under `drizzle/**`.
- Migration verification used `npm.cmd exec -- drizzle-kit migrate`.
- No migration contains `DROP`, `TRUNCATE`, or data `DELETE` operations for this task.
- pgvector verification confirms extension `vector 0.8.2` in the local dev database.

## Test Coverage And Accepted Gaps

- Covered:
  - deterministic seed dataset structure;
  - one super admin, one student, one organization, one active authorization, one published answerable paper, and mock AI metadata;
  - no empty-string seed values;
  - focused unit test RED/GREEN;
  - local migrate and seed rerun count checks.
- Accepted gaps:
  - No auth login flow is tested here; `phase-7-auth-session-runtime-baseline` owns session runtime.
  - No student/admin API smoke test is run here; later Phase 7 smoke tasks own route behavior.

## Verdict

`APPROVE`: The task is safe to merge after required quality gates pass. Remaining gaps are intentionally deferred to queued Phase 7 runtime tasks and are non-blocking for this migration/seed baseline.
