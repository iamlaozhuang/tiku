# L5 Browser Runtime Scope Approval Package

## Status

- packageId: `L5_LOCAL_BROWSER_RUNTIME_SCOPE_2026_06_23`
- taskId: `acceptance-l5-browser-runtime-scope-approval-2026-06-23`
- batchId: `standard-advanced-mvp-runtime-blocker-evidence-batch-2026-06-23`
- status: `prepared_not_approved_for_execution`
- scope: local-only L5 role-flow and browser runtime evidence for Standard and Advanced MVP acceptance.
- release claim: none.
- staging claim: none.
- production claim: none.

## What This Package Is For

This package gives `laozhuang` a precise approval boundary for the next two runtime evidence tasks:

- `acceptance-l5-standard-role-flow-run-2026-06-23`
- `acceptance-l5-advanced-role-flow-run-2026-06-23`

Approval of this package would allow local runtime evidence collection only. It would not approve Provider, Cost
Calibration, staging, production, payment, dependency, schema, migration, seed, database, env/secret, PR, force-push, or
release work.

## Recommended Approval Statement

To approve the next local runtime step, use this exact decision:

```text
批准 L5_LOCAL_BROWSER_RUNTIME_SCOPE_2026_06_23：允许 Codex 在本地 localhost/127.0.0.1 范围内，为 Standard 和 Advanced MVP 验收启动或使用本地 dev server，使用 in-app browser 做人工辅助浏览器走查，并可运行 e2e --list 以及 safe_smoke allowlist 中的既有本地 Playwright smoke spec。凭据由 laozhuang 手动输入或确认，Codex 不读取、不记录、不输出任何凭据、secret、token、数据库 URL、Authorization header、.env 内容、Provider payload、raw prompt、raw AI output、完整 paper/material、原始作答或 plaintext redeem_code。Provider、Cost Calibration、staging、production、payment、dependency、schema、migration、seed、database、deploy、PR、force-push 仍然不批准。
```

If this exact approval is not given, the next L5 runtime tasks must remain blocked.

## Local Target Boundary

Allowed local targets after approval:

| Target             | Rule                                                                                   |
| ------------------ | -------------------------------------------------------------------------------------- |
| Base URL           | `http://127.0.0.1:<local-port>` or `http://localhost:<local-port>` only.               |
| Default port       | `3000` if available.                                                                   |
| Alternate port     | The local dev server's first available fallback port, if the command reports one.      |
| Public URL         | Not allowed.                                                                           |
| Staging/prod URL   | Not allowed.                                                                           |
| Cloud/external URL | Not allowed unless it is already a public documentation page and unrelated to runtime. |

Allowed local server action after approval:

| Action                            | Allowed | Boundary                                                                              |
| --------------------------------- | ------- | ------------------------------------------------------------------------------------- |
| Start local app dev server        | yes     | Only an existing project script such as `npm.cmd run dev`; no package or env changes. |
| Reuse user-opened local app       | yes     | Only when the URL is local.                                                           |
| Stop local dev server started now | yes     | Only the process started for this acceptance task.                                    |
| Read `.env*`                      | no      | Framework may load local env internally; Codex must not open or record file contents. |
| Modify `.env*`                    | no      | Blocked.                                                                              |
| Run migrations or seed/reset      | no      | Blocked.                                                                              |

## Browser And Playwright Boundary

Allowed after approval:

| Capability                              | Allowed | Evidence rule                                                                 |
| --------------------------------------- | ------- | ----------------------------------------------------------------------------- |
| In-app browser local walkthrough        | yes     | Record bounded route, role label, expected state, actual summary, and result. |
| Manual user-assisted login              | yes     | `laozhuang` enters credentials; Codex records only role label and outcome.    |
| `npm.cmd run test:e2e -- --list`        | yes     | Record command and available spec count only.                                 |
| `e2e/home.spec.ts`                      | yes     | Existing safe smoke only; record spec name and pass/fail/test count.          |
| `e2e/admin-role-denial-browser.spec.ts` | yes     | Existing safe smoke only; record spec name and pass/fail/test count.          |
| `e2e/local-auth-route-guard.spec.ts`    | yes     | Existing safe smoke only; record spec name and pass/fail/test count.          |

Not allowed by this package:

- full e2e suite;
- `test:e2e:ui`;
- headed/debug/inspector mode;
- generated or new e2e specs;
- credentialed data-write e2e specs;
- screenshots, traces, HTML reports, browser storage dumps, or page text dumps committed as evidence;
- non-local browser targets.

## Role And Account Labels

No credentials are committed. Accounts are referenced only by label.

| Account label                 | Role label                | Use in evidence                                                             |
| ----------------------------- | ------------------------- | --------------------------------------------------------------------------- |
| `unauthenticated_reviewer`    | `unauthenticated_visitor` | Protected route denial and login visibility.                                |
| `student_reviewer`            | `student`                 | Standard `practice`, `mock_exam`, `exam_report`, `mistake_book`, `profile`. |
| `advanced_student_reviewer`   | `advanced_student`        | Advanced entitlement and Provider-disabled AI boundary.                     |
| `content_admin_reviewer`      | `content_admin`           | `question`, `material`, `paper`, `knowledge_node` surfaces.                 |
| `ops_admin_reviewer`          | `ops_admin`               | `user`, `organization`, `redeem_code`, `authorization`, log surfaces.       |
| `super_admin_reviewer`        | `super_admin`             | Highest-privilege governance and negative checks.                           |
| `organization_admin_reviewer` | `org_admin`               | `org_auth`, organization training, assignment, analytics.                   |
| `employee_reviewer`           | `employee`                | Organization training participation and visibility boundaries.              |
| `evidence_redaction_reviewer` | `auditor`                 | Evidence hygiene, `audit_log`, `ai_call_log`, blocked-gate review.          |

