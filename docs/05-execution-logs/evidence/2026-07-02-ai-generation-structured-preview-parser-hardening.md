# AI generation structured preview parser hardening evidence

## Boundary

- Task id: `ai-generation-structured-preview-parser-hardening-2026-07-02`
- Branch: `codex/ai-generation-structured-preview-parser-hardening`
- Scope: local source/test parser repair.
- Provider/browser/DB/dependency/schema/deploy executed: false at task start.
- Evidence mode: file paths, task ids, status categories, counts, and validation command results only.

## Requirement Mapping Result

| Requirement source                       | Mapping                                                                                                                      |
| ---------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| `UC-ADV-AI-TASK-LIFECYCLE`               | Structured previews must expose deterministic safe draft status and failure categories.                                      |
| `UC-ADV-PERSONAL-AI-QUESTION-GENERATION` | AI出题 parser must accept only supported arrays at the requested count.                                                      |
| `UC-ADV-PERSONAL-AI-PAPER-GENERATION`    | AI组卷 parser must recognize a safe total question count before draft acceptance.                                            |
| `UC-ADV-ORG-ADMIN-AI-GENERATION`         | Organization AI generation should reuse the same parser behavior as personal/content paths.                                  |
| `UC-ADV-CONTENT-ADMIN-AI-GENERATION`     | Content admin AI drafts remain reviewable and must not expose raw generated content in evidence.                             |
| `US-06-15`                               | Content backend AI draft/review requires AI出题 and AI组卷 structured preview recognition without prompt or payload leakage. |

## Initial Findings

- AI出题 parser already supports `questions`, `questionDrafts`, and `question_drafts` with requested-count validation.
- AI组卷 parser currently derives counts from section-level and nested arrays but does not read top-level `questionCount`, top-level `totalQuestionCount`, or distribution totals.
- AI组卷 parser currently does not reject count mismatch when requested count is available.

## Validation

- RED before implementation: `npm.cmd run test:unit -- src/server/services/route-integrated-provider-execution-service.test.ts` failed as expected; 1 file ran, 24 tests total, 19 passed and 5 failed. Failure categories were top-level paper count not recognized, distribution total not recognized, requested count mismatch accepted, and requested count missing accepted.
- GREEN focused parser tests: `npm.cmd run test:unit -- src/server/services/route-integrated-provider-execution-service.test.ts` passed; 1 file, 24 tests.
- `npm.cmd run lint` passed.
- `npm.cmd run typecheck` passed.
- Scoped `npm.cmd exec -- prettier --write --ignore-unknown ...` completed.
- Scoped `npm.cmd exec -- prettier --check --ignore-unknown ...` passed.
- `git diff --check` passed.
- Initial Module Run v2 metadata check found missing task queue paths and stale accepted ancestor SHA; project-state/task-queue metadata was repaired before closeout.
- `Test-ModuleRunV2PreCommitHardening.ps1 -TaskId ai-generation-structured-preview-parser-hardening-2026-07-02` passed; files scanned: 8.
- `Test-ModuleRunV2PrePushReadiness.ps1 -TaskId ai-generation-structured-preview-parser-hardening-2026-07-02 -SkipRemoteAheadCheck` passed against branch `codex/ai-generation-structured-preview-parser-hardening`, master/origin/state SHA `10645915e49f1c8102da97ba75f4901a3330f238`.

## Acceptance Result

- AI出题 supported roots covered: `questions`, `questionDrafts`, and `question_drafts`.
- AI出题 safe failure categories covered: `missing_questions` and `question_count_mismatch`; existing invalid JSON coverage remains in service behavior.
- AI组卷 count sources covered: top-level `questionCount`, top-level `totalQuestionCount`, section `questionCount`, nested `questions`, nested `questionDrafts`, and `questionTypeDistribution` totals.
- AI组卷 safe failure categories covered: `missing_question_count` and `question_count_mismatch`.
- Provider/browser/DB/dependency/schema/deploy executed: false.
- Release readiness claimed: false.
- Final Pass claimed: false.
