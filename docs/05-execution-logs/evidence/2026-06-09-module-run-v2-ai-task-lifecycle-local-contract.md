# Module Run v2 AI Task Lifecycle Local Contract Evidence

## Task

- Task id: `module-run-v2-ai-task-lifecycle-local-contract`
- Status: done.
- Approval: seeded by `module-run-v2-ai-task-and-provider-planning` with `autoDriveLocalImplementationApproval`.
- localFullLoopGate: L2.

## Scope

Pending implementation may touch only the existing local `ai-task-domain` contract, model, validator, service, focused
same-directory tests, and task governance logs.

## Guardrails

- No provider calls.
- No provider configuration.
- No env/secret access.
- No dependency/package/lockfile changes.
- No schema/migration changes.
- No repository, mapper, REST API, Server Action, UI/browser, e2e, deploy, payment, or external-service work.
- Cost Calibration Gate remains blocked.

## Evidence Status

result: pass
Passed: focused local implementation gates completed.

## Batch Evidence

- Batch range: Module Run v2 `ai-task-and-provider` localFullLoopGate L2 focused implementation.
- Commit: `b8f0871ac87accdd54c051f79179404982760229` current branch HEAD before an explicit task commit; no task commit
  was created in this cycle because the seeded task approval does not separately authorize commit, merge, push, or branch
  cleanup.
- threadRolloverGate: dry-run closeout recovery allowed `continue_current_thread`.

## Recovery And Gates

- Recovery audit read `AGENTS.md`, code taste ten commandments, ADRs, project state, task queue, task plan, evidence,
  audit review, and relevant SOPs.
- Startup gate: `startupDecision: prepare_next_task`.
- Closeout recovery dry-run: `autopilotDecision: continue_current_thread`; `nextModuleRunCandidate:
ai-task-and-provider`.
- Unattended readiness for this task: `unattendedStopDecision: continue`.
- Implementation auto-seed readiness: passed for `module-run-v2-ai-task-lifecycle-local-contract`.
- Pre-edit work readiness: passed on `codex/module-run-v2-ai-task-lifecycle-local-contract`.

## Implementation

- Added provider-agnostic `taskStatus` lifecycle states to the local `ai-task-domain` model and API DTO contract:
  `pending`, `running`, `succeeded`, `failed`, `timeout`, `cancelled`.
- Extended validator normalization to trim and accept only registered `taskStatus` values.
- Extended service mapping so the read model includes `taskStatus` while retaining `runtimeStatus:
local_contract_only`.
- Focused tests verify lifecycle status output, unknown status rejection, nullable public references, and redaction of raw
  prompt, answer, and execution payload fields.

## Validation

```text
npm.cmd run test:unit -- src/server/validators/ai-task-domain.test.ts src/server/services/ai-task-domain-service.test.ts
Initial baseline attempt failed because node_modules was absent and vitest was not installed in the worktree.
```

```text
pnpm install --frozen-lockfile
First attempt timed out before completion.
```

```text
pnpm install --frozen-lockfile --prefer-offline
Exit code: 0
Lockfile was up to date; 738 packages were linked from the existing store.
No package.json or lockfile changes were made.
```

```text
npm.cmd run test:unit -- src/server/validators/ai-task-domain.test.ts src/server/services/ai-task-domain-service.test.ts
Exit code: 0
Test Files 2 passed (2)
Tests 5 passed (5)
```

```text
npm.cmd run test:unit -- src/server/validators/ai-task-domain.test.ts src/server/services/ai-task-domain-service.test.ts
RED: exit code 1
Expected failures showed taskStatus was not normalized, not returned, and unknown taskStatus was not rejected.
```

```text
npm.cmd run test:unit -- src/server/validators/ai-task-domain.test.ts src/server/services/ai-task-domain-service.test.ts
GREEN: exit code 0
Test Files 2 passed (2)
Tests 6 passed (6)
```

```text
npm.cmd run lint
Exit code: 0
```

```text
npm.cmd run typecheck
Exit code: 0
```

```text
git diff --check
Exit code: 0
```

```text
node .\node_modules\prettier\bin\prettier.cjs --check --ignore-unknown src\server\contracts\ai-task-domain-contract.ts src\server\models\ai-task-domain.ts src\server\validators\ai-task-domain.ts src\server\validators\ai-task-domain.test.ts src\server\services\ai-task-domain-service.ts src\server\services\ai-task-domain-service.test.ts docs\04-agent-system\state\project-state.yaml docs\04-agent-system\state\task-queue.yaml docs\05-execution-logs\task-plans\2026-06-09-module-run-v2-ai-task-lifecycle-local-contract.md docs\05-execution-logs\evidence\2026-06-09-module-run-v2-ai-task-lifecycle-local-contract.md docs\05-execution-logs\audits-reviews\2026-06-09-module-run-v2-ai-task-lifecycle-local-contract.md
Exit code: 0
All matched files use Prettier code style.
```

```text
Select-String -Path src\server\contracts\ai-task-domain-contract.ts,src\server\models\ai-task-domain.ts,src\server\validators\ai-task-domain.ts,src\server\services\ai-task-domain-service.ts,docs\05-execution-logs\evidence\2026-06-09-module-run-v2-ai-task-lifecycle-local-contract.md -Pattern 'ai-task-domain','localFullLoopGate','provider-agnostic','audit_log','ai_call_log','Cost Calibration Gate remains blocked'
Exit code: 0
Required anchors were present.
```

```text
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId module-run-v2-ai-task-lifecycle-local-contract
Exit code: 0
module-closeout readiness passed.
```

```text
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master
Exit code: 0
Git completion readiness inventory completed.
Tracked changes are task-scoped and unstaged; no untracked files.
No local commit, merge, push, or branch cleanup was executed because the seeded task approval does not separately
authorize those actions.
```

## Blocked Gates

- Provider calls and provider configuration were not touched.
- Env/secret files were not read or changed.
- Dependency declarations, packages, and lockfiles were not changed.
- Schema, migration, repository, mapper, REST API, Server Action, UI/browser, e2e, deploy, payment, and
  external-service surfaces were not touched.
- Cost Calibration Gate remains blocked.
