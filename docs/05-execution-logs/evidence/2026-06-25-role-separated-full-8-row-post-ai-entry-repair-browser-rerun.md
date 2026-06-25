# Evidence: role-separated-full-8-row-post-ai-entry-repair-browser-rerun-2026-06-25

## Summary

- Task id: `role-separated-full-8-row-post-ai-entry-repair-browser-rerun-2026-06-25`.
- Branch: `codex/full-8-row-post-ai-entry-rerun-20260625`.
- Task kind: `acceptance_runtime_walkthrough`.
- Approval consumed: `ROLE_SEPARATED_FULL_8_ROW_POST_ORG_ADMIN_REPAIR_RERUN_SCOPE_2026_06_25`.
- Credential approval amendment: `current_user_message_allow_input_or_read_credentials_2026_06_25` allowed Codex to read/input the local private role account credentials for this task.
- Result: `blocked_full_8_row_browser_rerun_1_pass_7_fail_no_final_pass`.
- Non-claim: no Standard MVP or Advanced MVP final Pass is declared.

## Approval Boundary

The current user messages on 2026-06-25 approved serial execution, including task 2 operation using the prepared package,
and then explicitly allowed credential input or credential reads. This rerun used only the approved local private
role-account credential source for authentication. Evidence records no account identifiers, passwords, tokens, cookies,
storage values, raw HTML, screenshots, traces, database rows, Provider payloads, or raw generated content.

Still blocked: `.env*`, browser storage inspection, password-manager access, token/cookie capture, DB/seed/schema/migration,
account mutation, source/test/package/lockfile changes, Provider, Cost Calibration, staging/prod, payment, external
services, PR, force push, and final MVP Pass claims.

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
- `docs/01-requirements/advanced-edition/00-index.md`.
- `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`.
- `docs/01-requirements/traceability/2026-06-24-role-separated-mvp-requirement-alignment.md`.
- `docs/01-requirements/traceability/role-experience-fulfillment-matrix.md`.
- `docs/01-requirements/traceability/edition-aware-authorization-acceptance-matrix.md`.
- Browser skill documentation for in-app Browser runtime control.

## Requirement Mapping Result

This rerun maps to R1-R15 from the 2026-06-24 role-separated MVP alignment. It executes the already approved local
runtime scope and does not change requirements or implementation.

## Role Mapping Result

Rows in scope:

- `personal_standard_student`
- `personal_advanced_student`
- `org_standard_employee`
- `org_advanced_employee`
- `org_standard_admin`
- `org_advanced_admin`
- `content_admin`
- `ops_admin`

## Acceptance Mapping Result

The full eight-row role-separated gate remains blocked. One row passed strict local runtime checks after the post-repair
rerun; seven rows still failed at least one required route, entry, denial, or UI-language observation.

## Local Target And Browser Readiness

| Check                         | Result | Redacted evidence                                                                 |
| ----------------------------- | ------ | --------------------------------------------------------------------------------- |
| Local HTTP target             | pass   | `http://127.0.0.1:3000/login` returned HTTP `200` outside the browser.            |
| Browser bootstrap             | pass   | In-app Browser runtime connected after using the documented bootstrap flow.       |
| Browser local login page      | pass   | Local login page opened and exposed the expected phone, password, and login form. |
| Login page console health     | pass   | Console error/warn count was `0` for the login-page readiness check.              |
| Approved credential handling  | pass   | Approved private role-account source was read; values were not recorded.          |
| Credential redaction boundary | pass   | No account identifiers, passwords, tokens, cookies, or storage values recorded.   |

## Runtime Observation Matrix

| Role row                    | Login landing path     | Allowed workflow status                                                                                     | Denied workflow status                                                                               | Logout status                     | Console error/warn count | Row result | Redacted notes                                                                                                                                                        |
| --------------------------- | ---------------------- | ----------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- | --------------------------------- | ------------------------ | ---------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `personal_standard_student` | `/home`                | `home` reachable; direct AI generation route shows login prompt                                             | ops, content, and organization portal routes denied to login page                                    | visible logout clicked            | 0                        | fail       | Direct AI route still misclassifies the authenticated standard learner as unauthenticated; visible technical UI label still sampled.                                  |
| `personal_advanced_student` | `/home`                | `home` reachable; direct AI generation route shows login prompt                                             | ops, content, and organization portal routes denied to login page                                    | visible logout clicked            | 0                        | fail       | Home AI training entry missing; direct AI route still misclassifies the authenticated advanced learner as unauthenticated; visible technical UI label still sampled.  |
| `org_standard_employee`     | `/home`                | `home` reachable; organization training route reachable; direct AI generation route shows login prompt      | ops and content routes denied to login page                                                          | visible logout clicked            | 0                        | fail       | Direct AI route still misclassifies authenticated employee as unauthenticated; standard employee can reach organization training without denial/unavailable guidance. |
| `org_advanced_employee`     | `/home`                | `home` reachable; organization training route reachable; direct AI generation route shows login prompt      | ops and content routes denied to login page                                                          | visible logout clicked            | 0                        | fail       | Advanced employee home AI and enterprise-training entries missing; direct AI route still misclassifies authenticated employee; visible technical UI label sampled.    |
| `org_standard_admin`        | `/organization/portal` | organization portal, training admin, organization AI question, and organization AI paper routes reached     | ops users, ops redeem codes, and content papers denied with no-access                                | returned to login after UI logout | 0                        | fail       | Standard organization admin can still reach advanced organization AI routes.                                                                                          |
| `org_advanced_admin`        | `/organization/portal` | organization portal, training admin, analytics, organization AI question, and organization AI paper reached | ops users, ops redeem codes, and content papers denied with no-access                                | returned to login after UI logout | 0                        | pass       | No blocking observation for this row in this rerun.                                                                                                                   |
| `content_admin`             | `/content/papers`      | content papers, content AI question, and content AI paper routes reached                                    | ops redeem codes, ops organizations, ops users, and organization portal denied with no-access        | returned to login after UI logout | 0                        | fail       | Visible technical UI label still sampled.                                                                                                                             |
| `ops_admin`                 | `/ops/users`           | ops users, ops organizations, ops redeem codes, and ops AI audit logs reached                               | content papers, content AI question, content AI paper, and organization portal denied with no-access | returned to login after UI logout | 0                        | fail       | Visible technical UI label still sampled.                                                                                                                             |

