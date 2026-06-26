# Evidence: Admin AI Generation Route DB Adapter Integration TDD

Task id: `admin-ai-generation-route-db-adapter-integration-tdd-2026-06-26`

Branch: `codex/admin-ai-route-db-adapter-integration-tdd-20260626`

## Summary

Implemented local route integration so successful content and organization admin AI generation local-contract POSTs call
the admin AI generation task persistence port and return a redacted persistence summary.

The default production route handler now uses the existing Postgres admin AI generation task persistence adapter. Unit
tests inject fake persistence repositories and do not validate a live database connection or execute the migration.

## Requirement Mapping Result

- AI task domain: accepted admin AI generation local-contract requests now create or reuse a trackable pending task
  through the persistence port.
- Content admin: content AI question and AI `paper` local contracts remain platform/content-review owned.
- Organization admin: organization advanced admin AI question and AI `paper` local contracts remain organization-owned.
- Formal content separation: route responses keep Provider blocked and `question`/`paper` write statuses blocked.
- Standard organization admin denial: denied organization standard admin requests do not call persistence.

## Changed Files

- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/2026-06-26-admin-ai-generation-route-db-adapter-integration-tdd.md`
- `docs/05-execution-logs/evidence/2026-06-26-admin-ai-generation-route-db-adapter-integration-tdd.md`
- `docs/05-execution-logs/audits-reviews/2026-06-26-admin-ai-generation-route-db-adapter-integration-tdd.md`
- `src/server/contracts/admin-ai-generation-local-contract.ts`
- `src/server/contracts/admin-ai-generation-task-persistence-contract.ts`
- `src/server/services/admin-ai-generation-local-contract-route.ts`
- `src/server/services/admin-ai-generation-local-contract-route.test.ts`
- `src/server/repositories/admin-ai-generation-task-persistence-repository.ts`
- `src/server/repositories/admin-ai-generation-task-persistence-repository.test.ts`

## TDD Log

- RED command: `npm.cmd run test:unit -- src/server/services/admin-ai-generation-local-contract-route.test.ts`
  - result: failed as expected;
  - failures: response lacked `taskPersistence`, and injected task persistence repository calls were not observed.
- GREEN route command: `npm.cmd run test:unit -- src/server/services/admin-ai-generation-local-contract-route.test.ts`
  - result: pass;
  - files: 1 passed;
  - tests: 7 passed.
- First combined command:
  `npm.cmd run test:unit -- src/server/services/admin-ai-generation-local-contract-route.test.ts src/server/repositories/admin-ai-generation-task-persistence-repository.test.ts src/server/repositories/admin-ai-generation-task-persistence-db-adapter.test.ts`
  - result: failed;
  - reason: existing repository tests created local contracts without injected fake persistence, so the new route success
    path returned the standard unexpected-runtime error envelope from the default DB adapter path.
  - evidence safety: no DB URL, secret, token, raw DB row, provider payload, prompt, or raw output was printed.
- Repair: repository tests now inject a fake route persistence repository when they only need a local-contract fixture.
- Final focused command:
  `npm.cmd run test:unit -- src/server/services/admin-ai-generation-local-contract-route.test.ts src/server/repositories/admin-ai-generation-task-persistence-repository.test.ts src/server/repositories/admin-ai-generation-task-persistence-db-adapter.test.ts`
  - result: pass;
  - files: 3 passed;
  - tests: 15 passed.

## Implementation Evidence

- `src/server/contracts/admin-ai-generation-local-contract.ts`
  - split the local-contract response into a persistable base DTO and full response DTO;
  - added `taskPersistence` with only public ids, status, result visibility, evidence summary, citation count, and
    redaction status.
- `src/server/contracts/admin-ai-generation-task-persistence-contract.ts`
  - narrowed persistence input to accept the local-contract base DTO, so persistence can run before the response summary
    exists.
- `src/server/services/admin-ai-generation-local-contract-route.ts`
  - added injected `taskPersistenceRepository`, `createRequestPublicId`, and `requestClock` route options;
  - wired successful content/org admin route requests to `createOrReuseTask`;
  - defaulted production handlers to `createPostgresAdminAiGenerationTaskPersistenceRepository`;
  - kept Provider and formal content boundaries blocked.
- `src/server/services/admin-ai-generation-local-contract-route.test.ts`
  - verifies route persistence calls, redacted persistence summaries, reuse summaries, Provider-disabled boundaries, and
    no persistence call for denied/invalid requests.
- `src/server/repositories/admin-ai-generation-task-persistence-repository.test.ts`
  - injects fake route persistence when constructing local-contract fixtures, avoiding live DB/env validation in unit
    tests.

## Safety Boundary

- Local DB migration execution: `false`.
- `drizzle-kit push`: `false`.
- Schema/migration/Drizzle metadata change: `false`.
- Intended live database connection validation: `false`.
- Destructive database operation: `false`.
- Seed/account mutation: `false`.
- Provider call/configuration/env/credential use in product path: `false`.
- Cost Calibration Gate: `false`.
- Formal `question`/`paper` write or adoption: `false`.
- Browser/e2e/dev-server: `false`.
- Staging/prod/payment/external service/deployment/release readiness: `false`.
- Package/lockfile change: `false`.
- Final Pass claim: `false`.

## Validation Log

- Focused RED: `pass_observed_expected_failure`.
- Focused GREEN: `pass`, 3 files / 15 tests.
- Lint: `pass`.
- Typecheck: `pass`.
- `git diff --check`: `pass`.
- Scoped Prettier write/check: `pass`.
- Module Run v2 pre-commit hardening: `pass`.
- Module Run v2 pre-push readiness: `pass_skip_remote_ahead_check`.

## Closeout Decision

Local route DB adapter integration TDD packet: `PASS`.

This pass is limited to source wiring and unit-tested injected persistence. It does not approve or execute local DB
migration application, live DB route validation, Provider/Cost smoke, formal `question`/`paper` writes, staging/prod,
payment, external services, deployment, release readiness, or final Pass.

## Blocked Remainder

- Applying the local DB migration remains a separate approval.
- Live DB route validation remains a separate approval after local migration execution is approved.
- Provider/Cost, generated-result storage, formal adoption, staging/prod, payment, external service, deployment, release
  readiness, and final Pass remain blocked.

Cost Calibration Gate remains blocked.
