# Layer 3 Provider Smoke OpenAI-Compatible DashScope Config Boundary Repair Retry Plan

Task id: `layer-3-provider-smoke-openai-compatible-dashscope-config-boundary-repair-retry-2026-06-27`

Branch: `codex/provider-openai-compatible-repair-retry-20260627`

## Objective

Run one local dev redacted Provider smoke through the explicit OpenAI-compatible DashScope boundary after the previous
implicit `alibaba` / `qwen-plus` Provider path returned sanitized HTTP `401`. This task treats the issue as a
configuration-boundary repair retry, not as a key replacement task.

The retry must use the existing smoke script surface with:

- provider: `openai_compatible`
- provider name: `alibaba-qwen`
- model: `qwen3.7-max`
- base URL: `https://dashscope.aliyuncs.com/compatible-mode/v1`
- credential alias: `ALIBABA_API_KEY`
- max Provider calls: `1`
- retry cap: `0`
- timeout: `30000` ms
- max output tokens: existing script cap only
- spend stop limit: USD `0.05`

## SSOT Read List

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/01-requirements/00-index.md`
- `docs/01-requirements/advanced-edition/00-index.md`
- `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`
- `docs/01-requirements/traceability/2026-06-23-advanced-ai-generation-scope-clarification.md`
- `docs/01-requirements/traceability/2026-06-21-content-admin-ai-generation-scope-decision.md`
- `docs/02-architecture/adr/adr-001-tech-stack-selection.md`
- `docs/02-architecture/adr/adr-002-runtime-architecture-and-multi-client-contract.md`
- `docs/02-architecture/adr/adr-003-workplace-desktop-web-compatibility.md`
- `docs/02-architecture/adr/adr-004-environment-isolation-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-005-staging-architecture-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-006-runtime-dependency-alignment.md`
- `docs/02-architecture/adr/adr-007-edition-aware-authorization-source-of-truth.md`
- `docs/04-agent-system/sop/task-lifecycle-governance.md`
- `docs/04-agent-system/sop/failure-retry-and-human-takeover-governance.md`
- `docs/04-agent-system/sop/advanced-edition-evidence-redaction-template.md`
- `docs/04-agent-system/sop/advanced-edition-cost-calibration-blocked-gate.md`
- `docs/04-agent-system/sop/repository-hygiene-closeout-checklist.md`
- `docs/04-agent-system/sop/local-first-validation-governance.md`
- `docs/04-agent-system/sop/dependency-introduction-gate.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/evidence/2026-06-26-ai-generation-provider-smoke-execution.md`
- `docs/05-execution-logs/evidence/2026-06-27-layer-3-provider-smoke-redacted-error-code-diagnostic-execution.md`
- `docs/05-execution-logs/audits-reviews/2026-06-27-layer-3-provider-smoke-redacted-error-code-diagnostic-execution.md`
- `docs/05-execution-logs/acceptance/2026-06-27-layer-3-provider-smoke-redacted-error-code-diagnostic-execution.md`
- `scripts/ai/run-personal-ai-provider-smoke.mjs`

## Approval Boundary

The current user fresh-approved this exact task. Approved:

- create an independent short branch;
- write task plan, queue/state registration, evidence, audit, and acceptance documents;
- open `.env.local` only for this command;
- extract only `ALIBABA_API_KEY` into the current command process environment;
- execute one Provider smoke through `openai_compatible` / `alibaba-qwen` / `qwen3.7-max` with explicit
  `https://dashscope.aliyuncs.com/compatible-mode/v1`;
- record only provider label, provider name, model label, base URL host, pass/fail/blocked, request count, Provider call
  executed boolean, retry count, cap status, redaction status, failure category, sanitized `providerErrorSummary`, stop
  condition, and forbidden-action checklist.

Blocked:

- `.env.local` modification or output;
- credential value, raw prompt, raw response, raw Provider payload, raw Provider error body/message, raw generated AI
  content, Authorization header, DB URL, DB row, SQL output, screenshot, trace, cookie, or localStorage evidence;
