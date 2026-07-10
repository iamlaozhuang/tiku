# 2026-07-10 0704 Organization Tree Auth Inheritance Acceptance Evidence

## Scope

- taskId: `0704-org-tree-auth-inheritance-acceptance-2026-07-10`
- branch: `codex/0704-org-tree-auth-inheritance-acceptance`
- mode: validation-only localhost/source/test acceptance
- result: blocked, requires independent employee transfer mutation repair

## Readiness

- private credential index: metadata-only read pass
- core role labels found: 9
- credential values output: none
- browser/runtime login: not executed
- direct DB connection or mutation: not executed
- provider/staging/prod/deploy/env/secret/Cost Calibration: not executed

## Acceptance Result

Validated coverage:

- Organization node create, edit, disable, enable, parent hierarchy, depth, and public DTO boundaries are covered by source
  markers and focused tests.
- `specified_nodes` and `current_and_descendants` organization authorization coverage paths are present.
- Employee inheritance and effective authorization are covered by focused authorization tests.
- Employee unbind route/service/repository flow requires both organization and employee public route labels and releases
  enterprise visibility without exposing raw employee data.
- Organization admin role/session binding and scoped portal route boundaries are covered by focused tests.

Confirmed product capability gap against the 0704 acceptance standard:

- Employee transfer has a visible impact-review surface, but no actual transfer mutation route, service action, or
  repository transaction was found.
- Because transfer execution is missing, the current code cannot prove target-organization quota occupancy, old-organization
  access revocation, session revocation, unsubmitted old-organization training blocking, or historical submitted snapshot
  behavior after transfer.

Decision:

- Stop the serial queue before `0704-org-admin-surface-acceptance-2026-07-10`.
- Open and complete repair task `0704-org-tree-employee-transfer-fix-2026-07-10`.
- Rerun affected validation as `0704-org-tree-auth-inheritance-acceptance-rerun-2026-07-10` before continuing.

## Commands

- metadata-only private credential index preflight
  - result: pass, 9 role labels, credential values output none
- `rg` source marker checks for organization tree, descendant scope, specified nodes, disable/enable, unbind, role/session
  binding, and transfer execution markers
  - result: pass for tree/auth/unbind/session markers; transfer mutation route/service/repository markers not found
- `corepack pnpm@10.26.1 vitest run tests/unit/phase-11-system-ops-organization-management-loop.test.ts tests/unit/phase-11-system-ops-org-auth-management-loop.test.ts tests/unit/phase-20-ra-01-12-employee-transfer-unbind.test.ts tests/unit/phase-20-ra-01-10-organization-disable-termination.test.ts tests/unit/phase-20-ra-06-03-organization-employee-management-completion.test.ts tests/unit/phase-8-admin-organization-org-auth-runtime.test.ts tests/unit/organization/organization-auth-layering-lifecycle.test.ts src/server/services/organization-auth-service.test.ts src/server/services/effective-authorization-service.test.ts src/server/auth/local-session-runtime.test.ts tests/unit/admin-workspace-role-guard-contract.test.ts tests/unit/organization-portal-admin-entry-surface.test.ts`
  - result: pass, 12 files, 58 tests
- `corepack pnpm@10.26.1 run lint`
  - result: pass
- `corepack pnpm@10.26.1 run typecheck`
  - result: pass
- `git diff --check`
  - result: pass
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId 0704-org-tree-auth-inheritance-acceptance-2026-07-10`
  - result: pass
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId 0704-org-tree-auth-inheritance-acceptance-2026-07-10 -SkipRemoteAheadCheck`
  - result: pass

## Redaction Review

- Credentials, passwords, sessions, cookies, tokens, localStorage, Authorization headers: not recorded.
- Env values, DB URLs, raw DB rows, internal numeric ids: not recorded.
- Provider payloads, raw prompts, raw AI output: not recorded.
- Full question, paper, material, resource, chunk, employee raw answer, plaintext `redeem_code`: not recorded.
