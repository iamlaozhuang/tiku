# Standard Advanced Edition Experience Optimization Planning

Task id: `standard-advanced-edition-experience-optimization-planning-2026-06-27`

Branch: `codex/standard-advanced-experience-planning-20260627`

Task kind: `docs_state_planning`

## Goal

Create a docs/state-only planning package for standard and advanced edition capability, UX/detail gaps, risk tiers, follow-up task decomposition, and copyable approval text.

This task does not modify source, tests, schema, migration, seed, package or lockfiles, `.env*`, Provider configuration, Cost Calibration, staging/prod, payment, OCR/export, browser runtime, dev server, e2e, PR, force push, release readiness, or final Pass state.

## Documents Read

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/adr-001-tech-stack-selection.md`
- `docs/02-architecture/adr/adr-002-runtime-architecture-and-multi-client-contract.md`
- `docs/02-architecture/adr/adr-003-workplace-desktop-web-compatibility.md`
- `docs/02-architecture/adr/adr-004-environment-isolation-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-005-staging-architecture-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-006-runtime-dependency-alignment.md`
- `docs/02-architecture/adr/adr-007-edition-aware-authorization-source-of-truth.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/04-agent-system/sop/task-lifecycle-governance.md`
- `docs/04-agent-system/sop/module-lifecycle-governance.md`
- `docs/04-agent-system/sop/local-first-validation-governance.md`
- `docs/04-agent-system/sop/requirement-ssot-reading-governance.md`
- `docs/04-agent-system/sop/docs-only-fast-lane-governance.md`
- `docs/04-agent-system/sop/dependency-introduction-gate.md`
- `docs/04-agent-system/sop/advanced-edition-implementation-boundary-checklist.md`
- `docs/04-agent-system/sop/advanced-edition-cost-calibration-blocked-gate.md`
- `docs/04-agent-system/sop/advanced-edition-evidence-redaction-template.md`
- `docs/04-agent-system/sop/advanced-edition-requirements-reading-surface-maintenance.md`
- `docs/04-agent-system/sop/repository-hygiene-closeout-checklist.md`

## SSOT Read List

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
- `docs/01-requirements/advanced-edition/modules/07-retention-log-governance.md`
- `docs/01-requirements/advanced-edition/modules/08-organization-ai-generation.md`
- `docs/01-requirements/traceability/unified-standard-advanced-source-index.md`
- `docs/01-requirements/traceability/capability-catalog.md`
- `docs/01-requirements/traceability/unified-edition-delta-matrix.md`
- `docs/01-requirements/traceability/role-experience-fulfillment-matrix.md`
- `docs/01-requirements/traceability/requirement-fulfillment-matrix.md`
- `docs/01-requirements/traceability/edition-aware-authorization-acceptance-matrix.md`
- `docs/01-requirements/traceability/2026-06-21-org-auth-scope-product-decision.md`
- `docs/01-requirements/traceability/2026-06-23-advanced-ai-generation-scope-clarification.md`
- `docs/01-requirements/traceability/2026-06-24-role-separated-mvp-requirement-alignment.md`
- `docs/01-requirements/use-cases/use-case-catalog.md`

## Requirement Decision Map

- Standard MVP remains the baseline for account/session, personal and platform-managed organization authorization, formal `question` and `paper`, `practice`, `mock_exam`, `exam_report`, `mistake_book`, AI scoring/explanation/hint, RAG knowledge, and platform admin operations.
- Advanced edition adds `effectiveEdition`, `auth_upgrade`, advanced learner AI generation, organization training, organization analytics, organization/admin AI generation, advanced operations authorization/quota governance, and retention/log governance.
- `effectiveEdition` is service-computed from source authorization and upgrade facts. UI state and menu visibility are not authorization boundaries.
- Standard AI question generation and AI `paper` generation remain standard MVP non-goals. Advanced generation is allowed only as advanced extension scope and remains Provider/cost/formal-adoption gated.
- Organization self-service is excluded from standard MVP but required for advanced organization admin workspace scope.
- Content and organization AI generation surfaces may prove discoverable local contract entries, but product-complete generation loops require request APIs, task lifecycle, Provider/cost decisions, and formal adoption governance.
- Cost Calibration Gate remains blocked pending fresh explicit approval.

## Requirement Mapping

This task maps the planning output to these requirement groups:

- Standard capability matrix: `CAP-STD-*` and `UC-STD-*` rows from capability and use-case catalogs.
- Advanced capability matrix: `CAP-ADV-*`, role-separated `CAP-RS-*`, and `UC-ADV-*` rows.
- UX/detail issues: role matrix blockers, role-separated R1-R15 repair requirements, and current source/evidence gaps.
- Risk tiers: local docs/source-only, permission/authorization contract, browser validation, DB/schema/migration, Provider/cost, payment/external-service, staging/prod/deploy.

## Evidence-Only Sources

- `docs/05-execution-logs/acceptance/2026-06-26-ai-generation-scope-inventory-and-mvp-decision-package.md`
- `docs/05-execution-logs/acceptance/2026-06-26-mvp-final-pass-decision-criteria-package.md`
- `docs/05-execution-logs/acceptance/2026-06-26-mvp-final-pass-decision-review.md`
- `docs/05-execution-logs/audits-reviews/2026-06-26-role-separated-full-8-row-post-admin-ai-local-contract-loop-browser-rerun.md`
- `docs/05-execution-logs/audits-reviews/2026-06-26-role-separated-full-8-row-post-ops-visible-label-repair-browser-rerun.md`
- `docs/05-execution-logs/audits-reviews/2026-06-26-role-separated-full-8-row-post-visible-label-private-credential-browser-rerun.md`
- `docs/05-execution-logs/audits-reviews/2026-06-26-provider-cost-gate-closeout-review.md`
- `docs/05-execution-logs/acceptance/2026-06-27-staging-infrastructure-readiness-planning.md`
- `docs/05-execution-logs/acceptance/2026-06-27-archive-staging-infrastructure-readiness-planning.md`

These files are used as historical execution and blocker evidence only. They do not create new requirements and do not authorize runtime work in this task.

## Conflict Check

- No requirement conflict is resolved by this task.
- Existing conflict boundaries remain active:
  - Standard MVP excludes AI generation while advanced edition includes gated AI generation.
  - Standard MVP keeps organization authorization platform-managed while advanced edition needs organization admin workspace and training.
  - Formal content remains separate from generated/training content unless a later governed adoption path is approved.
  - Provider and quota requirements exist, but Provider execution and Cost Calibration are separately gated.
- Historical local browser evidence can inform planning, but it must not be used to claim release readiness, Provider readiness, staging readiness, or final Pass in this task.

## Allowed Files

- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/01-requirements/**`
- `docs/05-execution-logs/task-plans/**`
- `docs/05-execution-logs/evidence/**`
- `docs/05-execution-logs/audits-reviews/**`
- `docs/05-execution-logs/acceptance/**`

