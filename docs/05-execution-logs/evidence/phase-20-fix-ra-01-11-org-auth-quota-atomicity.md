# Phase 20 Fix RA-01-11 Org Auth Quota Atomicity Evidence

## Summary

- Result: pass.
- Scope: implementation.
- Changed surfaces: `org_auth` repository creation atomicity, targeted unit regression, agent task state and evidence.
- Gates: targeted RED/GREEN pass; lint/typecheck pass after sandbox EPERM rerun; full unit/e2e/readiness/naming/git inventory/quality gates pass; build skipped because no frontend route, rendering, build config, or UI behavior changed.
- Forbidden scope (`forbiddenScope`): no env, dependency, schema, migration, staging, prod, cloud, deploy, real provider, or lockfile change.
- Residual gaps (`residualGaps`): implementation commit, merge, push, and cleanup closeout pending.

## Metadata

- Task id: `phase-20-fix-ra-01-11-org-auth-quota-atomicity`.
- Branch: `codex/phase-20-fix-ra-01-11-org-auth-quota-atomicity`.
- Base: `master` at `782f51f045afd09fc63785d1d581653997790cc7`.
- Task plan: `docs/05-execution-logs/task-plans/2026-05-31-phase-20-fix-ra-01-11-org-auth-quota-atomicity.md`.
- Finding: Phase 18 RA-01 `F-RA-01-11-001`.

## Startup And Claim

- Fresh `git fetch origin master`: pass.
- `git status --short --branch`: `## master...origin/master`.
- `git rev-list --left-right --count master...origin/master`: `0 0`.
- Residual `codex/*` branch check before claim: none.
- Worktree inventory before claim: only `D:/tiku`.
- Claim branch: `codex/phase-20-fix-ra-01-11-org-auth-quota-atomicity`.

