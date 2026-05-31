# Phase 20 Fix RA-01-12 Employee Transfer Unbind Evidence

## Task

- Task id: `phase-20-fix-ra-01-12-employee-transfer-unbind`
- Branch: `codex/phase-20-fix-ra-01-12-employee-transfer-unbind`
- Plan: `docs/05-execution-logs/task-plans/2026-05-31-phase-20-fix-ra-01-12-employee-transfer-unbind.md`
- Scope: local runtime employee organization-path unbind, quota release, and org_auth visibility removal after unbind.

## Claim Readiness

Command:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-TaskClaimReadiness.ps1 -TaskId phase-20-fix-ra-01-12-employee-transfer-unbind
```

Result:

```text
task claim readiness passed
```

## TDD

### RED

Command:

```powershell
npm.cmd run test:unit -- tests/unit/phase-20-ra-01-12-employee-transfer-unbind.test.ts
```

Result:

```text
Test Files 1 failed
Tests 5 failed
Failures confirmed the missing organization-scoped route, missing organizationPublicId repository guard, missing user_type employee filters for quota/effective org_auth, and missing unbind visibility constraints.
```

### GREEN

Command:

```powershell
npm.cmd run test:unit -- tests/unit/phase-20-ra-01-12-employee-transfer-unbind.test.ts
```

Result:

```text
Test Files 1 passed
Tests 5 passed
```

### Targeted Regression

Command:

```powershell
npm.cmd run test:unit -- tests/unit/phase-20-ra-01-12-employee-transfer-unbind.test.ts tests/unit/phase-20-ra-06-03-organization-employee-management-completion.test.ts tests/unit/phase-20-ra-01-11-org-auth-quota-atomicity.test.ts src/server/services/effective-authorization-service.test.ts src/server/services/practice-service.test.ts src/server/services/mock-exam-service.test.ts src/server/services/exam-report-service.test.ts src/server/services/mistake-book-service.test.ts
```

Result:

```text
Test Files 8 passed
Tests 67 passed
```

## Validation

### Local CI

Command:

```powershell
npm.cmd run lint
```

Result:

```text
passed
```

Command:

```powershell
npm.cmd run typecheck
```

Result:

```text
passed
```

Command:

```powershell
npm.cmd run format:check
```

Result:

```text
All matched files use Prettier code style.
```

### Full Unit

Command:

```powershell
npm.cmd run test:unit
```

Result:

```text
Test Files 145 passed
Tests 604 passed
```

### Full E2E

Command:

```powershell
npm.cmd run test:e2e
```

Result:

```text
26 passed
```

### Agent Gates

Command:

```powershell
git diff --check
```

Result:

```text
passed
```

Command:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-AgentSystemReadiness.ps1
```

Result:

```text
passed
```

Command:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master
```

Result:

```text
git completion readiness inventory completed
```

Command:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-NamingConventions.ps1
```

Result:

```text
naming convention scan completed
```

Command:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Invoke-QualityGate.ps1
```

Result:

```text
lint passed
typecheck passed
test:unit passed: Test Files 145 passed, Tests 604 passed
format:check passed
```

### Build

Build was run because this task adds an App Router API route.

Command:

```powershell
npm.cmd run build
```

Result:

```text
Compiled successfully.
Route present: /api/v1/organizations/[publicId]/employees/[employeePublicId]/unbind
```

Note: Next.js reported `.env.local` as an environment source during build, but no env file content or secret value was read, changed, copied, or recorded in this evidence.

## Git Closeout

- Implementation commit: `c3822656b1d6fedbde2c78f527fe0f2322b71885`
- Merge commit on `master`: `ac59aa53861b026b498b51b52ae334eaaab500e9`
- Push: `origin/master` updated from `70fd7b6` to `ac59aa5`
- Short-lived branch cleanup: `codex/phase-20-fix-ra-01-12-employee-transfer-unbind` deleted after merge.
- Cleanup docs/state commit: pending.

## Security Review

- `auth_permission_model`: organization-scoped unbind requires admin employee mutation permission, uses public IDs in the URL, validates employee/organization binding in repository lookup, revokes active sessions, and removes org_auth effectiveness by requiring `user_type = employee`.
- `local_human_verification`: local-only commands, unit/e2e/build verification, and route tests only; no staging/prod/cloud/real provider access.
- `evidence_integrity`: evidence contains redacted command summaries only; no raw secrets, passwords, tokens, provider payloads, or private environment values.
- Secrets: no token, secret, password, `.env.local`, or `.env.example` access or modification.
- Public IDs: external URLs and response payloads use public IDs only.
- API JSON: camelCase response fields are required.
- API envelope: `{ code, message, data, pagination? }` is required.
