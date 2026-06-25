# Evidence: organization-admin-runtime-session-hydration-repair-planning-2026-06-24

## Summary

- Task id: `organization-admin-runtime-session-hydration-repair-planning-2026-06-24`.
- Branch: `codex/org-admin-session-hydration-planning-20260625`.
- Task kind: `docs_requirement_alignment`.
- Status: closed.
- Result: pass_focused_root_cause_planning_no_final_pass.
- Closeout approval consumed: current user approved closeout on 2026-06-25.
- Final standard/advanced MVP Pass claim: false.

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
- `docs/01-requirements/traceability/2026-06-24-role-separated-mvp-requirement-alignment.md`.
- `docs/01-requirements/traceability/role-experience-fulfillment-matrix.md`.
- `docs/05-execution-logs/evidence/2026-06-23-acceptance-role-separated-account-local-account-provisioning-and-credential-handoff-execution.md`.
- `docs/05-execution-logs/evidence/2026-06-23-acceptance-role-separated-account-local-account-runtime-rerun.md`.
- `docs/05-execution-logs/evidence/2026-06-24-organization-admin-local-db-migration-seed-and-runtime-rerun-approval.md`.
- `docs/05-execution-logs/evidence/2026-06-24-organization-admin-session-role-mapping-runtime-repair-planning.md`.
- `docs/05-execution-logs/evidence/2026-06-24-organization-admin-session-role-mapping-runtime-repair.md`.
- `docs/05-execution-logs/evidence/2026-06-24-organization-admin-workspace-runtime-rerun-after-session-role-repair.md`.
- `docs/05-execution-logs/audits-reviews/2026-06-24-organization-admin-workspace-runtime-rerun-after-session-role-repair.md`.

## Requirement Mapping Result

| Requirement area                        | Evidence status                                                                                                                                 |
| --------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| User authentication/session boundary    | Failing by design inspection: logout does not clear the server cookie or invalidate the session; route-to-login alone is insufficient evidence. |
| Admin ops separation                    | Failing in prior runtime: organization admin rows reached `/ops/users` and `/ops/redeem-codes`.                                                 |
| Organization admin workspace            | Failing in prior runtime: `/organization/portal` was denied for both organization admin rows.                                                   |
| Standard/advanced organization behavior | Blocked until session hydration returns true organization admin roles.                                                                          |
| Chinese UI                              | Must remain part of future runtime acceptance; this docs task did not execute UI runtime.                                                       |

## Role Mapping Result

| Role                 | Evidence status                                                                                                                                                            |
| -------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `org_standard_admin` | Prior runtime fail; likely hydrated from stale ops cookie or legacy organization-bound `ops_admin` account, not from a confirmed first-class `org_standard_admin` session. |
| `org_advanced_admin` | Prior runtime fail; same hydration and fixture-mapping risk as standard row.                                                                                               |
| `ops_admin`          | Control role must remain global operations; it must not be reused to prove organization admin acceptance.                                                                  |
| `content_admin`      | Out of direct scope; remains unrelated-workspace denial guard.                                                                                                             |
| `super_admin`        | Out of direct scope; remains explicit global override.                                                                                                                     |

## Acceptance Mapping Result

- Planning acceptance: pass only after plan/evidence/audit/state/queue are created and docs gates pass.
- Runtime acceptance: not executed.
- Implementation acceptance: not executed.
- Final Pass: blocked and not claimed.

## Root Cause Evidence

- `src/components/AdminDashboardLayout/AdminDashboardLayout.tsx` logout removes `tiku.localSessionToken` and navigates to `/login`.
- `src/server/auth/session-cookie.ts` stores the effective server credential in HttpOnly `tiku_session`.
- `src/server/auth/session-route.ts` has `POST` and `GET`; no logout or cookie expiry handler exists.
- Therefore prior logout evidence only proved visible navigation to `/login`, not server-session cleanup.
- 2026-06-23 credential handoff evidence explicitly states organization admin acceptance accounts were created as organization-bound `ops_admin` rows before first-class organization admin enum values existed.
- `src/db/dev-seed.ts` later introduced `org_standard_admin` and `org_advanced_admin` seed rows, but those rows are not proven to be the same owner-entered acceptance credentials used in the browser run.
- `tests/unit/student-login-ui.test.ts` and `tests/unit/admin-dashboard-layout-navigation.test.ts` still contain stale phone-role fixture mappings that diverge from current dev seed.

