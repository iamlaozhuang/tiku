# Paper Student Runtime Guard Package Evidence

## Scope

- Task: `paper-student-runtime-guard-package`
- Branch: `codex/paper-student-runtime-guard-package`
- Base: `a690dcd6194ba447f40c86020dde459faa2445f4`
- Scope: local `practice` and `mock_exam` service startup guards plus focused unit tests for illegal published `paper` question counts.

## TDD Evidence

- RED command:
  `npm.cmd run test:unit -- src/server/services/practice-service.test.ts src/server/services/mock-exam-service.test.ts`
- RED result: failed as expected. The new `practice` and `mock_exam` startup tests proved illegal published `paper`
  question counts still created runtime sessions.
- GREEN command:
  `npm.cmd run test:unit -- src/server/services/practice-service.test.ts src/server/services/mock-exam-service.test.ts`
- GREEN result: pass, 2 test files and 42 tests passed.

## Validation

| Command                                                                                                                                                                                 | Result                                          |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------- |
| `npm.cmd run test:unit -- src/server/services/practice-service.test.ts src/server/services/mock-exam-service.test.ts`                                                                   | Pass, 2 files and 42 tests                      |
| `npm.cmd run lint`                                                                                                                                                                      | Pass                                            |
| `npm.cmd run typecheck`                                                                                                                                                                 | Pass                                            |
| `git diff --check`                                                                                                                                                                      | Pass                                            |
| `node .\node_modules\prettier\bin\prettier.cjs --check ...paper student runtime guard task files...`                                                                                    | Pass, all matched files use Prettier code style |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId paper-student-runtime-guard-package`                     | Pass, 9 files in task scope                     |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId paper-student-runtime-guard-package -SkipRemoteAheadCheck` | Pass                                            |

## Implementation Summary

- Added startup guards for `practice` and `mock_exam` after published `paper` lookup and before authorization/session
  side effects.
- Reused the published `paper` question-count validator and counted questions from `paper_snapshot.paperSections`.
- Added focused unit coverage for empty and 101-question published snapshots in both student runtime startup paths.

## Redaction

Evidence must not include secrets, tokens, database URLs, Authorization headers, raw DB rows, plaintext `redeem_code`,
raw prompts, Provider payloads, private answers, full paper/material content, internal numeric ids, or publicId
inventories.
