# Task Plan: Admin AI Generation Route DB Adapter Integration TDD

Task id: `admin-ai-generation-route-db-adapter-integration-tdd-2026-06-26`

Branch: `codex/admin-ai-route-db-adapter-integration-tdd-20260626`

Task kind: `implementation_tdd`

## SSOT Read List

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/04-agent-system/operating-manual.md`
- `docs/04-agent-system/sop/requirement-ssot-reading-governance.md`
- `docs/04-agent-system/sop/task-lifecycle-governance.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/01-requirements/00-index.md`
- `docs/01-requirements/advanced-edition/00-index.md`
- `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`
- `docs/01-requirements/advanced-edition/modules/02-ai-task-domain.md`
- `docs/01-requirements/advanced-edition/modules/08-organization-ai-generation.md`
- `docs/01-requirements/advanced-edition/stories/epic-05-formal-content-separation.md`
- `docs/01-requirements/advanced-edition/stories/epic-07-organization-ai-generation.md`
- `docs/01-requirements/traceability/2026-06-21-content-admin-ai-generation-scope-decision.md`
- `docs/01-requirements/traceability/2026-06-23-advanced-ai-generation-scope-clarification.md`
- `docs/01-requirements/traceability/2026-06-24-role-separated-mvp-requirement-alignment.md`
- `docs/01-requirements/traceability/role-experience-fulfillment-matrix.md`

## Requirement Decision Map

- ADR-002 keeps route handlers thin over services and repositories.
- ADR-004/ADR-005 keep staging/prod, env/secret, deployment, and migration execution separate.
- ADR-006 treats installed AI SDK packages as dependency availability only, not Provider approval.
- ADR-007 requires service-computed `effectiveEdition`; UI visibility is not an authorization boundary.
- 2026-06-23 advanced AI scope requires content and organization admin AI question/AI `paper` generation entries, with
  generated content separated from formal `question`/`paper`.
- 2026-06-24 role-separated alignment requires `content_admin` and `org_advanced_admin` access while keeping standard
  organization admin denied.

## Requirement Mapping

- AI task domain: accepted admin local-contract requests must create or reuse a trackable task persistence summary.
- Content admin: successful content admin AI question/AI `paper` requests are platform-owned review-domain tasks.
- Organization admin: successful organization advanced admin AI question/AI `paper` requests are organization-owned
  tasks.
- Formal content separation: successful route integration must keep Provider blocked and formal `question`/`paper` write
  statuses blocked.
- Standard role denial: denied organization standard admin requests must not call persistence.

## Evidence-Only Sources

- `docs/05-execution-logs/evidence/2026-06-26-admin-ai-generation-task-persistence-db-schema-and-adapter-tdd.md`
- `docs/05-execution-logs/audits-reviews/2026-06-26-admin-ai-generation-task-persistence-db-schema-and-adapter-tdd.md`
- `docs/05-execution-logs/acceptance/2026-06-26-admin-ai-generation-task-persistence-route-integration-plan-or-db-adapter-decision.md`
- `docs/05-execution-logs/acceptance/2026-06-26-admin-ai-generation-task-persistence-db-schema-mapping-approval-package.md`

These files are read as history and approval evidence only. Requirement scope remains sourced from `docs/01-requirements/`
and ADRs.

## Conflict Check

No requirement conflict found. The prior DB schema/adapter TDD task explicitly left route integration as the next
separate step. The current user request approves route DB adapter integration TDD only. It does not approve local DB
migration execution, live DB connection validation, Provider/Cost, raw generated result storage, formal `question` or
`paper` writes, staging/prod, payment, external services, deployment, release readiness, or final Pass.

## Scope

Allowed:

- wire content and organization admin local-contract route success path to the admin AI generation task persistence port;
- use the existing Postgres DB adapter as the default production route persistence adapter;
- keep tests on fake/injected persistence adapters so no live DB connection or migration execution occurs;
- expose only a redacted task persistence summary in the local-contract response;
- update task plan, evidence, audit review, project-state, and task-queue.

Blocked:

- local DB migration execution or `drizzle-kit push`;
- schema, migration, Drizzle snapshot, seed, destructive DB, account mutation;
- env/secret/credential reads or writes;
- Provider call, Provider configuration, Provider payload, prompt, raw output, or Cost Calibration;
- formal `question`/`paper` writes, adoption, publish, or student-visible content;
- browser/e2e/dev-server runtime, staging/prod, payment, external service, deployment, PR, force push, or final Pass.

## Implementation Plan

1. RED: extend `admin-ai-generation-local-contract-route.test.ts` so successful content/org admin POSTs must call an
   injected task persistence repository and return a redacted `taskPersistence` summary.
2. RED: assert denied/invalid requests do not call persistence.
3. GREEN: add a local-contract task persistence summary DTO.
4. GREEN: add route options for injected persistence repository, request public id creation, and request clock.
5. GREEN: default successful production route handlers to `createPostgresAdminAiGenerationTaskPersistenceRepository`.
6. GREEN: keep Provider bridge and formal content boundaries unchanged and blocked.

## Risk Defenses

- No default handler test will execute a live DB connection; unit tests inject fake persistence.
- The default DB adapter is lazy and only reads local env when a real request reaches the persistence call.
- Route response exposes public ids and safe statuses only; no internal numeric ids or raw AI fields.
- Persistence is invoked only after session, input, and role checks pass.
- If persistence throws, the existing route error envelope returns the standard error response.

## Validation Plan

- RED: `npm.cmd run test:unit -- src/server/services/admin-ai-generation-local-contract-route.test.ts`
- GREEN:
  `npm.cmd run test:unit -- src/server/services/admin-ai-generation-local-contract-route.test.ts src/server/repositories/admin-ai-generation-task-persistence-repository.test.ts src/server/repositories/admin-ai-generation-task-persistence-db-adapter.test.ts`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- scoped Prettier write/check for changed docs/source files
- `git diff --check`
- Module Run v2 pre-commit hardening
- Module Run v2 pre-push readiness

Cost Calibration Gate remains blocked.
