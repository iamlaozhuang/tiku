# Acceptance L6 Owner Preview Actual Walkthrough Evidence

taskId: acceptance-l6-owner-preview-actual-walkthrough-2026-06-23
status: closed
result: reviewed_with_blocking_student_mistake_book_auth_gap_and_recorded_l6_residual_gaps
recordedAt: "2026-06-23T02:33:49-07:00"
branch: codex/runtime-blocker-evidence-batch-20260623
owner: laozhuang
codexRole: execution_assistant_and_evidence_preparer_only
approvalConsumed: L6_OWNER_PREVIEW_ACTUAL_WALKTHROUGH_2026_06_23

## Summary

Completed the approved local L6 owner preview actual walkthrough against the existing in-app browser tab.

Current execution state:

- local target confirmed: `http://127.0.0.1:3000/login`;
- login page visible;
- unauthenticated route guard checks completed for the selected protected routes;
- super_admin owner walkthrough checks completed for system operations, content operations, organization, resource,
  audit, and AI configuration surfaces;
- student routes redirected to login when checked from the super_admin context, preserving admin/student account
  separation;
- student owner walkthrough checks completed for `/home`, `/profile`, `/practice`, `/mock-exam`, `/exam-report`, and
  `/mistake-book`;
- student `/home`, `/profile`, and `/exam-report` were accessible;
- student `/profile` showed valid authorization, version authorization, personal authorization, standard, advanced,
  upgrade, and redeem-code entry labels;
- student `/practice` and `/mock-exam` direct route entries require a selected paper context; the home page exposed
  practice and mock exam entries without executing a write flow;
- student `/mistake-book` showed a login-required state while the same student session could access `/home` and
  `/profile`, so this is a blocking L6 gap for final acceptance;
- browser error-level logs included repeated React duplicate-key errors during the walkthrough, recorded as a frontend
  runtime quality gap.

This task closes as an actual owner walkthrough evidence task. It is not an L6 pass decision for final acceptance.

## Browser Runtime Boundary

| Check                    | Result | Summary                                                                                                                                             |
| ------------------------ | ------ | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| Current tab target       | pass   | Current tab is local: `http://127.0.0.1:3000/login`.                                                                                                |
| Login page visibility    | pass   | Login heading, phone field, password field, disabled login button, and register link were visible.                                                  |
| Browser backend          | pass   | Used the in-app browser local runtime.                                                                                                              |
| Error-level console logs | gap    | Repeated React duplicate-key errors were observed. They did not block route inspection, but they must be tracked as a frontend runtime quality gap. |

## Unauthenticated Route Guard Checks

| Route                | Result  | Owner-visible summary                                                                                      |
| -------------------- | ------- | ---------------------------------------------------------------------------------------------------------- |
| `/home`              | pass    | Protected route showed a login-required state instead of business content.                                 |
| `/practice`          | partial | Route showed login-status verification state during the bounded check; it did not expose business content. |
| `/mock-exam`         | pass    | Protected route showed a login-required state instead of business content.                                 |
| `/exam-report`       | pass    | Protected route showed a login-required state instead of business content.                                 |
| `/mistake-book`      | pass    | Protected route showed a login-required state instead of business content.                                 |
| `/content/questions` | pass    | Protected route showed a login-required state instead of business content.                                 |
| `/content/papers`    | pass    | Protected route showed a login-required state instead of business content.                                 |
| `/ops/users`         | pass    | Protected route showed a login-required state instead of business content.                                 |
| `/ops/organizations` | pass    | Protected route showed a login-required state instead of business content.                                 |
| `/ops/ai-audit-logs` | pass    | Protected route showed a login-required state instead of business content.                                 |

## Super Admin Owner Walkthrough

The owner logged into the local browser as a super_admin account and Codex inspected route-level visible states without
using write actions.

