# Security Log List Query Filter Boundary Hardening Plan

- Task id: `security-log-list-query-filter-boundary-hardening-2026-06-30`
- Branch: `codex/security-log-list-query-filter-boundary-20260630`
- Mode: local focused source/test security repair.
- Result target: audit log and AI call log list-query validators expose explicit bounded free-text filter contracts while preserving legitimate list-query behavior.
- Cost Calibration Gate remains blocked.

## Read Before Execution

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/**`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- Latest local security static inventory task plan, evidence, audit review, and acceptance.
- Latest provider metadata redaction allowlist repair task plan, evidence, audit review, and acceptance.
- `codex-security:fix-finding` guidance for reproduce-first, minimal fix, and verification discipline.

## Goal

Recheck the log list query boundary candidate identified by the local static inventory. If the current validators accept
unbounded free-text filters for audit log or AI call log list queries, encode that behavior with a focused regression and
then apply a minimal validator repair.

## Allowed Files

- `src/server/validators/ai-call-log/list-query.ts`
- `src/server/validators/audit-log/list-query.ts`
- `tests/unit/admin-logs/admin-log-retention-redaction-layering.test.ts`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/2026-06-30-security-log-list-query-filter-boundary-hardening.md`
- `docs/05-execution-logs/evidence/2026-06-30-security-log-list-query-filter-boundary-hardening.md`
- `docs/05-execution-logs/audits-reviews/2026-06-30-security-log-list-query-filter-boundary-hardening.md`
- `docs/05-execution-logs/acceptance/2026-06-30-security-log-list-query-filter-boundary-hardening.md`

## Boundaries

- DB: no database connection, no raw rows, no mutation, no schema/migration/seed, no `drizzle-kit push`.
- AI/Provider: no Provider/AI call, no Provider configuration, no model config read/write, no prompt payload, no raw AI I/O.
- Browser: no browser runtime, no dev server, no e2e, no raw DOM, no screenshot, no trace.
- Credentials: no env, secrets, connection strings, registry tokens, account credentials, cookies, tokens, sessions,
  localStorage, or Authorization headers.
- Dependencies: no `package.json`, lockfile, package manager, install, update, remove, registry lookup, audit fix, or
  lifecycle script change.
- Release: no staging/prod/cloud/deploy, no release readiness, no final Pass, no Cost Calibration, no PR, no force-push.
- Evidence: record task ids, file paths, synthetic filter lengths, status counts, validation commands, and closeout
  summaries only. Do not record raw Provider payload, prompt, raw AI I/O, raw DB rows, internal ids, PII, credentials,
  Authorization material, or full business content.

## Implementation Plan

1. Inspect only the allowed validators and focused unit test file.
2. Confirm whether audit log and AI call log free-text filters currently accept an overlong synthetic query string.
3. Add a focused regression that fails before the fix if the overlong query is accepted.
4. Apply the smallest validator change that enforces the intended bounded filter invariant.
5. Preserve legitimate behavior for normal filter length, pagination, sort, and existing redaction/retention tests.
6. Re-run the focused unit test, lint, typecheck, scoped formatting, diff checks, and Module Run v2 closeout gates.
7. Write redacted evidence, audit review, and acceptance.

## Validation Commands

```powershell
rg -n "security-log-list-query-filter-boundary-hardening-2026-06-30|securityFollowupCentralApproval20260630|releaseReadinessClaimed: false|finalPassClaimed: false|costCalibrationExecuted: false" docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/evidence/2026-06-30-security-log-list-query-filter-boundary-hardening.md docs/05-execution-logs/acceptance/2026-06-30-security-log-list-query-filter-boundary-hardening.md
npx.cmd vitest run tests/unit/admin-logs/admin-log-retention-redaction-layering.test.ts
npm.cmd run lint -- src/server/validators/ai-call-log/list-query.ts src/server/validators/audit-log/list-query.ts tests/unit/admin-logs/admin-log-retention-redaction-layering.test.ts
npm.cmd run typecheck
npx.cmd prettier --write --ignore-unknown src/server/validators/ai-call-log/list-query.ts src/server/validators/audit-log/list-query.ts tests/unit/admin-logs/admin-log-retention-redaction-layering.test.ts docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-06-30-security-log-list-query-filter-boundary-hardening.md docs/05-execution-logs/evidence/2026-06-30-security-log-list-query-filter-boundary-hardening.md docs/05-execution-logs/audits-reviews/2026-06-30-security-log-list-query-filter-boundary-hardening.md docs/05-execution-logs/acceptance/2026-06-30-security-log-list-query-filter-boundary-hardening.md
npx.cmd prettier --check --ignore-unknown src/server/validators/ai-call-log/list-query.ts src/server/validators/audit-log/list-query.ts tests/unit/admin-logs/admin-log-retention-redaction-layering.test.ts docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-06-30-security-log-list-query-filter-boundary-hardening.md docs/05-execution-logs/evidence/2026-06-30-security-log-list-query-filter-boundary-hardening.md docs/05-execution-logs/audits-reviews/2026-06-30-security-log-list-query-filter-boundary-hardening.md docs/05-execution-logs/acceptance/2026-06-30-security-log-list-query-filter-boundary-hardening.md
git diff --check
git diff --name-only -- package.json pnpm-lock.yaml pnpm-workspace.yaml package-lock.yaml package-lock.json scripts src/db drizzle migrations seed e2e playwright-report test-results .next .env
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId security-log-list-query-filter-boundary-hardening-2026-06-30
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId security-log-list-query-filter-boundary-hardening-2026-06-30
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId security-log-list-query-filter-boundary-hardening-2026-06-30 -SkipRemoteAheadCheck
```

## Closeout Policy

If declared validation passes, local commit, fast-forward merge to `master`, push to `origin/master`, and deletion of the
merged `codex/` short branch are approved by `securityFollowupCentralApproval20260630`.

PR creation and force-push remain forbidden. This is not release readiness, not a final Pass, and not Cost Calibration.
