# Content AI 0704 Question Publish Replay Evidence

## Scope

- Task id: `content-ai-0704-question-publish-replay-2026-07-09`
- Branch: `codex/content-ai-0704-question-publish-replay`
- Target: localhost / local 0704 only.
- Purpose: replay content AI出题 accepted formal question draft to available formal question.

## Redaction Boundary

- No credential, session, cookie, token, localStorage value, Authorization header, DB URL, env value, raw DB row, internal numeric id, Provider payload, raw prompt, raw AI output, or full question/paper/material/resource/chunk content was recorded.
- Product API payload reused the existing formal question detail in process memory only; full stem/options/answer/analysis were not printed or written to evidence.

## Localhost Replay

| Probe                                              | Result       |
| -------------------------------------------------- | ------------ |
| Content admin in-memory login                      | pass         |
| Content AI出题 history target lookup               | pass         |
| Formal question target before replay               | `disabled`   |
| `PATCH /api/v1/questions/{publicId}` status update | pass         |
| Formal question target after replay                | `available`  |
| Available question list contains target            | pass         |
| Available question list aggregate total            | 17           |
| Provider execution                                 | not executed |
| Screenshot/raw DOM capture                         | not executed |
| Direct DB mutation                                 | not executed |

## Validation

| Command                                                                                                                                                                                                                                                                                                                                                                                                               | Result                   |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------ |
| `corepack pnpm@10.26.1 exec vitest run tests/unit/admin-ai-generation-entry-surface.test.ts tests/unit/admin-question-material-ui.test.ts src/server/services/admin-ai-generation-local-contract-route.test.ts src/server/services/question-service.test.ts --reporter=dot`                                                                                                                                           | pass: 4 files, 118 tests |
| `corepack pnpm@10.26.1 exec vitest run src/server/services/personal-ai-generation-request-route.test.ts src/server/services/personal-ai-generation-result-route.test.ts src/features/student/ai-generation/StudentPersonalAiGenerationPage.test.tsx tests/unit/student-personal-ai-generation-ui.test.ts --reporter=dot`                                                                                              | pass: 4 files, 96 tests  |
| `corepack pnpm@10.26.1 exec vitest run src/server/services/organization-training-route.test.ts src/server/services/organization-training-service.test.ts tests/unit/organization-training-admin-entry-surface.test.ts tests/unit/organization-training-employee-entry-surface.test.ts tests/unit/organization-portal-admin-entry-surface.test.ts tests/unit/admin-dashboard-layout-navigation.test.ts --reporter=dot` | pass: 6 files, 119 tests |
| `corepack pnpm@10.26.1 lint`                                                                                                                                                                                                                                                                                                                                                                                          | pass                     |
| `corepack pnpm@10.26.1 typecheck`                                                                                                                                                                                                                                                                                                                                                                                     | pass                     |
| `git diff --check`                                                                                                                                                                                                                                                                                                                                                                                                    | pass                     |
| `corepack pnpm@10.26.1 exec prettier --check --ignore-unknown <scoped files>`                                                                                                                                                                                                                                                                                                                                         | pass                     |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId content-ai-0704-question-publish-replay-2026-07-09`                                                                                                                                                                                                                                    | pass                     |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId content-ai-0704-question-publish-replay-2026-07-09 -SkipRemoteAheadCheck`                                                                                                                                                                                                                | pass                     |

## Result

Pass. Content AI出题 now has a no-Provider localhost replay from accepted formal question draft to available formal question.
