# Admin AI generation formal draft local DB route smoke retry after reused actor context repair plan

Task id:
`admin-ai-generation-formal-draft-local-db-route-smoke-retry-after-reused-actor-context-repair-2026-06-26`

## SSOT Read List

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/04-agent-system/operating-manual.md`
- `docs/04-agent-system/sop/requirement-ssot-reading-governance.md`
- `docs/04-agent-system/sop/task-lifecycle-governance.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/01-requirements/modules/02-question-paper.md`
- `docs/01-requirements/advanced-edition/stories/epic-05-formal-content-separation.md`
- `docs/01-requirements/traceability/2026-06-23-advanced-ai-generation-scope-clarification.md`

## Requirement Decision Map

- Content admin may adopt a redacted generated result into formal `question` or `paper` draft only through the governed
  formal adoption route and reviewed draft payload.
- This task may verify the repaired route with existing local DB state only.
- Formal publish, paper section/question composition, Provider/Cost, organization adoption, staging/prod, payment,
  external service, deployment/release readiness, and final Pass remain separate gates.

## Scope

Allowed:

- Create docs/state/evidence/audit records for this retry.
- Run focused formal draft/adoption unit tests before route smoke.
- Connect to local DB only through existing runtime configuration; do not print or persist secrets.
- Perform at most two sanitized eligible-source lookups against existing local DB state.
- Perform at most two content admin route-handler POST smoke calls:
  - one content `question` formal draft adoption when an eligible source exists;
  - one content `paper` formal draft adoption when an eligible source exists.
- Allow those route calls to create local formal draft records and update adoption metadata only.

Blocked:

- Source/test changes.
- Schema or migration changes/execution.
- Seed, fixture creation, direct raw DB mutation, cleanup deletes, or data repair.
- Provider/model calls or provider credential access.
- Organization-scoped adoption.
- Formal publish, paper section/question composition, or student-visible content.
- Staging/prod, payment, external service, deployment/release readiness, Cost Calibration, and final Pass claims.

## Execution Approach

1. Confirm focused formal draft/adoption unit tests pass on the repaired master.
2. Build a transient route smoke harness outside the repository.
3. Query only sanitized eligible source identifiers and workflow metadata.
4. POST to `createAdminAiGenerationFormalAdoptionRuntimeRouteHandlers` with an injected content admin session and default
   DB-backed repositories/writers.
5. Record only redacted status, call counts, workflow, latency, public identifier state, and failure category.

## Validation Commands

- `npm.cmd run test:unit -- src/server/services/admin-ai-generation-formal-draft-adapter.test.ts src/server/services/admin-ai-generation-formal-adoption-runtime.test.ts`
- `node_modules\.bin\tsx.cmd <external-temp-route-smoke-harness>`
- `npx.cmd prettier --check --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-06-26-admin-ai-generation-formal-draft-local-db-route-smoke-retry-after-reused-actor-context-repair.md docs/05-execution-logs/evidence/2026-06-26-admin-ai-generation-formal-draft-local-db-route-smoke-retry-after-reused-actor-context-repair.md docs/05-execution-logs/audits-reviews/2026-06-26-admin-ai-generation-formal-draft-local-db-route-smoke-retry-after-reused-actor-context-repair.md`
- `git diff --check`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId admin-ai-generation-formal-draft-local-db-route-smoke-retry-after-reused-actor-context-repair-2026-06-26`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId admin-ai-generation-formal-draft-local-db-route-smoke-retry-after-reused-actor-context-repair-2026-06-26 -SkipRemoteAheadCheck`

## Stop Conditions

- Existing local DB has no eligible content generated result for the workflow.
- Route response is not `draft_created`.
- Evidence would require raw generated result, raw reviewed draft, DB URL, cookie, token, Authorization header, raw DB
  row, raw prompt/output, or Provider payload.
- Any next step requires migration, seed, source repair, Provider, organization adoption, publish, external service, or
  staging/prod work.
