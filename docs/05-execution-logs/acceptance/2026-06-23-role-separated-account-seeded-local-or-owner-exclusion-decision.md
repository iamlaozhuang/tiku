# Role Separated Account Seeded Local Or Owner Exclusion Decision

taskId: acceptance-role-separated-account-seeded-local-or-owner-exclusion-decision-2026-06-23
status: closed
result: pass_all_mandatory_rows_require_seeded_local_runtime_evidence
recordedAt: "2026-06-23T07:04:42-07:00"
owner: laozhuang
codexRole: execution_assistant_and_evidence_preparer_only
approvalConsumed: ROLE_SEPARATED_SEEDED_LOCAL_OR_OWNER_EXCLUSION_SCOPE_2026_06_23

## Plain-Language Decision

laozhuang approved the scope package. No role-level MVP exclusion and no fixture-only/variance acceptance was named in
that approval.

Therefore the conservative default from the package applies:

All eight mandatory role rows require real seeded local account/runtime evidence before the role-separated account
blocker can close.

This decision still does not authorize creating accounts, reading passwords, running seed scripts, writing to a
database, changing `.env*`, changing schema, running browser/Playwright, calling Provider, running Cost Calibration,
deploying staging/prod, or claiming final MVP Pass.

## Row-by-Row Decision

| Role row                    | Decision                        | Exclusion accepted? | Fixture-only/variance accepted? | Meaning                                                                                                      |
| --------------------------- | ------------------------------- | ------------------- | ------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| `personal_standard_student` | `seeded_local_runtime_required` | no                  | no                              | Need a clean standard learner runtime proof; current mixed-label learner session is not enough.              |
| `personal_advanced_student` | `seeded_local_runtime_required` | no                  | no                              | Need a dedicated advanced learner runtime proof with advanced behavior and denied unrelated power.           |
| `org_standard_employee`     | `seeded_local_runtime_required` | no                  | no                              | Need standard organization employee runtime proof with allowed employee behavior and denied admin power.     |
| `org_advanced_employee`     | `seeded_local_runtime_required` | no                  | no                              | Need advanced organization employee runtime proof under employee scope.                                      |
| `org_standard_admin`        | `seeded_local_runtime_required` | no                  | no                              | Need standard organization admin runtime proof with organization boundary behavior.                          |
| `org_advanced_admin`        | `seeded_local_runtime_required` | no                  | no                              | Need advanced organization admin runtime proof with advanced entitlement and organization boundary behavior. |
| `content_admin`             | `seeded_local_runtime_required` | no                  | no                              | Need positive content operations runtime proof and denied system operations behavior.                        |
| `ops_admin`                 | `seeded_local_runtime_required` | no                  | no                              | Need positive system operations runtime proof and denied content editing behavior.                           |

## Gate Decision

The role-separated account blocker remains `Blocked`.

It can move toward closure only after a later approved task collects redacted seeded local runtime evidence for the rows
above. A later owner decision may still change a row to explicit MVP exclusion or fixture-only/variance acceptance, but
that would require a new explicit owner decision by role.

## Recommended Next Task

Recommended next task:

`acceptance-role-separated-account-seeded-local-runtime-scope-approval-2026-06-23`

Recommended next package:

`ROLE_SEPARATED_SEEDED_LOCAL_RUNTIME_SCOPE_2026_06_23`

That task should prepare an execution approval package for the actual seeded local runtime walkthrough batch. It should
still not create accounts, read credentials, run seeds, write to a database, or execute browser/runtime checks until
laozhuang approves the execution scope.

## Evidence Rules For Later Runtime Work

Later runtime work should record only:

- role row name;
- route or workflow label;
- whether the role could perform its allowed behavior;
- whether the role was denied from the required forbidden behavior;
- redacted pass/fail/blocked summary.

Later runtime work must not record passwords, credential document contents, tokens, cookies, localStorage, `.env*`,
database URLs, raw database rows, raw prompts, raw generated AI content, provider payloads, raw answers, full question
text, full paper text, or private user answer text.