Command:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-TaskClaimReadiness.ps1 -TaskId phase-20-fix-ra-01-11-org-auth-quota-atomicity
```

Result: pass.

Output summary:

```text
status: pending
dependencies: phase-18-audit-ra-01-user-auth-authorization
riskType: auth_permission_model / local_human_verification / evidence_integrity
task claim readiness passed
```

## Implementation Notes

- Added a targeted unit regression for `org_auth` quota atomicity.
- Moved repository `createOrgAuth` into one `database.transaction`.
- Added transaction-level PostgreSQL advisory locks over requested `profession` / `level` / covered organization scope before final overlap and quota checks.
- Rechecked active overlapping `org_auth` rows inside the locked transaction before counting active employees and inserting records.
- Kept `org_auth` creation response shape unchanged and kept public identifiers only in DTOs.

## Command Evidence

### RED

Command:

```powershell
npm.cmd run test:unit -- tests/unit/phase-20-ra-01-11-org-auth-quota-atomicity.test.ts
```

Result: expected fail before implementation.

Output summary:

```text
Test Files  1 failed (1)
Tests       2 failed (2)
missing database.transaction
missing lockOrgAuthQuotaScope / advisory lock path
```

### GREEN

Command:

```powershell
npm.cmd run test:unit -- tests/unit/phase-20-ra-01-11-org-auth-quota-atomicity.test.ts
```

Result: pass.

Output summary:

```text
Test Files  1 passed (1)
Tests       2 passed (2)
```

### Targeted Regression

Command:

```powershell
npm.cmd run test:unit -- tests/unit/phase-20-ra-01-11-org-auth-quota-atomicity.test.ts tests/unit/phase-11-system-ops-org-auth-management-loop.test.ts tests/unit/phase-8-admin-organization-org-auth-runtime.test.ts tests/unit/phase-20-ra-06-03-organization-employee-management-completion.test.ts tests/unit/phase-20-ra-06-04-org-auth-detail-route-alignment.test.ts
```

Result: pass.

Output summary:

```text
Test Files  5 passed (5)
Tests       16 passed (16)
```

### Lint And Typecheck

Commands:

```powershell
npm.cmd run typecheck
npm.cmd run lint
```

Initial sandbox result: both failed with `EPERM` while Node attempted to open package binaries under `node_modules/.pnpm`.

Rerun outside sandbox per permission policy: pass.

Output summary:

```text
typecheck: pass
lint: pass
```

### Full Unit

Command:

```powershell
npm.cmd run test:unit
```

Result: pass.

Output summary:

```text
Test Files  144 passed (144)
Tests       599 passed (599)
```

### Full E2E

Command:

```powershell
npm.cmd run test:e2e
```

Result: pass.

Output summary:

```text
26 passed
```

### Diff And Agent Gates

Commands:

```powershell
git diff --check
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-AgentSystemReadiness.ps1
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-NamingConventions.ps1
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master
```

Result: pass.

Output summary:

```text
diff check: pass
agent readiness: pass
naming convention scan completed
git completion readiness inventory completed
```

### Format And Quality Gate

Commands:

```powershell
npm.cmd run format:check
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Invoke-QualityGate.ps1
```

Result: initial `format:check` inside `Invoke-QualityGate.ps1` failed after `Update-TaskStatus.ps1` rewrote `task-queue.yaml` with mojibake and malformed YAML. The queue file was restored from `HEAD` and the target status was re-applied with `apply_patch`.

Final result: pass.

Output summary:

```text
format:check: pass, all matched files use Prettier code style
Invoke-QualityGate.ps1: pass
lint: pass
typecheck: pass
test:unit: pass, 144 files / 599 tests
format:check: pass
```

### Build

`npm.cmd run build` skipped because this task changed backend repository mutation atomicity, tests, and execution docs/state only. It did not change frontend pages, routes, build configuration, or rendering behavior.

## Security Review

- Task id: `phase-20-fix-ra-01-11-org-auth-quota-atomicity`.
- Reviewer: Codex.
- Review date: 2026-05-31.
- Risk types reviewed: `auth_permission_model`, `local_human_verification`, `evidence_integrity`.
- Files reviewed:
  - `src/server/repositories/admin-organization-org-auth-runtime-repository.ts`
  - `tests/unit/phase-20-ra-01-11-org-auth-quota-atomicity.test.ts`
- Abuse cases considered:
  - Two admins create overlapping active `org_auth` records concurrently.
  - Quota count is checked before another overlapping creation commits.
  - Partial `org_auth` row is inserted without matching `org_auth_organization` rows.
  - Evidence records tokens, secrets, passwords, internal numeric ids, or raw private payloads.
- Authorization boundary review: service-level mutation permission remains unchanged and restricted to `super_admin` / `ops_admin`; `content_admin` remains denied by existing tests.
- Data exposure review: DTO mapping still exposes `publicId` and camelCase fields only; internal numeric ids stay inside repository code and are not added to API responses.
- API contract review: response envelope remains `{ code, message, data, pagination? }`; optional nullable fields remain `null`; no API JSON snake_case added.
- Local human verification: runtime behavior is local-only; no staging/prod/cloud/deploy/provider action occurred.
- Evidence integrity: command output is summarized and redacted; no `.env.local`, token, secret, password, generated credential, internal auto-increment id, raw provider payload, raw prompt, raw answer, or full content is recorded.
- Verdict: `APPROVE`.

## Validation Summary

- RED/GREEN targeted unit: pass after expected RED.
- Targeted regression: pass.
- `npm.cmd run lint`: pass.
- `npm.cmd run typecheck`: pass.
- `npm.cmd run test:unit`: pass.
- `npm.cmd run test:e2e`: pass.
- `git diff --check`: pass.
- `Test-AgentSystemReadiness.ps1`: pass.
- `Test-GitCompletionReadiness.ps1 -BaseBranch master`: pass.
- `Test-NamingConventions.ps1`: pass.
- `Invoke-QualityGate.ps1`: pass.
- `npm.cmd run build`: skipped, reason above.

## Git Closeout

- Implementation commit: `43b3c815c2066d4b55429b9bdf4e76698ff7f9c4` (`fix(auth): make org auth quota creation atomic`).
- Merge commit on `master`: `fb0b4d2f4ad0f7dfd80a73b238f00c742f8151af` (`merge: phase 20 org auth quota atomicity`).
- Master validation after merge:
  - `git diff --check`: pass.
  - `Test-AgentSystemReadiness.ps1`: pass.
  - `Test-NamingConventions.ps1`: pass.
  - `Test-GitCompletionReadiness.ps1 -BaseBranch origin/master`: pass; `master` was ahead of `origin/master` by implementation and merge commits before push.
  - `npm.cmd run test:unit`: pass; 144 files / 599 tests.
  - `npm.cmd run test:e2e`: pass; 26 tests.
  - `Invoke-QualityGate.ps1`: pass; lint, typecheck, `test:unit`, and `format:check`.
- Push `origin master`: pass; `origin/master` advanced from `782f51f045afd09fc63785d1d581653997790cc7` to `fb0b4d2f4ad0f7dfd80a73b238f00c742f8151af`.
- Short-lived branch cleanup: pass; deleted `codex/phase-20-fix-ra-01-11-org-auth-quota-atomicity` after merge and push.
- Cleanup docs commit: pending.
