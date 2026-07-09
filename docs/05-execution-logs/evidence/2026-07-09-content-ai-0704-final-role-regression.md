# 2026-07-09 Content AI 0704 Final Role Regression Evidence

## Scope

- Task id: `content-ai-0704-final-role-regression-2026-07-09`
- Branch: `codex/content-ai-0704-final-role-regression`
- Target: localhost / local 0704 only.
- Purpose: verify the content AI question/paper publish replays remain usable and do not regress adjacent personal learner or organization advanced employee/admin boundaries.

## Redaction Boundary

- No credential, password, plaintext card value, session, cookie, token, localStorage value, Authorization header, DB URL, env value, raw DB row, internal numeric id, Provider payload, raw prompt, raw AI output, or full question/paper/material/resource/chunk content was recorded.
- Product route probe values were kept in process memory only.
- No screenshot, raw DOM dump, trace, staging/prod/deploy, Provider, direct DB access, direct DB mutation, schema, migration, seed, dependency, package, lockfile, PR, force push, or Cost Calibration action was executed.

## Localhost Probe

| Check                                   | Result                 |
| --------------------------------------- | ---------------------- |
| Localhost target                        | pass: `127.0.0.1:3000` |
| Content local acceptance session        | pass                   |
| Content AI出题 history read             | pass: 3 items          |
| Content AI出题 formal target count      | 1                      |
| Formal question target status           | `available`            |
| Available question list contains target | pass                   |
| Available question list aggregate total | 17                     |
| Content AI组卷 history read             | pass: 2 items          |
| Content AI组卷 formal target count      | 1                      |
| Formal paper target status              | `published`            |
| Published paper list contains target    | pass                   |
| Published paper list aggregate total    | 3                      |
| Published paper target scope resolved   | pass                   |
| Authorized learner fixture login        | pass                   |
| Student paper list route                | pass                   |
| Student visible target                  | pass                   |
| Student visible list aggregate total    | 1                      |
| Organization advanced employee login    | pass                   |
| Employee training visible-list route    | pass                   |
| Employee visible training version count | 4                      |
| Provider execution                      | not executed           |
| Screenshot/raw DOM capture              | not executed           |
| Direct DB access or mutation            | not executed           |

## Validation

| Command                                                                                                                                                                                                                                                                                                                                                                                                                                        | Result                                      |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------- |
| `corepack pnpm@10.26.1 exec vitest run tests/unit/admin-ai-generation-entry-surface.test.ts tests/unit/admin-question-material-ui.test.ts tests/unit/admin-paper-ui.test.ts src/server/services/admin-ai-generation-formal-draft-adapter.test.ts src/lib/admin-ai-generation-formal-draft-payload.test.ts src/server/services/paper-draft-service.test.ts src/server/services/admin-ai-generation-local-contract-route.test.ts --reporter=dot` | pass: 7 files, 147 tests                    |
| `corepack pnpm@10.26.1 exec vitest run src/server/services/personal-ai-generation-request-route.test.ts src/server/services/personal-ai-generation-result-route.test.ts src/features/student/ai-generation/StudentPersonalAiGenerationPage.test.tsx tests/unit/student-personal-ai-generation-ui.test.ts --reporter=dot`                                                                                                                       | pass: 4 files, 96 tests                     |
| `corepack pnpm@10.26.1 exec vitest run src/server/services/organization-training-route.test.ts src/server/services/organization-training-service.test.ts tests/unit/organization-training-admin-entry-surface.test.ts tests/unit/organization-training-employee-entry-surface.test.ts tests/unit/organization-portal-admin-entry-surface.test.ts tests/unit/admin-dashboard-layout-navigation.test.ts --reporter=dot`                          | pass: 6 files, 119 tests                    |
| `corepack pnpm@10.26.1 lint`                                                                                                                                                                                                                                                                                                                                                                                                                   | pass                                        |
| `corepack pnpm@10.26.1 typecheck`                                                                                                                                                                                                                                                                                                                                                                                                              | pass                                        |
| `git diff --check`                                                                                                                                                                                                                                                                                                                                                                                                                             | pass                                        |
| `corepack pnpm@10.26.1 exec prettier --check --ignore-unknown <scoped files>`                                                                                                                                                                                                                                                                                                                                                                  | pass                                        |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId content-ai-0704-final-role-regression-2026-07-09`                                                                                                                                                                                                                                                               | pass                                        |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId content-ai-0704-final-role-regression-2026-07-09 -SkipRemoteAheadCheck`                                                                                                                                                                                                                                           | pass after repository checkpoint correction |

## Result

Pass. Runtime and targeted regression probes passed without Provider execution or sensitive evidence exposure.
