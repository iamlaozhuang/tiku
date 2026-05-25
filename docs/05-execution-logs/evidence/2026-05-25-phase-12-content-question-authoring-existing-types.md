# Evidence: Phase 12 Content Question Authoring Existing Types

## Status

`validated`

## Boundary

This task implements local/dev content question authoring for existing schema-supported question types only. It does not change dependencies, package or lockfiles, schema, migrations, scripts, secrets, env files, staging/prod, deployment, cloud resources, Tencent Cloud COS, public object storage URLs, or provider configuration.

## Recovery

| Item            | Result                                                      |
| --------------- | ----------------------------------------------------------- |
| Started from    | clean `master` at `29c78ba`                                 |
| Branch          | `codex/phase-12-content-question-authoring-existing-types`  |
| Task            | `phase-12-repair-content-question-authoring-existing-types` |
| Claim readiness | pass                                                        |
| High-risk gates | schema/migration/dependency/secret/cloud remain closed      |

## TDD Log

| Step       | Command                                                                  | Result                                                                                       |
| ---------- | ------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------- |
| RED        | `npm.cmd run test:unit -- tests/unit/admin-question-material-ui.test.ts` | failed as expected: content question form had no `题型` control, proving the missing UI gap. |
| GREEN      | `npm.cmd run test:unit -- tests/unit/admin-question-material-ui.test.ts` | passed: 8 tests after adding existing-type fields and payload mapping.                       |
| REGRESSION | `npm.cmd run test:unit -- tests/unit/admin-question-material-ui.test.ts` | passed: 9 tests after adding non-option `short_answer` scoring point coverage.               |

Notes:

- The form now exposes schema-supported existing question types only: `single_choice`, `multi_choice`, `true_false`, `fill_blank`, and `short_answer`.
- `case_analysis` and `calculation` remain outside this task because they require the separate schema/migration approval gate.
- The implementation preserves publicId-facing behavior and does not expose auto-increment IDs.

## Validation

| Command                                                                                                                                                                        | Result                                          |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------- |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-TaskClaimReadiness.ps1 -TaskId phase-12-repair-content-question-authoring-existing-types` | pass                                            |
| `npm.cmd run test:unit -- tests/unit/admin-question-material-ui.test.ts tests/unit/phase-9-content-question-material-runtime.test.ts`                                          | pass: 2 files, 13 tests                         |
| `npm.cmd run test:e2e -- e2e/content-action-closures.spec.ts`                                                                                                                  | pass: 1 Playwright test                         |
| `npm.cmd run build`                                                                                                                                                            | pass: Next.js build and TypeScript completed    |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-AgentSystemReadiness.ps1`                                                                 | pass                                            |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-NamingConventions.ps1`                                                                    | pass                                            |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`                                            | pass inventory; uncommitted task files expected |
| `git diff --check`                                                                                                                                                             | pass                                            |

Closeout sequencing note:

- `Test-TaskClaimReadiness` was run and passed while the queue task status was `claimed`.
- After validation, the queue task was changed to `closed`. A later accidental rerun of `Test-TaskClaimReadiness` correctly reported the task as not claimable because it was already closed; this is expected mechanism behavior and not a runtime/test failure.

Formatting:

- `node .\node_modules\prettier\bin\prettier.cjs --write ...` completed after sandbox escalation because the sandbox denied reading `node_modules` with `EPERM`.

Pre-commit note:

- First `git commit` attempt failed because `eslint --fix` reported `react-hooks/set-state-in-effect` on the question form prop-to-state sync effect.
- Fixed by keying `QuestionWriteForm` from `activeForm.mode` and `activeForm.publicId`, so switching create/edit targets remounts the form without a synchronous effect state update.
- After the fix, `npm.cmd run test:unit -- tests/unit/admin-question-material-ui.test.ts tests/unit/phase-9-content-question-material-runtime.test.ts`, `npm.cmd run test:e2e -- e2e/content-action-closures.spec.ts`, `npm.cmd run build`, `Test-NamingConventions`, and `git diff --check` were rerun and passed.

## Repository Hygiene

| Item                            | Result                                                              |
| ------------------------------- | ------------------------------------------------------------------- |
| Package/lockfile changes        | none                                                                |
| Schema/migration/script changes | none                                                                |
| Secret/env access               | no `.env.local` content read or output                              |
| Staging/prod/cloud/deploy       | not touched                                                         |
| Changed runtime scope           | content question authoring UI and unit coverage only                |
| Next task after closeout        | `phase-12-repair-student-question-type-runtime` from clean `master` |

## Implementation Summary

- Added content question form controls for question type, profession, level, subject, scoring method, multi-choice rule, and material publicId.
- Added option editing for existing option-based question types and scoring point editing for non-option question types.
- Replaced hardcoded `single_choice` create payload defaults with selected form values mapped to the existing `/api/v1/questions` contract.
- Hydrates edit forms from existing question DTO fields while preserving current page/list behavior.