| Surface                           | Result                           | Owner-visible summary                                                                                                                                                                                                     |
| --------------------------------- | -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `/ops/users`                      | pass                             | System operations dashboard, user management, organization, authorization, `redeem_code`, `audit_log`, and `ai_call_log` sections were visible.                                                                           |
| `/ops/organizations`              | pass                             | Enterprise organization, employee, and `org_auth` management surfaces were visible with create/import/detail/edit/disable action entries.                                                                                 |
| `/ops/redeem-codes`               | pass_with_redaction_boundary     | `redeem_code` management surface was visible and explicitly showed that cleartext code material is unavailable. No cleartext code was recorded.                                                                           |
| `/ops/resources`                  | pass_with_blocked_cloud_boundary | Resource and knowledge-base management surface was visible; cloud upload/download actions remained approval-gated.                                                                                                        |
| `/ops/contact-config`             | pass_with_copy_gap               | Purchase contact configuration form and active preview were visible. Some UI labels remain technical English/`contact_config`, which is a usability copy gap for later review if desired.                                 |
| `/ops/ai-audit-logs`              | pass_with_provider_gate_blocked  | AI configuration, model provider/config/template, `audit_log`, `ai_call_log`, and cost summary sections were visible. Provider/secret inputs were visible but no values were entered and no Provider action was executed. |
| `/content/questions`              | pass                             | `question` management list, filters, create/edit/disable/copy/recommendation action entries were visible.                                                                                                                 |
| `/content/materials`              | pass                             | `material` management list, filters, create/edit/disable/copy action entries were visible.                                                                                                                                |
| `/content/papers`                 | pass                             | `paper` management list, filters, draft/group/publish/unpublish/copy/asset metadata action entries were visible.                                                                                                          |
| `/content/knowledge-nodes`        | pass                             | `knowledge_node` tree maintenance and recommendation review entry were visible.                                                                                                                                           |
| `/content/organization-training`  | pass                             | Organization training draft, source-binding, and copy-version form entries were visible.                                                                                                                                  |
| `/content/organization-analytics` | pass_read_only_entry             | Organization analytics entry and aggregate dashboard load control were visible.                                                                                                                                           |
| `/content/organization-portal`    | pass                             | Organization portal entry linked to organization training and organization analytics.                                                                                                                                     |

No destructive, write, Provider, Cost Calibration, staging, cloud, payment, or external-service action was executed.

## Admin/Student Separation Check

| Route           | Result        | Owner-visible summary                                                                         |
| --------------- | ------------- | --------------------------------------------------------------------------------------------- |
| `/home`         | pass_boundary | From the super_admin context, the route returned to login instead of showing student content. |
| `/practice`     | pass_boundary | From the super_admin context, the route returned to login instead of showing student content. |
| `/mock-exam`    | pass_boundary | From the super_admin context, the route returned to login instead of showing student content. |
| `/exam-report`  | pass_boundary | From the super_admin context, the route returned to login instead of showing student content. |
| `/mistake-book` | pass_boundary | From the super_admin context, the route returned to login instead of showing student content. |
| `/profile`      | pass_boundary | From the super_admin context, the route returned to login instead of showing student content. |

## Student Owner Walkthrough

The owner logged into the local browser as the local student account and Codex inspected route-level visible states
without using write actions.

| Surface         | Result             | Owner-visible summary                                                                                                                                                                                    |
| --------------- | ------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `/home`         | pass               | Student home loaded with authorization, profile, `practice`, `mock_exam`, `exam_report`, and `mistake_book` entries visible.                                                                             |
| `/profile`      | pass               | Profile loaded with valid authorization, version authorization, personal authorization, standard, advanced, upgrade, and redeem-code entry labels visible.                                               |
| `/practice`     | partial_entry_only | Direct route loaded as an authenticated entry state but did not prove a full practice flow because no paper context was selected and no write action was executed. Home page exposed practice entries.   |
| `/mock-exam`    | partial_entry_only | Direct route loaded as an authenticated entry state but did not prove a full mock exam flow because no paper context was selected and no write action was executed. Home page exposed mock exam entries. |
| `/exam-report`  | pass_read_only     | Exam report list loaded with report and AI learning suggestion labels visible. No report detail, raw answer, or AI content was recorded.                                                                 |
| `/mistake-book` | fail_blocking_gap  | Route showed a login-required state while the same student session could access `/home` and `/profile`. This blocks final acceptance until repaired or explicitly deferred.                              |

## Final L6 Walkthrough Matrix

| Row                                                      | Status                                   | Note                                                                                                                                                      |
| -------------------------------------------------------- | ---------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Login and unauthenticated protection                     | pass                                     | Protected routes did not expose business content before login.                                                                                            |
| Student home and authorization status                    | pass                                     | Student home and profile authorization sections were visible.                                                                                             |
| Personal standard, advanced, upgrade, expiry, revocation | partial_pass_visible_labels_only         | Standard, advanced, and upgrade labels were visible. Expiry/revocation fallback remains covered by L5 seeded evidence rather than manually replayed here. |
| `practice` and `mock_exam`                               | partial_entry_only                       | Entries were visible from home; no write flow was executed in this L6 read-only walkthrough.                                                              |
| `exam_report`                                            | pass_read_only                           | Report list and AI learning suggestion labels were visible; sensitive content was not recorded.                                                           |
| `mistake_book`                                           | fail_blocking_gap                        | Student route displayed a login-required state despite an active student session on other student pages.                                                  |
| `org_auth` and enterprise training                       | partial_admin_visible_employee_login_gap | Admin-side `org_auth`, employee, training, and analytics surfaces were visible; dedicated employee login remains a known account gap.                     |
| Content operations                                       | pass_super_admin_view                    | Content pages opened and showed expected route-level controls; dedicated `content_admin` account remains a known gap.                                     |
| System operations                                        | pass_super_admin_view                    | Operations pages opened and showed expected route-level controls; dedicated `ops_admin` account remains a known gap.                                      |
| `audit_log` and `ai_call_log` summaries                  | pass_super_admin_view                    | Audit and AI call log sections were visible; no raw prompt, raw response, or Provider payload was recorded.                                               |
| Provider, Cost Calibration, staging                      | blocked                                  | Not approved or executed.                                                                                                                                 |
| Final acceptance Pass                                    | blocked                                  | Forbidden because `mistake_book`, dedicated-role, Provider/Cost/staging, and release gates are not all passing.                                           |

