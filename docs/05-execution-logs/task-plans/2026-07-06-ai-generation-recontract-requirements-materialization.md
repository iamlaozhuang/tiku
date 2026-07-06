# 2026-07-06 AI Generation Recontract Requirements Materialization Plan

## Task

- Task id: `ai-generation-recontract-requirements-materialization-2026-07-06`
- Branch: `codex/ai-generation-recontract-requirements-materialization-2026-07-06`
- Request: materialize the product-owner discussion decisions for AI出题 / AI组卷, then run three self-check rounds.

## Scope

Docs-only requirement materialization:

- create a traceability overlay that records the new AI出题 / AI组卷 product contract;
- update requirement reading entrypoints so future tasks read the new overlay;
- record redacted evidence and adversarial audit;
- update project state and task queue for Module Run v2 governance.

## Non-Scope

This task does not:

- change product source code or tests;
- run browser or localhost acceptance;
- run DB-backed runtime probes;
- run Provider calls or Provider configuration changes;
- change prompts;
- change schema, migration, seed, package, or lockfile files;
- read or write env/secret values;
- execute staging/prod/deploy;
- execute or claim Cost Calibration;
- claim release readiness, final Pass, or production usability.

## Required Reading Completed

- `AGENTS.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/adr-001-tech-stack-selection.md`
- `docs/02-architecture/adr/adr-002-runtime-architecture-and-multi-client-contract.md`
- `docs/02-architecture/adr/adr-003-workplace-desktop-web-compatibility.md`
- `docs/02-architecture/adr/adr-004-environment-isolation-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-005-staging-architecture-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-006-runtime-dependency-alignment.md`
- `docs/02-architecture/adr/adr-007-edition-aware-authorization-source-of-truth.md`
- `docs/01-requirements/00-index.md`
- `docs/01-requirements/advanced-edition/00-index.md`
- `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`
- `docs/01-requirements/advanced-edition/modules/02-ai-task-domain.md`
- `docs/01-requirements/advanced-edition/modules/03-personal-ai-generation.md`
- `docs/01-requirements/advanced-edition/modules/04-organization-training.md`
- `docs/01-requirements/advanced-edition/modules/08-organization-ai-generation.md`
- `docs/01-requirements/advanced-edition/stories/epic-01-personal-ai-generation.md`
- `docs/01-requirements/advanced-edition/stories/epic-05-formal-content-separation.md`
- `docs/01-requirements/advanced-edition/stories/epic-07-organization-ai-generation.md`
- `docs/01-requirements/modules/02-question-paper.md`
- `docs/01-requirements/modules/03-student-experience.md`
- `docs/01-requirements/modules/05-rag-knowledge.md`
- `docs/01-requirements/traceability/2026-06-23-advanced-ai-generation-scope-clarification.md`
- `docs/01-requirements/traceability/2026-07-02-ai-generation-requirements-ssot-alignment.md`
- `docs/01-requirements/traceability/2026-07-02-phase4-requirements-agent-baseline-alignment.md`
- `docs/01-requirements/traceability/2026-07-05-ai-generation-closed-loop-target-alignment.md`
- `docs/01-requirements/traceability/2026-07-02-ui-ux-requirement-design-baseline-gap-analysis.md`
- `docs/01-requirements/traceability/2026-07-02-role-auth-training-ops-decision-package.md`
- `docs/01-requirements/traceability/2026-07-02-current-thread-requirement-reconciliation-ledger.md`
- latest 2026-07-06 AI generation runtime, personal standard fixture, organization/content loop, Provider, residual, and queue evidence files.

## Materialized Decision Summary

- AI出题 means AI-generated complete question draft content.
- AI组卷 means AI-generated assembly plan plus local selection from allowed formal question sources.
- Platform formal source is `question.status = available`.
- Enterprise question bank v1 is same-organization published and not taken-down enterprise training question snapshots.
- AI-generated drafts are excluded from AI组卷 sources unless later governed flows make them eligible formal sources.
- AI出题 quantity: default 3, max 10.
- AI组卷 quantity: default 30, max 80.
- AI组卷 source insufficiency allows explainable degradation but not AI-invented replacement questions.
- UI must be all Chinese and user-facing, not technical implementation wording.
- Learner/employee AI训练 uses tabs for `AI出题` / `AI组卷`; tab switching must not submit.
- Organization advanced admin uses an enterprise AI training content workbench.
- Content admin AI组卷 directly creates a reviewable paper draft container through governed content flow.

## Files To Change

- `docs/01-requirements/traceability/2026-07-06-ai-generation-recontract-requirements-materialization.md`
- `docs/01-requirements/00-index.md`
- `docs/01-requirements/advanced-edition/00-index.md`
- `docs/01-requirements/traceability/2026-07-05-ai-generation-closed-loop-target-alignment.md`
- `docs/05-execution-logs/task-plans/2026-07-06-ai-generation-recontract-requirements-materialization.md`
- `docs/05-execution-logs/evidence/2026-07-06-ai-generation-recontract-requirements-materialization.md`
- `docs/05-execution-logs/audits-reviews/2026-07-06-ai-generation-recontract-requirements-materialization.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`

## Three-Round Self-Check Plan

Round 1: requirement completeness.

- Verify every product-owner decision is present.
- Verify role contracts include personal learner, organization employee, organization admin, and content admin.
- Verify default/max quantities, source definitions, degradation, knowledge coverage, and paper containers are present.

Round 2: contradiction and supersession.

- Verify the new AI组卷 meaning does not silently claim old runtime evidence as new implementation success.
- Verify standard roles remain denied.
- Verify no release, production, staging, Provider, or Cost Calibration claim appears.

Round 3: implementation-readiness and redaction.

- Verify follow-up tasks are split and not bundled.
- Verify UI wording requirements are Chinese/user-facing.
- Verify evidence/audit contain no secrets, raw DB rows, Provider payload, prompt, raw AI output, full content, private fixture values, or screenshots.

## Validation Commands

- `npm.cmd exec -- prettier --write --ignore-unknown <scoped changed docs>`
- `npm.cmd exec -- prettier --check --ignore-unknown <scoped changed docs>`
- `git diff --check`
- blocked-path diff guard for source/test/schema/dependency/env/runtime artifacts
- `npm.cmd run typecheck`
- `npm.cmd run lint`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId ai-generation-recontract-requirements-materialization-2026-07-06`

## Closeout Boundary

- Local commit: approved by current user request to execute this task.
- Merge to `master`: not executed in this task without fresh approval.
- Push: not executed in this task without fresh approval.
- Branch cleanup: not executed before merge/push approval.
