# Security AI Model Config Fallback Order Limit Repair Plan

> **For agentic workers:** this is a local source/test security repair. Do not connect to any database, read env or
> secrets, record raw DB rows/internal IDs/PII, mutate schema/migrations/seeds, run browser/e2e/dev-server, call
> Provider/AI, touch package/lockfiles, or make release readiness/final Pass/Cost Calibration claims.

**Goal:** Enforce a bounded `model_config.reorder_fallback` item list before the repository per-item update loop can be
reached, while preserving legitimate fallback reorder behavior.

**Architecture:** The repair stays at the validator boundary used by the route/service adapter. This follows ADR-002
thin adapter and shared validator layering, ADR-004/ADR-005 environment isolation, ADR-006 dependency/provider gates, and
ADR-007 source-of-truth constraints. Runtime DB, Provider, browser, dependency, schema, migration, seed, staging, prod,
release readiness, final Pass, and Cost Calibration remain blocked.

---

- Task id: `security-ai-model-config-fallback-order-limit-repair-2026-06-29`
- Branch: `codex/security-ai-fallback-order-limit-20260629`
- Status: `in_progress_materialized`
- Planned at: `2026-06-29T13:15:41-07:00`
- Finding id: `db-query-002`
- Severity: `medium`

## Mandatory Read List

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/2026-06-29-security-db-repository-query-construction-review.md`
- `docs/05-execution-logs/evidence/2026-06-29-security-db-repository-query-construction-review.md`
- `docs/05-execution-logs/audits-reviews/2026-06-29-security-db-repository-query-construction-review.md`
- `docs/05-execution-logs/acceptance/2026-06-29-security-db-repository-query-construction-review.md`

## Allowed Writable Files

- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/01-requirements/traceability/2026-06-29-security-ai-model-config-fallback-order-limit-repair.md`
- `docs/05-execution-logs/task-plans/2026-06-29-security-ai-model-config-fallback-order-limit-repair.md`
- `docs/05-execution-logs/evidence/2026-06-29-security-ai-model-config-fallback-order-limit-repair.md`
- `docs/05-execution-logs/audits-reviews/2026-06-29-security-ai-model-config-fallback-order-limit-repair.md`
- `docs/05-execution-logs/acceptance/2026-06-29-security-ai-model-config-fallback-order-limit-repair.md`
- `src/server/validators/ai-rag.ts`
- `src/server/validators/ai-rag.test.ts`
- `tests/unit/phase-12-model-config-server-runtime.test.ts`

## Read-Only Supporting Scope

- `src/server/services/admin-ai-audit-log-runtime.ts`
- `src/server/repositories/admin-ai-audit-log-runtime-repository.ts`

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
- [x] **Step 4: Inspect validator/service/repository/test path**
- [x] **Step 5: Add RED regression coverage for oversized fallback reorder input**
- [x] **Step 6: Implement the smallest validator-level item limit**
- [x] **Step 7: Verify focused GREEN and normal behavior**
- [x] **Step 8: Write traceability, evidence, audit, and acceptance**
- [x] **Step 9: Run scoped formatting, diff, lint, typecheck, and Module Run v2 gates**
- [ ] **Step 10: Commit, fast-forward merge, push, and cleanup if validation passes**

## Security Invariant

`model_config.reorder_fallback` must reject an oversized item list at the input normalization boundary before route code
can call `reorderModelConfigFallback`, because the repository performs one update per accepted item.

## TDD Plan

1. Add a validator-level test that currently fails because oversized `items` are accepted.
2. Add or update a route/runtime unit test proving the oversized payload returns validation failure and does not call the
   repository.
3. Run focused tests and record the RED result.
4. Add the smallest validator guard and named limit constant.
5. Re-run focused tests and record the GREEN result.

## Validation Commands

```powershell
npm.cmd run test:unit -- src/server/validators/ai-rag.test.ts tests/unit/phase-12-model-config-server-runtime.test.ts
npm.cmd run lint
npm.cmd run typecheck
npx.cmd prettier --write --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/01-requirements/traceability/2026-06-29-security-ai-model-config-fallback-order-limit-repair.md docs/05-execution-logs/task-plans/2026-06-29-security-ai-model-config-fallback-order-limit-repair.md docs/05-execution-logs/evidence/2026-06-29-security-ai-model-config-fallback-order-limit-repair.md docs/05-execution-logs/audits-reviews/2026-06-29-security-ai-model-config-fallback-order-limit-repair.md docs/05-execution-logs/acceptance/2026-06-29-security-ai-model-config-fallback-order-limit-repair.md src/server/validators/ai-rag.ts src/server/validators/ai-rag.test.ts tests/unit/phase-12-model-config-server-runtime.test.ts
npx.cmd prettier --check --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/01-requirements/traceability/2026-06-29-security-ai-model-config-fallback-order-limit-repair.md docs/05-execution-logs/task-plans/2026-06-29-security-ai-model-config-fallback-order-limit-repair.md docs/05-execution-logs/evidence/2026-06-29-security-ai-model-config-fallback-order-limit-repair.md docs/05-execution-logs/audits-reviews/2026-06-29-security-ai-model-config-fallback-order-limit-repair.md docs/05-execution-logs/acceptance/2026-06-29-security-ai-model-config-fallback-order-limit-repair.md src/server/validators/ai-rag.ts src/server/validators/ai-rag.test.ts tests/unit/phase-12-model-config-server-runtime.test.ts
git diff --check
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId security-ai-model-config-fallback-order-limit-repair-2026-06-29
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId security-ai-model-config-fallback-order-limit-repair-2026-06-29
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId security-ai-model-config-fallback-order-limit-repair-2026-06-29 -SkipRemoteAheadCheck
```

## Closeout Policy

- Local commit: approved by `localSecurityRepairLoopApproval20260629` after task-scoped validation passes.
- Fast-forward merge to `master`: approved by task-scoped closeout policy after validation passes.
- Push `origin/master`: approved by task-scoped closeout policy after validation passes.
- Cleanup short branch: approved after merge and push.
