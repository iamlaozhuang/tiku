# 2026-07-09 Learner AI Final Regression Evidence

## Task

- Task id: `learner-ai-final-regression-2026-07-09`
- Branch: `codex/learner-ai-final-regression`
- Scope: validation-only closeout for the approved learner AI repair sequence.

## Requirement Mapping Result

- Personal advanced learner AI出题 remains able to create isolated self-practice sessions from server-created session questions.
- Personal advanced learner AI组卷 keeps submitted parameters, uses assembled formal-source paper containers, renders redacted preview state, and starts isolated self-practice from server-created session questions.
- Organization advanced employee AI出题 remains employee/actor scoped.
- Organization advanced employee AI组卷 keeps enterprise source preference, supports platform plus organization-visible enterprise source composition, and renders redacted enterprise self-test preview state.
- Employee learner AI request/result/session ownership checks remain covered by route/repository/service tests.
- AI组卷 insufficient state remains blocked before `开始作答`.
- Formal `practice`, `answer_record`, `mistake_book`, formal `question`, and formal `paper` writes remain outside learner AI self-practice.
- Content admin and organization admin AI generation/training surfaces were not modified in the final regression branch.

## Validation

- `corepack pnpm@10.26.1 exec vitest run tests/unit/student-personal-ai-generation-ui.test.ts src/server/validators/personal-ai-generation-request.test.ts src/server/services/personal-ai-generation-request-route.test.ts src/server/services/personal-ai-generation-result-route.test.ts src/server/services/personal-ai-generation-result-history-service.test.ts src/server/services/personal-ai-generation-result-persistence-service.test.ts src/server/services/personal-ai-generation-route-integrated-result-materialization-service.test.ts src/server/services/personal-ai-generation-runtime-bridge-service.test.ts src/server/services/personal-ai-generation-learning-session-route.test.ts src/server/services/personal-ai-generation-learning-session-service.test.ts src/server/services/personal-ai-generation-learning-session-paper-source-resolver.test.ts --reporter=dot`: PASS, 11 files / 135 tests.
- `corepack pnpm@10.26.1 run typecheck`: PASS.
- `corepack pnpm@10.26.1 run lint`: PASS.
- `git diff --check`: PASS.
- Localhost status-only checks:
  - `http://127.0.0.1:3000/login`: HTTP 200.
  - `http://127.0.0.1:3000/ops/users`: HTTP 200.
- `corepack pnpm@10.26.1 exec prettier --check --ignore-unknown <scoped docs>`: PASS.
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId learner-ai-final-regression-2026-07-09`: PASS.
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId learner-ai-final-regression-2026-07-09 -SkipRemoteAheadCheck`: PASS.

## Redaction Notes

- Localhost checks recorded HTTP status only; no raw DOM, screenshot, trace, cookies, token, session, localStorage, Authorization header, credential, or account value was captured.
- Evidence records command status and field-level behavior only.
- No environment values, DB URLs, DB raw rows, internal numeric ids, Provider payload, raw prompt, raw AI output, full question, full paper, or material content were recorded.
- No Provider execution, direct DB access, DB mutation, schema migration, seed, package, or lockfile operation was performed.