- Provider SDK, package, lockfile, script, source, test, schema, migration, seed, or app configuration changes;
- second Provider call, retry loop, model switch, endpoint switch, fallback, or broader Provider configuration change;
- Cost Calibration, DB, browser/dev-server/e2e, staging/prod/deploy/payment external service, OCR/export, PR, force
  push, release readiness, or final Pass.

## Execution Plan

1. Register this task in `task-queue.yaml` with exact allowed files, blocked files, caps, redaction rules, validation
   commands, and closeout policy.
2. Update `project-state.yaml` to make this the current active Provider configuration-boundary repair retry.
3. Create evidence, audit, and acceptance documents before the Provider command.
4. Run one PowerShell/Node command that:
   - reads `.env.local` only to find `ALIBABA_API_KEY`;
   - sets only that alias in process env for this command;
   - sets `TIKU_PROVIDER_SMOKE_APPROVED=1`;
   - calls `runProviderSmokeSandbox` with the approved OpenAI-compatible DashScope config;
   - prints only the approved redacted field subset.
5. If the command returns `fail` or `blocked`, record blocked evidence and stop after task closeout.
6. If the command returns `pass`, record Provider smoke pass for this exact boundary only. Do not start Cost
   Calibration or any later serial task under this approval.
7. Run scoped Prettier write/check, `git diff --check`, project status, Module Run v2 hardening, closeout readiness, and
   pre-push readiness. Commit, ff-only merge, push, and branch cleanup only if the task-scoped closeout policy passes.

## Requirement Decision Map

- Layer 1 remains complete and unchanged.
- Layer 2 remains at the local PostgreSQL test-owned `rejected` review-command minimum business loop.
- Layer 3 Provider smoke is the only layer touched by this task.
- Cost Calibration and pre-release gates remain blocked even if this Provider smoke passes.

## Evidence-Only Sources

The 2026-06-26 Provider smoke evidence is used only as a historical precedent that an explicit OpenAI-compatible
DashScope path with `dashscope.aliyuncs.com` had previously passed. The 2026-06-27 diagnostic evidence is used only as
the latest blocked/failure premise for the implicit `alibaba` / `qwen-plus` path.

## Conflict Check

The latest state says Layer 3 is blocked by sanitized HTTP `401` on the implicit Alibaba Provider path. The user's fresh
approval changes the premise by allowing exactly one explicit OpenAI-compatible DashScope boundary retry. This does not
authorize a general Provider configuration change in source code or persisted project configuration.

## Validation Commands

- `node --input-type=module -e <single-alias ALIBABA_API_KEY loader plus redacted openai_compatible DashScope Provider smoke call>`
- `npx.cmd prettier --write --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-06-27-layer-3-provider-smoke-openai-compatible-dashscope-config-boundary-repair-retry.md docs/05-execution-logs/evidence/2026-06-27-layer-3-provider-smoke-openai-compatible-dashscope-config-boundary-repair-retry.md docs/05-execution-logs/audits-reviews/2026-06-27-layer-3-provider-smoke-openai-compatible-dashscope-config-boundary-repair-retry.md docs/05-execution-logs/acceptance/2026-06-27-layer-3-provider-smoke-openai-compatible-dashscope-config-boundary-repair-retry.md`
- `npx.cmd prettier --check --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-06-27-layer-3-provider-smoke-openai-compatible-dashscope-config-boundary-repair-retry.md docs/05-execution-logs/evidence/2026-06-27-layer-3-provider-smoke-openai-compatible-dashscope-config-boundary-repair-retry.md docs/05-execution-logs/audits-reviews/2026-06-27-layer-3-provider-smoke-openai-compatible-dashscope-config-boundary-repair-retry.md docs/05-execution-logs/acceptance/2026-06-27-layer-3-provider-smoke-openai-compatible-dashscope-config-boundary-repair-retry.md`
- `git diff --check`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Get-TikuProjectStatus.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId layer-3-provider-smoke-openai-compatible-dashscope-config-boundary-repair-retry-2026-06-27`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId layer-3-provider-smoke-openai-compatible-dashscope-config-boundary-repair-retry-2026-06-27`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId layer-3-provider-smoke-openai-compatible-dashscope-config-boundary-repair-retry-2026-06-27 -SkipRemoteAheadCheck`
