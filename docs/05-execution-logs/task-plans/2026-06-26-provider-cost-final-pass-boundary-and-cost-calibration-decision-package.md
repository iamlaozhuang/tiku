# provider-cost-final-pass-boundary-and-cost-calibration-decision-package-2026-06-26

## Task

- Task id: `provider-cost-final-pass-boundary-and-cost-calibration-decision-package-2026-06-26`
- Branch: `codex/provider-cost-boundary-refresh-20260626`
- Task kind: `docs_only_provider_cost_final_pass_boundary_package`
- Scope: docs/state/evidence/audit only.

## Current-State Refresh

This task refreshes the existing Provider/Cost boundary after the admin generated-result history/read UI closure task.

Current basis:

- admin content and organization local contract routes can persist redacted draft generated-result summaries;
- admin content and organization GET history can read persisted generated-result summaries;
- admin UI can display redacted generated-result summaries in the request history surface;
- admin routes still default to `local_contract_only`, `provider_call_blocked`, and `providerCallExecuted: false`;
- no admin route-integrated real Provider bridge has been implemented or approved in this task.

Therefore the next Provider smoke task must distinguish local Provider/model capability evidence from admin product route
Provider execution evidence.

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

- Advanced AI generation entries are required for eligible learner, organization admin, and content admin surfaces.
- Content admin and organization admin AI generated output must remain outside formal `question` and `paper` records
  unless a later governed adoption task is approved.
- AI task evidence must be redacted and must not expose raw prompt, provider payload, raw output, secret, token, or full
  content.
- ADR-006 records installed AI SDK availability but does not itself approve Provider calls.
- Provider/Cost, staging/prod, payment, external-service, deployment, and release readiness remain separately gated.

## Requirement Mapping

This task maps only the Provider/Cost decision boundary for local admin AI generation. It does not alter requirements or
runtime behavior.

Mapped rows:

- `content_admin`: content backend `content_ai_question` and `content_ai_paper` local contract loops.
- `org_advanced_admin`: organization backend `organization_ai_question` and `organization_ai_paper` local contract loops.
- `org_standard_admin`: remains denied/unavailable for organization AI generation.
- Generated result boundary: redacted generated-result history/read UI is a draft/result surface, not formal adoption.
- Formal content boundary: no direct formal `question` or `paper` write.
- Provider boundary: the next task may perform bounded local dev Provider smoke/calibration only if it stays inside this
  package.

## Evidence-Only Sources

- `docs/05-execution-logs/acceptance/2026-06-26-mvp-final-pass-decision-review.md`
- `docs/05-execution-logs/evidence/2026-06-26-mvp-final-pass-decision-review.md`
- `docs/05-execution-logs/acceptance/2026-06-26-mvp-final-pass-decision-criteria-package.md`
- `docs/05-execution-logs/evidence/2026-06-26-ai-generation-provider-smoke-execution.md`
- `docs/05-execution-logs/acceptance/2026-06-26-ai-generation-provider-cost-gate-package.md`
- `docs/05-execution-logs/evidence/2026-06-26-content-organization-ai-generation-admin-local-contract-loop-source-repair.md`
- `docs/05-execution-logs/evidence/2026-06-26-content-organization-ai-generation-admin-local-contract-loop-focused-browser-rerun.md`
- `docs/05-execution-logs/evidence/2026-06-26-role-separated-full-8-row-post-admin-ai-local-contract-loop-browser-rerun.md`
- `docs/05-execution-logs/evidence/2026-06-26-admin-ai-generation-generated-result-storage-migration-journal-alignment-route-integration-tdd-smoke-retry.md`
- `docs/05-execution-logs/evidence/2026-06-26-admin-ai-generation-generated-result-history-read-ui-closure-tdd.md`

## Conflict Check

No requirement conflict found. Existing evidence proves local contract loops, generated-result persistence/readback UI,
and one prior personal Provider smoke. It does not prove content/organization admin route-integrated Provider execution.

The next task must classify results separately:

- Provider/model capability and token/cost summary evidence;
- admin route/product-chain status: `local_contract_only`, `provider_call_blocked`, or `provider_call_executed`.

If the admin product route still reports `provider_call_blocked`, the result may be a Provider capability smoke plus a
product-chain diagnostic. It must not be recorded as admin route-integrated Provider Pass.

