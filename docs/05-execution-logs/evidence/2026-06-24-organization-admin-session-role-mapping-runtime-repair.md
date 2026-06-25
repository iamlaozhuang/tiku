# Evidence: organization-admin-session-role-mapping-runtime-repair-2026-06-24

## Summary

- Task id: `organization-admin-session-role-mapping-runtime-repair-2026-06-24`.
- Branch: `codex/org-admin-session-role-mapping-runtime-repair-20260625`.
- Status: closed.
- Result: pass_source_repair_unit_validated_no_final_pass.
- Final Pass claim: false.

## SSOT Read List

- `AGENTS.md`.
- `docs/03-standards/code-taste-ten-commandments.md`.
- `docs/02-architecture/adr/`.
- `docs/04-agent-system/operating-manual.md`.
- `docs/04-agent-system/sop/requirement-ssot-reading-governance.md`.
- `docs/04-agent-system/sop/task-lifecycle-governance.md`.
- `docs/04-agent-system/state/project-state.yaml`.
- `docs/04-agent-system/state/task-queue.yaml`.
- `docs/01-requirements/00-index.md`.
- `docs/01-requirements/modules/01-user-auth.md`.
- `docs/01-requirements/modules/06-admin-ops.md`.
- `docs/01-requirements/advanced-edition/00-index.md`.
- `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`.
- `docs/01-requirements/advanced-edition/modules/04-organization-training.md`.
- `docs/01-requirements/advanced-edition/modules/08-organization-ai-generation.md`.
- `docs/01-requirements/traceability/2026-06-21-org-auth-scope-product-decision.md`.
- `docs/01-requirements/traceability/2026-06-24-role-separated-mvp-requirement-alignment.md`.
- `docs/01-requirements/traceability/role-experience-fulfillment-matrix.md`.
- `docs/05-execution-logs/evidence/2026-06-24-organization-admin-session-role-mapping-runtime-repair-planning.md`.
- `docs/05-execution-logs/audits-reviews/2026-06-24-organization-admin-session-role-mapping-runtime-repair-planning.md`.

## Requirement Mapping Result

| Role                 | Required result                                                                            | Evidence status                                             |
| -------------------- | ------------------------------------------------------------------------------------------ | ----------------------------------------------------------- |
| `org_standard_admin` | Organization workspace only; no global ops workspace or redeem-code/admin-global surfaces. | Red/green source repair in progress.                        |
| `org_advanced_admin` | Organization workspace with advanced organization entries; no global ops workspace.        | Covered by same source boundary and deferred runtime rerun. |
| `ops_admin`          | Global operations workspace remains valid for true ops admin accounts.                     | Must remain green in existing layout tests.                 |
| `content_admin`      | Content workspace remains separated from ops and organization.                             | Must remain green in existing layout tests.                 |
| `super_admin`        | Global super admin remains privileged.                                                     | Preserved as explicit override.                             |

## Commands

- Red: `npm.cmd run test:unit -- src/server/contracts/user-auth/session-boundary.test.ts tests/unit/admin-dashboard-layout-navigation.test.ts`
  - Result: fail as expected.
  - Output summary: 2 test files failed; 2 failed tests and 7 passed tests.
  - Failure summary: contaminated organization admin login still resolved `/ops/users`; contaminated organization admin session still rendered the operations workspace.
- First green attempt after source repair: `npm.cmd run test:unit -- src/server/contracts/user-auth/session-boundary.test.ts tests/unit/admin-dashboard-layout-navigation.test.ts`
  - Result: fail due test assertion text encoding only.
  - Output summary: session-boundary test passed; layout behavior denied access, but the new test expected a mis-encoded denial string.
  - Remediation: changed the new assertion to real Chinese visible text `无权访问此后台工作区`.
- Green: `npm.cmd run test:unit -- src/server/contracts/user-auth/session-boundary.test.ts tests/unit/admin-dashboard-layout-navigation.test.ts`
  - Result: pass.
  - Output summary: 2 test files passed; 9 tests passed.
- `npx.cmd prettier --write --ignore-unknown ...`
  - Result: pass.
  - Output summary: allowed task files formatted or unchanged.
- Post-format focused unit: `npm.cmd run test:unit -- src/server/contracts/user-auth/session-boundary.test.ts tests/unit/admin-dashboard-layout-navigation.test.ts`
  - Result: pass.
  - Output summary: 2 test files passed; 9 tests passed.
- `npm.cmd run lint`
  - Result: pass.
- `npm.cmd run typecheck`
  - Result: pass.
- `npx.cmd prettier --check --ignore-unknown ...`
  - Result: pass.
  - Output summary: all matched files use Prettier code style.
- `git diff --check`
  - Result: pass.
- First run of `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId organization-admin-session-role-mapping-runtime-repair-2026-06-24`
  - Result: fail.
  - Output summary: task plan missing because the queue item had `taskPlanPath` but not the script-required `planPath`.
  - Remediation: added `planPath` with the same task-plan path.
- Second run of `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId organization-admin-session-role-mapping-runtime-repair-2026-06-24`
  - Result: pass.
  - Output summary: SSOT Read List present, requirement mapping present, and 9 scoped files passed scope/sensitive-evidence/terminology scans.
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId organization-admin-session-role-mapping-runtime-repair-2026-06-24 -SkipRemoteAheadCheck`
  - Result: pass.
  - Output summary: branch, `master`, `origin/master`, state master, and state origin master aligned at task-entry SHA; evidence and audit paths present.

## Implementation Result

- `resolveAdminWorkspaceLandingPath` now keeps `super_admin` as the explicit global override and routes any non-super organization admin role context to `/organization/portal`, even if a legacy `ops_admin` role is also present.
- `AdminDashboardLayout` now denies ops/content workspace access for non-super sessions that contain `org_standard_admin` or `org_advanced_admin`; the organization workspace remains the only allowed backend workspace for that context.
- Existing true `ops_admin`, `content_admin`, and `super_admin` tests stayed green in the focused layout suite.
- No new English UI strings were introduced; the new assertion checks the existing Chinese denial title.

## Result

- Source repair behavior: pass in focused unit tests.
- Final mechanism gates: pass.
- No credential values, tokens, DB URLs, raw DB rows, browser storage, screenshots, traces, Provider payloads, plaintext `redeem_code`, or secrets are recorded.
- No browser runtime, dev server start, database query/write/migration/seed, Provider, staging/prod, payment, external-service, or final Pass work is approved or performed in this task.
