# Layer 3 Provider Smoke Local Dev Redacted Execution Approval Package Plan

Task id: `layer-3-provider-smoke-local-dev-redacted-execution-approval-package-2026-06-27`

Branch: `codex/layer-3-provider-smoke-approval-package-20260627`

Task kind: docs/state-only approval package

## Objective

Prepare the Layer 3 local dev Provider smoke execution approval package after the Layer 3 Provider/cost/pre-release
matrix refresh. This task defines future Provider/model candidates, credential alias handling, call/retry/token/spend
caps, evidence redaction, stop conditions, owner escalation, and copyable execution approval text.

This task does not execute Provider calls, read or output credentials, read `.env*`, change Provider configuration, run
Cost Calibration, connect to DB, run browser/dev-server/e2e, mutate runtime state, publish content, deploy, touch
payment/external services, run OCR/export, create PRs, force push, or claim release readiness/final Pass.

## SSOT Read List

- `docs/01-requirements/00-index.md`
- `docs/01-requirements/advanced-edition/00-index.md`
- `docs/01-requirements/traceability/2026-06-23-advanced-ai-generation-scope-clarification.md`
- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/adr-001-tech-stack-selection.md`
- `docs/02-architecture/adr/adr-002-runtime-architecture-and-multi-client-contract.md`
- `docs/02-architecture/adr/adr-003-workplace-desktop-web-compatibility.md`
- `docs/02-architecture/adr/adr-004-environment-isolation-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-005-staging-architecture-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-006-runtime-dependency-alignment.md`
- `docs/02-architecture/adr/adr-007-edition-aware-authorization-source-of-truth.md`
- `docs/04-agent-system/sop/task-lifecycle-governance.md`
- `docs/04-agent-system/sop/module-lifecycle-governance.md`
- `docs/04-agent-system/sop/docs-only-fast-lane-governance.md`
- `docs/04-agent-system/sop/requirement-ssot-reading-governance.md`
- `docs/04-agent-system/sop/advanced-edition-cost-calibration-blocked-gate.md`

## Requirement Decision Map

- Standard MVP excludes online payment, OCR, broad automatic import, AI balance/token billing, and production backup
  implementation from the current MVP surface.
- Advanced edition requires AI generation paths but keeps Provider/env/secret/staging/payment/external-service work
  approval-gated.
- The 2026-06-23 advanced AI generation clarification requires generated content to stay outside formal `question` and
  `paper` until governed review/adoption.
- ADR-004 and ADR-005 require dev/staging/prod isolation and explicit approval for deployment, staging/prod connections,
  secret work, and environment changes.
- ADR-006 confirms installed AI SDK packages are dependency availability only; they do not approve Provider runtime use,
  Provider configuration, or credential access.
- The Cost Calibration blocked-gate SOP requires cost measurement, provider cost measurement, pricing decisions, quota
  defaults, Provider account/quota/model/endpoint/fallback configuration, env/secret work, staging/prod/cloud/deploy,
  payment, and external-service work to remain blocked pending fresh explicit approval.

## Requirement Mapping

This task maps to the Layer 3 acceptance gate only. It prepares a future, capped, local dev Provider smoke execution
boundary for AI generation readiness review. It does not satisfy AI/RAG runtime acceptance, cost readiness, staging
readiness, production readiness, or final acceptance.

## Evidence-Only Sources

- `docs/05-execution-logs/acceptance/2026-06-27-layer-3-provider-cost-pre-release-approval-matrix-refresh-after-layer-2-local-postgres-minimum.md`
- `docs/05-execution-logs/evidence/2026-06-27-layer-3-provider-cost-pre-release-approval-matrix-refresh-after-layer-2-local-postgres-minimum.md`
- `docs/05-execution-logs/acceptance/2026-06-27-high-risk-approval-package-consolidation-retirement.md`
- Historical retired AP-01 queue entries are evidence only; they do not authorize new Provider execution.

## Conflict Check

No conflict found. Requirement and ADR sources allow docs-only approval-package preparation, while execution logs and
the high-risk consolidation ledger keep Provider execution, Provider configuration, credential reads, and Cost
Calibration blocked until a later fresh approval.

## Proposed Future Provider Smoke Boundary

Future execution must choose exactly one Provider path:

| Path          | Provider/model candidate                         | Credential alias       | Status in this task                                                                                                       |
| ------------- | ------------------------------------------------ | ---------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| Preferred     | Alibaba Provider, `qwen-plus`                    | `ALIBABA_API_KEY`      | Candidate only; no credential read, no configuration read/change, no Provider call                                        |
| Alternate     | OpenAI-compatible DashScope, `qwen-plus`         | `ALIBABA_API_KEY`      | Candidate only; base URL/endpoint must be named in future execution approval if used                                      |
| Future custom | Any other Provider/model named by the task owner | Owner-named alias only | Blocked unless the future approval explicitly names Provider, model, alias, endpoint/config boundary, and redaction rules |

Default future execution caps to propose:

- call cap: `1`
- retry cap: `0`
- provider target count: `1`
- max prompt envelope: redacted synthetic or already-approved minimal prompt only
- max output tokens: `64`
- max spend cap: `USD 0.05` as a stop limit only, not Cost Calibration
- timeout cap: `30s`
- evidence fields: provider label, model label, pass/fail/blocked, call count, retry count, cap status, redaction status,
  stop condition, and forbidden-action checklist

## Allowed Files

- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/2026-06-27-layer-3-provider-smoke-local-dev-redacted-execution-approval-package.md`
- `docs/05-execution-logs/evidence/2026-06-27-layer-3-provider-smoke-local-dev-redacted-execution-approval-package.md`
- `docs/05-execution-logs/audits-reviews/2026-06-27-layer-3-provider-smoke-local-dev-redacted-execution-approval-package.md`
- `docs/05-execution-logs/acceptance/2026-06-27-layer-3-provider-smoke-local-dev-redacted-execution-approval-package.md`

## Blocked Scope

- source, tests, e2e, schema, migration, seed, package, lockfile, script, archive/index, private local files
- browser/dev-server/e2e
- DB connection/read/write
- `.env*`, secret, token, Provider credential, DB URL, or credential value read/output/copy
- Provider call, Provider retry, Provider payload inspection, Provider configuration execution
- Cost Calibration execution or pricing/quota/default point decisions
- real runtime mutation, formal publish, student-visible runtime
- staging/prod/deploy/payment/external service/OCR/export
- PR, force push, release readiness, production readiness, final Pass

## Validation Commands

- `npx.cmd prettier --write --ignore-unknown <changed docs/state files>`
- `npx.cmd prettier --check --ignore-unknown <changed docs/state files>`
- `git diff --check`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Get-TikuProjectStatus.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId layer-3-provider-smoke-local-dev-redacted-execution-approval-package-2026-06-27`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId layer-3-provider-smoke-local-dev-redacted-execution-approval-package-2026-06-27`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId layer-3-provider-smoke-local-dev-redacted-execution-approval-package-2026-06-27 -SkipRemoteAheadCheck`

## Stop Conditions

Stop before any Provider execution, `.env*` or credential read, Provider configuration use/change, Cost Calibration,
browser/dev-server/e2e, DB access, runtime mutation, formal publish, student-visible runtime, staging/prod/deploy,
payment/external service, OCR/export, archive/index movement, PR, force push, release readiness, or final Pass claim.
