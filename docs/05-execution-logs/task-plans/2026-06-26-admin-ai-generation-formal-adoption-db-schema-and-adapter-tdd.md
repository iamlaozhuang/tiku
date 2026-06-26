# Admin AI generation formal adoption DB schema and adapter TDD task plan

Task id: `admin-ai-generation-formal-adoption-db-schema-and-adapter-tdd-2026-06-26`

Branch: `codex/admin-ai-formal-adoption-db-adapter-tdd-20260626`

Task kind: `implementation_tdd`

## SSOT Read List

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/adr-001-tech-stack-selection.md`
- `docs/02-architecture/adr/adr-002-runtime-architecture-and-multi-client-contract.md`
- `docs/02-architecture/adr/adr-004-environment-isolation-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-006-runtime-dependency-alignment.md`
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

## Requirement Decision Map

- Formal content separation requires generated AI content to remain outside formal `question` and `paper` records unless a governed adoption path exists.
- Content admin generated output may become formal content only through review, validation, attribution, and audit. Direct formal write remains forbidden.
- Organization-owned generated output remains separate from platform formal content and is not in this task scope.
- ADR-004 keeps migration execution local-dev only and separately approved; this task may add reviewed local schema/migration files but must not execute migration or connect to a live database.

## Requirement Mapping

- This task implements the approved persistence landing zone for the reviewed adoption metadata companion table: `admin_ai_generation_formal_adoption`.
- The task preserves generated-result isolation by reading source metadata from `admin_ai_generation_result` and storing adoption metadata separately.
- The adapter must keep formal target write state at `blocked_without_follow_up_task`; no formal `question` or `paper` draft rows are created.
- The adapter must expose only redacted summaries, public IDs, status, reviewer, and provenance metadata. It must not store raw prompt, raw output, provider payload, generated content body, API key, token, cookie, Authorization header, or live DB rows in evidence.

## Evidence-Only Sources

- `docs/05-execution-logs/acceptance/2026-06-26-admin-ai-generation-formal-adoption-db-schema-adapter-or-route-integration-approval-package.md`
- `docs/05-execution-logs/evidence/2026-06-26-admin-ai-generation-formal-adoption-db-schema-adapter-or-route-integration-approval-package.md`
- `docs/05-execution-logs/evidence/2026-06-26-admin-ai-generation-formal-adoption-contract-and-repository-tdd.md`
- `docs/05-execution-logs/audits-reviews/2026-06-26-admin-ai-generation-formal-adoption-contract-and-repository-tdd.md`

## Conflict Check

No requirement conflict was found. The latest approval package authorizes schema/migration-file and DB adapter TDD only. It does not authorize local migration execution, live DB connection, route integration, route smoke, formal draft write, Provider work, staging/prod/deploy/payment, external service, Cost Calibration, or final Pass.

## Allowed Scope

- Add focused RED/GREEN unit tests for the formal adoption DB adapter.
- Add `admin_ai_generation_formal_adoption` schema to `src/db/schema/ai-rag.ts`.
- Add reviewed SQL migration and Drizzle metadata/journal for the new table.
- Add a Postgres DB adapter that implements the existing formal adoption repository gateway.
- Update task queue, project state, task plan, evidence, and audit review for this task.

## Blocked Scope

- Do not execute Drizzle migration.
- Do not connect to live DB or run route smoke.
- Do not integrate admin routes in this task.
- Do not write formal `question` or `paper` draft rows.
- Do not call Provider, read credentials, or touch `.env*`.
- Do not modify package or lockfiles.
- Do not touch staging/prod, deployment/release readiness, payment, external service, or Cost Calibration.

## TDD Plan

1. Add a focused adapter test that imports the not-yet-existing DB adapter helpers and asserts:
   - insert values map camelCase gateway input to snake_case table columns;
   - source generated-result rows map to adoption source DTOs without internal ids;
   - adoption rows map to repository rows while preserving blocked formal write state;
   - unsafe formal target write rows are rejected.
2. Run the focused test and record the expected RED failure.
3. Implement the minimum schema, migration metadata, helper mappers, and gateway adapter.
4. Re-run the focused test and then broader source/doc gates.

## Validation Commands

- `npm.cmd run test:unit -- src/server/repositories/admin-ai-generation-formal-adoption-db-adapter.test.ts`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `npx.cmd prettier --write --ignore-unknown <changed docs/state/source files>`
- `npx.cmd prettier --check --ignore-unknown <changed docs/state/source files>`
- `git diff --check`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId admin-ai-generation-formal-adoption-db-schema-and-adapter-tdd-2026-06-26`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId admin-ai-generation-formal-adoption-db-schema-and-adapter-tdd-2026-06-26 -SkipRemoteAheadCheck`

## Stop Conditions

- Any need to execute local migration or connect to live DB.
- Any need to route-integrate or smoke-test an HTTP route.
- Any need to write formal `question`/`paper` drafts.
- Any need to read credentials, Provider config, `.env*`, staging/prod, payment, or external service data.
