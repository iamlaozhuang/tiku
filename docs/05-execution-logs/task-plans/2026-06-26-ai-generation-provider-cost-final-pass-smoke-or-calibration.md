# ai-generation-provider-cost-final-pass-smoke-or-calibration-2026-06-26

## Task

- Task id: `ai-generation-provider-cost-final-pass-smoke-or-calibration-2026-06-26`
- Branch: `codex/ai-provider-cost-smoke-refresh-20260626`
- Task kind: `local_provider_cost_smoke_or_calibration`
- Gate package:
  `docs/05-execution-logs/acceptance/2026-06-26-provider-cost-final-pass-boundary-and-cost-calibration-decision-package.md`

## Refreshed Gate Basis

The Provider/Cost boundary was refreshed in
`provider-cost-final-pass-boundary-and-cost-calibration-decision-package-2026-06-26` before this execution.

Refreshed boundary:

- real Provider calls are allowed only in this task, not in the boundary task;
- maximum real Provider calls: `4`;
- approved workflow labels: `content_ai_question`, `content_ai_paper`, `organization_ai_question`,
  `organization_ai_paper`;
- evidence must stay redacted;
- Provider/model capability smoke must be distinguished from admin route-integrated Provider execution;
- admin route-integrated Provider Pass requires an approved route path returning `providerCallExecuted: true`;
- if admin routes remain `provider_call_blocked`, the outcome is a product-chain diagnostic, not final Pass.

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
- `docs/01-requirements/traceability/role-experience-fulfillment-matrix.md`

## Requirement Decision Map

- Provider calls are allowed only because task 1 materialized a bounded gate package and the owner approved task 2.
- Content admin and organization advanced admin AI `question` and AI `paper` workflows are the only product workflow
  labels in scope.
- Current local contract loops must remain redacted and must not write formal `question` or `paper`.
- Staging/prod, payment, external service, deployment, release readiness, DB/schema/migration/account mutation, and
  source/test/package changes remain blocked.

## Requirement Mapping

Mapped workflows:

- `content_ai_question`
- `content_ai_paper`
- `organization_ai_question`
- `organization_ai_paper`

The task verifies local Provider reachability and usage/cost-summary evidence for these workflow labels. Because the
current admin route source and evidence report `local_contract_only`, `provider_call_blocked`, and
`providerCallExecuted: false`, this task must record the product loop as provider-disabled unless an approved route path
proves otherwise.

## Evidence-Only Sources

- `docs/05-execution-logs/acceptance/2026-06-26-provider-cost-final-pass-boundary-and-cost-calibration-decision-package.md`
- `docs/05-execution-logs/evidence/2026-06-26-provider-cost-final-pass-boundary-and-cost-calibration-decision-package.md`
- `docs/05-execution-logs/evidence/2026-06-26-ai-generation-provider-smoke-execution.md`
- `docs/05-execution-logs/evidence/2026-06-26-content-organization-ai-generation-admin-local-contract-loop-focused-browser-rerun.md`
- `docs/05-execution-logs/evidence/2026-06-26-role-separated-full-8-row-post-admin-ai-local-contract-loop-browser-rerun.md`
- `docs/05-execution-logs/evidence/2026-06-26-admin-ai-generation-generated-result-history-read-ui-closure-tdd.md`
- `scripts/ai/run-personal-ai-provider-smoke.mjs`
- `src/server/services/admin-ai-generation-local-contract-route.ts`

## Conflict Check

No conflict in permission scope: the refreshed gate package allows this task to execute up to four local real Provider
calls. Product-chain status remains blocked because current admin routes are local contract only. A Provider smoke pass
without a provider-integrated admin route is not enough to claim admin product-chain Provider/Cost Pass.

## Allowed Files

- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/2026-06-26-ai-generation-provider-cost-final-pass-smoke-or-calibration.md`
- `docs/05-execution-logs/evidence/2026-06-26-ai-generation-provider-cost-final-pass-smoke-or-calibration.md`
- `docs/05-execution-logs/audits-reviews/2026-06-26-ai-generation-provider-cost-final-pass-smoke-or-calibration.md`

## Blocked Files And Work

- No source, tests, e2e, DB, schema, migration, seed, account mutation, package, lockfile, script, or env file edit.
- No browser or role-account credential runtime unless separately approved.
- No raw prompt, raw output, provider payload, API key, token, cookie, Authorization header, raw provider payload, raw
  DOM, screenshot, trace, DB rows, full `question`/`paper`, or generated content evidence.
- No staging/prod, payment, external service, deployment, PR, force push, release readiness, or final Pass claim.

## Execution Approach

1. Use the task 1 provider profile: `openai_compatible`, `alibaba-qwen`, `qwen3.7-max`,
   `dashscope.aliyuncs.com`, `ALIBABA_API_KEY`.
2. Read `ALIBABA_API_KEY` from the already-approved local Provider credential source without printing or recording it.
3. Execute at most four serial Provider smoke calls with `maxRequests=1`, `maxRetries=0`, `maxOutputTokens=8`, and
   `timeoutMs=30000`.
4. Label the redacted summaries by workflow: `content_ai_question`, `content_ai_paper`, `organization_ai_question`,
   `organization_ai_paper`.
5. Record token/call usage and monetary cost status. If no approved pricing source exists, record
   `monetaryCostEstimated: false`.
6. Record product-chain status from the existing local contract evidence/source boundary.

## Validation Commands

1. Local Provider/Cost smoke loop under the refreshed task 1 gate package, max four real calls, redacted summary output
   only.
2. `npx.cmd prettier --write --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-06-26-ai-generation-provider-cost-final-pass-smoke-or-calibration.md docs/05-execution-logs/evidence/2026-06-26-ai-generation-provider-cost-final-pass-smoke-or-calibration.md docs/05-execution-logs/audits-reviews/2026-06-26-ai-generation-provider-cost-final-pass-smoke-or-calibration.md`
3. `npx.cmd prettier --check --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-06-26-ai-generation-provider-cost-final-pass-smoke-or-calibration.md docs/05-execution-logs/evidence/2026-06-26-ai-generation-provider-cost-final-pass-smoke-or-calibration.md docs/05-execution-logs/audits-reviews/2026-06-26-ai-generation-provider-cost-final-pass-smoke-or-calibration.md`
4. `git diff --check`
5. `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId ai-generation-provider-cost-final-pass-smoke-or-calibration-2026-06-26`
6. `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId ai-generation-provider-cost-final-pass-smoke-or-calibration-2026-06-26 -SkipRemoteAheadCheck`

## Stop Conditions

- Credential missing.
- Provider error/timeout requiring retry beyond the gate.
- Any evidence redaction violation.
- Any call count would exceed `4`.
- Any requested action needs source/test/package/env/schema/DB/account/browser/staging/prod/payment/external-service work.
