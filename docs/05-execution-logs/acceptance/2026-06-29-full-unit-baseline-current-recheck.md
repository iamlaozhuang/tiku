# Full Unit Baseline Current Recheck Acceptance

- Task id: `full-unit-baseline-current-recheck-2026-06-29`
- Branch: `codex/full-unit-current-recheck-20260629`
- Acceptance status: pass
- Updated at: `2026-06-29T00:32:00-07:00`

## Acceptance Criteria

| Criterion                                                                                                                                                                         | Status                       |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------- |
| Governance files materialize target, authorization, allowed/blocked files, DB boundary, AI/Provider boundary, credential boundary, redaction, and closeoutPolicy before execution | pass                         |
| `npm.cmd run test:unit` passes on current state, or failing baseline is repaired narrowly and rerun green                                                                         | pass                         |
| `npm.cmd run lint` passes                                                                                                                                                         | pass                         |
| `npm.cmd run typecheck` passes                                                                                                                                                    | pass                         |
| Scoped Prettier check and `git diff --check` pass                                                                                                                                 | pass                         |
| Module Run v2 pre-commit, closeout, and pre-push gates pass                                                                                                                       | pass                         |
| No sensitive evidence is recorded                                                                                                                                                 | pass                         |
| No browser, DB, AI Provider, dependency, schema/migration/seed, staging/prod, PR, force-push, final Pass, release readiness, or Cost Calibration action is executed               | pass                         |
| Task is committed, fast-forward merged to `master`, pushed to `origin/master`, and short branch is cleaned up                                                                     | pending post-commit closeout |

## Acceptance Notes

This task can accept only the current full unit baseline gate. It cannot accept the durable goal, because all-role,
all-flow, all-function owner-facing acceptance matrix coverage remains a later required stage.
