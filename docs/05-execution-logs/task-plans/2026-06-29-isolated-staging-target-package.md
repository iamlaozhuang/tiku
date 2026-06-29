# Isolated Staging Target Package Task Plan

- Task id: `isolated-staging-target-package-2026-06-29`
- Branch: `codex/isolated-staging-target-package-20260629`
- Status: in progress
- Date: `2026-06-29`

## Approval And Goal

The current user approved execution of the recommended next release-readiness gate: a docs-only isolated staging target
materialization package.

Goal: define the staging target decision package and the exact boundaries required before any future staging smoke
execution. This task may prepare docs/state, task-plan, evidence, audit-review, acceptance, and traceability records
only.

## Required Reading

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/adr-001-tech-stack-selection.md`
- `docs/02-architecture/adr/adr-002-runtime-architecture-and-multi-client-contract.md`
- `docs/02-architecture/adr/adr-003-workplace-desktop-web-compatibility.md`
- `docs/02-architecture/adr/adr-004-environment-isolation-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-005-staging-architecture-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-006-runtime-dependency-alignment.md`
- `docs/02-architecture/adr/adr-007-edition-aware-authorization-source-of-truth.md`
- `docs/01-requirements/traceability/2026-06-29-release-readiness-docs-only-execution-plan.md`
- `docs/01-requirements/traceability/2026-06-29-owner-handoff-release-readiness-approval-package.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`

## Allowed Files

- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/01-requirements/traceability/2026-06-29-isolated-staging-target-package.md`
- `docs/05-execution-logs/task-plans/2026-06-29-isolated-staging-target-package.md`
- `docs/05-execution-logs/evidence/2026-06-29-isolated-staging-target-package.md`
- `docs/05-execution-logs/audits-reviews/2026-06-29-isolated-staging-target-package.md`
- `docs/05-execution-logs/acceptance/2026-06-29-isolated-staging-target-package.md`

## Blocked Files And Actions

- `.env*`, `package.json`, package lockfiles, `src/**`, `tests/**`, `src/db/schema/**`, `drizzle/**`,
  `migrations/**`, `seed/**`, `scripts/**`, `e2e/**`, `playwright-report/**`, `test-results/**`, `.next/**`
- `D:/tiku-local-private/**` and `D:\tiku-local-private\**`
- Browser/runtime/dev-server/e2e execution
- DB access, mutation, schema, migration, or seed execution
- AI/Provider execution, configuration, credential reads, prompt or payload work
- Source, test, dependency, package, lockfile, schema, migration, or seed changes
- Cloud resource creation/modification, staging/prod connection, deployment
- PR, force-push, release readiness claim, final Pass, Cost Calibration

## Boundary Materialization

- DB boundary: no database access or mutation; no schema, migration, seed, raw row, internal id, PII, email, phone, or
  plaintext `redeem_code` evidence.
- AI/Provider boundary: no Provider execution or configuration; no provider payloads, prompts, raw AI input/output,
  generated content, pricing, quota, or Cost Calibration.
- Account boundary: no credentials, cookies, tokens, sessions, localStorage, Authorization headers, private account
  fixture reads, or account switching.
- Evidence boundary: staging target labels, owner labels, gate names, approval requirements, stop conditions, status,
  count, and commit summaries only.
- Closeout policy: local commit, fast-forward merge to `master`, push to `origin/master`, and clean up the short branch
  after validation passes.

## Implementation Plan

1. Create the scoped staging target traceability package.
2. Record evidence that no runtime, DB, Provider, source, dependency, deploy, PR, release readiness, final Pass, or Cost
   Calibration work occurred.
3. Record audit-review and acceptance summaries.
4. Update `project-state.yaml` and `task-queue.yaml` from in-progress to closed after validation.
5. Run scoped formatting, diff check, and Module Run v2 checks.
6. Commit, fast-forward merge to `master`, push `origin/master`, and delete the short branch.

## Risk Controls

- If no exact staging URL or deploy target label is available, record that the next staging smoke gate is blocked pending
  owner-supplied target details.
- If any secret, credential, production resource, production data, raw DOM, screenshot, trace, DB row, Provider payload,
  prompt, or raw AI IO would be needed, stop and require fresh approval.

## Validation Commands

```text
npx.cmd prettier --write --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/01-requirements/traceability/2026-06-29-isolated-staging-target-package.md docs/05-execution-logs/task-plans/2026-06-29-isolated-staging-target-package.md docs/05-execution-logs/evidence/2026-06-29-isolated-staging-target-package.md docs/05-execution-logs/audits-reviews/2026-06-29-isolated-staging-target-package.md docs/05-execution-logs/acceptance/2026-06-29-isolated-staging-target-package.md
npx.cmd prettier --check --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/01-requirements/traceability/2026-06-29-isolated-staging-target-package.md docs/05-execution-logs/task-plans/2026-06-29-isolated-staging-target-package.md docs/05-execution-logs/evidence/2026-06-29-isolated-staging-target-package.md docs/05-execution-logs/audits-reviews/2026-06-29-isolated-staging-target-package.md docs/05-execution-logs/acceptance/2026-06-29-isolated-staging-target-package.md
git diff --check
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId isolated-staging-target-package-2026-06-29
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId isolated-staging-target-package-2026-06-29
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId isolated-staging-target-package-2026-06-29 -SkipRemoteAheadCheck
```
