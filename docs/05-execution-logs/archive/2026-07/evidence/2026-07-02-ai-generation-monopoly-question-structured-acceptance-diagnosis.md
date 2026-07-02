# AI generation monopoly question structured acceptance diagnosis evidence

## Boundary

- Task id: `ai-generation-monopoly-question-structured-acceptance-diagnosis-2026-07-02`
- Branch: `codex/ai-generation-monopoly-question-structured-acceptance-diagnosis`
- Scope: shared AI出题 structured-preview parser/instruction repair.
- Provider/browser/DB/private OCR/dependency/schema/deploy executed: false at task start.

## Requirement Mapping Result

- `UC-ADV-CONTENT-ADMIN-AI-GENERATION`: repair targets content-admin AI出题 structured draft acceptance after sufficient RAG.
- Shared parser boundary: no profession-specific monopoly branch is allowed.
- Admin formal-content boundary remains unchanged: no formal `question` or `paper` adoption occurs.

## Implementation Evidence

- `src/server/services/route-integrated-provider-execution-service.ts`
  - Added shared AI出题 plaintext fallback for numbered draft markers.
  - Fallback accepts only exact `questionCount` marker coverage.
  - Fallback returns redacted summary fields only: count, draft number, null type/difficulty/knowledge-node count, review status.
  - Existing JSON object/array parsing remains preferred.
  - AI组卷 structured parser path unchanged.
- `src/server/services/route-integrated-provider-execution-service.test.ts`
  - Added exact numbered plaintext pass case: `3/3`.
  - Added common Chinese marker pass case: `3/3`.
  - Added numbered plaintext count mismatch safe failure: actual `2`, requested `3`, category `question_count_mismatch`.
  - Added arbitrary non-JSON prose safe failure: category `invalid_json`.
- `src/server/services/route-integrated-provider-instruction-service.ts`
  - Strengthened AI出题 output contract to forbid full question stem, options, answers, or analysis.
- `src/server/services/route-integrated-provider-instruction-service.test.ts`
  - Added assertions for the strengthened redaction/output boundary.

## Validation

| Command                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            | Result                                                                                         |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------- |
| `npm.cmd run test:unit -- src/server/services/route-integrated-provider-execution-service.test.ts`                                                                                                                                                                                                                                                                                                                                                                                                                                                                 | Failed before implementation as expected: 1 file, 33 tests, 3 failed plaintext fallback cases. |
| `npm.cmd run test:unit -- src/server/services/route-integrated-provider-execution-service.test.ts`                                                                                                                                                                                                                                                                                                                                                                                                                                                                 | Passed after implementation: 1 file, 33 tests.                                                 |
| `npm.cmd run test:unit -- src/server/services/route-integrated-provider-execution-service.test.ts src/server/services/route-integrated-provider-instruction-service.test.ts`                                                                                                                                                                                                                                                                                                                                                                                       | Passed: 2 files, 37 tests.                                                                     |
| `npm.cmd run test:unit -- src/server/services/route-integrated-provider-execution-service.test.ts src/server/services/route-integrated-provider-instruction-service.test.ts src/server/services/admin-ai-generation-runtime-bridge-service.test.ts src/server/services/personal-ai-generation-route-integrated-provider-execution-service.test.ts src/server/services/personal-ai-generation-runtime-bridge-service.test.ts src/server/services/admin-ai-generation-local-contract-route.test.ts src/server/services/personal-ai-generation-request-route.test.ts` | Passed: 7 files, 111 tests.                                                                    |
| `npm.cmd exec -- prettier --write --ignore-unknown ...`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            | Passed.                                                                                        |
| `npm.cmd run lint`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 | Passed.                                                                                        |
| `npm.cmd run typecheck`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            | Passed.                                                                                        |
| `npm.cmd exec -- prettier --check --ignore-unknown ...`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            | Passed.                                                                                        |
| `git diff --check`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 | Passed.                                                                                        |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId ai-generation-monopoly-question-structured-acceptance-diagnosis-2026-07-02`                                                                                                                                                                                                                                                                                                                                                         | Passed.                                                                                        |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId ai-generation-monopoly-question-structured-acceptance-diagnosis-2026-07-02 -SkipRemoteAheadCheck`                                                                                                                                                                                                                                                                                                                                     | Passed.                                                                                        |

## Boundary Checks

- Provider call executed: false.
- Browser runtime or dev server action executed: false.
- Database connection or mutation executed: false.
- Private OCR/material read or write executed: false.
- Package or lockfile changed: false.
- Schema, migration, or seed changed: false.
- `.env*` read or written: false.
- Raw Provider payload, prompt, AI output, full generated question, full generated paper, material, resource, or chunk content recorded: false.
- Credentials, cookies, tokens, sessions, Authorization header, localStorage, DB raw rows, internal ids, or PII recorded: false.
- Staging/prod/cloud/deploy executed: false.
- Release readiness, final Pass, production usability, and Cost Calibration claimed: false.