## Diagnostic Conclusion

The current evidence no longer supports another narrow landing-path patch. The likely root cause is a session-hydration system gap:

1. logout does not actually end cookie-backed server sessions;
2. owner-entered organization admin rows may still be legacy `ops_admin` accounts from the private acceptance handoff;
3. unit fixture mappings are stale and can hide drift between mocked payloads and dev seed accounts.

The next implementation task should start by proving this with red tests, then repair logout/session invalidation and fixture SSOT alignment before any further browser runtime rerun.

## Changed Files

- `docs/04-agent-system/state/project-state.yaml`.
- `docs/04-agent-system/state/task-queue.yaml`.
- `docs/05-execution-logs/task-plans/2026-06-24-organization-admin-runtime-session-hydration-repair-planning.md`.
- `docs/05-execution-logs/evidence/2026-06-24-organization-admin-runtime-session-hydration-repair-planning.md`.
- `docs/05-execution-logs/audits-reviews/2026-06-24-organization-admin-runtime-session-hydration-repair-planning.md`.

## Validation Results

1. `npx.cmd prettier --write --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-06-24-organization-admin-runtime-session-hydration-repair-planning.md docs/05-execution-logs/evidence/2026-06-24-organization-admin-runtime-session-hydration-repair-planning.md docs/05-execution-logs/audits-reviews/2026-06-24-organization-admin-runtime-session-hydration-repair-planning.md`
   - Result: pass.
   - Output summary: allowed docs/state files formatted or unchanged.
2. `npx.cmd prettier --check --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-06-24-organization-admin-runtime-session-hydration-repair-planning.md docs/05-execution-logs/evidence/2026-06-24-organization-admin-runtime-session-hydration-repair-planning.md docs/05-execution-logs/audits-reviews/2026-06-24-organization-admin-runtime-session-hydration-repair-planning.md`
   - Result: pass.
   - Output summary: all matched files use Prettier code style.
3. `git diff --check`
   - Result: pass.
   - Output summary: no whitespace errors.
4. `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId organization-admin-runtime-session-hydration-repair-planning-2026-06-24`
   - Result: pass.
   - Output summary: `OK_SSOT_READ_LIST`, `OK_REQUIREMENT_MAPPING_RESULT`, all 5 changed files in task scope, and
     pre-commit hardening passed.
5. `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId organization-admin-runtime-session-hydration-repair-planning-2026-06-24 -SkipRemoteAheadCheck`
   - Result: pass.
   - Output summary: branch, `master`, `origin/master`, state master, and state origin master aligned at
     `63528dd3edc6880b5ae06a4dad1d817092eba493`; evidence and audit paths present; pre-push readiness passed.

## Boundary Evidence

- No source, test, e2e, script, schema, migration, seed, database, account, credential file, dependency, lockfile, `.env*`, Provider, staging/prod, payment, external service, browser runtime, dev server, PR, force push, or final Pass work was performed.
- No credential values, server credentials, database URLs, browser storage, cookies, screenshots, traces, Provider payloads, generated AI content, employee answer content, full paper content, or plaintext `redeem_code` values are recorded.

## Closeout Approval

- Approval source: current user message on 2026-06-25: execute closeout by committing, merging to `master`, pushing, and
  deleting the short branch.
- Approved closeout actions: local commit, merge to `master`, push `origin/master`, delete merged short branch.

## Next Recommended Task

- `organization-admin-runtime-session-hydration-repair-2026-06-24`.
- Recommended allowed implementation scope must include backend logout/session-cookie tests and repair, admin shell logout integration, fixture/seed role-mapping tests, and focused login/session hydration tests.
