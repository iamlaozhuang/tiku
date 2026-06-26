# Evidence: Admin AI Generation Provider-Disabled Task History And Status UI TDD

Task id: `admin-ai-generation-provider-disabled-task-history-and-status-ui-tdd-2026-06-26`

Branch: `codex/admin-ai-provider-disabled-history-ui-20260626`

## Summary

Implemented a Provider-disabled, metadata-only task status/history loop for backend admin AI generation.

Changes:

- Added redacted task history DTOs for admin AI generation.
- Extended the existing admin task persistence repository port with `listTaskHistory`.
- Added `GET /api/v1/content-ai-generation-requests` and `GET /api/v1/organization-ai-generation-requests`.
- Scoped content history to the platform content review pool.
- Scoped organization history to the current organization from the admin session.
- Updated backend AI generation UI to show loading, empty, error, latest/recent history, Provider blocked, Cost
  Calibration blocked, and formal write blocked states.
- Kept generated result content unavailable while Provider remains disabled.

## Requirement Mapping Result

- AI task domain: task status/history now exposes redacted metadata only.
- Content admin AI generation: content review scoped task history is visible to content admin/super admin.
- Organization admin AI generation: organization scoped task history is visible to advanced organization admin/super
  admin; organization standard admin remains unavailable or denied.
- Formal content separation: no formal `question` or `paper` write path was added.
- Release boundary: staging/prod, Provider, Cost Calibration, deployment, payment, external service, release readiness,
  and final Pass remain excluded.

## TDD Evidence

RED command:

```text
npm.cmd run test:unit -- src/server/services/admin-ai-generation-local-contract-route.test.ts src/server/repositories/admin-ai-generation-task-persistence-repository.test.ts tests/unit/admin-ai-generation-entry-surface.test.ts
```

RED result:

- Failed as expected.
- 3 test files failed.
- 8 failed, 14 passed.
- Failure causes matched intended RED surface: `listTaskHistory` missing, route collection `GET` missing, UI history
  panel/loading/empty/error/refresh behavior missing.

GREEN command:

```text
npm.cmd run test:unit -- src/server/services/admin-ai-generation-local-contract-route.test.ts src/server/repositories/admin-ai-generation-task-persistence-repository.test.ts tests/unit/admin-ai-generation-entry-surface.test.ts
```

GREEN result:

- Pass.
- 3 test files passed.
- 22 tests passed.

## Changed Files

- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/2026-06-26-admin-ai-generation-provider-disabled-task-history-and-status-ui-tdd.md`
- `docs/05-execution-logs/evidence/2026-06-26-admin-ai-generation-provider-disabled-task-history-and-status-ui-tdd.md`
- `docs/05-execution-logs/audits-reviews/2026-06-26-admin-ai-generation-provider-disabled-task-history-and-status-ui-tdd.md`
- `src/app/api/v1/content-ai-generation-requests/route.ts`
- `src/app/api/v1/organization-ai-generation-requests/route.ts`
- `src/features/admin/ai-generation/AdminAiGenerationEntryPage.tsx`
- `src/server/contracts/admin-ai-generation-local-contract.ts`
- `src/server/contracts/admin-ai-generation-task-persistence-contract.ts`
- `src/server/repositories/admin-ai-generation-task-persistence-db-adapter.ts`
- `src/server/repositories/admin-ai-generation-task-persistence-repository.ts`
- `src/server/repositories/admin-ai-generation-task-persistence-repository.test.ts`
- `src/server/services/admin-ai-generation-local-contract-route.ts`
- `src/server/services/admin-ai-generation-local-contract-route.test.ts`
- `tests/unit/admin-ai-generation-entry-surface.test.ts`

## Safety Boundary

- Provider call/configuration/env/credential read: `false`.
- Raw prompt, raw output, raw provider payload, API key, token, cookie, Authorization header, or DB URL recorded:
  `false`.
- DB connection, DB write, migration execution, seed, or account mutation executed: `false`.
- Schema or migration files changed: `false`.
- Generated result storage approved or implemented: `false`.
- Formal `question`/`paper` write or adoption: `false`.
- Package or lockfile changed: `false`.
- Browser/dev-server/e2e executed: `false`.
- Staging/prod/payment/external service/deployment/release readiness touched: `false`.
- Final Pass claimed: `false`.

## Validation Log

- RED focused unit test: pass as expected failure.
- GREEN focused unit test: pass, 22 tests.
- `npm.cmd run typecheck`: pass.
- `npm.cmd run lint`: pass.
- Scoped Prettier write/check: pass.
- `git diff --check`: pass.
- `Test-ModuleRunV2PreCommitHardening.ps1`: pass.
- `Test-ModuleRunV2PrePushReadiness.ps1 -SkipRemoteAheadCheck`: pass.

## Browser Runtime

Not executed. This task explicitly blocks browser runtime, dev-server, and e2e execution. UI behavior was validated by
focused component/unit tests only.

## Closeout Decision

`READY_FOR_LOCAL_COMMIT_FF_MERGE_PUSH_AND_SHORT_BRANCH_CLEANUP`.

Cost Calibration Gate remains blocked.
