# Content AI 0704 Fixture History Refresh Evidence

## Scope

- Task id: `content-ai-0704-fixture-history-refresh-2026-07-09`
- Branch: `codex/content-ai-0704-fixture-history-refresh`
- Approval: user approved Option B local 0704 non-destructive fixture/history refresh.
- Target: localhost / local 0704 acceptance DB only.

## Redaction Boundary

- No credential, session, cookie, token, localStorage value, Authorization header, DB URL, env value, raw DB row, internal numeric id, Provider payload, raw prompt, raw AI output, or full question/paper/material/resource/chunk content was recorded.
- Evidence below uses route labels, state labels, aggregate counts, and redacted status only.

## DB Target And Mutation

| Check                                         | Result                                          |
| --------------------------------------------- | ----------------------------------------------- |
| Local DB target label                         | pass: `tiku_full_chain_acceptance_20260704_001` |
| Provider execution                            | not executed                                    |
| Destructive DB operation                      | not executed                                    |
| Schema/migration/seed/package/lockfile change | not executed                                    |
| Source/test code change                       | not executed                                    |

Pre-refresh aggregate:

| Area                   | Status                                                              |
| ---------------------- | ------------------------------------------------------------------- |
| Content AI出题 history | only rejected/no-target history existed for the content review pool |
| Content AI组卷 history | a draft target existed, but the draft paper total score was missing |

Non-destructive refresh actions:

| Action                                                                            | Result                 |
| --------------------------------------------------------------------------------- | ---------------------- |
| Insert redacted content AI出题 accepted history with formal question draft target | executed once          |
| Align content AI出题 owner to platform content review pool                        | executed once          |
| Align content AI出题 task metadata to current read-model contract                 | executed once          |
| Update existing content AI组卷 draft paper total score from question score sum    | executed once          |
| Update paper section totals                                                       | no-op; already aligned |

Post-refresh aggregate:

| Area                                             | Result                      |
| ------------------------------------------------ | --------------------------- |
| Content AI出题 approved + draft-created target   | pass: 1                     |
| Content AI出题 target question status            | pass: disabled draft target |
| Content AI组卷 draft target                      | pass: 1                     |
| Content AI组卷 draft question count              | pass: 2                     |
| Content AI组卷 missing question score count      | pass: 0                     |
| Content AI组卷 paper total score vs question sum | pass: equal                 |
| Content AI组卷 empty section count               | pass: 0                     |
| Content AI组卷 publish precondition aggregate    | pass                        |

## Localhost Read Probe

Method: local content admin account was used in process memory only. Credentials and session cookie were not printed or stored in evidence.

| Probe                                                                | Result                   |
| -------------------------------------------------------------------- | ------------------------ |
| `POST /api/v1/sessions`                                              | pass                     |
| Session cookie received                                              | pass; value not recorded |
| `GET /api/v1/content-ai-generation-requests?generationKind=question` | pass                     |
| Content AI出题 history pagination total                              | 3                        |
| Content AI出题 approved + draft-created + formal target count        | 1                        |
| `GET /api/v1/content-ai-generation-requests?generationKind=paper`    | pass                     |
| Content AI组卷 history pagination total                              | 2                        |
| Content AI组卷 approved + draft-created + formal target count        | 1                        |

Temporary diagnostic smoke tests were created only to locate a read-model contract mismatch and were deleted before evidence closeout.

## Validation

| Command                                                                                                                                                                                                                                                                                                                                                                                                                                        | Result                   |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------ |
| `corepack pnpm@10.26.1 exec vitest run tests/unit/admin-ai-generation-entry-surface.test.ts tests/unit/admin-question-material-ui.test.ts tests/unit/admin-paper-ui.test.ts src/server/services/admin-ai-generation-formal-draft-adapter.test.ts src/lib/admin-ai-generation-formal-draft-payload.test.ts src/server/services/paper-draft-service.test.ts src/server/services/admin-ai-generation-local-contract-route.test.ts --reporter=dot` | pass: 7 files, 147 tests |
| `corepack pnpm@10.26.1 exec vitest run src/server/services/personal-ai-generation-request-route.test.ts src/server/services/personal-ai-generation-result-route.test.ts src/features/student/ai-generation/StudentPersonalAiGenerationPage.test.tsx tests/unit/student-personal-ai-generation-ui.test.ts --reporter=dot`                                                                                                                       | pass: 4 files, 96 tests  |
| `corepack pnpm@10.26.1 exec vitest run src/server/services/organization-training-route.test.ts src/server/services/organization-training-service.test.ts tests/unit/organization-training-admin-entry-surface.test.ts tests/unit/organization-training-employee-entry-surface.test.ts tests/unit/organization-portal-admin-entry-surface.test.ts tests/unit/admin-dashboard-layout-navigation.test.ts --reporter=dot`                          | pass: 6 files, 119 tests |
| `corepack pnpm@10.26.1 lint`                                                                                                                                                                                                                                                                                                                                                                                                                   | pass                     |
| `corepack pnpm@10.26.1 typecheck`                                                                                                                                                                                                                                                                                                                                                                                                              | pass                     |
| `corepack pnpm@10.26.1 exec prettier --check --ignore-unknown <scoped files>`                                                                                                                                                                                                                                                                                                                                                                  | pass                     |
| `git diff --check`                                                                                                                                                                                                                                                                                                                                                                                                                             | pass                     |
| `Test-ModuleRunV2PreCommitHardening.ps1 -TaskId content-ai-0704-fixture-history-refresh-2026-07-09`                                                                                                                                                                                                                                                                                                                                            | pass                     |
| `Test-ModuleRunV2PrePushReadiness.ps1 -TaskId content-ai-0704-fixture-history-refresh-2026-07-09 -SkipRemoteAheadCheck`                                                                                                                                                                                                                                                                                                                        | pass                     |

## Result

Local 0704 content AI history is now sufficient for the next no-Provider publish replay branches:

- AI出题 has an approved formal question draft target visible to content backend history.
- AI组卷 has an approved formal paper draft target with aggregate publish preconditions aligned.
