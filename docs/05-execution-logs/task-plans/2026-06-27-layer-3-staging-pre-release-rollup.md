# Layer 3 Staging Pre-Release Rollup Plan

Task id: `layer-3-staging-pre-release-rollup-2026-06-27`

Branch: `codex/staging-pre-release-rollup-20260627`

Task kind: `docs_state_rollup`

## Approval Boundary

This docs/state-only rollup consumes the current user's unattended serial high-risk package approval for
`layer-3-staging-pre-release-rollup-2026-06-27`.

It may update only:

- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/2026-06-27-layer-3-staging-pre-release-rollup.md`
- `docs/05-execution-logs/evidence/2026-06-27-layer-3-staging-pre-release-rollup.md`
- `docs/05-execution-logs/audits-reviews/2026-06-27-layer-3-staging-pre-release-rollup.md`
- `docs/05-execution-logs/acceptance/2026-06-27-layer-3-staging-pre-release-rollup.md`

It must not execute staging/prod/deploy, connect to DB, open `.env*`, read credentials, call Providers, execute Cost
Calibration, run browser/dev-server/e2e, mutate runtime data, modify source/tests/scripts/package/lockfiles/schema/
migration/seed, touch payment/external-service, execute OCR/export, move archive/index entries, create PRs, force push,
or claim release readiness/final Pass.

## SSOT Read List

- `AGENTS.md`
- `docs/01-requirements/00-index.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/adr-004-environment-isolation-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-005-staging-architecture-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-006-runtime-dependency-alignment.md`
- `docs/04-agent-system/sop/task-lifecycle-governance.md`
- `docs/04-agent-system/sop/module-lifecycle-governance.md`
- `docs/04-agent-system/sop/batch-execution-package-governance.md`
- `docs/04-agent-system/sop/repository-hygiene-closeout-checklist.md`
- `docs/04-agent-system/sop/advanced-edition-evidence-redaction-template.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/evidence/2026-06-27-layer-3-staging-pre-release-redacted-execution.md`
- `docs/05-execution-logs/acceptance/2026-06-27-layer-3-staging-pre-release-redacted-execution.md`

## Rollup Decision

- Layer 1 remains complete and preserved.
- Layer 2 minimum local business closure remains preserved.
- Layer 3 Provider smoke remains passed.
- Layer 3 Cost Calibration remains passed for the completed minimum local single-sample estimate.
- Layer 3 staging/pre-release remains blocked because the execution task found no registered concrete isolated staging
  target and executed zero external commands.
- Prod/deploy/payment/external-service/OCR/export/release readiness/final Pass remain blocked.

## Successor Registration

Seed `layer-3-payment-external-service-approval-package-2026-06-27` as the next docs/state-only task. It may define
payment/external-service boundaries only; it must not execute payment/external-service work.

## Validation Commands

- `npx.cmd prettier --write --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-06-27-layer-3-staging-pre-release-rollup.md docs/05-execution-logs/evidence/2026-06-27-layer-3-staging-pre-release-rollup.md docs/05-execution-logs/audits-reviews/2026-06-27-layer-3-staging-pre-release-rollup.md docs/05-execution-logs/acceptance/2026-06-27-layer-3-staging-pre-release-rollup.md`
- `npx.cmd prettier --check --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-06-27-layer-3-staging-pre-release-rollup.md docs/05-execution-logs/evidence/2026-06-27-layer-3-staging-pre-release-rollup.md docs/05-execution-logs/audits-reviews/2026-06-27-layer-3-staging-pre-release-rollup.md docs/05-execution-logs/acceptance/2026-06-27-layer-3-staging-pre-release-rollup.md`
- `git diff --check`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Get-TikuProjectStatus.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId layer-3-staging-pre-release-rollup-2026-06-27`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId layer-3-staging-pre-release-rollup-2026-06-27`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId layer-3-staging-pre-release-rollup-2026-06-27 -SkipRemoteAheadCheck`

## Stop Conditions

- Any need to execute staging/prod/deploy, payment/external-service, OCR/export, Provider, Cost Calibration, DB, browser,
  dev-server, e2e, archive/index movement, PR, force push, release readiness, or final Pass.
- Any need to read `.env*`, credentials, secret values, raw logs, raw requests/responses, raw prompts, Provider payloads,
  raw generated AI content, screenshots, traces, cookies, localStorage, DB rows, full paper/material content, or private
  data.
- Any mechanism gate failure that cannot be repaired inside the six allowed files.
