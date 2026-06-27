# Layer 3 Staging Pre-Release Redacted Execution Plan

Task id: `layer-3-staging-pre-release-redacted-execution-2026-06-27`

Branch: `codex/staging-pre-release-execution-20260627`

Task kind: `high_risk_staging_pre_release_execution`

## Approval Boundary

This task consumes the current user's unattended serial high-risk package approval plus the supplemental
staging/pre-release execution boundary. It may execute at most one staging-only deploy-or-smoke validation only if a
concrete isolated staging URL or deploy target is already registered in durable state/queue without exposing secrets.

The queued task also explicitly says that if no such target is registered, this task must stop and write blocked evidence
only.

This task may update only:

- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/2026-06-27-layer-3-staging-pre-release-redacted-execution.md`
- `docs/05-execution-logs/evidence/2026-06-27-layer-3-staging-pre-release-redacted-execution.md`
- `docs/05-execution-logs/audits-reviews/2026-06-27-layer-3-staging-pre-release-redacted-execution.md`
- `docs/05-execution-logs/acceptance/2026-06-27-layer-3-staging-pre-release-redacted-execution.md`

It must not touch prod, production data, payment, OCR/export, Provider, Cost Calibration, DB, browser/e2e, screenshots,
traces, cookies, localStorage, PR, force push, release readiness, or final Pass.

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
- `docs/04-agent-system/sop/failure-retry-and-human-takeover-governance.md`
- `docs/04-agent-system/sop/repository-hygiene-closeout-checklist.md`
- `docs/04-agent-system/sop/advanced-edition-evidence-redaction-template.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/acceptance/2026-06-27-layer-3-staging-prod-deploy-pre-release-approval-package.md`
- `docs/05-execution-logs/evidence/2026-06-27-layer-3-staging-prod-deploy-pre-release-approval-package.md`

## Requirement Decision Map

- Layer 1 remains complete by prior role/entry/permission evidence; this task does not change it.
- Layer 2 minimum local business loop remains the local PostgreSQL test-owned `rejected` review-command evidence; this
  task does not change it.
- Layer 3 Provider smoke and minimum local Cost Calibration evidence are already present.
- Layer 3 staging/pre-release execution is blocked at the target preflight because no concrete isolated staging target is
  registered in durable state/queue.

## Preflight Decision

Queued requirement:

```yaml
requiredRegisteredTargetStatus: exactly_one_isolated_staging_url_or_deploy_target
currentKnownTargetStatusFromPackage: missing_concrete_isolated_staging_target
defaultIfTargetMissing: blocked_evidence_closeout_only
```

Observed durable state:

- `project-state.yaml` records `stagingTargetRegistrationStatus:
missing_concrete_isolated_staging_target_in_current_docs_state`.
- The predecessor acceptance records that if target remains missing, this task must write blocked evidence and close out
  only.

Therefore this task will not run any staging/deploy/smoke command. The execution envelope is:

- `targetRegistrationStatus`: `missing_concrete_isolated_staging_target`
- `deployOrSmokeExecuted`: `false`
- `requestOrCommandCount`: `0`
- `passFailBlocked`: `blocked`
- `stopCondition`: `no_registered_isolated_staging_target`

## Successor Rollup

Seed `layer-3-staging-pre-release-rollup-2026-06-27` as the next docs/state-only task to roll up the blocked staging
pre-release evidence and keep payment/external-service, OCR/export, archive/index movement, release readiness, and final
Pass gates separated.

## Risk Defenses

- No external command is executed after target preflight fails.
- No staging/prod URL, credential alias, env file, secret, token, Authorization header, raw log, raw response, screenshot,
  trace, cookie, localStorage, DB row, or private data is recorded.
- The task does not convert missing infrastructure into a failure of Layer 1/2 or Provider/Cost evidence.
- The successor rollup is docs/state-only and cannot claim staging readiness or final Pass.

## Validation Commands

- `npx.cmd prettier --write --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-06-27-layer-3-staging-pre-release-redacted-execution.md docs/05-execution-logs/evidence/2026-06-27-layer-3-staging-pre-release-redacted-execution.md docs/05-execution-logs/audits-reviews/2026-06-27-layer-3-staging-pre-release-redacted-execution.md docs/05-execution-logs/acceptance/2026-06-27-layer-3-staging-pre-release-redacted-execution.md`
- `npx.cmd prettier --check --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-06-27-layer-3-staging-pre-release-redacted-execution.md docs/05-execution-logs/evidence/2026-06-27-layer-3-staging-pre-release-redacted-execution.md docs/05-execution-logs/audits-reviews/2026-06-27-layer-3-staging-pre-release-redacted-execution.md docs/05-execution-logs/acceptance/2026-06-27-layer-3-staging-pre-release-redacted-execution.md`
- `git diff --check`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Get-TikuProjectStatus.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId layer-3-staging-pre-release-redacted-execution-2026-06-27`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId layer-3-staging-pre-release-redacted-execution-2026-06-27`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId layer-3-staging-pre-release-redacted-execution-2026-06-27 -SkipRemoteAheadCheck`

## Stop Conditions

- Any need to guess or discover a staging target outside durable state/queue.
- Any need to execute staging/prod/deploy/smoke after target preflight fails.
- Any need to read `.env*`, credential values, raw logs, raw requests/responses, Provider payloads, raw prompts, raw
  responses, or raw generated AI content.
- Any need to modify source/tests/scripts/package/lockfiles/schema/migration/seed.
- Any need for browser/dev-server/e2e, DB, Provider, Cost Calibration, payment/external-service/OCR/export.
- Any need to record screenshot, trace, cookie, localStorage, raw page text, raw row data, or private data.
- Any mechanism gate failure that cannot be repaired inside the six allowed files.
- Any release readiness or final Pass claim.
