# Security DB Migration Replay Guard Review Plan

> **For agentic workers:** this is a docs/source-read-only security review. Do not connect to a database, read env or
> secrets, execute or replay migrations, record raw SQL output, mutate schema/migrations/seeds, change source/tests, run
> browser/e2e/dev-server, call Provider/AI, touch package/lockfiles, or make release readiness/final Pass/Cost
> Calibration claims.

**Goal:** Review generated migration inventory, journal metadata, schema/config command surfaces, and destructive or
constraint-relaxation migration labels to determine whether executable migration guard tasks are needed, without running
any database or migration command.

**Architecture:** This follows ADR-001 Drizzle ORM and migration discipline, ADR-002 runtime layering, ADR-004/ADR-005
environment and release boundaries, ADR-006 dependency gates, and ADR-007 authorization source-of-truth constraints.
Migration execution, schema changes, live DB inspection, staging/prod/cloud, release readiness, final Pass, and Cost
Calibration remain blocked.

---

- Task id: `security-db-migration-replay-guard-review-2026-06-29`
- Branch: `codex/security-db-migration-replay-guard-review-20260629`
- Status: `closed_pending_commit_merge_push_cleanup`
- Planned at: `2026-06-29T13:49:17-07:00`
- Finding id: `db-inv-002`
- Severity: `medium`

## Mandatory Read List

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/2026-06-29-security-db-schema-migration-risk-inventory.md`
- `docs/05-execution-logs/evidence/2026-06-29-security-db-schema-migration-risk-inventory.md`
- `docs/05-execution-logs/audits-reviews/2026-06-29-security-db-schema-migration-risk-inventory.md`
- `docs/05-execution-logs/acceptance/2026-06-29-security-db-schema-migration-risk-inventory.md`
- `docs/05-execution-logs/task-plans/2026-06-29-security-db-repository-query-construction-review.md`
- `docs/05-execution-logs/evidence/2026-06-29-security-db-repository-query-construction-review.md`
- `docs/05-execution-logs/audits-reviews/2026-06-29-security-db-repository-query-construction-review.md`
- `docs/05-execution-logs/acceptance/2026-06-29-security-db-repository-query-construction-review.md`
- `docs/05-execution-logs/task-plans/2026-06-29-security-employee-import-bulk-limit-repair.md`
- `docs/05-execution-logs/evidence/2026-06-29-security-employee-import-bulk-limit-repair.md`
- `docs/05-execution-logs/audits-reviews/2026-06-29-security-employee-import-bulk-limit-repair.md`
- `docs/05-execution-logs/acceptance/2026-06-29-security-employee-import-bulk-limit-repair.md`

## Allowed Writable Files

- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/01-requirements/traceability/2026-06-29-security-db-migration-replay-guard-review.md`
- `docs/05-execution-logs/task-plans/2026-06-29-security-db-migration-replay-guard-review.md`
- `docs/05-execution-logs/evidence/2026-06-29-security-db-migration-replay-guard-review.md`
- `docs/05-execution-logs/audits-reviews/2026-06-29-security-db-migration-replay-guard-review.md`
- `docs/05-execution-logs/acceptance/2026-06-29-security-db-migration-replay-guard-review.md`

## Read-Only Source Scope

- `package.json`
- `drizzle.config.ts`
- `drizzle/meta/_journal.json`
- `drizzle/meta/*.json`
- `drizzle/*.sql`
- `src/db/schema/**`
- `migrations/**`

## Blocked Files And Actions

- No `.env*`, package, lockfile, source, test, e2e, script, migration, schema, seed, browser artifact, private fixture,
  archive/history, or unrelated docs writes.
- No DB connection/read/write/raw row/schema/migration/seed, migration replay, `drizzle-kit push`, destructive SQL,
  drift command against a live database, or raw SQL output capture.
- No env/secret/connection string value read or evidence.
- No Provider/AI call, Provider configuration, prompt, payload, raw AI I/O, browser/dev-server/e2e, staging/prod/cloud,
  deploy, PR, force-push, release readiness, final Pass, or Cost Calibration.

## Execution Steps

- [x] **Step 1: Read governance and predecessor evidence**
- [x] **Step 2: Create short branch from aligned master**
- [x] **Step 3: Materialize task boundaries in state, queue, and plan**
- [x] **Step 4: Build read-only migration surface index**
- [x] **Step 5: Classify migration replay and destructive-pattern guard risks**
- [x] **Step 6: Write traceability, evidence, audit, and acceptance**
- [x] **Step 7: Run scoped formatting, diff, and Module Run v2 gates**
- [ ] **Step 8: Commit, fast-forward merge, push, and cleanup if validation passes**

## Review Classification Targets

| Finding id | Surface                                | Initial severity | Initial status          | Expected output                                      |
| ---------- | -------------------------------------- | ---------------- | ----------------------- | ---------------------------------------------------- |
| db-mig-001 | Migration command and config boundary  | medium           | pending_review          | guardrail classification and future task split       |
| db-mig-002 | Generated migration journal continuity | low              | pending_count_review    | count/status summary without raw SQL                 |
| db-mig-003 | Destructive-pattern migration labels   | medium           | pending_label_review    | redacted label/category matrix                       |
| db-mig-004 | Schema/migration source alignment      | medium           | pending_read_only_check | source-only alignment summary without DB drift check |

## Validation Commands

```powershell
rg --files drizzle src/db/schema
rg -l "DROP|TRUNCATE|ALTER TABLE|CREATE TABLE|CREATE INDEX|DROP INDEX|DROP TABLE|NOT NULL|UNIQUE|REFERENCES" drizzle src/db/schema drizzle.config.ts package.json
npx.cmd prettier --write --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/01-requirements/traceability/2026-06-29-security-db-migration-replay-guard-review.md docs/05-execution-logs/task-plans/2026-06-29-security-db-migration-replay-guard-review.md docs/05-execution-logs/evidence/2026-06-29-security-db-migration-replay-guard-review.md docs/05-execution-logs/audits-reviews/2026-06-29-security-db-migration-replay-guard-review.md docs/05-execution-logs/acceptance/2026-06-29-security-db-migration-replay-guard-review.md
npx.cmd prettier --check --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/01-requirements/traceability/2026-06-29-security-db-migration-replay-guard-review.md docs/05-execution-logs/task-plans/2026-06-29-security-db-migration-replay-guard-review.md docs/05-execution-logs/evidence/2026-06-29-security-db-migration-replay-guard-review.md docs/05-execution-logs/audits-reviews/2026-06-29-security-db-migration-replay-guard-review.md docs/05-execution-logs/acceptance/2026-06-29-security-db-migration-replay-guard-review.md
git diff --check
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId security-db-migration-replay-guard-review-2026-06-29
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId security-db-migration-replay-guard-review-2026-06-29
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId security-db-migration-replay-guard-review-2026-06-29 -SkipRemoteAheadCheck
```

## Closeout Policy

- Local commit: approved by `localSecurityRepairLoopApproval20260629` after task-scoped validation passes.
- Fast-forward merge to `master`: approved by task-scoped closeout policy after validation passes.
- Push `origin/master`: approved by task-scoped closeout policy after validation passes.
- Cleanup short branch: approved after merge and push.
