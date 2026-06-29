# Full Acceptance Remaining Coverage Audit Traceability

- Task id: `full-acceptance-remaining-coverage-audit-2026-06-29`
- Branch: `codex/full-acceptance-coverage-audit-20260629`
- Status: in progress
- Date: `2026-06-29`

## Objective

Reconcile the mandatory owner-facing checklist against existing redacted evidence after the current full unit baseline
recheck, identify remaining unproven workflow rows, and seed the next local acceptance task.

This task is docs/state-only. It does not execute browser, DB, AI, account fixture, source, test, dependency, schema,
migration, seed, staging/prod, PR, force-push, release readiness, final Pass, or Cost Calibration actions.

## Current Baseline

- Current full unit baseline: pass, 318 files and 1437 tests.
- Current pushed master before this audit: `3bdfd8bfcf661b0d4f669f4f970ecf2f25513537`.
- Mandatory checklist:
  `docs/01-requirements/traceability/2026-06-28-owner-facing-role-gap-capture-scope.md`.
- Durable goal remains incomplete.

## Existing Coverage Summary

| Coverage area                                            | Evidence status                                                                    |
| -------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| All 8 allowed role session coverage                      | pass, combined from Option A plus `ops_admin` completion.                          |
| `org_advanced_admin.organization_analytics`              | pass after local DB/test-owned data alignment repair.                              |
| `org_advanced_admin.organization_ai_question_generation` | pass for detail controls, no Provider execution.                                   |
| `org_advanced_admin.organization_ai_paper_generation`    | pass for detail controls, no Provider execution.                                   |
| `content_admin.content_ai_question_generation`           | pass for detail controls, no Provider execution.                                   |
| `content_admin.content_ai_paper_generation`              | pass for detail controls, no Provider execution.                                   |
| `content_admin.formal_content`                           | pass for read-only route/control coverage; mutation/adoption/publish not executed. |
| Full unit baseline                                       | pass on 2026-06-29 current state.                                                  |

## Remaining Coverage Classes

| Role                        | Remaining unproven class                                                                                                         |
| --------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| `org_advanced_admin`        | `organization_training` create/manage workflow beyond route reachability; organization training lifecycle/status/count evidence. |
| `org_standard_admin`        | Standard admin organization basics and advanced-denial/unavailable detail beyond route smoke.                                    |
| `org_advanced_employee`     | Enterprise training start/continue/submit states and learner AI detail controls.                                                 |
| `org_standard_employee`     | Standard learning workflow and direct advanced-route denial/unavailable details.                                                 |
| `ops_admin`                 | `org_auth`, employee import, logs, prompt/provider-denial redaction and operation workflow details.                              |
| `content_admin`             | Formal content write/review lifecycle and content AI draft review/adoption boundary beyond read-only/detail controls.            |
| `personal_advanced_student` | Learner AI question/paper detail controls and generated-content practice/feedback boundaries without Provider execution.         |
| `personal_standard_student` | Standard learner practice/mock/mistake workflows and advanced AI denial/unavailable detail.                                      |

## Seeded Next Task

The next executable task is seeded as
`full-acceptance-org-advanced-admin-training-workflow-2026-06-29`.

Rationale:

- It follows the mandatory checklist's recommended order after `org_advanced_admin.organization_analytics` and
  organization AI detail rows already have pass evidence.
- It targets a concrete remaining row: `org_advanced_admin.organization_training`.
- It can consume existing staged local approval Stage A and Stage B after its own task plan is created.

## Boundaries

Allowed in this audit:

- Read repository governance, requirements, and redacted evidence.
- Write only task-scoped docs/state files.
- Seed the next queue task.
- Commit, fast-forward merge, push, and cleanup after validation.

Blocked in this audit:

- Browser/dev-server/e2e execution.
- Private account/fixture reads.
- DB connection/read/write, migration, seed, schema.
- AI/Provider execution, Provider configuration, prompt/payload/raw AI IO.
- Source/test/dependency/package/lockfile changes.
- Staging/prod/deploy, PR, force-push, release readiness, final Pass, Cost Calibration.
