# Evidence: organization-admin-session-role-mapping-runtime-repair-planning-2026-06-24

## Summary

- Task id: `organization-admin-session-role-mapping-runtime-repair-planning-2026-06-24`.
- Branch: `codex/org-admin-session-role-mapping-planning-20260625`.
- Result: pass_source_repair_plan_and_expected_fail_red_test_recorded_no_final_pass.
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
- `docs/01-requirements/advanced-edition/modules/06-ops-authorization-quota.md`.
- `docs/01-requirements/advanced-edition/modules/08-organization-ai-generation.md`.
- `docs/01-requirements/traceability/2026-06-21-org-auth-scope-product-decision.md`.
- `docs/01-requirements/traceability/2026-06-24-role-separated-mvp-requirement-alignment.md`.
- `docs/01-requirements/traceability/role-experience-fulfillment-matrix.md`.
- `docs/05-execution-logs/evidence/2026-06-24-organization-admin-local-db-migration-seed-and-runtime-rerun-approval.md`.
- `docs/05-execution-logs/audits-reviews/2026-06-24-organization-admin-local-db-migration-seed-and-runtime-rerun-approval.md`.

## Requirement / Role / Acceptance Mapping Result

| Role                 | Required result                                                                     | Evidence status                                            |
| -------------------- | ----------------------------------------------------------------------------------- | ---------------------------------------------------------- |
| `org_standard_admin` | Pure organization admin workspace; no global ops workspace.                         | Red-test planning in progress after prior runtime failure. |
| `org_advanced_admin` | Organization workspace plus advanced organization entries; no global ops workspace. | Deferred until standard role mapping is repaired.          |
| `ops_admin`          | Global operations workspace remains valid for true ops admin accounts.              | Must not be confused with organization admin roles.        |
| `super_admin`        | Global admin remains privileged.                                                    | Out of scope except as a deny-contamination boundary.      |

## Source Diagnosis

- Login page routing is driven by `payload.data.user.adminRoles`.
- Pure organization admin roles already map to `/organization/portal`.
- Previous runtime evidence means the effective login response/session was not pure organization admin.
- Source risk identified: role contamination containing both an organization admin role and `ops_admin` is currently treated as ops by the post-login boundary.
- Source risk identified: admin login lookup by phone does not filter active rows or specify deterministic ordering.

No credential values, tokens, DB URLs, raw DB rows, screenshots, traces, or browser storage were recorded.

## Commands

- `npm.cmd run test:unit -- src/server/contracts/user-auth/session-boundary.test.ts`
  - Result: pass.
  - Output summary: 1 test file passed; 1 passed test; 1 expected fail.
  - Interpretation: pure organization admin routing is green; contaminated organization admin plus `ops_admin` role is
    captured as an expected failing red test and currently routes unsafely to the global operations workspace.
- `npx.cmd prettier --write --ignore-unknown ...`
  - Result: pass.
- `npm.cmd run test:unit -- src/server/contracts/user-auth/session-boundary.test.ts`
  - Result: pass after formatting.
  - Output summary: 1 test file passed; 1 passed test; 1 expected fail.
- `git diff --check`
  - Result: pass.
- `npx.cmd prettier --check --ignore-unknown ...`
  - Result: pass.
  - Output summary: all matched files use Prettier code style.
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId organization-admin-session-role-mapping-runtime-repair-planning-2026-06-24`
  - Result: pass.
  - Output summary: pre-commit hardening passed; 6 task-scope files scanned.
- First run of `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId organization-admin-session-role-mapping-runtime-repair-planning-2026-06-24 -SkipRemoteAheadCheck`
  - Result: fail.
  - Output summary: hard block for repository SHA drift because state still recorded the previous master/origin
    checkpoint.
  - Remediation: updated `project-state.yaml` repository checkpoint to the actual current `master` and `origin/master`
    SHA at task entry.
- Second run of `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId organization-admin-session-role-mapping-runtime-repair-planning-2026-06-24 -SkipRemoteAheadCheck`
  - Result: pass.
  - Output summary: pre-push readiness passed; master, origin/master, stateMaster, and stateOriginMaster aligned.

## Result

- Task plan created with SSOT Read List, Requirement/Role/Acceptance Mapping Result, and allowed file range.
- Queue/state files now materialize the task and its closeout policy.
- Focused red test added in `src/server/contracts/user-auth/session-boundary.test.ts`.
- Root cause narrowed to login/session role mapping rather than organization workspace rendering:
  - login routing depends on login response roles;
  - pure organization admin roles already route to `/organization/portal`;
  - contaminated organization admin role sets currently route to `/ops/users`;
  - admin login lookup still has a deterministic-selection risk when stale or duplicated admin rows exist.
- No source implementation fix, DB connection/query, browser runtime, credential reading, migration, seed, Provider,
  external-service, or final Pass work was performed.

## Next Recommended Task

- `organization-admin-session-role-mapping-runtime-repair-2026-06-24`.
- Scope should allow a production source fix only after reviewing this red test and source diagnosis.
