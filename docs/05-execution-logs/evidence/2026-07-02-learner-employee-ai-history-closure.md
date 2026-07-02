# Learner and employee AI history closure evidence

## Task

- Task id: `learner-employee-ai-history-closure-2026-07-02`
- Branch: `codex/learner-employee-ai-history-closure`

## Redaction Boundary

- Evidence records task ids, file paths, status labels, command results, test counts, and redacted summaries only.
- No credentials, cookies, tokens, sessions, localStorage, Authorization headers, `.env*` values, DB raw rows, internal numeric ids, PII, Provider payloads, prompts, raw AI input/output, raw DOM, screenshots, traces, or full generated/question/paper/material/resource/chunk content.

## Execution Log

- Task started from residual findings `MM-01` and `MM-02`.
- Scope excludes logistics, real Provider calls, DB runtime access, `.env*`, schema/migration/seed, dependency changes, e2e, staging/prod/deploy, Cost Calibration, release readiness, and final Pass.
- Root-cause class confirmed:
  - Employee local browser POST used organization ownership in the request flow but persistent request creation rejected non-personal ownership, so employee submits were not recorded.
  - Employee request/result history used employee user public id instead of organization owner public id.
  - Route-integrated Provider success returned visible transient content but did not run redacted result materialization when both Provider execution and materialization controls were present.
- Repair summary:
  - Request repository now accepts personal and organization owner type in history, idempotency, and insert paths.
  - Result repository and result history service now pass owner type through list/detail/materialization paths.
  - Request/result routes now derive owner scope from the authenticated session: personal user -> personal owner; employee -> organization owner.
  - Provider success plus explicit materialization control now persists only a redacted draft result summary through the existing materialization service.

## TDD Log

- Red run: `npm.cmd run test:unit -- src/server/services/personal-ai-generation-request-route.test.ts src/server/services/personal-ai-generation-result-route.test.ts src/server/services/personal-ai-generation-runtime-bridge-service.test.ts`
  - Result: failed as expected.
  - Failure classes: employee request persistence skipped; employee request history owner scope used employee user; employee result history/detail owner scope used employee user; Provider success did not materialize redacted result.
- Green run: `npm.cmd run test:unit -- src/server/repositories/personal-ai-generation-request-repository.test.ts src/server/repositories/personal-ai-generation-result-repository.test.ts src/server/services/personal-ai-generation-request-route.test.ts src/server/services/personal-ai-generation-result-route.test.ts src/server/services/personal-ai-generation-runtime-bridge-service.test.ts`
  - Result: pass, 5 files, 56 tests.
- Post-format focused rerun: same command.
  - Result: pass, 5 files, 56 tests.

## Validation

- `npm.cmd run typecheck`: pass.
- `npm.cmd run lint`: pass.
- `npm.cmd run test:unit -- src/server/repositories/personal-ai-generation-request-repository.test.ts src/server/repositories/personal-ai-generation-result-repository.test.ts src/server/services/personal-ai-generation-request-route.test.ts src/server/services/personal-ai-generation-result-route.test.ts src/server/services/personal-ai-generation-runtime-bridge-service.test.ts`: pass, 5 files, 56 tests.
- `npm.cmd exec -- prettier --check --ignore-unknown <changed docs/source/test files>`: first run failed on formatting only; scoped `prettier --write` executed; rerun pass; post-evidence rerun pass.
- `git diff --check`: pass.
- `Test-ModuleRunV2PreCommitHardening.ps1 -TaskId learner-employee-ai-history-closure-2026-07-02`: first run failed because task allowedFiles omitted three result-history files; task scope was materialized to include those exact files; rerun pass.
- `Test-ModuleRunV2PrePushReadiness.ps1 -TaskId learner-employee-ai-history-closure-2026-07-02 -SkipRemoteAheadCheck`: first run failed because task was still `in_progress` while repository SHA baseline was an accepted ancestor; task status was advanced to closeout state after validation; rerun pass.
- `Test-ModuleRunV2PreCommitHardening.ps1` without `-TaskId`: first commit hook attempt selected the previous task because `project-state.currentTask.id` was stale; `currentTask` was synced to this task; rerun pass.
- Provider call executed: false.
- `.env*` read or modified: false.
- DB connection or mutation executed: false.
- Resource import executed: false.
- Schema/migration/seed executed: false.
- Dependency/package/lockfile changed: false.
- Release readiness, final Pass, Cost Calibration, staging/prod/deploy: not executed or claimed.
