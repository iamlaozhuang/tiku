# Admin AI generation formal draft local DB route smoke retry plan

Task id: `admin-ai-generation-formal-draft-local-db-route-smoke-retry-2026-06-26`

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
- `docs/01-requirements/modules/02-question-paper.md`
- `docs/01-requirements/advanced-edition/00-index.md`
- `docs/01-requirements/advanced-edition/modules/02-ai-task-domain.md`
- `docs/01-requirements/advanced-edition/modules/08-organization-ai-generation.md`
- `docs/01-requirements/advanced-edition/stories/epic-05-formal-content-separation.md`
- `docs/01-requirements/traceability/2026-06-23-advanced-ai-generation-scope-clarification.md`

## Requirement Decision Map

- Content admin AI output may only become formal `question` or `paper` through governed review, validation, attribution,
  and `audit_log`.
- Formal adoption must not publish formal content, compose final `paper` sections/questions, or make content
  student-visible in the same action.
- Provider/Cost, staging/prod, payment, external service, deployment/release readiness, organization-scoped adoption,
  and final Pass remain separate gates.

## Requirement Mapping

- `modules/02-question-paper.md`: this smoke may create local draft `question` or draft `paper` shell records only; it
  does not publish or mutate released content.
- `epic-05-formal-content-separation.md`: this smoke verifies the separately approved governed adoption path after
  isolated generated result storage and review.
- `2026-06-23-advanced-ai-generation-scope-clarification.md`: content admin adoption requires human review and must not
  bypass formal validation/publish rules.

## Evidence-Only Sources

- `docs/05-execution-logs/acceptance/2026-06-26-admin-ai-generation-formal-draft-adapter-route-integration-approval-package.md`
- `docs/05-execution-logs/evidence/2026-06-26-admin-ai-generation-formal-draft-local-db-route-smoke-execution.md`
- `docs/05-execution-logs/audits-reviews/2026-06-26-admin-ai-generation-formal-draft-local-db-route-smoke-execution.md`
- `docs/05-execution-logs/evidence/2026-06-26-admin-ai-generation-formal-draft-writer-mutation-context-repair-tdd.md`

## Conflict Check

The requirement SSOT and approval evidence agree: retry is allowed only after the writer mutation context repair. This
task may connect to the local DB through existing runtime configuration and may execute at most two content admin POST
route-handler smoke calls against existing eligible generated results. It must not seed data or execute migration.

## Scope

Allowed:

- Create docs/state/evidence/audit records for this retry.
- Run focused unit tests before route smoke.
- Perform at most two sanitized eligible-source lookups against existing local DB state.
- Perform at most two content admin route-handler POST smoke calls:
  - one content `question` formal draft adoption when an eligible source exists;
  - one content `paper` formal draft adoption when an eligible source exists.
- Allow those route calls to create local formal draft records and update adoption metadata only.

Blocked:

- Source/test changes.
- Schema or migration file changes.
- Local migration execution.
- Seed, fixture creation, direct raw DB mutation, or cleanup deletes.
- Provider/model calls or provider credential access.
- Organization-scoped adoption.
- Formal publish, paper section/question composition, or student-visible adoption.
- Staging/prod, payment, external service, deployment/release readiness, Cost Calibration, and final Pass claims.

## Execution Approach

1. Confirm focused formal draft/adoption unit tests still pass.
2. Use an external transient route smoke harness outside the repository.
3. Query only sanitized eligible source identifiers and workflow metadata.
4. POST to the route handler through `createAdminAiGenerationFormalAdoptionRuntimeRouteHandlers` with an injected
   content admin session and default DB-backed repositories/writers.
5. Record only redacted status, call counts, workflow, latency, public identifiers, and failure category.

## Validation Commands

- `npm.cmd run test:unit -- src/server/services/admin-ai-generation-formal-draft-adapter.test.ts src/server/services/admin-ai-generation-formal-adoption-runtime.test.ts`
- `node_modules\.bin\tsx.cmd <external-temp-route-smoke-harness>`
- `npx.cmd prettier --check --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-06-26-admin-ai-generation-formal-draft-local-db-route-smoke-retry.md docs/05-execution-logs/evidence/2026-06-26-admin-ai-generation-formal-draft-local-db-route-smoke-retry.md docs/05-execution-logs/audits-reviews/2026-06-26-admin-ai-generation-formal-draft-local-db-route-smoke-retry.md`
- `git diff --check`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId admin-ai-generation-formal-draft-local-db-route-smoke-retry-2026-06-26`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId admin-ai-generation-formal-draft-local-db-route-smoke-retry-2026-06-26 -SkipRemoteAheadCheck`

## Stop Conditions

- Existing local DB has no eligible content generated result for the workflow.
- Route response is not `draft_created`.
- Evidence would require raw generated result, raw reviewed draft, DB URL, cookie, token, Authorization header, raw DB
  row, raw prompt/output, or Provider payload.
- Any next step requires migration, seed, source repair, Provider, organization adoption, publish, external service, or
  staging/prod work.
