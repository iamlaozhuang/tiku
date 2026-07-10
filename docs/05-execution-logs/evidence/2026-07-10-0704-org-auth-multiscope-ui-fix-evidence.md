# 2026-07-10 0704 Org Auth Multiscope UI Fix Evidence

## Scope

- taskId: `0704-org-auth-multiscope-ui-fix-2026-07-10`
- branch: `codex/0704-org-auth-multiscope-ui-fix`
- mode: targeted implementation repair
- sensitive boundary: no credentials, token, cookie, env value, DB URL, DB raw row, internal numeric id, provider payload, raw prompt, raw AI output, full question/paper/material/resource/chunk, employee raw answer, or plaintext redeem code recorded

## Changes Verified

- Organization authorization create UI now supports multiple `profession` selections and multiple `level` selections.
- Create preview shows atomic profession-level count and per-atom labels before submit.
- Frontend submits one package payload with `scopeSelections`.
- Server validator accepts legacy single-scope input and package `scopeSelections`, then expands to atomic org_auth inputs.
- Service/runtime checks overlap per atom before create and returns both `orgAuth` and `orgAuths`.
- No package/lockfile, schema, migration, seed, provider, browser, direct DB, staging, prod, deploy, or Cost Calibration action was executed.

## Commands

- `corepack pnpm@10.26.1 vitest run src/server/services/organization-auth-service.test.ts src/server/services/organization-auth-route.test.ts tests/unit/phase-11-system-ops-org-auth-management-loop.test.ts tests/unit/admin-user-org-auth-ops-baseline.test.ts`
  - result: initial red captured before implementation, expected failures for missing `scopeSelections` contract and UI test ids
- `corepack pnpm@10.26.1 vitest run src/server/validators/org-auth.test.ts src/server/services/organization-auth-service.test.ts src/server/services/organization-auth-route.test.ts tests/unit/phase-11-system-ops-org-auth-management-loop.test.ts tests/unit/admin-user-org-auth-ops-baseline.test.ts`
  - result: pass, 5 files, 36 tests
- `corepack pnpm@10.26.1 typecheck`
  - result: pass
- `corepack pnpm@10.26.1 lint`
  - result: pass
- `git diff --check`
  - result: pass
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId 0704-org-auth-multiscope-ui-fix-2026-07-10`
  - result: pass
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId 0704-org-auth-multiscope-ui-fix-2026-07-10 -SkipRemoteAheadCheck`
  - result: initial blocked for missing evidence/audit and repository checkpoint drift before this evidence/state update; final rerun pass

## Readiness

- account readiness: metadata-only private index preflight pass, 9 core role labels found
- product route/browser runtime: not executed
- direct DB connection/mutation: not executed
- provider-enabled path: not executed
- subject axis: not added because current `org_auth` schema has no subject column; subject-scoped persistence remains deferred to a future reviewed schema task
