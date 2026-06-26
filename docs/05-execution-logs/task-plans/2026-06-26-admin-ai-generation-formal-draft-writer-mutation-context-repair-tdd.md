# Admin AI generation formal draft writer mutation context repair TDD plan

Task id: `admin-ai-generation-formal-draft-writer-mutation-context-repair-tdd-2026-06-26`

Branch: `codex/admin-ai-formal-draft-writer-context-repair-20260626`

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
- `docs/05-execution-logs/evidence/2026-06-26-admin-ai-generation-formal-draft-local-db-route-smoke-execution.md`
- `src/server/services/admin-ai-generation-formal-draft-adapter.ts`
- `src/server/services/admin-ai-generation-formal-adoption-runtime.ts`
- `src/server/repositories/question-repository.ts`
- `src/server/repositories/paper-draft-repository.ts`

## Requirement Mapping

- The local DB route smoke reached the formal draft writer boundary and failed with route response `500014`.
- Read-only source inspection showed the existing formal content writers require content mutation actor context.
- This task repairs only the source/test contract so the formal draft adapter passes the content admin reviewer public id as
  mutation context to question and paper writer services.

## Approved Scope

- Extend the formal draft adapter writer contract with a narrow content mutation context.
- Pass `actorPublicId` from the approved adoption review reviewer into question and paper writer calls.
- Update default runtime writer wrappers to forward that context to existing `QuestionService.createQuestion` and
  `PaperDraftService.createPaper`.
- Add focused RED/GREEN unit coverage for question and paper writer context propagation.

## Blocked Scope

- No live DB connection or route smoke.
- No schema, migration, seed, fixture creation, or local data setup.
- No formal publish, paper section/question composition, or student-visible content adoption.
- No organization-scoped adoption.
- No Provider call, Provider credential read, staging/prod, payment, external service, release readiness, final Pass,
  dependency, package, or lockfile change.

## TDD Plan

1. Add focused failing expectations that the formal draft adapter calls question/paper writers with
   `{ actorPublicId: adoption.review.reviewerPublicId }`.
2. Extend the writer contract and adapter implementation to pass the context.
3. Update runtime default writer wrappers to forward the context into existing services.
4. Run focused tests, lint, typecheck, scoped Prettier, diff, and Module Run v2 gates.

## Validation Commands

- RED/GREEN:
  `npm.cmd run test:unit -- src/server/services/admin-ai-generation-formal-draft-adapter.test.ts`
- Focused:
  `npm.cmd run test:unit -- src/server/services/admin-ai-generation-formal-draft-adapter.test.ts src/server/services/admin-ai-generation-formal-adoption-runtime.test.ts`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- Scoped `prettier --check`
- `git diff --check`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId admin-ai-generation-formal-draft-writer-mutation-context-repair-tdd-2026-06-26`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId admin-ai-generation-formal-draft-writer-mutation-context-repair-tdd-2026-06-26 -SkipRemoteAheadCheck`
