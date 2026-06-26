# AI Generation Provider Smoke Execution Plan

Task id: `ai-generation-provider-smoke-execution-2026-06-26`

Branch: `codex/ai-provider-smoke-20260626`

Task kind: `local_provider_smoke_execution`

## SSOT Read List

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/adr-001-tech-stack-selection.md`
- `docs/02-architecture/adr/adr-002-runtime-architecture-and-multi-client-contract.md`
- `docs/02-architecture/adr/adr-003-workplace-desktop-web-compatibility.md`
- `docs/02-architecture/adr/adr-004-environment-isolation-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-005-staging-architecture-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-006-runtime-dependency-alignment.md`
- `docs/02-architecture/adr/adr-007-edition-aware-authorization-source-of-truth.md`
- `docs/04-agent-system/operating-manual.md`
- `docs/04-agent-system/sop/requirement-ssot-reading-governance.md`
- `docs/04-agent-system/sop/task-lifecycle-governance.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/01-requirements/00-index.md`
- `docs/01-requirements/advanced-edition/00-index.md`
- `docs/01-requirements/advanced-edition/modules/02-ai-task-domain.md`
- `docs/01-requirements/advanced-edition/modules/03-personal-ai-generation.md`
- `docs/01-requirements/advanced-edition/modules/08-organization-ai-generation.md`
- `docs/01-requirements/traceability/2026-06-23-advanced-ai-generation-scope-clarification.md`
- `docs/01-requirements/traceability/2026-06-24-role-separated-mvp-requirement-alignment.md`

## Requirement Decision Map

- ADR-006 allows installed AI SDK packages to be used only with explicit Provider/env/runtime approval.
- The 2026-06-26 Provider/Cost gate package approves exactly one local dev Provider smoke for
  `openai_compatible` / `alibaba-qwen` / `qwen3.7-max`.
- Advanced AI requirements require redacted task and `ai_call_log` style evidence without exposing prompt, Provider
  payload, secret, token, or raw AI output.
- Cost Calibration remains blocked and must not be inferred from a smoke result.

## Requirement Mapping

This task maps to AI task/provider readiness only. It does not implement personal, content, or organization AI product
loops and does not approve final MVP Pass.

The smoke may prove:

- existing SDK and endpoint wiring can execute one local call;
- credential access can be performed without evidence leakage;
- Provider returns either pass, sanitized fail, or missing-credential blocked evidence;
- usage counters are present or absent.

The smoke must not prove:

- generated content quality;
- product-loop completion;
- quota, price, or Cost Calibration readiness;
- staging/prod/provider production readiness.

## Evidence-Only Sources

- `docs/05-execution-logs/acceptance/2026-06-26-ai-generation-provider-cost-gate-package.md`
- `docs/05-execution-logs/evidence/2026-06-26-ai-generation-provider-cost-gate-package.md`
- `docs/05-execution-logs/audits-reviews/2026-06-26-ai-generation-provider-cost-gate-package.md`
- `docs/05-execution-logs/acceptance/2026-06-26-ai-generation-scope-inventory-and-mvp-decision-package.md`

## Read-Only Runtime Sources

- `scripts/ai/run-personal-ai-provider-smoke.mjs`
- `tests/unit/run-personal-ai-provider-smoke.test.ts`
- `src/server/services/personal-ai-generation-route-integrated-provider-execution-service.ts`
- `src/server/services/personal-ai-generation-route-integrated-provider-execution-service.test.ts`
- `.env.local` only as fallback source for `ALIBABA_API_KEY` if the process environment does not already contain it.

## Conflict Check

No conflict found. The gate package explicitly selects Provider smoke before content/organization AI product-loop
planning. The gate also blocks full Cost Calibration, raw evidence, retries, browser runtime, DB work, source edits, and
final MVP Pass.

## Allowed Scope

- Update docs/state/queue/evidence/audit for this task.
- Execute one local Provider smoke with existing script runner.
- Read `ALIBABA_API_KEY` from ephemeral process env or `.env.local` fallback only.
- Run existing focused unit tests for smoke runner and route-integrated provider execution redaction.
- Record only allowed redacted evidence fields.

## Blocked Scope

- No second Provider call or retry.
- No raw prompt, request payload, response payload, raw generated output, API key, partial API key, Authorization header,
  raw `.env*` line, stack trace, screenshot, trace, HTML report, DB URL, or raw DB row in evidence.
- No Cost Calibration, quota pricing, production cost default, or Cost Calibration Pass.
- No source, test, script, package, lockfile, schema, migration, DB, seed, account, browser, e2e, staging/prod, payment,
  non-Provider external service, PR, force push, or final MVP Pass.

## Execution Approach

1. Prepare task plan, evidence, audit, queue, and project state.
2. Execute the existing smoke runner once with:
   - `provider`: `openai_compatible`
   - `providerName`: `alibaba-qwen`
   - `model`: `qwen3.7-max`
   - `envKey`: `ALIBABA_API_KEY`
   - `baseUrlHost`: `dashscope.aliyuncs.com`
   - `maxRequests`: `1`
   - `maxRetries`: `0`
   - `maxOutputTokens`: `8`
   - `timeoutMs`: `30000`
3. If process env lacks `ALIBABA_API_KEY`, read `.env.local` only to populate the process env for this one command.
4. Record sanitized result status and next-task decision.

## Risk Defenses

- `TIKU_PROVIDER_SMOKE_APPROVED=1` must be present for execution.
- The command uses the existing runner's redaction guard.
- The command prints only the redacted envelope.
- Evidence records command identity and sanitized outcome, not raw command output if it ever violates redaction.
- Failure does not retry automatically.

## Validation Commands

- `node scripts/ai/run-personal-ai-provider-smoke.mjs --provider openai_compatible --provider-name alibaba-qwen --model qwen3.7-max --env-key ALIBABA_API_KEY --max-requests 1 --timeout-ms 30000 --base-url https://dashscope.aliyuncs.com/compatible-mode/v1 --execute`
- `npm.cmd run test:unit -- tests/unit/run-personal-ai-provider-smoke.test.ts src/server/services/personal-ai-generation-route-integrated-provider-execution-service.test.ts`
- `npx.cmd prettier --write --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-06-26-ai-generation-provider-smoke-execution.md docs/05-execution-logs/evidence/2026-06-26-ai-generation-provider-smoke-execution.md docs/05-execution-logs/audits-reviews/2026-06-26-ai-generation-provider-smoke-execution.md`
- `npx.cmd prettier --check --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-06-26-ai-generation-provider-smoke-execution.md docs/05-execution-logs/evidence/2026-06-26-ai-generation-provider-smoke-execution.md docs/05-execution-logs/audits-reviews/2026-06-26-ai-generation-provider-smoke-execution.md`
- `git diff --check`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId ai-generation-provider-smoke-execution-2026-06-26`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId ai-generation-provider-smoke-execution-2026-06-26 -SkipRemoteAheadCheck`

## Evidence And Audit Requirements

- Evidence must include redacted Provider smoke result and credential source kind only.
- Evidence must record whether `.env.local` fallback was used, but not the raw line or secret value.
- Audit must decide whether the result is pass, fail, or blocked and select the next task accordingly.
- No MVP final Pass may be claimed.
