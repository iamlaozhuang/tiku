# AI generation shared task spec contract evidence

## Boundary

- Task id: `ai-generation-shared-task-spec-contract-2026-07-02`
- Branch: `codex/ai-generation-shared-task-spec-contract`
- Scope: local source/test contract repair.
- Provider/browser/DB/dependency/schema/deploy executed: false at task start.
- Evidence mode: file paths, task ids, status categories, counts, and validation command results only.

## Requirement Mapping Result

| Requirement source                       | Mapping                                                                                                                                            |
| ---------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| `UC-ADV-AI-TASK-LIFECYCLE`               | Shared task contract must expose safe status and structured draft semantics without prompt or raw output exposure.                                 |
| `UC-ADV-PERSONAL-AI-QUESTION-GENERATION` | AI出题 generated content remains learner-owned and must preserve requested question count before draft acceptance.                                 |
| `UC-ADV-PERSONAL-AI-PAPER-GENERATION`    | AI组卷 generated paper output remains isolated and must carry requested total question count for later preview validation.                         |
| `UC-ADV-ORG-ADMIN-AI-GENERATION`         | Organization AI generation should reuse the same task semantics instead of role-specific contract drift.                                           |
| `UC-ADV-CONTENT-ADMIN-AI-GENERATION`     | Content AI generated output stays in reviewable draft flow and must not directly write formal `question` or `paper`.                               |
| `US-06-15`                               | Content backend AI draft/review requires AI出题 and AI组卷 semantics without raw prompt, Provider payload, or complete generated content evidence. |

## Initial Findings

- Current `createRouteIntegratedStructuredPreviewOptionsForTask` fixes AI出题 `requestedQuestionCount` at 10.
- Current AI组卷 options do not preserve requested total `questionCount`.
- Existing parser tests cover explicit preview options but do not prevent task-derived count fallback.
- Admin and personal route-integrated Provider bridge call sites have existing generation parameters available and must pass them into the shared preview option helper.
- Admin local contract route kind checks also had an available parameter object and were updated to avoid keeping a no-parameter runtime-path call.

## Validation

- RED before implementation: `npm.cmd run test:unit -- src/server/services/route-integrated-provider-execution-service.test.ts` failed as expected; 1 file ran, 2 new count-contract assertions failed; failure categories were `question_count_defaulted_to_10` and `paper_count_missing_from_preview_options`.
- GREEN focused services: `npm.cmd run test:unit -- src/server/services/route-integrated-provider-execution-service.test.ts src/server/services/admin-ai-generation-runtime-bridge-service.test.ts src/server/services/personal-ai-generation-route-integrated-provider-execution-service.test.ts src/server/services/personal-ai-generation-runtime-bridge-service.test.ts src/server/services/admin-ai-generation-local-contract-route.test.ts` passed; 5 files, 59 tests.
- `npm.cmd run lint` passed.
- `npm.cmd run typecheck` passed.
- Scoped `npm.cmd exec -- prettier --write --ignore-unknown ...` completed with unchanged formatted files.
- Scoped `npm.cmd exec -- prettier --check --ignore-unknown ...` passed.
- `git diff --check` passed.
- `Test-ModuleRunV2PreCommitHardening.ps1 -TaskId ai-generation-shared-task-spec-contract-2026-07-02` passed; files scanned: 12.
- `Test-ModuleRunV2PrePushReadiness.ps1 -TaskId ai-generation-shared-task-spec-contract-2026-07-02 -SkipRemoteAheadCheck` passed against branch `codex/ai-generation-shared-task-spec-contract`, master/origin/state SHA `e9644f024576d5b1de1e60cba99042b083d5d51a`.

## Acceptance Result

- Shared task spec contract created for `ai_question_generation` and `ai_paper_generation`.
- AI出题 structured preview count now derives from `generationParameters.questionCount`.
- AI组卷 structured preview options now carry requested question count for parser validation.
- Admin runtime bridge, personal runtime bridge, and admin local route kind checks pass available generation parameters into the shared helper.
- Provider/browser/DB/dependency/schema/deploy executed: false.
- Release readiness claimed: false.
- Final Pass claimed: false.
