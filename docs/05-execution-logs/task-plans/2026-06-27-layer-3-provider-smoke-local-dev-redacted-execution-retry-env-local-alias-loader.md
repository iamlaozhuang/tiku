# Layer 3 Provider Smoke Local Dev Redacted Execution Retry Env Local Alias Loader Plan

Task id: `layer-3-provider-smoke-local-dev-redacted-execution-retry-env-local-alias-loader-2026-06-27`

Branch: `codex/provider-smoke-retry-env-local-alias-20260627`

## Objective

Retry the Layer 3 local dev Provider smoke through the approved `alibaba` / `qwen-plus` path by loading only the
`ALIBABA_API_KEY` alias from `.env.local` into the current command process environment. Record only a redacted evidence
envelope and stop on any fail, blocked result, cap breach, raw payload/secret need, second call, retry need, or mechanism
gate failure.

This task does not run Cost Calibration, DB, browser/dev-server/e2e, staging/prod/deploy/payment/external-service,
OCR/export, release readiness, or final Pass.

## SSOT Read List

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/01-requirements/00-index.md`
- `docs/01-requirements/advanced-edition/00-index.md`
- `docs/01-requirements/traceability/2026-06-23-advanced-ai-generation-scope-clarification.md`
- `docs/01-requirements/traceability/2026-06-21-content-admin-ai-generation-scope-decision.md`
- `docs/02-architecture/adr/adr-004-environment-isolation-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-005-staging-architecture-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-006-runtime-dependency-alignment.md`
- `docs/04-agent-system/sop/task-lifecycle-governance.md`
- `docs/04-agent-system/sop/requirement-ssot-reading-governance.md`
- `docs/04-agent-system/sop/advanced-edition-cost-calibration-blocked-gate.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/evidence/2026-06-27-layer-3-provider-smoke-local-dev-redacted-execution.md`
- `scripts/ai/run-personal-ai-provider-smoke.mjs`

## Approval Boundary

The current user fresh-approved this retry task with a narrow credential-loading exception:

- Open `.env.local` only for this command.
- Extract only `ALIBABA_API_KEY`.
- Load that value only into the current command process environment.
- Do not output, copy, record, or commit `.env.local` content, secrets, tokens, Provider credentials, DB URLs, or any
  credential value.
- Do not read other `.env*` keys.
- Do not modify `.env.local`.

Provider smoke caps:

- Provider/model: `alibaba` / `qwen-plus`
- Provider calls: maximum `1`
- Retries: `0`
- Script max output tokens: `8`, within approved cap `64`
- Timeout: `30000ms`
- Spend stop limit: `USD 0.05`

## Execution Plan

1. Register this task in `task-queue.yaml` with allowed files, blocked files, caps, redaction rules, validation commands,
   and closeout policy before runtime execution.
2. Update `project-state.yaml` to show the retry task as active/in scope.
3. Execute one PowerShell-wrapped command that reads `.env.local` line-by-line, extracts only `ALIBABA_API_KEY`, sets it
   as a transient process environment variable, runs `scripts/ai/run-personal-ai-provider-smoke.mjs`, filters output to
   the approved redacted fields, and removes the process environment variables before exit.
4. Write evidence/audit/acceptance documents from the filtered envelope only.
5. Run scoped Prettier, `git diff --check`, project status, PreCommit hardening, ModuleCloseout readiness, and PrePush
   readiness.
6. If all gates pass and closeout policy is satisfied, commit, ff-only merge to `master`, run master gates, push
   `origin/master`, and delete the merged short branch.

## Stop Conditions

- Missing `ALIBABA_API_KEY` alias in `.env.local`.
- Command returns `fail` or `blocked`.
- Need to output, inspect, copy, or record a secret, raw prompt, raw response, Provider payload, raw generated content, DB
  URL, DB row, SQL output, screenshot, trace, cookie, or localStorage.
- Need a second Provider call, retry loop, fallback Provider path, second target, or Provider configuration change.
- Need Cost Calibration, DB, browser/dev-server/e2e, staging/prod/deploy/payment/external service, OCR/export, formal
  publish, student-visible runtime, release readiness, or final Pass.
- Any mechanism validation failure.

## Evidence Rules

Allowed evidence fields only:

- provider label
- model label
- pass/fail/blocked
- request count
- Provider call executed boolean
- retry count
- cap status
- redaction status
- failure category
- stop condition
- forbidden-action checklist

Forbidden evidence:

- `.env*` content
- secret/token/credential/DB URL values
- Authorization headers
- raw prompts, responses, payloads, generated AI content
- full `paper`/`material` content
- DB rows, raw SQL output, broad scans
- screenshots, traces, cookies, localStorage

## Requirement Decision Map

- Layer 1 remains complete and is not changed by this task.
- Layer 2 remains at the local PostgreSQL test-owned rejected route/runtime smoke minimum baseline and is not changed.
- Layer 3 Provider smoke is the only gate touched.
- Cost Calibration and pre-release gates remain blocked until separate evidence exists.
- No release readiness or final Pass decision is made in this task.

## Validation Commands

- `npx.cmd prettier --write --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-06-27-layer-3-provider-smoke-local-dev-redacted-execution-retry-env-local-alias-loader.md docs/05-execution-logs/evidence/2026-06-27-layer-3-provider-smoke-local-dev-redacted-execution-retry-env-local-alias-loader.md docs/05-execution-logs/audits-reviews/2026-06-27-layer-3-provider-smoke-local-dev-redacted-execution-retry-env-local-alias-loader.md docs/05-execution-logs/acceptance/2026-06-27-layer-3-provider-smoke-local-dev-redacted-execution-retry-env-local-alias-loader.md`
- `npx.cmd prettier --check --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-06-27-layer-3-provider-smoke-local-dev-redacted-execution-retry-env-local-alias-loader.md docs/05-execution-logs/evidence/2026-06-27-layer-3-provider-smoke-local-dev-redacted-execution-retry-env-local-alias-loader.md docs/05-execution-logs/audits-reviews/2026-06-27-layer-3-provider-smoke-local-dev-redacted-execution-retry-env-local-alias-loader.md docs/05-execution-logs/acceptance/2026-06-27-layer-3-provider-smoke-local-dev-redacted-execution-retry-env-local-alias-loader.md`
- `git diff --check`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Get-TikuProjectStatus.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId layer-3-provider-smoke-local-dev-redacted-execution-retry-env-local-alias-loader-2026-06-27`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId layer-3-provider-smoke-local-dev-redacted-execution-retry-env-local-alias-loader-2026-06-27`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId layer-3-provider-smoke-local-dev-redacted-execution-retry-env-local-alias-loader-2026-06-27 -SkipRemoteAheadCheck`
