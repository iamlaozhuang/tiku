# Evidence: Phase 12 Student Question Type Runtime

## Status

`validated`

## Boundary

This task implements local/dev student runtime alignment for existing schema-supported question types only. It does not change dependencies, package or lockfiles, schema, migrations, scripts, secrets, env files, staging/prod, deployment, cloud resources, Tencent Cloud COS, public object storage URLs, or provider configuration.

## Recovery

| Item            | Result                                                 |
| --------------- | ------------------------------------------------------ |
| Started from    | clean `master` at `d7b4a60`                            |
| Branch          | `codex/phase-12-student-question-type-runtime`         |
| Task            | `phase-12-repair-student-question-type-runtime`        |
| Claim readiness | pass                                                   |
| High-risk gates | schema/migration/dependency/secret/cloud remain closed |

## TDD Log

| Step  | Command                                                                 | Result                                                                                                                         |
| ----- | ----------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| RED   | `npm.cmd run test:unit -- src/server/services/practice-service.test.ts` | failed as expected: canonical `multi_choice`, `fill_blank`, and `short_answer` were not handled correctly in practice service. |
| GREEN | `npm.cmd run test:unit -- src/server/services/practice-service.test.ts` | pass: 13 tests after canonical question type helpers, fill_blank auto-match, and short_answer subjective handling.             |
| RED   | `npm.cmd run test:unit -- tests/unit/student-practice-ui.test.ts`       | failed as expected: canonical `multi_choice` and `fill_blank` snapshots were dropped as empty practice.                        |
| GREEN | `npm.cmd run test:unit -- tests/unit/student-practice-ui.test.ts`       | pass: 12 tests after canonical parsing, multi-select toggling, and fill_blank text answer UI/payload handling.                 |

Notes:

- Legacy local snapshot values `multiple_choice` and `subjective` are normalized for backward compatibility, but new runtime behavior uses canonical `multi_choice` and `short_answer`.
- `case_analysis` and `calculation` remain outside this task because they require the separate schema/migration approval gate.
- Fill blank scoring is limited to `fill_blank` with `scoringMethod: "auto_match"` and uses local deterministic exact matching.

## Validation

| Command                                                                                                                                                                                                                                                | Result                                          |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------- |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-TaskClaimReadiness.ps1 -TaskId phase-12-repair-student-question-type-runtime`                                                                                     | pass                                            |
| `npm.cmd run test:unit -- tests/unit/student-practice-ui.test.ts tests/unit/student-mock-exam-report-ui.test.ts tests/unit/student-mistake-book-ui.test.ts src/server/services/practice-service.test.ts src/server/services/mock-exam-service.test.ts` | pass: 5 files, 58 tests                         |
| `npm.cmd run test:e2e -- e2e/student-practice-mock-entry.spec.ts`                                                                                                                                                                                      | pass: 1 Playwright test                         |
| `npm.cmd run build`                                                                                                                                                                                                                                    | pass: Next.js build and TypeScript completed    |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-AgentSystemReadiness.ps1`                                                                                                                                         | pass                                            |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-NamingConventions.ps1`                                                                                                                                            | pass                                            |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`                                                                                                                    | pass inventory; uncommitted task files expected |
| `git diff --check`                                                                                                                                                                                                                                     | pass                                            |

Mechanism note:

- A closeout rerun initially failed `Test-TaskClaimReadiness` because the task state had been advanced to `closed` before the commit barrier. The state was corrected back to `claimed`, the claim readiness gate was rerun successfully, and the task was then advanced to `closed` for the final commit.

## Repository Hygiene

| Item                            | Result                                                               |
| ------------------------------- | -------------------------------------------------------------------- |
| Package/lockfile changes        | none                                                                 |
| Schema/migration/script changes | none                                                                 |
| Secret/env access               | no `.env.local` content read or output                               |
| Staging/prod/cloud/deploy       | not touched                                                          |
| Changed runtime scope           | student practice/mock_exam UI and practice/mock_exam service only    |
| Next task after closeout        | `phase-12-repair-ops-org-auth-redeem-ui-closure` from clean `master` |

## Implementation Summary

- Practice service now recognizes canonical `multi_choice`, `fill_blank`, and `short_answer`; it keeps legacy snapshot aliases for local backward compatibility.
- Practice scoring now applies partial credit to canonical `multi_choice` and exact matching to `fill_blank` with `auto_match`.
- Student practice UI now parses canonical option/text question types, supports multi-select, and sends correct `selectedLabels`/`textAnswer` payloads.
- Mock exam service and UI now share the same canonical option/text question type boundary while still withholding correctness, answers, and analysis during the exam.
