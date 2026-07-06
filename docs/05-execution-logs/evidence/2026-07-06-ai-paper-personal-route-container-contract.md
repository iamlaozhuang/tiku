# 2026-07-06 AI Paper Personal Route Container Contract Evidence

## Scope

- Task id: `ai-paper-personal-route-container-contract-2026-07-06`
- Branch: `codex/ai-paper-personal-route-container-contract-2026-07-06`
- Scope type: local source/test/docs/state only.
- Runtime boundaries: no DB runtime, no Provider call, no browser/dev server, no staging/prod/deploy, no Cost Calibration.
- Dependency boundaries: no dependency/package/lockfile/schema/migration/seed change.
- Evidence redaction: only file paths, command status, test counts, role labels, source categories, counts, and failure categories are recorded.

## Source Changes

- Personal AI generation route runtime bridge DTO now exposes `paperAssembly` as a redacted container field.
- Personal/employee AI组卷 route path now resolves local paper assembly after Provider route success and before result materialization.
- Assembly rejection blocks personal/employee paper result materialization.
- Personal advanced student paper assembly uses platform formal questions only.
- Organization advanced employee paper assembly uses platform formal questions plus employee-visible organization training snapshots.
- Employee session resolver now preserves `employeePublicId` for organization training source resolution while keeping existing actor/user ownership semantics.
- App route explicitly wires lazy Postgres repositories for question and organization training source resolution; no DB connection was opened in this task.

## TDD Red

Command:

```text
npm.cmd run test:unit -- src/server/services/personal-ai-generation-request-route.test.ts src/server/services/personal-ai-generation-runtime-bridge-service.test.ts
```

Initial red result:

- Status: failed as expected.
- Failed tests: 5 newly added contract tests.
- Failure categories observed: paper assembly resolver not invoked, repository-backed source resolution not invoked, `paperAssembly` field missing, AI question route lacked explicit null assembly field, rejected assembly still allowed result materialization.
- Sensitive output: not recorded.

## Validation Commands

Focused unit after implementation:

```text
npm.cmd run test:unit -- src/server/services/personal-ai-generation-request-route.test.ts src/server/services/personal-ai-generation-runtime-bridge-service.test.ts
```

- Result: pass.
- Test files: 2 passed.
- Tests: 40 passed.

Related AI paper regression:

```text
npm.cmd run test:unit -- src/server/services/personal-ai-generation-request-route.test.ts src/server/services/personal-ai-generation-runtime-bridge-service.test.ts src/server/services/ai-paper-route-plan-select-wiring-service.test.ts src/server/services/ai-paper-route-source-resolution-service.test.ts src/server/services/ai-paper-route-assembly-service.test.ts src/server/services/ai-paper-plan-and-select-service.test.ts src/server/services/ai-paper-source-adapter-service.test.ts
```

- Result: pass.
- Test files: 7 passed.
- Tests: 61 passed.

Static gates:

```text
git diff --check
npm.cmd run typecheck
npm.cmd run lint
```

- `git diff --check`: pass.
- `typecheck`: pass.
- `lint`: pass.

Scoped formatting:

```text
npm.cmd exec -- prettier --check --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-07-06-ai-paper-personal-route-container-contract.md docs/05-execution-logs/evidence/2026-07-06-ai-paper-personal-route-container-contract.md docs/05-execution-logs/audits-reviews/2026-07-06-ai-paper-personal-route-container-contract.md src/app/api/v1/personal-ai-generation-requests/route.ts src/server/contracts/personal-ai-generation-runtime-bridge-contract.ts src/server/services/personal-ai-generation-local-browser-experience-service.ts src/server/services/personal-ai-generation-request-route.ts src/server/services/personal-ai-generation-request-route.test.ts src/server/services/personal-ai-generation-runtime-bridge-service.ts src/server/services/personal-ai-generation-runtime-bridge-service.test.ts
```

- Result: pass.
- Note: an earlier scoped prettier check found two source files requiring formatting; those files were formatted and the scoped check then passed.

Module Run v2 hardening:

```text
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId ai-paper-personal-route-container-contract-2026-07-06
```

- Result: pass.
- Cost Calibration Gate remained blocked.

## Assertions Covered

- `org_advanced_employee`: `paperAssembly.status = assembled`, source diagnostics include platform formal question count and enterprise training snapshot count, result materialization created after assembly.
- `org_advanced_employee`: repository-backed default resolver calls platform question repository and employee-visible training repository using employee public id.
- `personal_advanced_student`: platform formal questions only; enterprise repository not invoked.
- AI出题 route: paper assembly resolver not invoked; `paperAssembly = null`.
- Rejected AI组卷 assembly: no draft result materialization; result state failed.
- Redaction: serialized route payload does not contain credential fixture, provider payload marker, platform question content marker, or enterprise question content marker.

## Non-Claims

- DB-backed runtime: not tested.
- Browser/UI: not tested.
- Provider-disabled: not tested.
- Provider-enabled small sample: not tested.
- Staging/prod/deploy: not executed; requires fresh approval.
- Cost Calibration: not executed; requires fresh approval.
- Release readiness: not claimed.
- Production usability: not claimed.
