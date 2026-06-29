# Fix Route Error Envelope Question Paper Student Experience Traceability

- Task id: `fix-route-error-envelope-question-paper-student-experience-2026-06-29`
- Branch: `codex/fix-route-error-envelope-20260629`
- Status: closed pass
- Created at: `2026-06-29T07:44:19-07:00`
- Reviewed at: `2026-06-29T07:53:54-07:00`

## Scope

This traceability record covers a targeted source/test security fix for route error-envelope consistency in
question_paper and student_experience handler factories.

It does not authorize staging/prod/cloud/deploy, release readiness, final Pass, Cost Calibration, browser runtime, DB
connection or mutation, Provider/AI calls, dependency changes, schema/migration/seed work, PR creation, or force-push.

## Governance Inputs

| Input                                              | Status  |
| -------------------------------------------------- | ------- |
| `AGENTS.md`                                        | read    |
| `docs/03-standards/code-taste-ten-commandments.md` | read    |
| `docs/02-architecture/adr/`                        | read    |
| `docs/04-agent-system/state/project-state.yaml`    | updated |
| `docs/04-agent-system/state/task-queue.yaml`       | updated |
| source finding `sec-redlog-001`                    | closed  |

## Requirement Mapping

| Requirement                                                        | Evidence                                                                                                       |
| ------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------- |
| Unexpected route exceptions return standard API envelope           | Focused tests cover 500 status and `{ code, message, data }` envelope for both handler factories.              |
| Raw exception details are not serialized in response body          | Focused tests assert the response text omits the synthetic thrown detail.                                      |
| Existing success-path and provider-blocked behavior does not drift | Existing route-layering tests continue to pass in the same focused unit command.                               |
| Keep business URL and JSON naming rules intact                     | No external self-increment IDs are introduced; responses continue to use camelCase JSON fields.                |
| Preserve DB, Provider, browser, release, and dependency boundaries | No DB, Provider/AI, browser/runtime, release/deploy, dependency, package, lockfile, schema, or migration work. |

## Closed Finding

| Finding          | Severity | Status      | Closure                                                                  |
| ---------------- | -------- | ----------- | ------------------------------------------------------------------------ |
| `sec-redlog-001` | medium   | closed pass | Shared route-error-response envelope now covers the two scoped handlers. |

## Next Candidate

`verify-ai-provider-error-snapshot-redaction-2026-06-29`

The next task remains pending and must materialize its own allowedFiles/blockedFiles, validation commands, evidence
rules, and closeout policy before any source/test work.
