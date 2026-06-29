# Content Admin Local Safe Role Bootstrap Stage C Repair Traceability

## Status

- Task: `content-admin-local-safe-role-bootstrap-stage-c-repair-2026-06-28`
- Branch: `codex/content-admin-safe-role-bootstrap-20260628`
- Status: in_progress
- Durable goal: full acceptance matrix plus full unit baseline repair.
- Scope: local dev/test safe `content_admin` role bootstrap source/test repair only.

## Required Inputs Read

- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/01-requirements/traceability/2026-06-28-owner-facing-role-gap-capture-scope.md`
- `docs/01-requirements/traceability/2026-06-28-full-acceptance-matrix-unit-baseline-repair.md`
- `docs/05-execution-logs/evidence/2026-06-28-full-unit-baseline-current-recheck-and-repair.md`
- `docs/05-execution-logs/evidence/2026-06-28-content-admin-test-owned-account-stage-b-repair.md`

## Requirement Mapping

| Requirement                                                                               | Current task handling                                                                                                                                 |
| ----------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| Full unit baseline is green before matrix acceptance                                      | Prior evidence records current green baseline; this task must rerun full unit after repair.                                                           |
| `content_admin` AI rows require a valid local role/session before browser rerun           | This task may repair only the local/dev/test safe role bootstrap needed for later rerun.                                                              |
| Content `AI出题` and `AI组卷` details must be verified against the owner-facing checklist | Not passed here; a follow-up browser task must verify the UI controls and states.                                                                     |
| All acceptance role accounts are in one external private fixture document                 | Path recorded only: `D:\tiku-local-private\acceptance\role-separated-local-accounts-2026-06-23.md`; no account content read or recorded in this task. |
| Multi-role `AI出题` and `AI组卷` should reuse existing implementation                     | Future AI generation repairs must reuse shared contracts/services/components where feasible; this task does not implement AI generation.              |
| UI visibility is not authorization                                                        | Bootstrap must be a local acceptance helper only and cannot weaken production authorization.                                                          |
| Sensitive evidence boundary                                                               | Evidence records command/status/test counts/failure class only.                                                                                       |

## Acceptance Impact

This task can unblock the account/session setup prerequisite for:

- `content_admin.content_ai_question_generation`
- `content_admin.content_ai_paper_generation`

It cannot mark those rows as passed. Passing them requires a later localhost browser acceptance rerun with redacted
role/route/control/status evidence.

## Blocked Gates

No DB write, schema/migration/seed, Provider call/configuration, dependency/package/lockfile change, env/secret read,
browser runtime, dev-server start, staging/prod/deploy, PR, force push, release readiness, final Pass, or Cost
Calibration Gate execution is approved in this task.
