# Admin AI generation formal draft adapter route integration approval package task plan

Task id: `admin-ai-generation-formal-draft-adapter-route-integration-approval-package-2026-06-26`

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
- `docs/01-requirements/modules/02-question-paper.md`
- `docs/01-requirements/advanced-edition/00-index.md`
- `docs/01-requirements/advanced-edition/modules/02-ai-task-domain.md`
- `docs/01-requirements/advanced-edition/modules/08-organization-ai-generation.md`
- `docs/01-requirements/advanced-edition/stories/epic-05-formal-content-separation.md`
- `docs/01-requirements/traceability/2026-06-23-advanced-ai-generation-scope-clarification.md`
- `docs/01-requirements/use-cases/use-case-catalog.md`

## Requirement Decision Map

- `UC-ADV-CONTENT-ADMIN-AI-GENERATION`: content admin AI generation can produce reviewable drafts, but formal adoption requires governed review.
- `UC-ADV-FORMAL-CONTENT-SEPARATION`: generated content remains isolated until approved formal `question` or `paper` adoption.
- `DEC-2026-06-23-AI-SCOPE`: content admin adoption must include review, validation, attribution, and audit; direct publish or direct formal write without adoption remains forbidden.
- ADR-002: route handlers stay thin; business rules live in services and repositories.
- ADR-004/ADR-005: this package stays local/dev-only and does not approve staging/prod, deployment, release readiness, or cloud resources.
- ADR-006: installed AI SDK packages do not authorize Provider use.

## Requirement Mapping

This docs/state approval package maps the already implemented adoption metadata route and formal draft adapter into a
future route integration plan. It approves a narrow successor implementation task to connect content admin formal adoption
to existing formal draft writer ports and a later local route smoke task to prove at most two local content adoption
requests create formal drafts.

## Evidence-Only Sources

- `docs/05-execution-logs/evidence/2026-06-26-admin-ai-generation-formal-adoption-route-integration-tdd.md`
- `docs/05-execution-logs/audits-reviews/2026-06-26-admin-ai-generation-formal-adoption-route-integration-tdd.md`
- `docs/05-execution-logs/evidence/2026-06-26-admin-ai-generation-formal-adoption-local-route-smoke-execution.md`
- `docs/05-execution-logs/audits-reviews/2026-06-26-admin-ai-generation-formal-adoption-local-route-smoke-execution.md`
- `docs/05-execution-logs/evidence/2026-06-26-admin-ai-generation-formal-draft-adapter-contract-tdd.md`
- `docs/05-execution-logs/audits-reviews/2026-06-26-admin-ai-generation-formal-draft-adapter-contract-tdd.md`

## Conflict Check

No requirement conflict was found. The SSOT allows content admin formal adoption only through governed review and draft
creation. This task does not approve organization-scoped adoption, Provider/Cost work, staging/prod, release readiness,
or direct publish.

## Scope

Allowed files:

- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/2026-06-26-admin-ai-generation-formal-draft-adapter-route-integration-approval-package.md`
- `docs/05-execution-logs/acceptance/2026-06-26-admin-ai-generation-formal-draft-adapter-route-integration-approval-package.md`
- `docs/05-execution-logs/evidence/2026-06-26-admin-ai-generation-formal-draft-adapter-route-integration-approval-package.md`
- `docs/05-execution-logs/audits-reviews/2026-06-26-admin-ai-generation-formal-draft-adapter-route-integration-approval-package.md`

Blocked in this task:

- source or test changes;
- schema, migration, drizzle generate, or local migration execution;
- live DB connection, route smoke, seed, fixture, or data mutation;
- real Provider call, Provider credential read, Provider configuration, or Cost Calibration;
- staging/prod/cloud/deploy, payment, external service, release readiness, final Pass, PR, or force push.

## Approval Package Approach

1. Record the successor implementation task boundary for route integration and adoption metadata update TDD.
2. Record the later local DB route smoke boundary after implementation passes.
3. Keep evidence redacted and summary-only.
4. Update task queue and project state so the next executable task can be selected without chat memory.

## Validation Commands

- `npx.cmd prettier --write --ignore-unknown <changed docs/state files>`
- `npx.cmd prettier --check --ignore-unknown <changed docs/state files>`
- `git diff --check`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId admin-ai-generation-formal-draft-adapter-route-integration-approval-package-2026-06-26`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId admin-ai-generation-formal-draft-adapter-route-integration-approval-package-2026-06-26 -SkipRemoteAheadCheck`

## Stop Conditions

- Any source, test, schema, migration, env, provider, DB, e2e, deployment, payment, or external-service change becomes necessary.
- The approval package would need to expose raw generated content, prompt, provider payload, secret, DB URL, token, cookie,
  Authorization header, full formal `question`/`paper` content, or raw DB rows.
- The route integration boundary cannot preserve governed review and draft-only adoption.
