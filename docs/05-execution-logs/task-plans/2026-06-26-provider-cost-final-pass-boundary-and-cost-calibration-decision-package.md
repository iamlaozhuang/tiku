# provider-cost-final-pass-boundary-and-cost-calibration-decision-package-2026-06-26

## Task

- Task id: `provider-cost-final-pass-boundary-and-cost-calibration-decision-package-2026-06-26`
- Branch: `codex/provider-cost-final-pass-boundary-20260626`
- Task kind: `docs_only_provider_cost_final_pass_boundary_package`
- Scope: docs/state/evidence/audit only.

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
- Content admin and organization admin AI generated output must remain outside formal `question` and `paper` records unless a later governed adoption task is approved.
- AI task evidence must be redacted and must not expose raw prompt, provider payload, raw output, secret, token, or full content.
- ADR-006 records installed AI SDK availability but does not itself approve Provider calls.
- Provider/Cost, staging/prod, payment, external-service, deployment, and release readiness remain separately gated.

## Requirement Mapping

This task maps only the Provider/Cost decision boundary for the already-passing local product scope. It does not alter
requirements or runtime behavior.

Mapped rows:

- `content_admin`: content backend `AI出题` and `AI组卷` local contract loop.
- `org_advanced_admin`: organization backend `AI出题` and `AI组卷` local contract loop.
- `org_standard_admin`: remains denied/unavailable for organization AI generation.
- Formal content boundary: no direct formal `question` or `paper` write.
- Provider boundary: next task may perform bounded local dev Provider smoke/calibration only if this package allows it.

## Evidence-Only Sources

- `docs/05-execution-logs/acceptance/2026-06-26-mvp-final-pass-decision-review.md`
- `docs/05-execution-logs/evidence/2026-06-26-mvp-final-pass-decision-review.md`
- `docs/05-execution-logs/acceptance/2026-06-26-mvp-final-pass-decision-criteria-package.md`
- `docs/05-execution-logs/evidence/2026-06-26-ai-generation-provider-smoke-execution.md`
- `docs/05-execution-logs/acceptance/2026-06-26-ai-generation-provider-cost-gate-package.md`
- `docs/05-execution-logs/evidence/2026-06-26-content-organization-ai-generation-admin-local-contract-loop-source-repair.md`
- `docs/05-execution-logs/evidence/2026-06-26-content-organization-ai-generation-admin-local-contract-loop-focused-browser-rerun.md`
- `docs/05-execution-logs/evidence/2026-06-26-role-separated-full-8-row-post-admin-ai-local-contract-loop-browser-rerun.md`

## Conflict Check

No requirement conflict found. Existing evidence proves local contract loops and one prior personal Provider smoke, but it
does not prove content/organization admin Provider-backed runtime. Therefore the next task must treat Provider-backed
admin loop status as unproven until bounded smoke evidence exists.

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

1. Prepare the Provider/Cost final Pass boundary package.
2. Add queue/state records for this decision package and the gated follow-up task.
3. Record redaction, credential, max-call, cost-summary, and failure-branch rules.
4. Validate scoped formatting, diff hygiene, Module Run v2 pre-commit hardening, and pre-push readiness.

## Gate Decision To Materialize

The next task is allowed to execute local dev real Provider smoke/calibration under these constraints:

- provider/model follows the existing gate: `openai_compatible`, `alibaba-qwen`, `qwen3.7-max`,
  `dashscope.aliyuncs.com`, `ALIBABA_API_KEY`, max retries `0`, timeout `30000`, no streaming, no fallback.
- maximum real Provider calls: `4`, one each for content `AI出题`, content `AI组卷`, organization `AI出题`, and
  organization `AI组卷`.
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
