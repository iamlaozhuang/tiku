# Phase 20 Fix RA-01-06 User Disable Termination Evidence

## Summary

- Result: pass.
- Scope: implementation.
- Changed surfaces: admin user lifecycle runtime, admin flow repository hook, unit regression test, task plan/evidence/state.
- Gates: targeted unit pass, full unit pass, e2e pass, readiness pass, naming pass, quality gate pass, git inventory pass, diff check pass.
- Forbidden scope (`forbiddenScope`): no env/dependency/schema/migration/staging/prod/cloud/deploy/real provider/destructive data operation.
- Residual gaps (`residualGaps`): none for local unit/e2e scope.

## Startup And Claim

- Date: 2026-05-31.
- Branch: `codex/phase-20-fix-ra-01-06-user-disable-termination`.
- Base: `master` at `972a345 docs(agent): close question knowledge binding task`.
- `git fetch origin`: pass.
- `git rev-list --left-right --count master...origin/master`: `0 0`.
- Local `codex/*` branches before claim: none.
- Worktrees before claim: main worktree only.
- Task claim preflight: `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-TaskClaimReadiness.ps1 -TaskId phase-20-fix-ra-01-06-user-disable-termination` passed.
- Human approval: current user requested continuing Phase 20, approved claiming the recommended task, and approved local task permissions within the queue allowed scope. This approval is limited to local `auth_permission_model` implementation/test/evidence for account disable termination. No dependency, package, lockfile, schema, drizzle, env, cloud, deploy, real provider, external service, staging/prod, force push, or destructive data operation is approved.

## Source Finding

`F-RA-01-06-001`: `/disable` and `/enable` routes exist. Disable updates user status, revokes sessions, and writes audit logs. No implementation was found that terminates in-progress `practice` or `mock_exam` sessions when a user is disabled.

## Command Evidence

### RED

Command:

```powershell
npm.cmd run test:unit -- tests/unit/phase-20-ra-01-06-user-disable-termination.test.ts
```

Result: failed as expected before implementation.

Expected failure:

```text
expected [disableUser, revokeUserSessions] to deeply equal [disableUser, revokeUserSessions, terminateUserActiveFlows]
```

Interpretation: the test correctly proved the missing account-disable active-flow termination hook.

### GREEN

Command:

```powershell
npm.cmd run test:unit -- tests/unit/phase-20-ra-01-06-user-disable-termination.test.ts
```

Result: pass.

Output summary:

```text
Test Files 1 passed (1)
Tests 1 passed (1)
```

### Full Unit

Command:

```powershell
npm.cmd run test:unit
```

Result: pass.

Output summary:

```text
Test Files 140 passed (140)
Tests 592 passed (592)
```

### E2E

Command:

```powershell
npm.cmd run test:e2e
```

Result: pass.

Output summary:

```text
25 passed
```

### Readiness

Command:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-AgentSystemReadiness.ps1
```

Result: pass.

Output summary:

```text
OK required files, scripts, skills, and Phase 7 anchors.
```

### Git Completion Inventory

Command:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master
```

Result: pass.

Output summary:

```text
branch: codex/phase-20-fix-ra-01-06-user-disable-termination
tracked changes: project-state.yaml, task-queue.yaml, admin-flow-runtime-repository.ts, admin-flow-runtime.ts
untracked: task plan, evidence, phase-20 RA-01-06 unit test
result: git completion readiness inventory completed
```

### Naming

Command:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-NamingConventions.ps1
```

Result: pass.

Output summary:

```text
naming convention scan completed
```

### Diff Check

Command:

```powershell
git diff --check
```

Result: pass.

### Quality Gate

Command:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Invoke-QualityGate.ps1
```

Result: pass.

Output summary:

```text
lint: pass
typecheck: pass
test:unit: pass, 140 files / 592 tests
format:check: pass
```

### Build

`npm.cmd run build` skipped because this task did not change frontend rendering or build-system behavior.

### Post-Evidence Format And Diff Checks

Command:

```powershell
node .\node_modules\prettier\bin\prettier.cjs --check docs\04-agent-system\state\project-state.yaml docs\04-agent-system\state\task-queue.yaml docs\05-execution-logs\task-plans\2026-05-31-phase-20-fix-ra-01-06-user-disable-termination.md docs\05-execution-logs\evidence\phase-20-fix-ra-01-06-user-disable-termination.md tests\unit\phase-20-ra-01-06-user-disable-termination.test.ts src\server\services\admin-flow-runtime.ts src\server\repositories\admin-flow-runtime-repository.ts
```

Result: initial sandbox attempt failed with `EPERM` reading the Prettier binary under `node_modules`; rerun with approved escalation passed.

Output summary:

```text
All matched files use Prettier code style.
```

Command:

```powershell
git diff --check
```

Result: pass after evidence update.

## Security Review

- Task id: `phase-20-fix-ra-01-06-user-disable-termination`.
- Branch: `codex/phase-20-fix-ra-01-06-user-disable-termination`.
- Base: `master`.
- Reviewer: Codex.
- Review date: 2026-05-31.
- Files reviewed:
  - `src/server/services/admin-flow-runtime.ts`
  - `src/server/repositories/admin-flow-runtime-repository.ts`
  - `tests/unit/phase-20-ra-01-06-user-disable-termination.test.ts`
- Risk types reviewed: `auth_permission_model`, `local_human_verification`, `evidence_integrity`.
- Abuse cases considered:
  - content admin attempts to disable users.
  - unknown `userPublicId` should not terminate unrelated flows.
  - disabled user should not keep active session or active `practice` / `mock_exam` rows.
  - evidence must not expose session tokens, passwords, env values, or internal database ids.
- Data exposure review: API response remains `{ code, message, data }` with `data: null`; no internal ids, password hashes, sessions, or tokens are returned.
- Authorization boundary review: existing `super_admin` / `ops_admin` lifecycle permission boundary is preserved; `content_admin` denial path remains unchanged.
- API contract review: route remains `POST /api/v1/users/{publicId}/disable`; JSON envelope is unchanged; URL continues to use external `publicId`.
- Test coverage and accepted gaps: unit coverage proves successful disable calls active-flow termination after session revocation; full unit and e2e gates passed. No accepted local validation gap.
- Verdict: `APPROVE`.