## Blocked Files And Actions

- `src/**`
- `tests/**`
- `e2e/**`
- `schema/**`, `drizzle/**`, migrations, seed files
- `package.json`, lockfiles
- `.env*`
- Browser, dev-server, Playwright/e2e runtime
- DB connection or mutation
- Provider call or Provider configuration
- Cost Calibration
- staging/prod/deploy/payment/OCR/export/external-service work
- PR, force push, release readiness, final Pass

## Documentation Approach

1. Create this task plan first.
2. Register and close the docs/state planning task in `task-queue.yaml`.
3. Update `project-state.yaml` current task and planning summary without disturbing existing blocked tasks.
4. Create evidence, audit review, and acceptance files with:
   - capability matrix summary;
   - UX/detail issue inventory;
   - risk classification;
   - follow-up queue split from low to high risk;
   - copyable future approval text;
   - explicit forbidden-action checklist.
5. Preserve the residual archive candidate and staging blockers as out of scope.

## Validation Commands

- `npx.cmd prettier --write --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-06-27-standard-advanced-edition-experience-optimization-planning.md docs/05-execution-logs/evidence/2026-06-27-standard-advanced-edition-experience-optimization-planning.md docs/05-execution-logs/audits-reviews/2026-06-27-standard-advanced-edition-experience-optimization-planning.md docs/05-execution-logs/acceptance/2026-06-27-standard-advanced-edition-experience-optimization-planning.md`
- `npx.cmd prettier --check --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-06-27-standard-advanced-edition-experience-optimization-planning.md docs/05-execution-logs/evidence/2026-06-27-standard-advanced-edition-experience-optimization-planning.md docs/05-execution-logs/audits-reviews/2026-06-27-standard-advanced-edition-experience-optimization-planning.md docs/05-execution-logs/acceptance/2026-06-27-standard-advanced-edition-experience-optimization-planning.md`
- `git diff --check`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Get-TikuProjectStatus.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId standard-advanced-edition-experience-optimization-planning-2026-06-27`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId standard-advanced-edition-experience-optimization-planning-2026-06-27`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId standard-advanced-edition-experience-optimization-planning-2026-06-27 -SkipRemoteAheadCheck`

## Stop Conditions

- Any source/test/schema/migration/package/env file would need modification.
- A useful next step requires browser, dev-server, e2e, DB, Provider, Cost Calibration, staging/prod, deploy, payment, OCR/export, or external-service work.
- Evidence would need sensitive data, credentials, tokens, raw prompts, provider payloads, raw generated content, raw DB rows, plaintext `redeem_code`, screenshots, or traces.
- Queue or project state would need to claim release readiness or final Pass.
- Validation reports a hard blocker that cannot be fixed inside docs/state-only scope.
