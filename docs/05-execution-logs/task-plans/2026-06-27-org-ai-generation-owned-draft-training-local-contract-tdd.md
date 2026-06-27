# org AI generation owned draft/training local contract TDD

## Task

- Task id: `org-ai-generation-owned-draft-training-local-contract-tdd-2026-06-27`
- Branch: `codex/org-ai-owned-draft-contract-tdd-20260627`
- Approval source: current user serial batch request on 2026-06-27.

## Scope

- Add a source-level local contract boundary for organization advanced admin AI generation that separates:
  - organization-private generated result/history ownership;
  - organization-private draft adoption;
  - organization-private training source use;
  - platform formal draft adoption through content admin review only;
  - publish and student-visible content as blocked in this task.
- Use TDD: write the failing contract assertion first, then implement the minimal DTO/service mapping.

## Allowed files

- `src/server/contracts/admin-ai-generation-local-contract.ts`
- `src/server/repositories/admin-ai-generation-task-persistence-repository.ts`
- `src/server/repositories/admin-ai-generation-task-persistence-repository.test.ts`
- `src/server/services/admin-ai-generation-local-contract-route.ts`
- `src/server/services/admin-ai-generation-local-contract-route.test.ts`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/2026-06-27-org-ai-generation-owned-draft-training-local-contract-tdd.md`
- `docs/05-execution-logs/acceptance/2026-06-27-org-ai-generation-owned-draft-training-local-contract-tdd.md`
- `docs/05-execution-logs/evidence/2026-06-27-org-ai-generation-owned-draft-training-local-contract-tdd.md`
- `docs/05-execution-logs/audits-reviews/2026-06-27-org-ai-generation-owned-draft-training-local-contract-tdd.md`

## Explicit non-scope

- No DB connection, DB mutation, migration, seed, schema, drizzle, or env file access.
- No Provider call, Provider credential read, Cost Calibration, dev server, browser, e2e, staging/prod, payment, external service, PR, release readiness, or final Pass claim.
- No formal publish and no student-visible runtime verification.

## Validation plan

1. Focused RED test for the new organization-owned draft/training boundary.
2. Minimal implementation and focused GREEN test.
3. Scoped Prettier write/check over changed files.
4. `git diff --check`.
5. `npm.cmd run lint`.
6. `npm.cmd run typecheck`.
7. Module Run v2 pre-commit hardening, project status diagnostic, and pre-push readiness.
