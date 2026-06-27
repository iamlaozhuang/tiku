# learner AI private result practice/paper attempt source TDD

## Task

- Task id: `learner-ai-generation-private-result-practice-paper-attempt-tdd-2026-06-27`
- Branch: `codex/learner-ai-private-loop-tdd-20260627`
- Approval source: current user serial batch request on 2026-06-27.

## Scope

- Add source-level contract fields that make learner AI generated results and history explicitly private.
- Expose private-use boundaries for practice attempt and paper attempt source usage.
- Keep organization-private adoption, platform formal content adoption, publish, and student-visible content blocked.
- Use TDD: write failing result history/reference assertions first, then implement the minimal DTO/service mapping.

## Allowed files

- `src/server/contracts/personal-ai-generation-result-history-contract.ts`
- `src/server/contracts/personal-ai-generation-result-reference-contract.ts`
- `src/server/models/personal-ai-generation-result-reference.ts`
- `src/server/services/personal-ai-generation-result-history-service.ts`
- `src/server/services/personal-ai-generation-result-history-service.test.ts`
- `src/server/services/personal-ai-generation-result-reference-service.ts`
- `src/server/services/personal-ai-generation-result-reference-service.test.ts`
- `src/server/services/personal-ai-generation-result-route.test.ts`
- `src/server/services/personal-ai-generation-request-flow-service.test.ts`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/2026-06-27-learner-ai-generation-private-result-practice-paper-attempt-tdd.md`
- `docs/05-execution-logs/acceptance/2026-06-27-learner-ai-generation-private-result-practice-paper-attempt-tdd.md`
- `docs/05-execution-logs/evidence/2026-06-27-learner-ai-generation-private-result-practice-paper-attempt-tdd.md`
- `docs/05-execution-logs/audits-reviews/2026-06-27-learner-ai-generation-private-result-practice-paper-attempt-tdd.md`

## Explicit non-scope

- No DB connection, DB mutation, migration, seed, schema, drizzle, package, lockfile, or env file access.
- No Provider call, Provider credential read, Cost Calibration, dev server, browser, e2e, staging/prod, payment, external service, PR, release readiness, or final Pass claim.
- No practice/paper attempt mutation is executed; this task defines local source contracts only.
- No publish and no student-visible runtime verification.

## Validation plan

1. RED focused tests for private-use boundary on result history/detail/reference.
2. Minimal implementation and focused GREEN tests.
3. Scoped Prettier write/check over changed files.
4. `git diff --check`.
5. `npm.cmd run lint`.
6. `npm.cmd run typecheck`.
7. Module Run v2 pre-commit hardening, project status diagnostic, and pre-push readiness.
