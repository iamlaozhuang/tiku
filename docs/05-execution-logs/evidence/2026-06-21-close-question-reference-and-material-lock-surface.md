# Close Question Reference And Material Lock Surface Evidence

## Scope

- Task: `close-question-reference-and-material-lock-surface`
- Branch: `codex/close-question-reference-and-material-lock-surface`
- Base: `5e8f20fdebdc96160fb249b3fe1ba61572cabff7`
- Scope: content_admin UI reference counts/details and lock-state feedback for `question` and `material`.

## TDD Evidence

- RED command: `npm.cmd run test:unit -- tests/unit/admin-question-material-ui.test.ts`
- RED result: failed as expected. The question rows lacked `question-lock-{publicId}` summaries and material rows lacked
  `material-reference-summary-{publicId}` / `material-lock-{publicId}` surfaces.
- GREEN command: `npm.cmd run test:unit -- tests/unit/admin-question-material-ui.test.ts`
- GREEN result: pass, 1 file and 28 tests.

## Validation

| Command                                                                                                                                                                                                | Result                    |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------- |
| `npm.cmd run test:unit -- tests/unit/admin-question-material-ui.test.ts`                                                                                                                               | Pass, 1 file and 28 tests |
| `npm.cmd run lint`                                                                                                                                                                                     | Pass                      |
| `npm.cmd run typecheck`                                                                                                                                                                                | Pass                      |
| `git diff --check`                                                                                                                                                                                     | Pass                      |
| `node .\node_modules\prettier\bin\prettier.cjs --check ...question reference material lock task files...`                                                                                              | Pass after formatting     |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId close-question-reference-and-material-lock-surface`                     | Pass                      |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId close-question-reference-and-material-lock-surface -SkipRemoteAheadCheck` | Pass                      |

## Implementation Summary

- Added `question` lock summaries that show editable vs locked state and `lockedAt` without internal IDs.
- Added `material` lock summaries that show editable vs locked state and `lockedAt`.
- Added `material` reference summaries with linked `question` and `paper` publicId counts plus status/type details.
- Reused existing `MaterialDto.references`, `isLocked`, and `lockedAt`; no contract, service, persistence, or runtime
  lock behavior changed.

## Blocked Runtime Proof

- Dev server, Browser plugin, Playwright, and e2e/runtime screenshot validation are not run because the current batch
  instructions explicitly block those capabilities.

## Redaction

Evidence must not include secrets, tokens, database URLs, Authorization headers, raw DB rows, plaintext `redeem_code`,
raw prompts, Provider payloads, private answers, full paper/material/question content, internal numeric ids, or publicId
inventories.
