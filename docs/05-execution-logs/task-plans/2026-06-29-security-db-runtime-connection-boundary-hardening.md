# Security DB Runtime Connection Boundary Hardening Plan

> **For agentic workers:** harden local runtime DB boundary by reducing duplicated env/DB connection logic. Do not read
> `.env*`, record connection strings, connect to DB, run migrations/seeds, touch package/lockfile, run browser/e2e, call
> Provider/AI, or make release readiness/final Pass/Cost Calibration claims.

**Goal:** Centralize runtime database URL and local-env loading behavior behind `runtime-database.ts`, then update scoped
runtime auth/repository files to use that helper while preserving existing missing-configuration error behavior.

**Architecture:** This follows ADR-002 service/repository boundaries, ADR-004/ADR-005 environment isolation gates,
ADR-006 dependency gates, and ADR-007 authorization boundaries. This task changes local TypeScript source/tests only; it
does not execute database runtime.

---

- Task id: `security-db-runtime-connection-boundary-hardening-2026-06-29`
- Branch: `codex/security-db-runtime-boundary-20260629`
- Status: `in_progress_materialized`
- Planned at: `2026-06-29T12:43:05-07:00`

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
- `docs/05-execution-logs/evidence/2026-06-29-test-acceptance-evidence-status-reconciliation.md`

## Allowed Writable Files

- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/01-requirements/traceability/2026-06-29-security-db-runtime-connection-boundary-hardening.md`
- `docs/05-execution-logs/task-plans/2026-06-29-security-db-runtime-connection-boundary-hardening.md`
- `docs/05-execution-logs/evidence/2026-06-29-security-db-runtime-connection-boundary-hardening.md`
- `docs/05-execution-logs/audits-reviews/2026-06-29-security-db-runtime-connection-boundary-hardening.md`
- `docs/05-execution-logs/acceptance/2026-06-29-security-db-runtime-connection-boundary-hardening.md`
- `src/server/repositories/runtime-database.ts`
- `tests/unit/runtime-database-baseline.test.ts`
- `src/server/auth/local-session-runtime.ts`
- `src/server/auth/local-session-logout-route.ts`
- `src/server/repositories/admin-flow-runtime-repository.ts`
- `src/server/repositories/admin-ai-audit-log-runtime-repository.ts`
- `src/server/repositories/admin-redeem-code-runtime-repository.ts`
- `src/server/repositories/admin-organization-org-auth-runtime-repository.ts`
- `src/server/repositories/mistake-book-repository.ts`
- `src/server/repositories/student-authorization-redeem-runtime-repository.ts`
- `src/server/repositories/student-flow-runtime-repository.ts`

## Blocked Files And Actions

- No `.env*`, package, lockfile, `drizzle/**`, migration, seed, `src/db/**`, `drizzle.config.ts`, e2e, script, browser
  artifact, private fixture, or archive/history writes.
- No DB connection/read/write/raw row/schema/migration/seed or `drizzle-kit push`.
- No env/secret/connection string value read or evidence.
- No Provider/AI call, Provider configuration, prompt, payload, raw AI I/O, browser/dev-server/e2e, staging/prod/cloud,
  deploy, PR, force-push, release readiness, final Pass, or Cost Calibration.

## Execution Steps

- [x] **Step 1: Read governance and predecessor evidence**
- [x] **Step 2: Create short branch**
- [x] **Step 3: Materialize task boundaries**
- [x] **Step 4: Add central schema-aware runtime DB helper**
- [x] **Step 5: Replace scoped duplicate local-env DB factories**
- [x] **Step 6: Add focused no-env-read injected-database test coverage**
- [x] **Step 7: Run focused tests, lint, typecheck, formatting, diff, and Module Run v2 gates**
- [x] **Step 8: Write traceability, evidence, audit, acceptance, then close out**

## Validation Commands

```powershell
npm.cmd run test:unit -- tests/unit/runtime-database-baseline.test.ts src/server/auth/local-session-runtime.test.ts
npm.cmd run lint
npm.cmd run typecheck
npx.cmd prettier --write --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/01-requirements/traceability/2026-06-29-security-db-runtime-connection-boundary-hardening.md docs/05-execution-logs/task-plans/2026-06-29-security-db-runtime-connection-boundary-hardening.md docs/05-execution-logs/evidence/2026-06-29-security-db-runtime-connection-boundary-hardening.md docs/05-execution-logs/audits-reviews/2026-06-29-security-db-runtime-connection-boundary-hardening.md docs/05-execution-logs/acceptance/2026-06-29-security-db-runtime-connection-boundary-hardening.md src/server/repositories/runtime-database.ts tests/unit/runtime-database-baseline.test.ts src/server/auth/local-session-runtime.ts src/server/auth/local-session-logout-route.ts src/server/repositories/admin-flow-runtime-repository.ts src/server/repositories/admin-ai-audit-log-runtime-repository.ts src/server/repositories/admin-redeem-code-runtime-repository.ts src/server/repositories/admin-organization-org-auth-runtime-repository.ts src/server/repositories/mistake-book-repository.ts src/server/repositories/student-authorization-redeem-runtime-repository.ts src/server/repositories/student-flow-runtime-repository.ts
npx.cmd prettier --check --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/01-requirements/traceability/2026-06-29-security-db-runtime-connection-boundary-hardening.md docs/05-execution-logs/task-plans/2026-06-29-security-db-runtime-connection-boundary-hardening.md docs/05-execution-logs/evidence/2026-06-29-security-db-runtime-connection-boundary-hardening.md docs/05-execution-logs/audits-reviews/2026-06-29-security-db-runtime-connection-boundary-hardening.md docs/05-execution-logs/acceptance/2026-06-29-security-db-runtime-connection-boundary-hardening.md src/server/repositories/runtime-database.ts tests/unit/runtime-database-baseline.test.ts src/server/auth/local-session-runtime.ts src/server/auth/local-session-logout-route.ts src/server/repositories/admin-flow-runtime-repository.ts src/server/repositories/admin-ai-audit-log-runtime-repository.ts src/server/repositories/admin-redeem-code-runtime-repository.ts src/server/repositories/admin-organization-org-auth-runtime-repository.ts src/server/repositories/mistake-book-repository.ts src/server/repositories/student-authorization-redeem-runtime-repository.ts src/server/repositories/student-flow-runtime-repository.ts
git diff --check
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId security-db-runtime-connection-boundary-hardening-2026-06-29
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId security-db-runtime-connection-boundary-hardening-2026-06-29
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId security-db-runtime-connection-boundary-hardening-2026-06-29 -SkipRemoteAheadCheck
```

## Closeout Policy

- Local commit: approved by `localSecurityRepairLoopApproval20260629` after task-scoped validation passes.
- Fast-forward merge to `master`: approved by task-scoped closeout policy after validation passes.
- Push `origin/master`: approved by task-scoped closeout policy after validation passes.
- Cleanup short branch: approved after merge and push.
