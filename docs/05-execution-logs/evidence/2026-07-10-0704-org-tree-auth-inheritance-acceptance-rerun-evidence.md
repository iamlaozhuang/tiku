# 2026-07-10 0704 Organization Tree Auth Inheritance Acceptance Rerun Evidence

## Scope

- taskId: `0704-org-tree-auth-inheritance-acceptance-rerun-2026-07-10`
- branch: `codex/0704-org-tree-auth-inheritance-acceptance-rerun`
- mode: validation-only localhost/source/test rerun after repair
- result: pass, employee transfer gap closed and affected organization tree/auth inheritance acceptance passed

## Readiness

- private credential index: metadata-only read pass
- core role labels found: 9
- credential values output: none
- browser/runtime login: not executed
- direct DB connection or mutation: not executed
- Provider/staging/prod/deploy/env/secret/Cost Calibration: not executed
- package or lockfile change: none

## Acceptance Result

Validated coverage after `0704-org-tree-employee-transfer-fix-2026-07-10`:

- Organization node create, edit, disable, enable, parent hierarchy, depth, and public DTO boundary coverage remains intact.
- `specified_nodes` and `current_and_descendants` organization authorization coverage paths remain present.
- Employee authorization inheritance remains service-computed from current `org_auth` context.
- Employee transfer mutation route, service action, repository transaction, and operations UI submit path are present.
- Transfer convergence covers target authorization quota category, previous/target quota refresh category, employee session
  revocation category, old-organization in-progress enterprise training blocking category, and historical snapshot
  preservation category.
- Organization-scoped employee unbind and organization admin route/session boundaries remain covered.

Decision:

- The prior blocked finding is closed by repair plus rerun.
- Queue may continue to `0704-org-admin-surface-acceptance-2026-07-10`.

## Commands

- metadata-only private credential index preflight
  - result: pass, 9 role labels, credential values output none
- static source marker checks for repaired transfer route/service/repository/UI, quota lock, session revocation, old
  training blocking, and result panel
  - result: pass, 9 checks
- `corepack pnpm@10.26.1 vitest run tests/unit/phase-11-system-ops-organization-management-loop.test.ts tests/unit/phase-11-system-ops-org-auth-management-loop.test.ts tests/unit/phase-20-ra-01-12-employee-transfer-unbind.test.ts tests/unit/phase-20-ra-01-10-organization-disable-termination.test.ts tests/unit/phase-20-ra-06-03-organization-employee-management-completion.test.ts tests/unit/phase-8-admin-organization-org-auth-runtime.test.ts tests/unit/organization/organization-auth-layering-lifecycle.test.ts src/server/services/organization-auth-service.test.ts src/server/services/effective-authorization-service.test.ts src/server/auth/local-session-runtime.test.ts tests/unit/admin-workspace-role-guard-contract.test.ts tests/unit/organization-portal-admin-entry-surface.test.ts`
  - result: pass, 12 files, 61 tests
- `corepack pnpm@10.26.1 prettier --write --ignore-unknown ...scoped docs...`
  - result: pass, unchanged
- `corepack pnpm@10.26.1 run lint`
  - result: pass
- `corepack pnpm@10.26.1 run typecheck`
  - result: pass
- `git diff --check`
  - result: pass
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId 0704-org-tree-auth-inheritance-acceptance-rerun-2026-07-10`
  - result: pass
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId 0704-org-tree-auth-inheritance-acceptance-rerun-2026-07-10 -SkipRemoteAheadCheck`
  - result: pass

## Redaction Review

- Credentials, passwords, sessions, cookies, tokens, localStorage, Authorization headers: not recorded.
- Env values, DB URLs, raw DB rows, internal numeric ids: not recorded.
- Provider payloads, raw prompts, raw AI output: not recorded.
- Full question, paper, material, resource, chunk, employee raw answer, plaintext `redeem_code`: not recorded.
