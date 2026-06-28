# Local Full Loop Gap Reseed After UI Action Smoke Task Plan

## Task

- Task id: `local-full-loop-gap-reseed-after-ui-action-smoke-2026-06-28`
- Branch: `codex/local-full-loop-gap-reseed-20260628`
- Task kind: `docs_requirement_alignment`
- Approval: current user approved executing the recommended next local full-loop gap reseed task, including local commit, fast-forward merge to `master`, push to `origin/master`, and merged short-branch cleanup after validation.

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
- `docs/04-agent-system/sop/task-lifecycle-governance.md`
- `docs/04-agent-system/sop/module-lifecycle-governance.md`
- `docs/04-agent-system/sop/local-first-validation-governance.md`
- `docs/04-agent-system/sop/requirement-ssot-reading-governance.md`
- `docs/04-agent-system/sop/dependency-introduction-gate.md`
- `docs/04-agent-system/sop/advanced-edition-cost-calibration-blocked-gate.md`
- `docs/04-agent-system/sop/advanced-edition-evidence-redaction-template.md`
- `docs/04-agent-system/sop/advanced-edition-implementation-boundary-checklist.md`
- `docs/04-agent-system/sop/docs-only-fast-lane-governance.md`
- `docs/04-agent-system/sop/fresh-local-dev-db-validation-playbook.md`
- `docs/04-agent-system/sop/local-experience-closure-governance.md`
- `docs/04-agent-system/sop/task-queue-archival-and-index-governance.md`
- `docs/04-agent-system/sop/active-queue-slimming-plan.md`
- `docs/01-requirements/00-index.md`
- `docs/01-requirements/modules/01-user-auth.md`
- `docs/01-requirements/modules/02-question-paper.md`
- `docs/01-requirements/modules/03-student-experience.md`
- `docs/01-requirements/modules/04-ai-scoring.md`
- `docs/01-requirements/modules/05-rag-knowledge.md`
- `docs/01-requirements/modules/06-admin-ops.md`
- `docs/01-requirements/advanced-edition/00-index.md`
- `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`
- `docs/01-requirements/advanced-edition/modules/01-authorization-context.md`
- `docs/01-requirements/advanced-edition/modules/02-ai-task-domain.md`
- `docs/01-requirements/advanced-edition/modules/03-personal-ai-generation.md`
- `docs/01-requirements/advanced-edition/modules/04-organization-training.md`
- `docs/01-requirements/advanced-edition/modules/05-organization-analytics.md`
- `docs/01-requirements/advanced-edition/modules/06-ops-authorization-quota.md`
- `docs/01-requirements/advanced-edition/modules/08-organization-ai-generation.md`
- `docs/01-requirements/advanced-edition/stories/epic-01-personal-ai-generation.md`
- `docs/01-requirements/advanced-edition/stories/epic-02-organization-training.md`
- `docs/01-requirements/advanced-edition/stories/epic-03-employee-answer-statistics.md`
- `docs/01-requirements/advanced-edition/stories/epic-04-ops-authorization-quota-governance.md`
- `docs/01-requirements/advanced-edition/stories/epic-05-formal-content-separation.md`
- `docs/01-requirements/advanced-edition/stories/epic-07-organization-ai-generation.md`

## Requirement Decision Map

- `docs/01-requirements/traceability/2026-06-23-advanced-ai-generation-scope-clarification.md`: AI question and AI `paper` generation must be discoverable, owned by the proper domain, and must not directly write formal `question` or `paper`.
- `docs/01-requirements/traceability/2026-06-24-role-separated-mvp-requirement-alignment.md`: role-separated runtime remains blocked until all role allow/deny paths pass; standard users/admins must not receive advanced-only AI/training capability.
- `docs/01-requirements/traceability/role-experience-fulfillment-matrix.md`: advanced AI, organization training, and ops authorization rows remain release-blocked without fresh local/runtime evidence and high-risk gate approvals.
- `docs/01-requirements/traceability/2026-06-21-org-auth-scope-product-decision.md`: `org_auth` remains bundle-oriented; atomic scope implementation remains separately gated.
- `docs/02-architecture/adr/adr-006-runtime-dependency-alignment.md`: installed AI SDK packages do not by themselves approve Provider calls or env/secret work.
- `docs/02-architecture/adr/adr-007-edition-aware-authorization-source-of-truth.md`: `effectiveEdition` is service-computed; UI visibility is not an authorization boundary.

## Requirement Mapping

This task maps the completed local UI action-loop smoke evidence into the next approval-required local tasks:

| Future work                             | Requirement source                                                                                        | Queue decision                                                                                                                                |
| --------------------------------------- | --------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| Real local Provider AI experience smoke | AI scoring, RAG, personal AI generation, organization AI generation, content AI draft/review requirements | Seeded as blocked until fresh approval because it may execute real Provider calls and must not read `.env*` or record prompts/payload/output. |
| Local full-loop post-provider rollup    | Local-first validation, role-separated alignment, advanced edition evidence redaction                     | Seeded as blocked until Provider smoke evidence exists, so it cannot claim closure from the current local-contract/browser-only evidence.     |

