# Security DB Repository Query Construction Review Plan

> **For agentic workers:** this is a docs/source-read-only security review. Do not connect to a database, read env or
> secrets, record raw DB rows/internal IDs/PII, mutate schema/migrations/seeds, change source/tests, run browser/e2e,
> call Provider/AI, touch package/lockfiles, or make release readiness/final Pass/Cost Calibration claims.

**Goal:** Inventory repository query construction paths and classify query-construction, dynamic ordering/filtering,
pagination, raw SQL template, N+1, and unbounded-query risks into executable follow-up tasks. This task does not fix
source code.

**Architecture:** This follows ADR-002 repository ownership, ADR-004/ADR-005 environment isolation and release boundaries,
ADR-006 dependency gates, and ADR-007 authorization source-of-truth constraints. Repository source may be read only; DB
runtime and raw data access remain blocked.

---

- Task id: `security-db-repository-query-construction-review-2026-06-29`
- Branch: `codex/security-db-query-review-20260629`
- Status: `in_progress_materialized`
- Planned at: `2026-06-29T13:00:45-07:00`

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
- `docs/05-execution-logs/evidence/2026-06-29-security-db-runtime-connection-boundary-hardening.md`
- `docs/05-execution-logs/audits-reviews/2026-06-29-security-db-runtime-connection-boundary-hardening.md`
- `docs/05-execution-logs/acceptance/2026-06-29-security-db-runtime-connection-boundary-hardening.md`

## Allowed Writable Files

- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/01-requirements/traceability/2026-06-29-security-db-repository-query-construction-review.md`
- `docs/05-execution-logs/task-plans/2026-06-29-security-db-repository-query-construction-review.md`
- `docs/05-execution-logs/evidence/2026-06-29-security-db-repository-query-construction-review.md`
- `docs/05-execution-logs/audits-reviews/2026-06-29-security-db-repository-query-construction-review.md`
- `docs/05-execution-logs/acceptance/2026-06-29-security-db-repository-query-construction-review.md`

## Read-Only Source Scope

- `src/server/repositories/**`
- `src/server/services/**`
- `src/server/validators/**`
- `src/server/contracts/**`
- `tests/unit/**`

## Blocked Files And Actions

- No `.env*`, package, lockfile, `drizzle/**`, migration, seed, `src/db/**`, `drizzle.config.ts`, e2e, script, browser
  artifact, private fixture, archive/history, source, or test writes.
- No DB connection/read/write/raw row/schema/migration/seed or `drizzle-kit push`.
- No env/secret/connection string value read or evidence.
- No Provider/AI call, Provider configuration, prompt, payload, raw AI I/O, browser/dev-server/e2e, staging/prod/cloud,
  deploy, PR, force-push, release readiness, final Pass, or Cost Calibration.

## Execution Steps

- [x] **Step 1: Read governance and predecessor evidence**
- [x] **Step 2: Create short branch**
- [x] **Step 3: Materialize task boundaries**
- [x] **Step 4: Run source-read-only repository query pattern inventory**
- [x] **Step 5: Classify risks and split follow-up tasks without source repair**
- [x] **Step 6: Write traceability, evidence, audit, and acceptance**
- [x] **Step 7: Run scoped formatting, diff, and Module Run v2 gates**
- [ ] **Step 8: Commit, fast-forward merge, push, and cleanup if validation passes**

## Review Classification

| Finding id   | Surface                                                       | Severity | Status                                                   | Follow-up                                                         |
| ------------ | ------------------------------------------------------------- | -------- | -------------------------------------------------------- | ----------------------------------------------------------------- |
| db-query-001 | Repository SQL template and dynamic order/filter construction | medium   | no confirmed injection finding                           | continue routine review only                                      |
| db-query-002 | `model_config.reorder_fallback` items loop                    | medium   | follow-up repair required                                | `security-ai-model-config-fallback-order-limit-repair-2026-06-29` |
| db-query-003 | Employee import JSON/CSV/TSV bulk input                       | medium   | follow-up repair required                                | `security-employee-import-bulk-limit-repair-2026-06-29`           |
| db-query-004 | Repository pagination/query size guardrails                   | low      | mostly bounded; personal AI history has repository clamp | monitor                                                           |
| db-query-005 | Org auth quota refresh and hierarchy traversal loops          | low      | monitor performance; no source fix in this task          | future targeted review if needed                                  |

## Next Smallest Safe Repair

Recommended next task:
`security-ai-model-config-fallback-order-limit-repair-2026-06-29`.

Reason: it is the smallest confirmed local source/test repair candidate from this review and can be scoped to one
validator/service/repository path plus focused unit coverage. It must materialize exact allowedFiles and blockedFiles
before any source or test edit.

## Validation Commands

```powershell
rg -n "sql`|execute<|\.execute\(|orderBy\(|limit\(|offset\(|ilike\(|inArray\(" src/server/repositories
npx.cmd prettier --write --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/01-requirements/traceability/2026-06-29-security-db-repository-query-construction-review.md docs/05-execution-logs/task-plans/2026-06-29-security-db-repository-query-construction-review.md docs/05-execution-logs/evidence/2026-06-29-security-db-repository-query-construction-review.md docs/05-execution-logs/audits-reviews/2026-06-29-security-db-repository-query-construction-review.md docs/05-execution-logs/acceptance/2026-06-29-security-db-repository-query-construction-review.md
npx.cmd prettier --check --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/01-requirements/traceability/2026-06-29-security-db-repository-query-construction-review.md docs/05-execution-logs/task-plans/2026-06-29-security-db-repository-query-construction-review.md docs/05-execution-logs/evidence/2026-06-29-security-db-repository-query-construction-review.md docs/05-execution-logs/audits-reviews/2026-06-29-security-db-repository-query-construction-review.md docs/05-execution-logs/acceptance/2026-06-29-security-db-repository-query-construction-review.md
git diff --check
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId security-db-repository-query-construction-review-2026-06-29
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId security-db-repository-query-construction-review-2026-06-29
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId security-db-repository-query-construction-review-2026-06-29 -SkipRemoteAheadCheck
```

## Closeout Policy

- Local commit: approved by `localSecurityRepairLoopApproval20260629` after task-scoped validation passes.
- Fast-forward merge to `master`: approved by task-scoped closeout policy after validation passes.
- Push `origin/master`: approved by task-scoped closeout policy after validation passes.
- Cleanup short branch: approved after merge and push.
