# Evidence: AI generation admin idempotency and visible result repair

Task id: `ai-generation-admin-idempotency-visible-result-repair-2026-07-01`.

## Boundary

- Branch: `codex/ai-generation-admin-idempotency-visible-result-repair`
- Execution type: source and focused tests only.
- No database connection or mutation.
- No `.env*` access.
- No Provider call.
- No browser runtime.
- No package, lockfile, schema, migration, or seed change.
- Evidence is redacted and contains no raw AI output, prompt, payload, credential, token, cookie, session, localStorage, Authorization header, DB raw row, PII, or full content.

## Cross-role scan

| Surface                                          | Status  | Summary                                                                           |
| ------------------------------------------------ | ------- | --------------------------------------------------------------------------------- |
| content admin AI question/paper                  | scanned | Shares `AdminAiGenerationEntryPage` and admin local contract route.               |
| organization advanced admin AI question/paper    | scanned | Shares `AdminAiGenerationEntryPage` and admin local contract route.               |
| personal advanced student AI question/paper      | scanned | Shares `StudentPersonalAiGenerationPage`.                                         |
| organization advanced employee AI question/paper | scanned | Shares `StudentPersonalAiGenerationPage` with organization authorization context. |

## Initial findings

- Admin AI task identity and idempotency are currently scoped by workspace, generation kind, and actor; this is too broad for independent generation attempts.
- Admin AI result persistence reuses an existing result for the same task, so stale evidence can survive a later provider-succeeded attempt.
- Ordinary UI contains implementation-facing wording in shared AI components; this must be replaced by business wording.
- Student AI page already maps several raw field labels to Chinese business labels, but focused tests must protect against regression across history and detail surfaces.

## RED validation

| Command                                                                                                                                                                                                                                          | Result | Summary                                                                          |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------ | -------------------------------------------------------------------------------- |
| `npm.cmd run test:unit -- src/server/services/admin-ai-generation-local-contract-route.test.ts src/features/admin/ai-generation/AdminAiGenerationEntryPage.test.tsx src/features/student/ai-generation/StudentPersonalAiGenerationPage.test.tsx` | fail   | Confirmed actor-level admin task id reuse and ordinary admin UI wording leak.    |
| `npm.cmd run test:unit -- src/features/admin/ai-generation/AdminAiGenerationEntryPage.test.tsx`                                                                                                                                                  | fail   | Confirmed `元数据历史` and `paper_section` were visible in ordinary admin AI UI. |

## Implemented changes

- Admin AI task public id and idempotency key now include a request-scoped hash segment derived from the request public id.
- Admin AI result public id remains derived from task public id, so independent generation attempts no longer collide on the same actor-level result.
- Admin visible generated-content badge now uses business wording.
- Admin AI paper controls and structured previews now show `大题模块` rather than `paper_section`.
- Student structured paper preview now shows `大题模块` rather than `paper_section`.
- Focused tests protect ordinary admin/student UI from local-contract, redaction, raw field-name, and persistence wording leaks.

## GREEN validation

- `npm.cmd run test:unit -- src/features/admin/ai-generation/AdminAiGenerationEntryPage.test.tsx`: pass, 1 file and 2 tests.
- `npm.cmd run test:unit -- src/server/services/admin-ai-generation-local-contract-route.test.ts src/server/repositories/admin-ai-generation-task-persistence-repository.test.ts src/server/repositories/admin-ai-generation-result-persistence-repository.test.ts src/features/admin/ai-generation/AdminAiGenerationEntryPage.test.tsx src/features/student/ai-generation/StudentPersonalAiGenerationPage.test.tsx`: pass, 5 files and 46 tests.
- `npm.cmd exec -- prettier --check --ignore-unknown <task files>`: fail then pass. Initial check found 4 formatting targets; scoped prettier write was applied and rerun passed.
- `npm.cmd run lint`: pass.
- `npm.cmd run typecheck`: pass.
- `git diff --check`: pass.
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId ai-generation-admin-idempotency-visible-result-repair-2026-07-01`: pass.
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId ai-generation-admin-idempotency-visible-result-repair-2026-07-01 -SkipRemoteAheadCheck`: fail then pass. First run blocked on stale project-state repository SHA anchors; anchors were updated to current master/origin master and rerun passed.

## Static scan

- Command: `rg -n "<ordinary UI technical wording patterns>" src/features/admin/ai-generation src/features/student/ai-generation -g "*.tsx"`
- Result: pass with test-only hits.
- Summary: production UI source no longer contains these visible strings; remaining hits are negative assertions in tests.

## Validation log

Full gate validation passed before commit.
