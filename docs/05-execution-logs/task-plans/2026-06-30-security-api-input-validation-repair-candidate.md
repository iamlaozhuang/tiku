# Security API Input Validation Repair Candidate Task Plan

## Task

- Task id: `security-api-input-validation-repair-candidate-2026-06-30`
- Branch: `codex/security-api-input-validation-recheck-20260630`
- Goal: recheck the API contract/input validation repair candidate before any repair, and either close it as not
  actionable or seed an exact minimal source/test repair task.
- Non-goals: no source/test/script/package change, no DB, no Provider/AI, no browser/e2e/dev server, no staging/prod
  /cloud/deploy, no release readiness, no final Pass, no Cost Calibration, no PR, no force-push.

## Required Read List

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/**`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/2026-06-29-security-api-contract-input-validation-inventory.md`
- `docs/05-execution-logs/evidence/2026-06-29-security-api-contract-input-validation-inventory.md`
- `docs/05-execution-logs/audits-reviews/2026-06-29-security-api-contract-input-validation-inventory.md`
- `docs/05-execution-logs/acceptance/2026-06-29-security-api-contract-input-validation-inventory.md`
- `docs/05-execution-logs/task-plans/2026-06-29-verify-api-list-sort-by-validation-boundary.md`
- `docs/05-execution-logs/evidence/2026-06-29-verify-api-list-sort-by-validation-boundary.md`
- `docs/05-execution-logs/audits-reviews/2026-06-29-verify-api-list-sort-by-validation-boundary.md`
- `docs/05-execution-logs/acceptance/2026-06-29-verify-api-list-sort-by-validation-boundary.md`
- `docs/05-execution-logs/task-plans/2026-06-30-security-remaining-inventory-triage.md`
- `docs/05-execution-logs/evidence/2026-06-30-security-remaining-inventory-triage.md`
- `docs/05-execution-logs/audits-reviews/2026-06-30-security-remaining-inventory-triage.md`
- `docs/05-execution-logs/acceptance/2026-06-30-security-remaining-inventory-triage.md`

## Writable Scope

- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/01-requirements/traceability/2026-06-30-security-api-input-validation-repair-candidate.md`
- `docs/05-execution-logs/task-plans/2026-06-30-security-api-input-validation-repair-candidate.md`
- `docs/05-execution-logs/evidence/2026-06-30-security-api-input-validation-repair-candidate.md`
- `docs/05-execution-logs/audits-reviews/2026-06-30-security-api-input-validation-repair-candidate.md`
- `docs/05-execution-logs/acceptance/2026-06-30-security-api-input-validation-repair-candidate.md`

## Read-only Source Scope

- `src/app/api/v1/**`
- `src/server/validators/**`
- `src/server/contracts/**`
- `src/server/mappers/**`
- `src/server/services/**`
- `src/server/repositories/**`
- `tests/unit/**`

## Boundaries

- DB: no database connection, raw rows, mutation, schema, migration, seed, or `drizzle-kit push`.
- AI/Provider: no Provider call, configuration, model config read/write, prompt payload, or raw AI I/O.
- Browser: no browser runtime, dev server, e2e, raw DOM, screenshots, or traces.
- Credentials: no env, secrets, connection strings, account credentials, cookies, tokens, sessions, localStorage, or
  Authorization headers.
- Dependencies: no package or lockfile change, no install/update/remove/audit fix, and no registry lookup.
- Evidence: redacted path/risk/status/count/validation summaries only.

## Execution Plan

1. Confirm current branch and centralized approval materialization.
2. Materialize this task in state, queue, task plan, traceability, evidence, audit, and acceptance before source reads.
3. Recheck prior API inventory and sort-boundary evidence.
4. Run static direct-interpolation search over source read-only scope.
5. Run focused existing Vitest coverage that does not use DB, Provider, browser, or private fixtures.
6. If no actionable current issue is confirmed, close as no-op and recommend the next candidate.
7. If an actionable issue is confirmed, do not edit source in this task; seed an exact source/test repair task first.
8. Run scoped formatting, diff checks, blocked-path diff, and Module Run v2 validation.
9. If validation passes, commit, fast-forward merge to `master`, push `origin/master`, and delete the merged short branch.

## Validation Commands

```powershell
rg -n "security-api-input-validation-repair-candidate-2026-06-30|securityFollowupCentralApproval20260630|releaseReadinessClaimed: false|finalPassClaimed: false|costCalibrationExecuted: false" docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/evidence/2026-06-30-security-api-input-validation-repair-candidate.md docs/05-execution-logs/acceptance/2026-06-30-security-api-input-validation-repair-candidate.md
rg -n "\$\{.*sortBy|sortBy.*sql|orderBy.*sortBy|query\.sortBy" src/server
npx.cmd vitest run src/server/validators/student-paper.test.ts src/server/validators/mistake-book.test.ts src/server/validators/exam-report.test.ts src/server/validators/organization.test.ts src/server/services/material-service.test.ts src/server/services/paper-asset-service.test.ts src/server/services/paper-draft-service.test.ts src/server/services/question-service.test.ts src/server/services/student-paper-service.test.ts src/server/services/exam-report-service.test.ts src/server/services/mistake-book-service.test.ts
npx.cmd prettier --write --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/01-requirements/traceability/2026-06-30-security-api-input-validation-repair-candidate.md docs/05-execution-logs/task-plans/2026-06-30-security-api-input-validation-repair-candidate.md docs/05-execution-logs/evidence/2026-06-30-security-api-input-validation-repair-candidate.md docs/05-execution-logs/audits-reviews/2026-06-30-security-api-input-validation-repair-candidate.md docs/05-execution-logs/acceptance/2026-06-30-security-api-input-validation-repair-candidate.md
npx.cmd prettier --check --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/01-requirements/traceability/2026-06-30-security-api-input-validation-repair-candidate.md docs/05-execution-logs/task-plans/2026-06-30-security-api-input-validation-repair-candidate.md docs/05-execution-logs/evidence/2026-06-30-security-api-input-validation-repair-candidate.md docs/05-execution-logs/audits-reviews/2026-06-30-security-api-input-validation-repair-candidate.md docs/05-execution-logs/acceptance/2026-06-30-security-api-input-validation-repair-candidate.md
git diff --check
git diff --name-only -- package.json pnpm-lock.yaml pnpm-workspace.yaml package-lock.yaml package-lock.json src tests scripts src/db drizzle migrations seed e2e playwright-report test-results .next .env
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId security-api-input-validation-repair-candidate-2026-06-30
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId security-api-input-validation-repair-candidate-2026-06-30
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId security-api-input-validation-repair-candidate-2026-06-30 -SkipRemoteAheadCheck
```

## Closeout Policy

If validation passes, local commit, fast-forward merge to `master`, push to `origin/master`, and cleanup of the merged
short branch are approved by `securityFollowupCentralApproval20260630`.

This is not release readiness, not a final Pass, and not Cost Calibration.
