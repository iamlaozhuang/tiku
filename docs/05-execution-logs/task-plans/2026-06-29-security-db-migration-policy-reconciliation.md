# Security DB Migration Policy Reconciliation Plan

> **For agentic workers:** this is a docs/state policy reconciliation task. Do not connect to a database, read env or
> secrets, execute or replay migrations, change schema/migration/source/test/package files, run browser/e2e/dev-server,
> call Provider/AI, or make release readiness/final Pass/Cost Calibration claims.

**Goal:** Reconcile ADR-001 historical development `drizzle-kit push` wording with the current project-wide
no-`drizzle-kit push` migration policy already recorded in ADR-004, ADR-005, code taste rules, and current governance.

**Architecture:** This follows ADR-001 as the historical technology selection record, ADR-004/ADR-005 as the current
environment-aware migration boundary, ADR-006 dependency gates, and the code-taste commandment that forbids
data-losing push workflows. This task updates policy wording only and does not approve migration execution.

---

- Task id: `security-db-migration-policy-reconciliation-2026-06-29`
- Branch: `codex/security-db-migration-policy-reconciliation-20260629`
- Status: `closed_pending_commit_merge_push_cleanup`
- Planned at: `2026-06-29T14:06:15-07:00`
- Finding id: `db-mig-005`
- Severity: `medium`

## Mandatory Read List

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/2026-06-29-security-db-migration-replay-guard-review.md`
- `docs/05-execution-logs/evidence/2026-06-29-security-db-migration-replay-guard-review.md`
- `docs/05-execution-logs/audits-reviews/2026-06-29-security-db-migration-replay-guard-review.md`
- `docs/05-execution-logs/acceptance/2026-06-29-security-db-migration-replay-guard-review.md`
- `docs/01-requirements/traceability/2026-06-29-security-db-migration-replay-guard-review.md`

## Allowed Writable Files

- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/02-architecture/adr/adr-001-tech-stack-selection.md`
- `docs/01-requirements/traceability/2026-06-29-security-db-migration-policy-reconciliation.md`
- `docs/05-execution-logs/task-plans/2026-06-29-security-db-migration-policy-reconciliation.md`
- `docs/05-execution-logs/evidence/2026-06-29-security-db-migration-policy-reconciliation.md`
- `docs/05-execution-logs/audits-reviews/2026-06-29-security-db-migration-policy-reconciliation.md`
- `docs/05-execution-logs/acceptance/2026-06-29-security-db-migration-policy-reconciliation.md`

## Blocked Files And Actions

- No `.env*`, package, lockfile, source, test, e2e, script, migration, schema, seed, browser artifact, private fixture,
  archive/history, or unrelated docs writes.
- No DB connection/read/write/raw row/schema/migration/seed, migration replay, `drizzle-kit push`, destructive SQL,
  drift command against a live database, or raw SQL output capture.
- No env/secret/connection string value read or evidence.
- No Provider/AI call, Provider configuration, prompt, payload, raw AI I/O, browser/dev-server/e2e, staging/prod/cloud,
  deploy, PR, force-push, release readiness, final Pass, or Cost Calibration.

## Execution Steps

- [x] **Step 1: Read governance, ADRs, and predecessor evidence**
- [x] **Step 2: Create short branch from aligned master**
- [x] **Step 3: Materialize task boundaries in state, queue, and plan**
- [x] **Step 4: Reconcile ADR-001 migration wording with current no-push policy**
- [x] **Step 5: Write traceability, evidence, audit, and acceptance**
- [x] **Step 6: Run scoped formatting, diff, and Module Run v2 gates**
- [ ] **Step 7: Commit, fast-forward merge, push, and cleanup if validation passes**

## Policy Reconciliation Targets

| Finding id | Surface                          | Initial severity | Initial status  | Expected output                                           |
| ---------- | -------------------------------- | ---------------- | --------------- | --------------------------------------------------------- |
| db-mig-005 | ADR-001 historical dev push text | medium           | follow_up_split | ADR wording aligned to no-`drizzle-kit push` policy       |
| db-mig-001 | Migration command guard boundary | medium           | blocked_split   | command/config guard remains separate fresh-approval task |

## Validation Commands

```powershell
rg -n "drizzle-kit push|drizzle-kit generate|drizzle-kit migrate|Migration Boundary|forbidden" docs/02-architecture/adr/adr-001-tech-stack-selection.md docs/02-architecture/adr/adr-004-environment-isolation-and-release-boundaries.md docs/02-architecture/adr/adr-005-staging-architecture-and-release-boundaries.md docs/03-standards/code-taste-ten-commandments.md
npx.cmd prettier --write --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/02-architecture/adr/adr-001-tech-stack-selection.md docs/01-requirements/traceability/2026-06-29-security-db-migration-policy-reconciliation.md docs/05-execution-logs/task-plans/2026-06-29-security-db-migration-policy-reconciliation.md docs/05-execution-logs/evidence/2026-06-29-security-db-migration-policy-reconciliation.md docs/05-execution-logs/audits-reviews/2026-06-29-security-db-migration-policy-reconciliation.md docs/05-execution-logs/acceptance/2026-06-29-security-db-migration-policy-reconciliation.md
npx.cmd prettier --check --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/02-architecture/adr/adr-001-tech-stack-selection.md docs/01-requirements/traceability/2026-06-29-security-db-migration-policy-reconciliation.md docs/05-execution-logs/task-plans/2026-06-29-security-db-migration-policy-reconciliation.md docs/05-execution-logs/evidence/2026-06-29-security-db-migration-policy-reconciliation.md docs/05-execution-logs/audits-reviews/2026-06-29-security-db-migration-policy-reconciliation.md docs/05-execution-logs/acceptance/2026-06-29-security-db-migration-policy-reconciliation.md
git diff --check
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId security-db-migration-policy-reconciliation-2026-06-29
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId security-db-migration-policy-reconciliation-2026-06-29
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId security-db-migration-policy-reconciliation-2026-06-29 -SkipRemoteAheadCheck
```

## Closeout Policy

- Local commit: approved by `localSecurityRepairLoopApproval20260629` after task-scoped validation passes.
- Fast-forward merge to `master`: approved by task-scoped closeout policy after validation passes.
- Push `origin/master`: approved by task-scoped closeout policy after validation passes.
- Cleanup short branch: approved after merge and push.
