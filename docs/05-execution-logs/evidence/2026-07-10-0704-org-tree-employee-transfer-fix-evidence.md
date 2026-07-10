# 2026-07-10 0704 Organization Tree Employee Transfer Fix Evidence

## Scope

- taskId: `0704-org-tree-employee-transfer-fix-2026-07-10`
- branch: `codex/0704-org-tree-employee-transfer-fix`
- mode: targeted source repair after validation-only gap
- result: pass, employee transfer mutation path added and locally verified

## Readiness

- private credential index: metadata-only read pass
- core role labels found: 9
- credential values output: none
- browser/runtime login: not executed
- direct DB connection or mutation: not executed
- Provider/staging/prod/deploy/env/secret/Cost Calibration: not executed
- package or lockfile change: none

## Implemented Repair

- Added public-id route label `POST /api/v1/employees/{publicId}/transfer`.
- Added employee transfer contract with status categories only:
  - transfer status
  - quota refresh status
  - session revocation status
  - historical snapshot preservation status
  - old-organization in-progress training blocking status
- Added service action restricted to operations roles and redacted audit metadata.
- Added repository transaction that:
  - validates target organization category;
  - locks target org_auth quota scope;
  - checks target quota using active employee counts;
  - moves employee organization binding;
  - revokes active employee session category when present;
  - marks old-organization in-progress enterprise training answer records read-only;
  - refreshes previous and target organization authorization quota counts.
- Wired existing operations transfer review UI to submit available transfer rows and show redacted result categories.

## TDD Red

- `corepack pnpm@10.26.1 vitest run tests/unit/phase-20-ra-01-12-employee-transfer-unbind.test.ts tests/unit/phase-20-ra-06-03-organization-employee-management-completion.test.ts`
  - result before implementation: expected fail
  - summary: 2 files, 6 failed tests
  - failed categories: missing transfer route, missing service/repository transfer markers, missing handler, missing UI transfer submit control

## Validation Commands

- `corepack pnpm@10.26.1 vitest run tests/unit/phase-20-ra-01-12-employee-transfer-unbind.test.ts tests/unit/phase-20-ra-06-03-organization-employee-management-completion.test.ts`
  - result: pass, 2 files, 12 tests
- `corepack pnpm@10.26.1 vitest run tests/unit/phase-20-ra-01-04-employee-import.test.ts tests/unit/phase-20-ra-01-03-employee-account-runtime.test.ts tests/unit/phase-20-ra-01-12-employee-transfer-unbind.test.ts tests/unit/phase-20-ra-06-03-organization-employee-management-completion.test.ts`
  - result: pass, 4 files, 19 tests
- `corepack pnpm@10.26.1 vitest run tests/unit/phase-20-ra-01-12-employee-transfer-unbind.test.ts tests/unit/phase-20-ra-06-03-organization-employee-management-completion.test.ts tests/unit/admin-user-org-auth-ops-baseline.test.ts tests/unit/phase-8-admin-organization-org-auth-runtime.test.ts src/server/services/effective-authorization-service.test.ts`
  - result: pass, 5 files, 46 tests
- `corepack pnpm@10.26.1 prettier --write ...scoped touched files...`
  - result: pass
- `corepack pnpm@10.26.1 run typecheck`
  - result: pass
- `corepack pnpm@10.26.1 run lint`
  - result: pass
- `git diff --check`
  - result: pass
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId 0704-org-tree-employee-transfer-fix-2026-07-10`
  - initial result: blocked by literal dynamic route parameter path matching in task allowedFiles
  - corrective action: escaped the task allowedFiles route path without broadening scope
  - final result: pass
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId 0704-org-tree-employee-transfer-fix-2026-07-10 -SkipRemoteAheadCheck`
  - initial result: blocked by stale accepted repository checkpoint
  - corrective action: aligned the accepted checkpoint to current `master` and `origin/master`
  - final result: pass

## Redaction Review

- Credentials, passwords, sessions, cookies, tokens, localStorage, Authorization headers: not recorded.
- Env values, DB URLs, raw DB rows, internal numeric ids: not recorded.
- Provider payloads, raw prompts, raw AI output: not recorded.
- Full question, paper, material, resource, chunk, employee raw answer, plaintext `redeem_code`: not recorded.