## Runtime Summary

| Metric                             | Result  |
| ---------------------------------- | ------- |
| Rows in scope                      | 8       |
| Authenticated rows observed        | 8       |
| Strict pass rows                   | 1       |
| Fail rows                          | 7       |
| Blocked rows                       | 0       |
| Strict role-separated gate         | blocked |
| Final Standard/Advanced MVP Pass   | blocked |
| Browser storage or credential leak | false   |
| DB/source/schema/env/provider work | false   |

## Next Minimal Repair Candidate

The highest-priority remaining source repair is
`learner-org-employee-ai-runtime-login-prompt-residual-repair-2026-06-25`. Reason: all learner and organization employee
rows authenticated successfully, but direct AI generation still showed a login prompt for those authenticated sessions.
This supersedes the earlier unit-level source repair as a runtime residual. Organization training employee entry/guard
repair remains the next adjacent blocker after the AI login-state residual is closed or explicitly scoped together.

## Blocked Remainder

- Full eight-row runtime gate remains blocked at `1/8` strict pass.
- Learner and organization employee AI runtime login-state residual blocks four rows.
- Organization training employee entry/guard behavior remains blocked for standard and advanced employee rows.
- Standard organization admin still reaches advanced organization AI routes.
- Visible Chinese UI technical-label cleanup remains blocked for learner/employee/content/ops rows.
- Final Standard/Advanced MVP Pass remains blocked.

## Validation Results

| Command                                                                                                                                                                                                                                                                                                                                                                                                                                                                       | Result |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ |
| `npx.cmd prettier --write --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-06-25-role-separated-full-8-row-post-ai-entry-repair-browser-rerun.md docs/05-execution-logs/evidence/2026-06-25-role-separated-full-8-row-post-ai-entry-repair-browser-rerun.md docs/05-execution-logs/audits-reviews/2026-06-25-role-separated-full-8-row-post-ai-entry-repair-browser-rerun.md` | pass   |
| `npx.cmd prettier --check --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-06-25-role-separated-full-8-row-post-ai-entry-repair-browser-rerun.md docs/05-execution-logs/evidence/2026-06-25-role-separated-full-8-row-post-ai-entry-repair-browser-rerun.md docs/05-execution-logs/audits-reviews/2026-06-25-role-separated-full-8-row-post-ai-entry-repair-browser-rerun.md` | pass   |
| `git diff --check`                                                                                                                                                                                                                                                                                                                                                                                                                                                            | pass   |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId role-separated-full-8-row-post-ai-entry-repair-browser-rerun-2026-06-25`                                                                                                                                                                                                                                                                       | pass   |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId role-separated-full-8-row-post-ai-entry-repair-browser-rerun-2026-06-25 -SkipRemoteAheadCheck`                                                                                                                                                                                                                                                   | pass   |

## Changed Files

Planned task-scoped files:

- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/2026-06-25-role-separated-full-8-row-post-ai-entry-repair-browser-rerun.md`
- `docs/05-execution-logs/evidence/2026-06-25-role-separated-full-8-row-post-ai-entry-repair-browser-rerun.md`
- `docs/05-execution-logs/audits-reviews/2026-06-25-role-separated-full-8-row-post-ai-entry-repair-browser-rerun.md`

## Taste Compliance Checklist

- [x] Existing project terminology and role identifiers are preserved.
- [x] Evidence uses allowed redacted fields only and records no account ids, credentials, tokens, cookies, storage, raw page dumps, screenshots, traces, DB rows, or Provider payloads.
- [x] No source/API/schema/seed/dependency/env/Provider/DB change is made.
- [x] No final Standard/Advanced MVP Pass is claimed.
