# Admin AI generation formal draft reused adoption writer actor context repair TDD plan

Task id: `admin-ai-generation-formal-draft-reused-adoption-writer-actor-context-repair-tdd-2026-06-26`

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

- Content admin AI generated results may become formal `question` or `paper` draft content only through governed
  human review and explicit adoption.
- A reused blocked adoption row must not force the formal draft writer to use a stale persisted reviewer when the
  current route actor has already been authorized for the adoption command.
- This task repairs only the source contract/service path and proves it with focused unit tests.

## Scope

Allowed:

- Update formal draft adapter contract/service tests so the writer receives the current route actor context when a
  blocked adoption row is reused.
- Update adoption service to pass the current normalized actor into the formal draft adapter.
- Update docs/state/evidence/audit records.
- Run RED/GREEN focused unit tests, lint, typecheck, scoped Prettier, `git diff --check`, and Module Run v2 gates.

Blocked:

- Live DB connection or route smoke.
- Schema, migration, Drizzle metadata, seed, fixture creation, cleanup deletes, or direct DB mutation.
- Provider/model calls, provider credential reads, raw prompt/output evidence, or Cost Calibration.
- Organization-scoped formal adoption.
- Formal publish, paper section/question composition, or student-visible content.
- Staging/prod, payment, external service, deployment/release readiness, PR, force push, and final Pass claims.

## Execution Approach

1. Add a RED unit assertion showing the route/formal-adoption service passes `writerContext.actorPublicId` from the
   current content admin actor to `formalDraftAdapter.createFormalDraft`, even when adoption metadata carries a stale
   reviewer public id.
2. Add adapter coverage proving an explicit writer context overrides the persisted adoption reviewer only at the
   writer boundary.
3. Implement the narrow contract extension and service/adapter propagation.
4. Run focused tests, then full local quality gates required by the task.

## Validation Commands

- `npm.cmd run test:unit -- src/server/services/admin-ai-generation-formal-draft-adapter.test.ts src/server/services/admin-ai-generation-formal-adoption-runtime.test.ts`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `npx.cmd prettier --check --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-06-26-admin-ai-generation-formal-draft-reused-adoption-writer-actor-context-repair-tdd.md docs/05-execution-logs/evidence/2026-06-26-admin-ai-generation-formal-draft-reused-adoption-writer-actor-context-repair-tdd.md docs/05-execution-logs/audits-reviews/2026-06-26-admin-ai-generation-formal-draft-reused-adoption-writer-actor-context-repair-tdd.md src/server/contracts/admin-ai-generation-formal-draft-adapter-contract.ts src/server/services/admin-ai-generation-formal-draft-adapter.ts src/server/services/admin-ai-generation-formal-draft-adapter.test.ts src/server/services/admin-ai-generation-formal-adoption-service.ts src/server/services/admin-ai-generation-formal-adoption-runtime.test.ts`
- `git diff --check`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId admin-ai-generation-formal-draft-reused-adoption-writer-actor-context-repair-tdd-2026-06-26`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId admin-ai-generation-formal-draft-reused-adoption-writer-actor-context-repair-tdd-2026-06-26 -SkipRemoteAheadCheck`

## Stop Conditions

- Fix requires live DB state, migration, route smoke, seed, cleanup, Provider, organization adoption, publish, external
  service, or staging/prod work.
- Evidence would require raw generated result, raw reviewed draft, DB URL, cookie, token, Authorization header, raw DB
  row, raw prompt/output, or Provider payload.
