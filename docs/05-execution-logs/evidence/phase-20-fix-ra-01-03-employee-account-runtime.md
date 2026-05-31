# Phase 20 Fix RA-01-03 Employee Account Runtime Evidence

## Summary

- Result: pass.
- Scope: implementation.
- Changed surfaces: active admin employee route runtime, local employee account repository/credential adapter, unit regression test, task plan/evidence/state.
- Gates: RED pass, targeted unit pass, related unit pass, full unit pass, e2e pass after rerun, readiness pass, naming pass, quality gate pass, git inventory pass, diff check pass.
- Forbidden scope (`forbiddenScope`): no env/dependency/schema/migration/staging/prod/cloud/deploy/real provider/destructive data operation.
- Residual gaps (`residualGaps`): initial full e2e had one transient admin audit navigation loading timeout; single failed spec rerun and full e2e rerun passed.

## Startup And Claim

- Date: 2026-05-31.
- Branch: `codex/phase-20-fix-ra-01-03-employee-account-runtime`.
- Base: `master` at `5d9bc34 docs(agent): close user disable termination task`.
- `git fetch origin`: pass.
- `git rev-list --left-right --count master...origin/master`: `0 0`.
- Local `codex/*` branches before claim: none.
- Worktrees before claim: main worktree only.
- Task claim preflight: `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-TaskClaimReadiness.ps1 -TaskId phase-20-fix-ra-01-03-employee-account-runtime` passed.
- Human approval: current user authorized this batch to complete local low-blocked queue tasks inside allowed files, including implementation, validation, commit, merge into `master`, push `origin master`, merged branch cleanup, and cleanup docs commit/push. Approval does not include dependency, package, lockfile, schema, drizzle, env, staging/prod, cloud, deploy, real provider, external service, force push, unknown worktree deletion, or destructive data operation.

## Source Finding

`F-RA-01-03-001`: active employee API did not expose the full single employee creation workflow required by US-01-03 and appeared restricted to `super_admin`.

## Implementation Notes

- Added a failing unit test for `POST /api/v1/employees` with `phone`, `name`, `initialPassword`, and `organizationPublicId` under `ops_admin`.
- Reused existing `employee-account-service`, validator, mapper, and contract for the full employee account path.
- Preserved existing `userPublicId` plus `organizationPublicId` bind path for existing employee management flows.
- Added local Postgres employee account repository and credential adapter using existing schema and Better Auth-compatible password hashing without package, lockfile, schema, or migration changes.
- Employee account create audit metadata is redacted and does not include plaintext `initialPassword` or session token.

## Command Evidence

### RED

Command:

```powershell
npm.cmd run test:unit -- tests/unit/phase-20-ra-01-03-employee-account-runtime.test.ts
```

Result: failed as expected before implementation.

Expected failure:

```text
expected { code: 422601, data: null, message: "Employee input is invalid." } to deeply equal { code: 0, message: "ok", data: ... }
```

Interpretation: the test correctly proved the active `/api/v1/employees` route still rejected the full employee account creation payload.

### GREEN

Command:

```powershell
npm.cmd run test:unit -- tests/unit/phase-20-ra-01-03-employee-account-runtime.test.ts
```

Result: pass.

Output summary:

```text
Test Files 1 passed (1)
Tests 1 passed (1)
```

### Related Unit

Command:

```powershell
npm.cmd run test:unit -- tests/unit/phase-20-ra-06-03-organization-employee-management-completion.test.ts
```

Result: pass.

Output summary:

```text
Test Files 1 passed (1)
Tests 3 passed (3)
```

Command:

```powershell
npm.cmd run test:unit -- src/server/services/employee-account-service.test.ts src/server/services/employee-account-route.test.ts src/server/validators/employee-account.test.ts src/server/mappers/employee-account-mapper.test.ts
```

Result: pass.

Output summary:

```text
Test Files 4 passed (4)
Tests 7 passed (7)
```

