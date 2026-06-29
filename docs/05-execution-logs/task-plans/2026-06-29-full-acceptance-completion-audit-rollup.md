# Full Acceptance Completion Audit Rollup Plan

- Task id: `full-acceptance-completion-audit-rollup-2026-06-29`
- Branch: `codex/completion-audit-rollup-20260629`
- Status: claimed
- Date: `2026-06-29`

## Goal

Perform a requirement-by-requirement completion audit against the mandatory owner-facing role checklist, task queue,
project state, and redacted evidence/acceptance logs. If any completion gap remains, seed the next exact pending task
instead of claiming durable goal completion.

## Authorization

This task consumes the user's fresh approval for a local-only docs/state completion audit rollup. The approval allows
scoped docs/state/task-plan/evidence/audit/acceptance/traceability writes, local formatting/diff/Module Run v2 checks,
local commit, fast-forward merge to `master`, push to `origin/master`, and short-branch cleanup after validation.

## Allowed Files

- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/01-requirements/traceability/2026-06-29-full-acceptance-completion-audit-rollup.md`
- `docs/05-execution-logs/task-plans/2026-06-29-full-acceptance-completion-audit-rollup.md`
- `docs/05-execution-logs/evidence/2026-06-29-full-acceptance-completion-audit-rollup.md`
- `docs/05-execution-logs/audits-reviews/2026-06-29-full-acceptance-completion-audit-rollup.md`
- `docs/05-execution-logs/acceptance/2026-06-29-full-acceptance-completion-audit-rollup.md`

## Blocked

- Browser/runtime/e2e execution.
- DB access, DB mutation, schema, migration, seed, or raw row inspection.
- AI Provider execution/configuration, prompt/payload/raw AI input or output.
- Source, test, dependency, package, or lockfile changes.
- Credentials, cookies, tokens, sessions, localStorage, Authorization headers, env contents, connection strings, raw DOM,
  screenshots, traces, internal IDs, PII, email, phone, plaintext redeem codes, or complete content bodies.
- Staging/prod/cloud/deploy, PR, force-push, release readiness, final Pass, and Cost Calibration Gate.

## Read List

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/01-requirements/traceability/2026-06-28-owner-facing-role-gap-capture-scope.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- Redacted evidence, acceptance, task-plan, audit, and traceability logs relevant to the durable goal.

## Execution Steps

1. Reconcile the mandatory owner-facing checklist against the latest redacted evidence.
2. Confirm the latest full unit baseline evidence.
3. Classify every role/workflow row as pass, incomplete, or outside this approved audit boundary.
4. Record the durable goal decision without final Pass or release readiness claims.
5. Seed the next exact pending task for any remaining gap.
6. Run scoped Prettier, diff, and Module Run v2 governance checks.
7. If validation passes, close the audit task, commit, fast-forward merge to `master`, push `origin/master`, and clean up
   the short branch.

## Validation Commands

- `npx.cmd prettier --check --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/01-requirements/traceability/2026-06-29-full-acceptance-completion-audit-rollup.md docs/05-execution-logs/task-plans/2026-06-29-full-acceptance-completion-audit-rollup.md docs/05-execution-logs/evidence/2026-06-29-full-acceptance-completion-audit-rollup.md docs/05-execution-logs/audits-reviews/2026-06-29-full-acceptance-completion-audit-rollup.md docs/05-execution-logs/acceptance/2026-06-29-full-acceptance-completion-audit-rollup.md`
- `git diff --check`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId full-acceptance-completion-audit-rollup-2026-06-29`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId full-acceptance-completion-audit-rollup-2026-06-29`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId full-acceptance-completion-audit-rollup-2026-06-29 -SkipRemoteAheadCheck`