## Defects And Gaps Found

| Gap                                                                                                                              | Severity                         | Evidence impact                                                                        | Required follow-up                                                                 |
| -------------------------------------------------------------------------------------------------------------------------------- | -------------------------------- | -------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| Student `/mistake-book` asks for login while `/home` and `/profile` work in the same student session.                            | P1 acceptance blocker            | Blocks strict Standard/Advanced final acceptance for student `mistake_book`.           | Repair or explicitly defer, then rerun the student L6 route check.                 |
| Repeated React duplicate-key error-level logs appeared during local walkthrough.                                                 | P2 quality gap                   | Does not block route inspection, but weakens runtime quality evidence.                 | Triage duplicated list keys or duplicated seed rows.                               |
| `practice` and `mock_exam` were not executed as write flows in this owner walkthrough.                                           | expected L6 read-only limitation | Existing L5 seeded evidence covers runtime flows; this L6 task only confirmed entries. | Use existing L5 evidence or approve a separate write-flow walkthrough if required. |
| Dedicated `content_admin`, `ops_admin`, enterprise admin, employee, and auditor manual login accounts remain absent or unproven. | known coverage gap               | Blocks role-separated final acceptance.                                                | Approve seed/test account expansion or record explicit acceptance deferral.        |
| Provider, Cost Calibration, staging, payment, external service, and production release remain blocked.                           | blocked gate                     | Prevents final Pass and release readiness.                                             | Separate approval packages only after local blockers are handled or deferred.      |

## Redaction Statement

This evidence records only:

- task id, role labels, route labels, local URL labels, pass/partial/pending status, and bounded visible-state summaries.

This evidence does not record:

- passwords, generated passwords, tokens, cookies, Authorization headers, localStorage, database URLs, `.env*` contents,
  API keys, secrets, plaintext `redeem_code`, raw prompt, raw answer, Provider payload, AI raw output, full `paper`, full
  `material`, employee answer text, screenshots, traces, HTML reports, raw DB rows, or internal auto-increment ids.

## Blocked Work Statement

Not approved or executed:

- Codex credential handling;
- staging, prod, cloud, deploy, public endpoint, object storage, or TLS work;
- Provider/model call, Provider configuration, or Cost Calibration;
- database seed/write, schema migration, `drizzle-kit push`, drop, truncate, reset;
- source/test/script/package/lockfile/env change;
- payment or external-service action;
- push, PR, force push;
- Standard MVP Pass, Advanced MVP Pass, staging ready, release ready, production ready, or final acceptance Pass.

## Validation Commands

| Command                                                                                                    | Result | Summary                                                                                                         |
| ---------------------------------------------------------------------------------------------------------- | ------ | --------------------------------------------------------------------------------------------------------------- |
| in-app browser local route walkthrough                                                                     | pass   | Completed local unauthenticated, super_admin, and student route-level checks.                                   |
| `npx.cmd prettier --write --ignore-unknown <changed docs/state files>`                                     | pass   | Formatted task plan, evidence, audit review, project state, and task queue files.                               |
| `npx.cmd prettier --check --ignore-unknown <changed docs/state files>`                                     | pass   | All matched files use Prettier formatting.                                                                      |
| `git diff --check`                                                                                         | pass   | No whitespace errors.                                                                                           |
| sensitive value scan for changed L6 plan/evidence/audit files                                              | pass   | No phone numbers, URL publicId query values, plaintext password assignments, DB URLs, or key-like values found. |
| `Test-ModuleRunV2PreCommitHardening.ps1 -TaskId acceptance-l6-owner-preview-actual-walkthrough-2026-06-23` | pass   | allowedFiles, Cost Calibration block, sensitive evidence scan, and terminology scan passed.                     |

## Decision Impact

Actual L6 local owner walkthrough is complete as an evidence task, but the result is not acceptance Pass.

Strict next step:

1. Repair or explicitly defer the student `mistake_book` login-state blocker.
2. Triage the duplicate-key console error.
3. Decide whether dedicated role-separated accounts are required before final acceptance.
4. Only then proceed to Provider, Cost Calibration, and staging decision packages, or record them as deferred.