If an account is missing, blocked, or requires secret access, the runtime task must record the row as blocked instead
of creating or recovering credentials.

## Standard MVP Surface Matrix

| Acceptance id | Role label                | Route or surface family                                  | Expected evidence summary                                            |
| ------------- | ------------------------- | -------------------------------------------------------- | -------------------------------------------------------------------- |
| L5-STD-001    | `unauthenticated_visitor` | `/login` and protected student/admin route families      | Login visible; protected surfaces deny or redirect.                  |
| L5-STD-002    | `student`                 | student home/profile and `authorization` visibility      | Student reaches authorized local scope without exposing credentials. |
| L5-STD-003    | `student`                 | `practice`                                               | Practice entry and answer interaction are visible or gap recorded.   |
| L5-STD-004    | `student`                 | `mock_exam`                                              | Mock exam entry and submit/review path visible or gap recorded.      |
| L5-STD-005    | `student`                 | `exam_report` and `mistake_book`                         | Report and mistake_book visibility confirmed or gap recorded.        |
| L5-STD-006    | `content_admin`           | `question`, `material`, `paper`, `knowledge_node`        | Management surfaces render or deliberately guard actions.            |
| L5-STD-007    | `ops_admin`               | `user`, `organization`, `redeem_code`, `authorization`   | Ops surfaces render with redacted summaries only.                    |
| L5-STD-008    | `super_admin`             | admin/ops governance and negative authorization families | Highest-privilege and denial checks summarized.                      |
| L5-STD-009    | `auditor`                 | `audit_log`, `ai_call_log`, evidence hygiene             | Logs visible only as redacted metadata; Provider remains blocked.    |

## Advanced MVP Surface Matrix

| Acceptance id | Role label         | Route or surface family                                      | Expected evidence summary                                             |
| ------------- | ------------------ | ------------------------------------------------------------ | --------------------------------------------------------------------- |
| L5-ADV-001    | `advanced_student` | `effectiveEdition`, advanced personal learning surfaces      | Advanced entitlement boundary visible or blocked gap recorded.        |
| L5-ADV-002    | `advanced_student` | personal AI generation/scoring/explanation surfaces          | Provider disabled/fallback state summarized; no raw AI content.       |
| L5-ADV-003    | `org_admin`        | `org_auth`, organization portal, training content lifecycle  | Organization admin flow visible or blocked gap recorded.              |
| L5-ADV-004    | `employee`         | organization training assignment, answer, completion, report | Employee flow visibility summarized; no raw employee answer content.  |
| L5-ADV-005    | `org_admin`        | organization analytics summary                               | Aggregate-only analytics visibility summarized; no sensitive details. |
| L5-ADV-006    | `ops_admin`        | quota, Provider-disabled state, `audit_log`, `ai_call_log`   | Quota/Provider blockers remain explicit.                              |
| L5-ADV-007    | `auditor`          | cross-role redaction and blocked AP gates                    | Evidence hygiene and blocked-gate table reviewed.                     |

## Evidence Rules

Allowed evidence values:

- route or surface family;
- local URL base without query secrets;
- role label and account label;
- visible state summary;
- pass/fail/blocked result;
- defect severity and short reproduction summary;
- test command, spec name, pass/fail status, and test count;
- redacted `audit_log` and `ai_call_log` metadata summaries.

Forbidden evidence values:

- credentials, generated passwords, token values, Authorization headers, session cookies, database URLs, secret values,
  `.env*` contents, API keys, raw Provider payloads, raw prompts, raw AI output, raw model responses, full `paper`, full
  `material`, full OCR/textbook content, raw employee answer content, plaintext `redeem_code`, customer-like private
  data, screenshots with sensitive values, traces, HTML reports, local storage dumps, and browser page text dumps.

## Defect And Stop Rules

| Severity | Runtime task action                                                              |
| -------- | -------------------------------------------------------------------------------- |
| P0       | Stop the run, record redacted blocker, do not continue acceptance.               |
| P1       | Stop the affected role flow, record blocker, do not claim Pass.                  |
| P2       | Continue only if core flow remains usable; record owner role and next decision.  |
| P3       | Record as non-blocking observation if it does not affect security or completion. |

Immediate stop conditions:

- non-local URL appears;
- credential, secret, token, database URL, or Authorization header would be exposed;
- Provider, Cost Calibration, staging, payment, external service, schema, migration, seed, dependency, deploy, PR, or
  force-push becomes necessary;
- a route requires private or production-like data;
- evidence cannot be safely redacted;
- local result is being used to claim staging, production, Provider, Cost Calibration, or release readiness.

## Decision After Approval

If `laozhuang` approves this package, the next task can be reopened or updated as:

- task: `acceptance-l5-standard-role-flow-run-2026-06-23`
- allowed runtime level: local L5 browser and role-flow evidence only;
- allowed targets: local URL only;
- blocked remainder: Provider, Cost Calibration, staging, prod, payment, external service, env/secret, database,
  dependency, schema, migration, seed, deploy, PR, and force push.

If approval is not given, the next L5 runtime tasks remain blocked by approval gate.
