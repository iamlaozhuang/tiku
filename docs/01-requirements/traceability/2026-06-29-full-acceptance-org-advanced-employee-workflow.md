# Full Acceptance Org Advanced Employee Workflow Traceability

- Task id: `full-acceptance-org-advanced-employee-workflow-2026-06-29`
- Branch: `codex/org-advanced-employee-workflow-20260629`
- Status: closed
- Date: `2026-06-29`

## Objective

Verify the owner-facing `org_advanced_employee` learner enterprise training and learner AI generation rows on localhost
with redacted evidence. This task covers assigned enterprise training visibility/status, learner `AI出题` detail
controls, learner `AI组卷` detail controls, and safe no-Provider boundaries.

This task did not execute Provider, direct DB, schema/migration/seed, dependency, source/test repair, staging/prod, PR,
force-push, release readiness, final Pass, or Cost Calibration actions.

## Mandatory Checklist Mapping

Source checklist:
`docs/01-requirements/traceability/2026-06-28-owner-facing-role-gap-capture-scope.md`.

Mapped rows:

| Row                                                     | Result  | Evidence summary                                                                                          |
| ------------------------------------------------------- | ------- | --------------------------------------------------------------------------------------------------------- |
| `org_advanced_employee.enterprise_training`             | pass    | `/organization-training` reachable with organization/training context and start/save-submit action counts |
| `org_advanced_employee.employee_ai_question_generation` | blocked | `/ai-generation` entry visible, but detail workflow and required controls are absent                      |
| `org_advanced_employee.employee_ai_paper_generation`    | blocked | `/ai-generation` entry visible, but detail workflow and required controls are absent                      |

## Follow-Up Requirement

- Follow-up task: `repair-org-advanced-employee-ai-generation-detail-controls-2026-06-29`.
- Required repair scope: learner AI detail workflow controls for `AI出题` and `AI组卷`, reusing existing personal AI
  generation contracts/services and preserving no-Provider evidence boundaries.
- Required rerun: `org_advanced_employee` browser check for `/ai-generation` and any approved detail routes after
  repair.

## Boundaries

Allowed:

- Localhost or `127.0.0.1` browser verification only.
- Test-owned `org_advanced_employee` login input.
- Read-only navigation and non-Provider control/status checks.
- Redacted role/route/workflow/status/count evidence only.

Blocked:

- Direct DB access or mutation.
- Schema, migration, seed, destructive DB operations.
- Source/test/dependency/package/lockfile changes in this acceptance task.
- AI Provider execution, Provider configuration, prompt/payload/raw AI IO.
- Credentials, cookies, tokens, sessions, localStorage, Authorization headers, env contents, raw DOM, screenshots,
  traces, raw DB rows, internal ids, PII, email, phone, plaintext `redeem_code`, and complete content evidence.
- Staging/prod/deploy, PR, force-push, release readiness, final Pass, and Cost Calibration.

## Completion Rule

This task closes only the scoped `org_advanced_employee` evidence capture. It cannot claim durable goal completion.
