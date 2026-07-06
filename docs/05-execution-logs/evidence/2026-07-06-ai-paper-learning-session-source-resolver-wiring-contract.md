# 2026-07-06 AI Paper Learning Session Source Resolver Wiring Contract Evidence

## Scope

- Task id: `ai-paper-learning-session-source-resolver-wiring-contract-2026-07-06`
- Branch: `codex/ai-paper-learning-session-source-resolver-wiring-contract-2026-07-06`
- Scope executed: local source + unit tests only.
- Not executed: DB runtime, browser runtime, Provider call, staging/prod/deploy, Cost Calibration.
- Sensitive evidence boundary: only file paths, command statuses, aggregate test counts, role labels, source categories, and failure categories are recorded.

## Changed Surface

- `src/app/api/v1/personal-ai-generation-learning-sessions/route.ts`
- `src/server/repositories/organization-training-repository.ts`
- `src/server/repositories/organization-training-repository.test.ts`
- `src/server/services/personal-ai-generation-result-route.ts`
- `src/server/services/personal-ai-generation-result-route.test.ts`
- `src/server/services/personal-ai-generation-learning-session-paper-source-resolver.ts`
- `src/server/services/personal-ai-generation-learning-session-paper-source-resolver.test.ts`
- `src/server/services/personal-ai-generation-learning-session-route.test.ts`
- state, task plan, evidence, audit files for this task.

## TDD Red Evidence

- Command:
  - `npm.cmd run test:unit -- src/server/services/personal-ai-generation-result-route.test.ts src/server/services/personal-ai-generation-learning-session-paper-source-resolver.test.ts`
- Result: expected red, exit 1.
- Failure categories:
  - missing source resolver module;
  - personal result user context did not include `employeePublicId`;
  - employee result user context did not include `employeePublicId`.
- Sensitive output: not recorded.

## Green / Regression Evidence

- Command:
  - `npm.cmd run test:unit -- src/server/services/personal-ai-generation-result-route.test.ts src/server/services/personal-ai-generation-learning-session-paper-source-resolver.test.ts`
- Result: pass.
- Aggregate: 2 files passed, 16 tests passed.

- Command:
  - `npm.cmd run test:unit -- src/server/services/personal-ai-generation-result-route.test.ts src/server/services/personal-ai-generation-learning-session-paper-source-resolver.test.ts src/server/repositories/organization-training-repository.test.ts`
- Result: pass.
- Aggregate: 3 files passed, 40 tests passed.

- Command:
  - `npm.cmd run test:unit -- src/server/services/personal-ai-generation-result-route.test.ts src/server/services/personal-ai-generation-learning-session-paper-source-resolver.test.ts src/server/repositories/organization-training-repository.test.ts src/server/services/personal-ai-generation-learning-session-route.test.ts src/server/services/personal-ai-generation-learning-session-service.test.ts src/server/services/personal-ai-generation-request-route.test.ts src/server/services/ai-paper-route-plan-select-wiring-service.test.ts src/server/services/ai-paper-plan-and-select-service.test.ts`
- Result: pass.
- Aggregate: 8 files passed, 102 tests passed.

## Current Behavioral Evidence

- Personal context:
  - result user resolver returns `employeePublicId: null`;
  - AI组卷 source resolver resolves platform formal questions only.
- Employee context:
  - result user resolver preserves employee public id;
  - AI组卷 source resolver can resolve platform formal questions plus employee-visible enterprise training snapshots.
- Repository boundary:
  - new server-only method returns raw training question snapshot values needed for learning-session answerability;
  - public organization training DTO remains redacted of answer/analysis fields.
- Route wiring:
  - app route injects lazy Postgres question and organization training repositories into the default paper source resolver;
  - task did not open a DB connection.

## Final Gate Evidence

- Command: `git diff --check`
  - Result: pass.
- Command: `npm.cmd run typecheck`
  - Result: pass.
- Command: `npm.cmd run lint`
  - Result: pass.
- Command: scoped prettier check for current task files.
  - Result: pass.
- Command:
  - `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId ai-paper-learning-session-source-resolver-wiring-contract-2026-07-06`
  - Result: pass.
  - Scope scan: 13 files matched task allowlist.
  - Cost Calibration Gate remained blocked.

## Final Classification

- source/unit: pass.
- DB-backed runtime: not tested.
- browser: not tested.
- Provider-disabled: not tested.
- Provider-enabled small sample: not tested.
- release readiness: not claimed.
- production usability: not claimed.
- staging: not executed / requires fresh approval.
- Cost Calibration: not executed / requires fresh approval.
