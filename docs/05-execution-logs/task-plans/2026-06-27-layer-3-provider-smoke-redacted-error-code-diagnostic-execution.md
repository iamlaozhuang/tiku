# Layer 3 Provider Smoke Redacted Error-Code Diagnostic Execution Plan

Task id: `layer-3-provider-smoke-redacted-error-code-diagnostic-execution-2026-06-27`

Branch: `codex/provider-error-code-diagnostic-20260627`

## Objective

Run one local dev redacted Provider diagnostic call for `alibaba` / `qwen-plus` after the previous Provider smoke stopped
with sanitized `provider_error`. This task may read `.env.local` only to extract `ALIBABA_API_KEY` into the current command
process environment. It must not output, copy, record, or commit any credential value or raw Provider material.

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
- `docs/04-agent-system/sop/advanced-edition-evidence-redaction-template.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/evidence/2026-06-27-layer-3-provider-smoke-local-dev-redacted-execution-provider-error-follow-up-approval-package.md`
- `scripts/ai/run-personal-ai-provider-smoke.mjs`
- `tests/unit/run-personal-ai-provider-smoke.test.ts`

## Approval Boundary

The current user fresh-approved an unattended serial package and explicitly approved this task as step 1:

- open `.env.local` only for this command;
- extract only `ALIBABA_API_KEY` into the current command process environment;
- run at most one Provider diagnostic call for `alibaba` / `qwen-plus`;
- use 0 retries, timeout 30000 ms, script max output tokens 8, and spend stop limit USD 0.05;
- record only redacted status fields and sanitized `providerErrorSummary.httpStatus` /
  `providerErrorSummary.providerErrorCode`.

Blocked in this task:

- second Provider call, retry loop, second target, fallback Provider, or Provider configuration change;
- raw prompt, raw response, Provider payload, raw Provider error body/message, raw generated content, secret, token,
  Authorization header, DB URL, DB row, SQL output, screenshot, trace, cookie, or localStorage evidence;
- DB, browser/dev-server/e2e, Cost Calibration, staging/prod/deploy/payment external service, OCR/export;
- source/test/package/lockfile/schema/migration/seed edits;
- PR, force push, release readiness, or final Pass.

## Execution Plan

1. Register this high-risk diagnostic task in `task-queue.yaml` with exact docs/state allowed files, blocked files, caps,
   redaction fields, validation commands, and closeout policy.
2. Update `project-state.yaml` to make this the current task and to record the approved Provider diagnostic boundary.
3. Create evidence/audit/acceptance documents before execution.
4. Run one sanitized Node command that:
   - extracts only `ALIBABA_API_KEY` from `.env.local` into `process.env`;
   - sets `TIKU_PROVIDER_SMOKE_APPROVED=1`;
   - invokes `runProviderSmokeSandbox` for `alibaba` / `qwen-plus`;
   - prints only the approved diagnostic field subset.
5. Record the redacted result as pass/fail/blocked. If it is fail or blocked, stop the serial package after closeout.
6. Run scoped formatting and mechanism gates, then commit, ff-only merge, master gates, push, and delete the short branch
   if gates pass.

## Requirement Decision Map

- Layer 1 remains complete and unchanged.
- Layer 2 remains at the local PostgreSQL test-owned `rejected` review-command minimum business loop.
- Layer 3 Provider smoke remains blocked unless this diagnostic gives enough evidence to justify the next approved step.
- Cost Calibration and pre-release gates remain blocked until Provider smoke passes in a later task.

## Evidence-Only Sources

Prior Provider evidence is used only as blocker history and redaction precedent. It does not approve additional retries
outside this task's single diagnostic call cap.

## Conflict Check

Current state, queue, and evidence agree that the previous Provider smoke consumed one call, returned `provider_error`,
and stopped without retry. The current fresh approval authorizes exactly one diagnostic call to expose only sanitized
status and provider error code fields.

## Validation Commands

- `node --input-type=module -e <single-alias ALIBABA_API_KEY loader plus redacted Provider diagnostic call>`
- `npx.cmd prettier --write --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-06-27-layer-3-provider-smoke-redacted-error-code-diagnostic-execution.md docs/05-execution-logs/evidence/2026-06-27-layer-3-provider-smoke-redacted-error-code-diagnostic-execution.md docs/05-execution-logs/audits-reviews/2026-06-27-layer-3-provider-smoke-redacted-error-code-diagnostic-execution.md docs/05-execution-logs/acceptance/2026-06-27-layer-3-provider-smoke-redacted-error-code-diagnostic-execution.md`
- `npx.cmd prettier --check --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-06-27-layer-3-provider-smoke-redacted-error-code-diagnostic-execution.md docs/05-execution-logs/evidence/2026-06-27-layer-3-provider-smoke-redacted-error-code-diagnostic-execution.md docs/05-execution-logs/audits-reviews/2026-06-27-layer-3-provider-smoke-redacted-error-code-diagnostic-execution.md docs/05-execution-logs/acceptance/2026-06-27-layer-3-provider-smoke-redacted-error-code-diagnostic-execution.md`
- `git diff --check`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Get-TikuProjectStatus.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId layer-3-provider-smoke-redacted-error-code-diagnostic-execution-2026-06-27`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId layer-3-provider-smoke-redacted-error-code-diagnostic-execution-2026-06-27`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId layer-3-provider-smoke-redacted-error-code-diagnostic-execution-2026-06-27 -SkipRemoteAheadCheck`
