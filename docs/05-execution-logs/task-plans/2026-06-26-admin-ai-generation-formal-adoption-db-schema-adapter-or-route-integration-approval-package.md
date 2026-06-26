# Admin AI generation formal adoption DB/schema adapter or route integration approval package

Task id: `admin-ai-generation-formal-adoption-db-schema-adapter-or-route-integration-approval-package-2026-06-26`

## Scope

- Branch: `codex/admin-ai-formal-adoption-db-route-approval-20260626`
- Task kind: docs/state approval package only.
- Approval source: current user message requesting this approval package.
- Allowed write surfaces:
  - `docs/05-execution-logs/task-plans/2026-06-26-admin-ai-generation-formal-adoption-db-schema-adapter-or-route-integration-approval-package.md`
  - `docs/05-execution-logs/acceptance/2026-06-26-admin-ai-generation-formal-adoption-db-schema-adapter-or-route-integration-approval-package.md`
  - `docs/05-execution-logs/evidence/2026-06-26-admin-ai-generation-formal-adoption-db-schema-adapter-or-route-integration-approval-package.md`
  - `docs/05-execution-logs/audits-reviews/2026-06-26-admin-ai-generation-formal-adoption-db-schema-adapter-or-route-integration-approval-package.md`
  - `docs/04-agent-system/state/project-state.yaml`
  - `docs/04-agent-system/state/task-queue.yaml`
- Blocked write surfaces:
  - source code, tests, package or lockfile, env files
  - `src/db/schema/**`
  - `drizzle/**`
  - seed, migration execution, live DB connection, route smoke
  - Provider, credentials, staging/prod, payment, external service, deployment/release readiness

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
- `docs/01-requirements/advanced-edition/stories/epic-05-formal-content-separation.md`
- `docs/01-requirements/advanced-edition/modules/08-organization-ai-generation.md`
- `docs/01-requirements/traceability/2026-06-23-advanced-ai-generation-scope-clarification.md`
- `docs/05-execution-logs/acceptance/2026-06-26-formal-question-paper-adoption-approval-package.md`
- `docs/05-execution-logs/evidence/2026-06-26-admin-ai-generation-formal-adoption-contract-and-repository-tdd.md`
- `docs/05-execution-logs/audits-reviews/2026-06-26-admin-ai-generation-formal-adoption-contract-and-repository-tdd.md`
- `src/server/models/admin-ai-generation-formal-adoption.ts`
- `src/server/contracts/admin-ai-generation-formal-adoption-contract.ts`
- `src/server/repositories/admin-ai-generation-formal-adoption-repository.ts`
- `src/server/contracts/admin-ai-generation-result-persistence-contract.ts`
- `src/db/schema/ai-rag.ts`
- `src/server/services/admin-ai-generation-local-contract-route.ts`
- `src/server/repositories/question-repository.ts`
- `src/server/repositories/paper-draft-repository.ts`

## Requirement Decision Map

- Formal generated content must remain isolated from formal `question` and `paper` until governed review, validation, attribution, and audit are approved.
- Current admin generated-result storage is redacted summary/history storage, not a formal content source of truth.
- Existing formal adoption contract/repository TDD models a reviewed adoption plan and still returns `formalTargetWriteStatus: blocked_without_follow_up_task`.
- A schema/adapter decision is needed before any live adoption persistence, route integration, or formal draft write task.

## Requirement Mapping

- Formal content separation: preserve two-step adoption, no direct generated-result-to-formal write in this task.
- Architecture ADR: route must remain thin; DB logic belongs behind repository/adapter boundaries.
- Environment ADR: no staging/prod, cloud deploy, env/secret, or release readiness work.
- Drizzle ADR: any future DB change must use reviewed schema/migration flow; `drizzle-kit push` remains forbidden.

## Implementation Plan

1. Record a docs-only approval decision for the durable adoption landing zone.
2. Decide whether to add a companion table, extend `admin_ai_generation_result`, or create a new backend AI task table.
3. Decide whether formal `question`/`paper` draft adapter integration is allowed now or must remain a later task.
4. Define the allowed sequence for schema TDD, local migration execution, route integration, and smoke.
5. Update task queue and project state with blocked gates and next recommended task.
6. Validate docs/state formatting, diff hygiene, and Module Run v2 hardening gates.

## Evidence-Only Sources

- Prior execution logs are used as evidence of completed local contract/repository work only.
- No prior execution log is treated as a requirements source when it conflicts with requirements or ADR files.

## Conflict Check

- No conflict found between the user request, advanced-edition formal content separation requirements, and ADR boundaries.
- The only approved current task surface is docs/state approval packaging. Schema, migration, route, DB, Provider, and formal draft write execution remain blocked here.

## Validation Commands

- `npx.cmd prettier --check --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-06-26-admin-ai-generation-formal-adoption-db-schema-adapter-or-route-integration-approval-package.md docs/05-execution-logs/acceptance/2026-06-26-admin-ai-generation-formal-adoption-db-schema-adapter-or-route-integration-approval-package.md docs/05-execution-logs/evidence/2026-06-26-admin-ai-generation-formal-adoption-db-schema-adapter-or-route-integration-approval-package.md docs/05-execution-logs/audits-reviews/2026-06-26-admin-ai-generation-formal-adoption-db-schema-adapter-or-route-integration-approval-package.md`
- `git diff --check`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId admin-ai-generation-formal-adoption-db-schema-adapter-or-route-integration-approval-package-2026-06-26`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId admin-ai-generation-formal-adoption-db-schema-adapter-or-route-integration-approval-package-2026-06-26 -SkipRemoteAheadCheck`