## Allowed Files

- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/2026-06-26-provider-cost-final-pass-boundary-and-cost-calibration-decision-package.md`
- `docs/05-execution-logs/acceptance/2026-06-26-provider-cost-final-pass-boundary-and-cost-calibration-decision-package.md`
- `docs/05-execution-logs/evidence/2026-06-26-provider-cost-final-pass-boundary-and-cost-calibration-decision-package.md`
- `docs/05-execution-logs/audits-reviews/2026-06-26-provider-cost-final-pass-boundary-and-cost-calibration-decision-package.md`

## Blocked Files And Work

- No source, test, DB, schema, migration, seed, package, lockfile, script, or env file change.
- No Provider call, credential read, Cost Calibration execution, browser/e2e, DB/account mutation, staging/prod,
  payment, external service, deployment, PR, force push, or release readiness claim.

## Implementation Approach

1. Refresh the Provider/Cost final Pass boundary package against the current admin generated-result history/read state.
2. Update queue/state records for this refreshed decision package.
3. Record provider capability versus route-integrated execution classification rules.
4. Record redaction, credential, max-call, cost-summary, and failure-branch rules.
5. Validate scoped formatting, diff hygiene, Module Run v2 pre-commit hardening, and pre-push readiness.

## Gate Decision To Materialize

The next task is allowed to execute local dev real Provider smoke/calibration under these constraints:

- provider/model follows the existing gate: `openai_compatible`, `alibaba-qwen`, `qwen3.7-max`,
  `dashscope.aliyuncs.com`, `ALIBABA_API_KEY`, max retries `0`, timeout `30000`, no streaming, no fallback.
- maximum real Provider calls: `4`, one each for `content_ai_question`, `content_ai_paper`,
  `organization_ai_question`, and `organization_ai_paper`.
- because the current admin route has no approved real Provider bridge, calls are Provider/model capability smoke mapped
  to admin workflow labels unless the next task proves an existing approved route path returns `providerCallExecuted:
true`.
- route/product-chain status must be recorded separately as `local_contract_only`, `provider_call_blocked`, or
  `provider_call_executed`.
- evidence records only provider/model metadata, route/workflow, status, latency, token/cost summary, error category,
  call count, and whether local contract summary remained provider-disabled.
- no raw prompt, raw output, API key, token, cookie, Authorization header, raw provider payload, raw DOM, screenshot,
  trace, or full `question`/`paper` content can be recorded.

## Validation Commands

1. `npx.cmd prettier --write --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-06-26-provider-cost-final-pass-boundary-and-cost-calibration-decision-package.md docs/05-execution-logs/acceptance/2026-06-26-provider-cost-final-pass-boundary-and-cost-calibration-decision-package.md docs/05-execution-logs/evidence/2026-06-26-provider-cost-final-pass-boundary-and-cost-calibration-decision-package.md docs/05-execution-logs/audits-reviews/2026-06-26-provider-cost-final-pass-boundary-and-cost-calibration-decision-package.md`
2. `npx.cmd prettier --check --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-06-26-provider-cost-final-pass-boundary-and-cost-calibration-decision-package.md docs/05-execution-logs/acceptance/2026-06-26-provider-cost-final-pass-boundary-and-cost-calibration-decision-package.md docs/05-execution-logs/evidence/2026-06-26-provider-cost-final-pass-boundary-and-cost-calibration-decision-package.md docs/05-execution-logs/audits-reviews/2026-06-26-provider-cost-final-pass-boundary-and-cost-calibration-decision-package.md`
3. `git diff --check`
4. `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId provider-cost-final-pass-boundary-and-cost-calibration-decision-package-2026-06-26`
5. `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId provider-cost-final-pass-boundary-and-cost-calibration-decision-package-2026-06-26 -SkipRemoteAheadCheck`

## Stop Conditions

- Any required edit falls outside allowed files.
- Any task requires Provider execution before task 1 closes.
- Any evidence would expose a secret, raw prompt, provider payload, raw output, raw DOM, screenshot, token, credential,
  Authorization header, database URL, or full content.
- Any action touches staging/prod, payment, external service, deployment, source/test/schema/migration/package/env files.
