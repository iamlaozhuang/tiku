# Admin AI generation formal adoption route integration TDD task plan

Task id: `admin-ai-generation-formal-adoption-route-integration-tdd-2026-06-26`

Branch: `codex/admin-ai-formal-adoption-route-integration-tdd-20260626`

Task kind: `implementation_tdd`

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
- `docs/01-requirements/advanced-edition/stories/epic-05-formal-content-separation.md`
- `docs/01-requirements/advanced-edition/modules/08-organization-ai-generation.md`
- `docs/01-requirements/traceability/2026-06-23-advanced-ai-generation-scope-clarification.md`
- `docs/01-requirements/traceability/2026-06-24-role-separated-mvp-requirement-alignment.md`

## Requirement Decision Map

- Content admin AI generated content may become formal `question` or `paper` only through governed review,
  validation, reviewer attribution, source attribution, and `audit_log`.
- This task may connect the content admin review command to the existing adoption metadata repository.
- The formal `question`/`paper` draft adapter and draft-row write are still separate follow-up approvals.
- Organization-owned AI generation adoption remains out of this route and requires a separate organization-scoped task.
- Provider, env/secret, Cost Calibration, staging/prod, payment, deployment, and release readiness remain blocked.

## Requirement Mapping

- The route path is `/api/v1/content-ai-generation-results/{publicId}/formal-adoptions`, using kebab-case plural REST
  resources under ADR-002.
- The route handler stays thin: resolve session, validate transport input, call the service, and return `{ code,
message, data }`.
- Business logic belongs in `src/server/services/admin-ai-generation-formal-adoption-service.ts`.
- Input normalization belongs in `src/server/validators/admin-ai-generation-formal-adoption.ts`.
- Persistence stays behind the existing `AdminAiGenerationFormalAdoptionRepository` and Postgres adapter.
- Response data returns only adoption metadata and redacted source summary. It must not include raw generated content,
  prompt, output, Provider payload, API key, token, cookie, Authorization header, DB URL, or internal numeric ids.

## Evidence-Only Sources

- `docs/05-execution-logs/acceptance/2026-06-26-admin-ai-generation-formal-adoption-db-schema-adapter-or-route-integration-approval-package.md`
- `docs/05-execution-logs/evidence/2026-06-26-admin-ai-generation-formal-adoption-db-schema-and-adapter-tdd.md`
- `docs/05-execution-logs/evidence/2026-06-26-admin-ai-generation-formal-adoption-local-migration-execution.md`
- `docs/05-execution-logs/audits-reviews/2026-06-26-admin-ai-generation-formal-adoption-local-migration-execution.md`
- Existing personal formal adoption route/service/validator files, read only as implementation pattern.

## Conflict Check

No conflict was found. The latest requirement sources permit a governed adoption path for content admin AI generated
results, but they do not approve formal draft writes. The previous local migration execution made the companion table
available locally; this task still does not approve a live route smoke or direct DB execution.

## Allowed Scope

- Add focused RED/GREEN unit tests for the admin formal adoption runtime route.
- Add content-only formal adoption route file.
- Add admin formal adoption validator, service, and runtime route adapter.
- Update task queue, project state, task plan, evidence, and audit review.

## Blocked Scope

- Do not run route smoke or connect to live DB.
- Do not execute migration, generate migration files, or change schema.
- Do not write formal `question` or `paper` draft rows.
- Do not enable organization-scoped formal adoption.
- Do not call Provider, read Provider credentials, read or edit `.env*`, or record secret-bearing data.
- Do not change package or lockfiles.
- Do not touch staging/prod/cloud/deploy, payment, external service, Cost Calibration, release readiness, or final Pass.

## TDD Plan

1. Add `src/server/services/admin-ai-generation-formal-adoption-runtime.test.ts` with failing tests for:
   - content admin approval writes redacted adoption metadata and keeps formal target writes blocked;
   - missing admin session does not access the adoption repository;
   - organization admin role cannot use the content formal adoption route.
2. Run the focused test and record the expected RED failure.
3. Implement the smallest validator/service/runtime/route files needed to pass.
4. Re-run the focused test, then run lint, typecheck, scoped formatting checks, diff check, and Module Run v2 gates.

## Validation Commands

- `npm.cmd run test:unit -- src/server/services/admin-ai-generation-formal-adoption-runtime.test.ts`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `npx.cmd prettier --write --ignore-unknown <changed docs/state/source files>`
- `npx.cmd prettier --check --ignore-unknown <changed docs/state/source files>`
- `git diff --check`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId admin-ai-generation-formal-adoption-route-integration-tdd-2026-06-26`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId admin-ai-generation-formal-adoption-route-integration-tdd-2026-06-26 -SkipRemoteAheadCheck`

## Stop Conditions

- Any implementation requires live DB connection, route smoke, migration execution, or schema/migration edits.
- Any implementation requires formal `question`/`paper` draft write or adapter work.
- Any implementation requires Provider, env/secret, dependency, staging/prod, deploy, payment, external service, or Cost
  Calibration work.
