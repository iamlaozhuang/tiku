# 2026-07-09 Content AI 0704 Paper Publish Replay Evidence

## Task

- Task id: `content-ai-0704-paper-publish-replay-2026-07-09`
- Branch: `codex/content-ai-0704-paper-publish-replay`
- Evidence mode: redacted route label, role label, status category, field shape, and aggregate count only.

## Runtime Replay

| Check                                | Result                                                                 |
| ------------------------------------ | ---------------------------------------------------------------------- |
| Localhost target                     | pass: `127.0.0.1:3000`                                                 |
| Provider execution                   | not executed                                                           |
| Content AI组卷 history read          | pass: 2 history items                                                  |
| Formal paper target                  | pass: found one formal paper draft target                              |
| Before publish status                | draft                                                                  |
| Before publish section count         | 1                                                                      |
| Before publish paper question count  | 2                                                                      |
| Before publish scored question count | 2                                                                      |
| Before publish total score alignment | pass: paper total score matched paper question score sum               |
| Publish route                        | pass: `POST /api/v1/papers/{publicId}/publish` returned success        |
| After publish status                 | published                                                              |
| Content published paper list         | pass: published list contained the target after response-shape mapping |

## Authorization Fixture

Existing private learner/employee credentials were usable for login, but none had an authorization scope matching the newly published target paper. Per the user's prior local-0704 approval to add accounts when role credentials are missing, a local product-route fixture was created.

| Check                               | Result                                                                 |
| ----------------------------------- | ---------------------------------------------------------------------- |
| Existing account matching scope     | 0                                                                      |
| Local account fixture path          | product APIs only                                                      |
| Redeem code generation              | pass: one `personal_standard_activation` code generated in memory only |
| Local personal user registration    | pass                                                                   |
| Redeem code redemption              | pass                                                                   |
| Repository-external credential file | updated without outputting credential values                           |
| Student scope match                 | pass                                                                   |
| Student paper list route            | pass: `GET /api/v1/student-papers` returned success                    |
| Student visible target              | pass                                                                   |
| Student visible list total          | 1                                                                      |

## Validation Commands

| Command                                                                                                                                                                                                                                                                                                                                                                                                               | Result                   |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------ |
| `corepack pnpm@10.26.1 exec vitest run src/server/services/admin-ai-generation-formal-draft-adapter.test.ts src/lib/admin-ai-generation-formal-draft-payload.test.ts tests/unit/admin-ai-generation-entry-surface.test.ts tests/unit/admin-paper-ui.test.ts src/server/services/paper-draft-service.test.ts src/server/services/admin-ai-generation-local-contract-route.test.ts --reporter=dot`                      | pass: 6 files, 116 tests |
| `corepack pnpm@10.26.1 exec vitest run src/server/services/personal-ai-generation-request-route.test.ts src/server/services/personal-ai-generation-result-route.test.ts src/features/student/ai-generation/StudentPersonalAiGenerationPage.test.tsx tests/unit/student-personal-ai-generation-ui.test.ts --reporter=dot`                                                                                              | pass: 4 files, 96 tests  |
| `corepack pnpm@10.26.1 exec vitest run src/server/services/organization-training-route.test.ts src/server/services/organization-training-service.test.ts tests/unit/organization-training-admin-entry-surface.test.ts tests/unit/organization-training-employee-entry-surface.test.ts tests/unit/organization-portal-admin-entry-surface.test.ts tests/unit/admin-dashboard-layout-navigation.test.ts --reporter=dot` | pass: 6 files, 119 tests |
| `corepack pnpm@10.26.1 lint`                                                                                                                                                                                                                                                                                                                                                                                          | pass                     |
| `corepack pnpm@10.26.1 typecheck`                                                                                                                                                                                                                                                                                                                                                                                     | pass                     |
| `git diff --check`                                                                                                                                                                                                                                                                                                                                                                                                    | pass                     |
| `corepack pnpm@10.26.1 exec prettier --check --ignore-unknown <scoped files>`                                                                                                                                                                                                                                                                                                                                         | pass                     |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId content-ai-0704-paper-publish-replay-2026-07-09`                                                                                                                                                                                                                                       | pass                     |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId content-ai-0704-paper-publish-replay-2026-07-09 -SkipRemoteAheadCheck`                                                                                                                                                                                                                   | pass                     |

## Sensitive Evidence Boundary

- No credentials, plaintext redeem_code values, session values, cookies, tokens, localStorage values, Authorization headers, env values, or DB URLs were recorded.
- No raw DB rows, internal numeric ids, Provider payloads, raw prompt, raw AI output, full question, full paper, full material, resource content, or chunk content were recorded.
- No screenshot, raw DOM, trace, staging/prod, deploy, Provider, dependency, package, lockfile, schema, migration, seed, direct DB mutation, destructive DB, PR, force push, or Cost Calibration action was executed.
