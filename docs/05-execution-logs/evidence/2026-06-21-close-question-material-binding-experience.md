# Close Question Material Binding Experience Evidence

## Scope

- Task: `close-question-material-binding-experience`
- Branch: `codex/close-question-material-binding-experience`
- Base: `cbd6c7cf751af76f1473a7b9e539390cbe4c7279`
- Scope: content_admin UI binding feedback for `material`, `knowledge_node`, and `tag` plus focused jsdom coverage.

## TDD Evidence

- RED command: `npm.cmd run test:unit -- tests/unit/admin-question-material-ui.test.ts`
- RED result: failed as expected. The content admin question row did not expose explicit
  `question-binding-{publicId}` feedback and the question form did not expose `question-binding-preview`.
- GREEN command: `npm.cmd run test:unit -- tests/unit/admin-question-material-ui.test.ts`
- GREEN result: pass, 1 file and 26 tests.

## Validation

| Command                                                                                                                                                                                        | Result                    |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------- |
| `npm.cmd run test:unit -- tests/unit/admin-question-material-ui.test.ts`                                                                                                                       | Pass, 1 file and 26 tests |
| `npm.cmd run lint`                                                                                                                                                                             | Pass                      |
| `npm.cmd run typecheck`                                                                                                                                                                        | Pass                      |
| `git diff --check`                                                                                                                                                                             | Pass                      |
| `node .\node_modules\prettier\bin\prettier.cjs --check ...question material binding task files...`                                                                                             | Pass                      |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId close-question-material-binding-experience`                     | Pass                      |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId close-question-material-binding-experience -SkipRemoteAheadCheck` | Pass                      |

## Implementation Summary

- Added row-level `question` binding feedback for `material`, `knowledge_node`, and `tag`, including explicit `null`
  and `none` empty states.
- Added a form-level binding preview that parses and deduplicates `knowledge_node` and `tag` publicId input before save.
- Preserved existing question create/update payload behavior; no service, validator, schema, database, dependency, or
  Provider behavior changed.

## Blocked Runtime Proof

- Dev server, Browser plugin, Playwright, and e2e/runtime screenshot validation are not run because the current batch
  instructions explicitly block those capabilities.

## Redaction

Evidence must not include secrets, tokens, database URLs, Authorization headers, raw DB rows, plaintext `redeem_code`,
raw prompts, Provider payloads, private answers, full paper/material/question content, internal numeric ids, or publicId
inventories.
