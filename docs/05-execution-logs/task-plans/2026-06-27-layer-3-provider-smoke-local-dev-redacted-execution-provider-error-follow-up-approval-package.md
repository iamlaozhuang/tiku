# Layer 3 Provider Smoke Local Dev Redacted Execution Provider Error Follow-Up Approval Package Plan

Task id: `layer-3-provider-smoke-local-dev-redacted-execution-provider-error-follow-up-approval-package-2026-06-27`

Branch: `codex/provider-error-followup-approval-20260627`

## Objective

Create a docs/state-only approval package for the Provider smoke `provider_error` blocker produced by
`layer-3-provider-smoke-local-dev-redacted-execution-retry-env-local-alias-loader-2026-06-27`.

This task defines safe follow-up choices and copyable approval text. It does not run a Provider call, does not read
`.env*`, does not inspect raw Provider error details, and does not enter Cost Calibration.

## SSOT Read List

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/01-requirements/00-index.md`
- `docs/01-requirements/advanced-edition/00-index.md`
- `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`
- `docs/01-requirements/traceability/2026-06-23-advanced-ai-generation-scope-clarification.md`
- `docs/01-requirements/traceability/2026-06-21-content-admin-ai-generation-scope-decision.md`
- `docs/02-architecture/adr/adr-004-environment-isolation-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-006-runtime-dependency-alignment.md`
- `docs/04-agent-system/sop/task-lifecycle-governance.md`
- `docs/04-agent-system/sop/docs-only-fast-lane-governance.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/evidence/2026-06-27-layer-3-provider-smoke-local-dev-redacted-execution-retry-env-local-alias-loader.md`
- `docs/05-execution-logs/evidence/2026-06-19-ap-01-qwen-redacted-provider-error-code-diagnostics.md`
- `docs/05-execution-logs/task-plans/2026-06-19-ap-01-qwen-one-request-redacted-error-code-diagnostic-run.md`

## Approval Boundary

The current user approved execution of the docs/state-only follow-up approval package after the Provider smoke retry
returned a sanitized `provider_error`. This package may update only:

- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- task plan, evidence, audit review, and acceptance documents under `docs/05-execution-logs/**`

Blocked in this task:

- Provider call or retry
- `.env*` read/write/value output
- Provider configuration change
- raw error, prompt, response, payload, generated content, credential, token, Authorization header, or DB URL evidence
- DB, browser/dev-server/e2e, schema/migration/seed, source/test/package/lockfile edits
- Cost Calibration, staging/prod/deploy/payment/external service, OCR/export
- archive/index movement
- PR, force push, release readiness, final Pass

## Execution Plan

1. Register this docs/state-only task in `task-queue.yaml` with explicit allowed files, blocked files, redaction rules,
   validation commands, and closeout policy.
2. Update `project-state.yaml` to show the Provider smoke follow-up approval package as the current task.
3. Create evidence/audit/acceptance documents that:
   - restate the blocked Provider smoke result;
   - define the smallest safe diagnostic execution boundary;
   - define a no-call manual owner verification option;
   - define a configuration-boundary option if the provider/model path needs correction;
   - provide copyable approval text for the chosen follow-up.
4. Run scoped formatting and mechanism gates.
5. Commit, ff-only merge to `master`, run master gates, push `origin/master`, and delete the merged short branch if
   closeout gates pass.

## Requirement Decision Map

- Layer 1 remains complete and unchanged.
- Layer 2 remains at the local PostgreSQL test-owned `rejected` minimum business loop baseline and unchanged.
- Layer 3 Provider smoke remains blocked by sanitized `provider_error`.
- Cost Calibration and pre-release gates remain blocked until Provider smoke passes and separate approvals/evidence exist.
- No release readiness or final Pass decision is made in this task.

## Evidence-Only Sources

Execution logs from 2026-06-19 and 2026-06-27 are used as evidence history and redaction precedent only. They do not
create new runtime approval for this task.

## Conflict Check

The current queue/state/evidence agree that the latest Provider smoke attempt consumed one call, returned
`provider_error`, and stopped without retry. The next actionable step is a follow-up approval package because any
diagnosis beyond the coarse failure category would otherwise require either another Provider call, raw error inspection,
or Provider configuration work.

## Validation Commands

- `npx.cmd prettier --write --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-06-27-layer-3-provider-smoke-local-dev-redacted-execution-provider-error-follow-up-approval-package.md docs/05-execution-logs/evidence/2026-06-27-layer-3-provider-smoke-local-dev-redacted-execution-provider-error-follow-up-approval-package.md docs/05-execution-logs/audits-reviews/2026-06-27-layer-3-provider-smoke-local-dev-redacted-execution-provider-error-follow-up-approval-package.md docs/05-execution-logs/acceptance/2026-06-27-layer-3-provider-smoke-local-dev-redacted-execution-provider-error-follow-up-approval-package.md`
- `npx.cmd prettier --check --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-06-27-layer-3-provider-smoke-local-dev-redacted-execution-provider-error-follow-up-approval-package.md docs/05-execution-logs/evidence/2026-06-27-layer-3-provider-smoke-local-dev-redacted-execution-provider-error-follow-up-approval-package.md docs/05-execution-logs/audits-reviews/2026-06-27-layer-3-provider-smoke-local-dev-redacted-execution-provider-error-follow-up-approval-package.md docs/05-execution-logs/acceptance/2026-06-27-layer-3-provider-smoke-local-dev-redacted-execution-provider-error-follow-up-approval-package.md`
- `git diff --check`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Get-TikuProjectStatus.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId layer-3-provider-smoke-local-dev-redacted-execution-provider-error-follow-up-approval-package-2026-06-27`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId layer-3-provider-smoke-local-dev-redacted-execution-provider-error-follow-up-approval-package-2026-06-27`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId layer-3-provider-smoke-local-dev-redacted-execution-provider-error-follow-up-approval-package-2026-06-27 -SkipRemoteAheadCheck`
