# Test Acceptance Regression Coverage Reinforcement Candidate Plan

- Task id: `test-acceptance-regression-coverage-reinforcement-candidate-2026-06-30`
- Branch: `codex/test-acceptance-coverage-recheck-20260630`
- Mode: docs/state materialization plus read-only regression coverage gap recheck.
- Cost Calibration Gate remains blocked.

## Read Before Execution

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/03-standards/ui-code.md`
- `docs/02-architecture/adr/`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- Latest UI/UX small repair task plan, evidence, audit, and acceptance.
- Recent 2026-06-29 and 2026-06-30 redacted security, acceptance, and UI evidence.

## Goal

Recheck whether recent local security and UI repair tasks have corresponding local unit or contract coverage. This task does not directly edit source or tests. If a current actionable coverage gap is confirmed, split the next exact test repair task with its own allowedFiles and validation commands before changing tests.

## Allowed Files

- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/01-requirements/traceability/2026-06-30-test-acceptance-regression-coverage-reinforcement-candidate.md`
- `docs/05-execution-logs/task-plans/2026-06-30-test-acceptance-regression-coverage-reinforcement-candidate.md`
- `docs/05-execution-logs/evidence/2026-06-30-test-acceptance-regression-coverage-reinforcement-candidate.md`
- `docs/05-execution-logs/audits-reviews/2026-06-30-test-acceptance-regression-coverage-reinforcement-candidate.md`
- `docs/05-execution-logs/acceptance/2026-06-30-test-acceptance-regression-coverage-reinforcement-candidate.md`

## Read-Only Scope

- Recent redacted task plans, evidence, audit reviews, acceptance, and traceability files from 2026-06-29 and 2026-06-30.
- `src/**` and `tests/**` for static inventory only.
- `package.json` for script names only; no dependency or lockfile change.

## Blocked Files And Actions

- No writes to `src/**`, `tests/**`, `scripts/**`, package files, lockfiles, DB/schema/migration/seed/e2e artifacts, archive, local private paths, env, or secrets.
- No DB connection, raw row read, mutation, schema, migration, seed, or `drizzle-kit push`.
- No Provider/AI call, Provider configuration, model config read/write, prompt payload, or raw AI I/O.
- No browser/dev-server/e2e/raw DOM/screenshot/trace.
- No credential, cookie, token, session, localStorage, Authorization header, env, secret, or connection string access or evidence.
- No staging/prod/cloud/deploy, release readiness, final Pass, Cost Calibration, PR, force-push, or unauthorized dependency change.

## Evidence Redaction

Allowed evidence is limited to task ids, file paths, test file names, gap categories, severity, status, counts, validation commands, commit/branch/merge/push/cleanup summaries, and redacted expected/observed summaries.

Forbidden evidence includes credentials, tokens, sessions, cookies, Authorization headers, env or connection strings, raw DB rows, internal ids, PII, plaintext `redeem_code`, Provider payloads, prompts, raw AI I/O, raw DOM, screenshots, traces, raw exception payloads or stack traces, and complete question/paper/material/resource/chunk content.

## Plan

1. Confirm this task is materialized in state, queue, and this task plan before any further docs.
2. Inventory recent 2026-06-29/2026-06-30 repair and no-op closeout evidence for changed files and declared coverage.
3. Inspect relevant source/test file paths statically to verify whether coverage exists.
4. Run focused local unit validation already associated with the most recent source/test repair.
5. Record whether a concrete coverage gap exists.
6. If a gap exists, create the next exact pending test repair task instead of editing tests here.
7. Run scoped formatting, diff checks, Module Run v2 gates, and close out if validation passes.

## Validation Commands

```powershell
rg -n "test-acceptance-regression-coverage-reinforcement-candidate-2026-06-30|securityFollowupCentralApproval20260630|releaseReadinessClaimed: false|finalPassClaimed: false|costCalibrationExecuted: false" docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/evidence/2026-06-30-test-acceptance-regression-coverage-reinforcement-candidate.md docs/05-execution-logs/acceptance/2026-06-30-test-acceptance-regression-coverage-reinforcement-candidate.md
rg -n --glob "2026-06-29-*.md" --glob "2026-06-30-*.md" "GREEN Evidence|RED Evidence|testChanged: true|sourceChanged: true|packageOrLockfileChanged: false|nextModuleRunCandidate|closed_no_current_actionable" docs/05-execution-logs/evidence docs/05-execution-logs/acceptance
rg -n "root entry|active:scale|hover:bg-green-50|organization training|auth role|route error|redaction|migration guard|dependency" tests src
npx.cmd vitest run tests/unit/root-page-ui.test.ts
npm.cmd run typecheck
npm.cmd run lint
npx.cmd prettier --write --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/01-requirements/traceability/2026-06-30-test-acceptance-regression-coverage-reinforcement-candidate.md docs/05-execution-logs/task-plans/2026-06-30-test-acceptance-regression-coverage-reinforcement-candidate.md docs/05-execution-logs/evidence/2026-06-30-test-acceptance-regression-coverage-reinforcement-candidate.md docs/05-execution-logs/audits-reviews/2026-06-30-test-acceptance-regression-coverage-reinforcement-candidate.md docs/05-execution-logs/acceptance/2026-06-30-test-acceptance-regression-coverage-reinforcement-candidate.md
npx.cmd prettier --check --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/01-requirements/traceability/2026-06-30-test-acceptance-regression-coverage-reinforcement-candidate.md docs/05-execution-logs/task-plans/2026-06-30-test-acceptance-regression-coverage-reinforcement-candidate.md docs/05-execution-logs/evidence/2026-06-30-test-acceptance-regression-coverage-reinforcement-candidate.md docs/05-execution-logs/audits-reviews/2026-06-30-test-acceptance-regression-coverage-reinforcement-candidate.md docs/05-execution-logs/acceptance/2026-06-30-test-acceptance-regression-coverage-reinforcement-candidate.md
git diff --check
git diff --name-only -- package.json pnpm-lock.yaml pnpm-workspace.yaml package-lock.yaml package-lock.json src tests scripts src/db drizzle migrations seed e2e playwright-report test-results .next .env
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId test-acceptance-regression-coverage-reinforcement-candidate-2026-06-30
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId test-acceptance-regression-coverage-reinforcement-candidate-2026-06-30
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId test-acceptance-regression-coverage-reinforcement-candidate-2026-06-30 -SkipRemoteAheadCheck
```

## Closeout Policy

If declared validation passes, local commit, fast-forward merge to `master`, push to `origin/master`, and deletion of the merged `codex/` short branch are approved by `securityFollowupCentralApproval20260630`.

PR creation and force-push remain forbidden.