## Evidence-Only Sources

- `docs/05-execution-logs/evidence/2026-06-28-local-full-loop-acceleration-planning-state-queue.md`
- `docs/05-execution-logs/evidence/2026-06-28-local-full-loop-baseline-accounts-auth-db.md`
- `docs/05-execution-logs/evidence/2026-06-28-local-full-loop-knowledge-rag-maintenance-smoke.md`
- `docs/05-execution-logs/evidence/2026-06-28-local-full-loop-ai-generation-paper-provider-smoke.md`
- `docs/05-execution-logs/evidence/2026-06-28-local-full-loop-student-answer-ai-explanation-smoke.md`
- `docs/05-execution-logs/evidence/2026-06-28-local-full-loop-organization-training-analytics-ai-generation-role-flow.md`
- `docs/05-execution-logs/evidence/2026-06-28-local-full-loop-rollup-evidence.md`
- `docs/05-execution-logs/evidence/2026-06-28-local-role-browser-acceptance-hardening.md`
- `docs/05-execution-logs/evidence/2026-06-28-local-ui-action-loop-browser-smoke.md`

## Conflict Check

- Requirements require discoverable AI/training/account flows, and the latest browser evidence proves local UI action loops for six roles.
- The prior Provider smoke task did not execute a real Provider call because current-process credentials were not available; this remains an evidence gap, not a release blocker that can be bypassed.
- Cost Calibration, quota defaults, pricing, release readiness, staging/prod, payment, OCR/export, and external service remain blocked.
- No requirement source requires this reseed task to change product source, test, schema, migration, package, lockfile, `.env*`, or runtime data.

## Scope

Allowed changes:

- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/01-requirements/traceability/2026-06-28-local-full-loop-gap-reseed-after-ui-action-smoke.md`
- `docs/05-execution-logs/task-plans/2026-06-28-local-full-loop-gap-reseed-after-ui-action-smoke.md`
- `docs/05-execution-logs/evidence/2026-06-28-local-full-loop-gap-reseed-after-ui-action-smoke.md`
- `docs/05-execution-logs/audits-reviews/2026-06-28-local-full-loop-gap-reseed-after-ui-action-smoke.md`
- `docs/05-execution-logs/acceptance/2026-06-28-local-full-loop-gap-reseed-after-ui-action-smoke.md`

Blocked changes and actions:

- product source, tests, e2e specs, scripts, schema, migrations, package/lockfile, `.env*`, seed data, DB runtime, Provider execution, browser runtime, dev server, staging/prod/deploy, payment, OCR/export, external service, PR, force push, release readiness, final Pass, pricing, quota defaults, and Cost Calibration.

## Documentation Approach

1. Record this reseed task in state and queue as a closed docs/state task.
2. Add a traceability file linking UI action smoke to the next local Provider smoke approval boundary.
3. Seed blocked successor tasks with copyable fresh-approval text for the next execution step.
4. Record evidence and audit review with redacted metadata only.

## Validation Commands

- `npx.cmd prettier --write --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/01-requirements/traceability/2026-06-28-local-full-loop-gap-reseed-after-ui-action-smoke.md docs/05-execution-logs/task-plans/2026-06-28-local-full-loop-gap-reseed-after-ui-action-smoke.md docs/05-execution-logs/evidence/2026-06-28-local-full-loop-gap-reseed-after-ui-action-smoke.md docs/05-execution-logs/audits-reviews/2026-06-28-local-full-loop-gap-reseed-after-ui-action-smoke.md docs/05-execution-logs/acceptance/2026-06-28-local-full-loop-gap-reseed-after-ui-action-smoke.md`
- `npx.cmd prettier --check --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/01-requirements/traceability/2026-06-28-local-full-loop-gap-reseed-after-ui-action-smoke.md docs/05-execution-logs/task-plans/2026-06-28-local-full-loop-gap-reseed-after-ui-action-smoke.md docs/05-execution-logs/evidence/2026-06-28-local-full-loop-gap-reseed-after-ui-action-smoke.md docs/05-execution-logs/audits-reviews/2026-06-28-local-full-loop-gap-reseed-after-ui-action-smoke.md docs/05-execution-logs/acceptance/2026-06-28-local-full-loop-gap-reseed-after-ui-action-smoke.md`
- `git diff --check`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Get-TikuProjectStatus.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId local-full-loop-gap-reseed-after-ui-action-smoke-2026-06-28`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId local-full-loop-gap-reseed-after-ui-action-smoke-2026-06-28 -SkipRemoteAheadCheck`

## Stop Conditions

Stop if the next edit requires Provider execution, `.env*` read/edit, package/lockfile, schema/migration, DB mutation, browser/dev-server/e2e runtime, staging/prod/deploy, payment, OCR/export, external service, PR, force push, release readiness, final Pass, pricing/quota defaults, or Cost Calibration.