### Full Unit

Command:

```powershell
npm.cmd run test:unit
```

Result: pass.

Output summary:

```text
Test Files 141 passed (141)
Tests 593 passed (593)
```

### Lint And Typecheck

Command:

```powershell
npm.cmd run lint
```

Result: initial sandbox attempt failed with `EPERM` reading the ESLint executable under `node_modules`; approved rerun passed.

Command:

```powershell
npm.cmd run typecheck
```

Result: initial sandbox attempt failed with `EPERM` reading the TypeScript executable under `node_modules`; approved rerun found one real nullable `auth_user_id` type issue, which was fixed. Final approved rerun passed.

### E2E

Command:

```powershell
npm.cmd run test:e2e
```

Result: first full run failed one test:

```text
admin audit navigation > opens the existing AI audit log route from the admin shell
Expected body to contain "审计日志只读"; received loading text.
24 passed, 1 failed.
```

Systematic debugging result: the failed test was unrelated to employee account runtime and reproduced as a transient admin audit page loading timeout.

Command:

```powershell
npm.cmd run test:e2e -- e2e/admin-audit-navigation.spec.ts -g "opens the existing AI audit log route from the admin shell"
```

Result: pass.

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

### Git Completion Inventory

Command:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master
```

Result: pass.

Output summary:

```text
branch: codex/phase-20-fix-ra-01-03-employee-account-runtime
tracked changes: admin-organization-org-auth-runtime-repository.ts, admin-organization-org-auth-runtime.ts
untracked: task plan, phase-20 RA-01-03 unit test
result: git completion readiness inventory completed
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
test:unit: pass, 141 files / 593 tests
format:check: pass
```

### Final Pre-Commit Verification

Commands:

```powershell
git diff --check
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-AgentSystemReadiness.ps1
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-NamingConventions.ps1
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Invoke-QualityGate.ps1
npm.cmd run test:e2e
```

Result: pass.

Output summary:

```text
diff check: pass
git completion readiness inventory completed
agent system readiness: pass
naming convention scan completed
quality gate: lint/typecheck/test:unit/format:check pass
test:e2e: 25 passed
```

### Build

`npm.cmd run build` skipped because this task changed backend route/runtime behavior and unit/e2e coverage, not frontend rendering or build-system behavior.

## Security Review

- Task id: `phase-20-fix-ra-01-03-employee-account-runtime`.
- Branch: `codex/phase-20-fix-ra-01-03-employee-account-runtime`.
- Base: `master`.
- Reviewer: Codex.
- Review date: 2026-05-31.
- Files reviewed:
  - `src/server/services/admin-organization-org-auth-runtime.ts`
  - `src/server/repositories/admin-organization-org-auth-runtime-repository.ts`
  - `tests/unit/phase-20-ra-01-03-employee-account-runtime.test.ts`
- Risk types reviewed: `auth_permission_model`, `local_human_verification`, `evidence_integrity`.
- Abuse cases considered:
  - `content_admin` attempts employee account creation.
  - `ops_admin` creates a new employee with plaintext initial password.
  - existing bind-by-user path breaks after adding full account creation.
  - audit logs or evidence accidentally store plaintext password, session token, credential hash, or internal numeric ids.
- Data exposure review: response returns project DTOs with `publicId`; password hashes, auth session internals, credential values, and numeric ids are not returned.
- Authorization boundary review: `super_admin` and `ops_admin` remain allowed; `content_admin` remains denied by the existing `requireEmployeeManager` gate before any service or repository mutation.
- API contract review: route remains `POST /api/v1/employees`; request JSON uses camelCase; response envelope remains `{ code, message, data }`; external URL exposes no numeric database id.
- Test coverage and accepted gaps: unit coverage proves full employee account creation path, redacted audit metadata, and no existing-user mutation fallback for full payload; related unit, full unit, and full e2e gates passed. No accepted local validation gap.
- Verdict: `APPROVE`.
