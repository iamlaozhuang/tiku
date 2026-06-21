# Evidence: Clarify Student Subject And Paper Count Copy

**Date:** 2026-06-21
**Task id:** `clarify-student-subject-and-paper-count-copy`
**Branch:** `codex/clarify-student-home-copy`
**Evidence mode:** command/result summary only.

## Scope Confirmation

- Allowed product file: `src/features/student/home/StudentHomePage.tsx`.
- Allowed focused test: `tests/unit/student-home-ui.test.ts`.
- No browser/dev-server/e2e, package/dependency, schema/migration/database, Provider/env, deploy, PR, force-push, payment, external-service, or Cost Calibration Gate work.

## TDD Evidence

| phase | command                                                       | result        | evidence                                                                                                                                                         |
| ----- | ------------------------------------------------------------- | ------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| RED   | `npm.cmd run test:unit -- tests/unit/student-home-ui.test.ts` | expected fail | 9 tests ran; 1 failed. Failure was the new assertion missing `理论/技能是科目分组，不是两套系统或答题模式。`, proving the copy was absent before implementation. |
| GREEN | `npm.cmd run test:unit -- tests/unit/student-home-ui.test.ts` | pass          | 1 file passed; 9 tests passed.                                                                                                                                   |

## Validation Results

| command                                                     | result       | evidence                                                     |
| ----------------------------------------------------------- | ------------ | ------------------------------------------------------------ |
| `npm.cmd run lint`                                          | pass         | ESLint exited 0.                                             |
| `npm.cmd run typecheck`                                     | pass         | `tsc --noEmit` exited 0.                                     |
| `git diff --check`                                          | pass         | Exit 0, no whitespace errors.                                |
| `node .\node_modules\prettier\bin\prettier.cjs --check ...` | initial fail | Three new Markdown files required formatting.                |
| `node .\node_modules\prettier\bin\prettier.cjs --write ...` | pass         | Source/test files unchanged; three Markdown files formatted. |

Final validation after evidence/state updates:

| command                                                                                                                                                                      | result | evidence                                                                                                                            |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ | ----------------------------------------------------------------------------------------------------------------------------------- |
| `npm.cmd run test:unit -- tests\unit\student-home-ui.test.ts`                                                                                                                | pass   | 1 file passed; 9 tests passed.                                                                                                      |
| `npm.cmd run lint`                                                                                                                                                           | pass   | ESLint exited 0.                                                                                                                    |
| `npm.cmd run typecheck`                                                                                                                                                      | pass   | `tsc --noEmit` exited 0.                                                                                                            |
| `git diff --check`                                                                                                                                                           | pass   | Exit 0, no whitespace errors.                                                                                                       |
| `node .\node_modules\prettier\bin\prettier.cjs --check ...`                                                                                                                  | pass   | `All matched files use Prettier code style!`                                                                                        |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId clarify-student-subject-and-paper-count-copy` | pass   | Scanned 7 changed files; all matched allowed scope; pre-commit hardening passed.                                                    |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId clarify-student-subject-and-paper-count-copy`   | pass   | Git readiness passed; `master` and `origin/master` both at `76e44bbb`; evidence and audit paths present; pre-push readiness passed. |

## Runtime Boundary

No browser/dev-server/e2e runtime was executed. Runtime proof remains `runtime_verification_later` under the current approval boundary.
