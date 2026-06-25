# Evidence: organization-admin-runtime-session-hydration-repair-2026-06-24

## Summary

- Task id: `organization-admin-runtime-session-hydration-repair-2026-06-24`.
- Branch: `codex/org-admin-session-hydration-repair-20260625`.
- Task kind: `implementation_tdd`.
- Status: reviewed; awaiting fresh closeout approval.
- Result: pass_source_repair_validated_awaiting_closeout_approval_no_final_pass.
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

## Requirement Mapping Result

| Requirement area             | Status                                                                                                                  |
| ---------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| User auth/session            | Pass in focused unit scope: logout deletes local session through focused service/repository and expires `tiku_session`. |
| Backend workspace separation | Pass in source scope: backend logout now clears server-backed session before local marker cleanup.                      |
| Organization admin workspace | Pass in fixture scope: organization admin login/layout unit fixtures align with dev seed mapping.                       |
| Chinese UI                   | Pass by source review: changed visible UI remains existing Chinese logout/denial labels; no English copy.               |
| Final Pass                   | Blocked; not claimed.                                                                                                   |

## Role Mapping Result

| Role                 | Status                                                                    |
| -------------------- | ------------------------------------------------------------------------- |
| `org_standard_admin` | Unit login/layout fixtures align to `13900000004` + `org_standard_admin`. |
| `org_advanced_admin` | Unit login/layout fixtures align to `13900000005` + `org_advanced_admin`. |
| `ops_admin`          | Preserved as global operations control role.                              |
| `content_admin`      | Preserved as content workspace control role.                              |
| `super_admin`        | Preserved as global override control role.                                |

## Acceptance Mapping Result

- RED tests: pass; failed for expected reasons before production repair.
- GREEN tests: pass after minimal source repair and fixture alignment.
- Browser runtime: not executed in this task.
- Final standard/advanced MVP Pass: blocked and not claimed.

## Initial Source Findings

- `src/server/auth/session-route.ts` exported `POST` and `GET` handlers only; no logout route existed.
- `src/server/auth/session-cookie.ts` created and read `tiku_session`, but had no expired cookie helper.
- `src/server/services/session-service.ts` had login and current session lookup only; no logout service boundary existed.
- `src/server/auth/local-session-runtime.ts` could create and find sessions; it did not expose deletion.
- `src/components/AdminDashboardLayout/AdminDashboardLayout.tsx` logout removed local storage state and redirected to `/login`, but did not call the session API.
- `tests/unit/student-login-ui.test.ts` and `tests/unit/admin-dashboard-layout-navigation.test.ts` used organization admin phone mappings that diverged from `src/db/dev-seed.ts`.

## Implemented Changes

- `docs/04-agent-system/state/project-state.yaml`.
- `docs/04-agent-system/state/task-queue.yaml`.
- `docs/05-execution-logs/task-plans/2026-06-24-organization-admin-runtime-session-hydration-repair.md`.
- `docs/05-execution-logs/evidence/2026-06-24-organization-admin-runtime-session-hydration-repair.md`.
- `docs/05-execution-logs/audits-reviews/2026-06-24-organization-admin-runtime-session-hydration-repair.md`.
- `src/server/auth/session-cookie.ts`: added expired HttpOnly session cookie helper.
- `src/server/auth/session-route.ts`: added `DELETE` session route that delegates logout and expires `tiku_session`.
- `src/server/auth/local-session-logout-route.ts`: added local route runtime for server-backed logout.
- `src/server/repositories/session-logout-repository.ts`: added focused repository deletion boundary for local sessions.
- `src/server/services/session-logout-service.ts`: added idempotent logout service behavior.
- `src/app/api/v1/sessions/route.ts`: exported `DELETE`.
- `src/components/AdminDashboardLayout/AdminDashboardLayout.tsx`: logout button now calls server logout before clearing local marker and routing to `/login`.
- `src/server/auth/session-route.test.ts`: added red/green route and service logout tests.
- `tests/unit/admin-dashboard-layout-navigation.test.ts`: added logout request test and dev seed fixture alignment assertion.
- `tests/unit/student-login-ui.test.ts`: added dev seed fixture alignment assertion and updated organization admin fixture phones.

## Validation Results

1. RED command: `npx.cmd vitest run src/server/auth/session-route.test.ts tests/unit/admin-dashboard-layout-navigation.test.ts tests/unit/student-login-ui.test.ts --reporter=dot`
   - Result: expected failure before production repair.
   - Summary: 3 test files ran; 21 passed and 4 failed.
   - Expected failures: missing `DELETE` handler, backend logout did not call `DELETE /api/v1/sessions`, and organization admin unit fixture phones did not match dev seed.
2. GREEN command: `npx.cmd vitest run src/server/auth/session-route.test.ts tests/unit/admin-dashboard-layout-navigation.test.ts tests/unit/student-login-ui.test.ts src/db/dev-seed.test.ts --reporter=dot`
   - Result: pass.
   - Summary: 4 test files passed; 29 tests passed.
3. `npm.cmd run lint`
   - Result: pass.
4. `npm.cmd run typecheck`
   - Result: pass.
5. Scoped Prettier check, `git diff --check`, pre-commit hardening, and pre-push readiness:
   - Scoped Prettier check result: pass; all matched files use Prettier code style.
   - `git diff --check` result: pass; no whitespace errors.
   - Pre-commit hardening result: pass; changed files matched task scope and sensitive evidence scan passed.
   - Pre-push readiness result: pass with `master`, `origin/master`, state master, and state origin master aligned at
     `d35503770883368f1ece54156a849a79aead399e`.

## Boundary Evidence

- No browser runtime, dev server, credential read/entry, account action, database seed/write/migration, schema, dependency, `.env*`, Provider, staging/prod, payment, external service, PR, force push, Cost Calibration Gate, or final Pass work was performed.
- Evidence records only command/result summaries and does not record cookie values, Authorization headers, credentials, database rows, browser storage, screenshots, traces, Provider payloads, raw AI content, employee answer text, full paper content, or plaintext `redeem_code` values.

## Closeout Boundary

- Fresh closeout approval was provided by the owner on 2026-06-25 for local commit, fast-forward merge to `master`, push to
  `origin/master`, and deletion of `codex/org-admin-session-hydration-repair-20260625`.
- Source repair commit created: `9412c698f fix(auth): repair org admin session hydration logout`.
- `master` fast-forward merge completed locally.
- First post-merge pre-push readiness run blocked on repository SHA handoff because the task was still recorded as
  `reviewed`; this evidence/state-only closeout repair records the task as `done` so the Module Run v2 accepted-ancestor
  checkpoint policy can evaluate the merged task correctly.
- Push and branch cleanup are authorized next; delivery notes will record the remote push result.

## Next Step

- Rerun pre-push readiness, push `master` to `origin/master`, delete the short branch, then start the organization admin
  browser runtime rerun task.
