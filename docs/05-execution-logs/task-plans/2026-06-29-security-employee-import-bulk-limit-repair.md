# Security Employee Import Bulk Limit Repair Plan

> **For agentic workers:** this is a local source/test security repair. Do not connect to any database, read env or
> secrets, record raw DB rows/internal IDs/PII, mutate schema/migrations/seeds, run browser/e2e/dev-server, call
> Provider/AI, touch package/lockfiles, or make release readiness/final Pass/Cost Calibration claims.

**Goal:** Enforce bounded employee import JSON array and CSV/TSV content or row counts before repository import or
employee account creation work is reached, while preserving legitimate employee import behavior.

**Architecture:** The repair stays inside the service-layer transport normalization boundary used by the employee import
route. This follows ADR-002 thin route/service layering, ADR-004/ADR-005 environment isolation, ADR-006 dependency and
Provider gates, and ADR-007 authorization source-of-truth constraints.

---

- Task id: `security-employee-import-bulk-limit-repair-2026-06-29`
- Branch: `codex/security-employee-import-bulk-limit-20260629`
- Status: `closed`
- Planned at: `2026-06-29T13:33:19-07:00`
- Finding id: `db-query-003`
- Severity: `medium`

## Mandatory Read List

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/2026-06-29-security-ai-model-config-fallback-order-limit-repair.md`
- `docs/05-execution-logs/evidence/2026-06-29-security-ai-model-config-fallback-order-limit-repair.md`
- `docs/05-execution-logs/audits-reviews/2026-06-29-security-ai-model-config-fallback-order-limit-repair.md`
- `docs/05-execution-logs/acceptance/2026-06-29-security-ai-model-config-fallback-order-limit-repair.md`
- `docs/05-execution-logs/task-plans/2026-06-29-security-db-repository-query-construction-review.md`
- `docs/05-execution-logs/evidence/2026-06-29-security-db-repository-query-construction-review.md`
- `docs/05-execution-logs/audits-reviews/2026-06-29-security-db-repository-query-construction-review.md`
- `docs/05-execution-logs/acceptance/2026-06-29-security-db-repository-query-construction-review.md`

## Allowed Writable Files

- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/01-requirements/traceability/2026-06-29-security-employee-import-bulk-limit-repair.md`
- `docs/05-execution-logs/task-plans/2026-06-29-security-employee-import-bulk-limit-repair.md`
- `docs/05-execution-logs/evidence/2026-06-29-security-employee-import-bulk-limit-repair.md`
- `docs/05-execution-logs/audits-reviews/2026-06-29-security-employee-import-bulk-limit-repair.md`
- `docs/05-execution-logs/acceptance/2026-06-29-security-employee-import-bulk-limit-repair.md`
- `src/server/services/admin-organization-org-auth-runtime.ts`
- `tests/unit/phase-20-ra-01-04-employee-import.test.ts`

## Read-Only Supporting Scope

- `src/server/contracts/admin-user-org-auth-ops-contract.ts`
- `src/server/repositories/admin-organization-org-auth-runtime-repository.ts`

## Blocked Files And Actions

- No `.env*`, package, lockfile, `drizzle/**`, migration, seed, `src/db/**`, `drizzle.config.ts`, e2e, script, browser
  artifact, private fixture, archive/history, or unrelated source/test writes.
- No DB connection/read/write/raw row/schema/migration/seed or `drizzle-kit push`.
- No env/secret/connection string value read or evidence.
- No Provider/AI call, Provider configuration, prompt, payload, raw AI I/O, browser/dev-server/e2e, staging/prod/cloud,
  deploy, PR, force-push, release readiness, final Pass, or Cost Calibration.

## Execution Steps

- [x] **Step 1: Read governance and predecessor evidence**
- [x] **Step 2: Create short branch from aligned master**
- [x] **Step 3: Materialize task boundaries in state, queue, and plan**
- [x] **Step 4: Inspect employee import service and focused tests**
- [x] **Step 5: Add RED regression coverage for oversized JSON array and CSV/TSV input**
- [x] **Step 6: Implement the smallest service-level import limit guards**
- [x] **Step 7: Verify focused GREEN and normal behavior**
- [x] **Step 8: Write traceability, evidence, audit, and acceptance**
- [x] **Step 9: Run scoped formatting, diff, lint, typecheck, and Module Run v2 gates**
- [ ] **Step 10: Commit, fast-forward merge, push, and cleanup if validation passes**

## Security Invariant

Employee import must reject oversized JSON arrays and oversized CSV/TSV content before any repository import,
`inArray`-style lookup, per-row account creation, or audit summary based on large unbounded input can execute.

## TDD Plan

1. Add route-level tests showing oversized JSON array input currently reaches repository import.
2. Add route-level tests showing oversized CSV/TSV content currently reaches employee account creation or parser work.
3. Run focused tests and record the RED result.
4. Add named service-level limits and reject oversized input during normalization.
5. Re-run focused tests and record the GREEN result.

## Validation Commands

```powershell
npm.cmd run test:unit -- tests/unit/phase-20-ra-01-04-employee-import.test.ts
npm.cmd run lint
npm.cmd run typecheck
npx.cmd prettier --write --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/01-requirements/traceability/2026-06-29-security-employee-import-bulk-limit-repair.md docs/05-execution-logs/task-plans/2026-06-29-security-employee-import-bulk-limit-repair.md docs/05-execution-logs/evidence/2026-06-29-security-employee-import-bulk-limit-repair.md docs/05-execution-logs/audits-reviews/2026-06-29-security-employee-import-bulk-limit-repair.md docs/05-execution-logs/acceptance/2026-06-29-security-employee-import-bulk-limit-repair.md src/server/services/admin-organization-org-auth-runtime.ts tests/unit/phase-20-ra-01-04-employee-import.test.ts
npx.cmd prettier --check --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/01-requirements/traceability/2026-06-29-security-employee-import-bulk-limit-repair.md docs/05-execution-logs/task-plans/2026-06-29-security-employee-import-bulk-limit-repair.md docs/05-execution-logs/evidence/2026-06-29-security-employee-import-bulk-limit-repair.md docs/05-execution-logs/audits-reviews/2026-06-29-security-employee-import-bulk-limit-repair.md docs/05-execution-logs/acceptance/2026-06-29-security-employee-import-bulk-limit-repair.md src/server/services/admin-organization-org-auth-runtime.ts tests/unit/phase-20-ra-01-04-employee-import.test.ts
git diff --check
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId security-employee-import-bulk-limit-repair-2026-06-29
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId security-employee-import-bulk-limit-repair-2026-06-29
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId security-employee-import-bulk-limit-repair-2026-06-29 -SkipRemoteAheadCheck
```

## Closeout Policy

- Local commit: approved by `localSecurityRepairLoopApproval20260629` after task-scoped validation passes.
- Fast-forward merge to `master`: approved by task-scoped closeout policy after validation passes.
- Push `origin/master`: approved by task-scoped closeout policy after validation passes.
- Cleanup short branch: approved after merge and push.
