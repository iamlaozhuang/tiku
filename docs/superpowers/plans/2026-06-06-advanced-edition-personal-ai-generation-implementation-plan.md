# Advanced Edition Personal AI Generation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let an advanced personal user create, list, view, and practice AI-generated learning `question` and AI learning `paper` content in an isolated personal AI learning content domain.

**Architecture:** Keep the existing Next.js monolith layering: route handlers / server actions -> service -> repository -> model. Personal AI generation must consume the reviewed advanced authorization context and AI generation task domain, while keeping generated learning content separate from formal `question`, `paper`, `practice`, `mock_exam`, `exam_report`, and `mistake_book` records.

**Tech Stack:** TypeScript, existing API response contract, existing authorization context planning, reviewed AI generation task lifecycle planning, existing formal `question`/`paper` DTO patterns, Vitest unit tests, no new dependency.

---

## Current Code Facts

- Existing student formal `paper` service: `src/server/services/student-paper-service.ts`.
- Existing formal `paper` DTO: `src/server/contracts/student-paper-contract.ts`.
- Existing formal `practice` service: `src/server/services/practice-service.ts`.
- Existing platform content listing repository: `src/server/repositories/admin-flow-runtime-repository.ts`.
- Existing formal question validation and mapping: `src/server/validators/question.ts`, `src/server/contracts/question-contract.ts`, and `src/server/mappers/question-mapper.ts`.
- Existing formal paper draft validation and mapping: `src/server/validators/paper-draft.ts`, `src/server/contracts/paper-draft-contract.ts`, and `src/server/mappers/paper-draft-mapper.ts`.

The current code can read and operate formal `question`, formal `paper`, formal `practice`, and formal `mock_exam` paths. It does not yet provide a separate personal AI learning content domain for generated learning questions, generated learning `paper`, or generated AI learning practice.

## Dependency Contract

This plan depends on the reviewed upstream plans:

- Advanced authorization context:
  - Personal AI generation requires `effectiveEdition = advanced`.
  - Personal AI generation binds `authorizationSource = personal_auth`.
  - Personal AI generation binds `ownerType = personal` and `quotaOwnerType = personal`.
  - Missing production configuration blocks capability with `production_enablement_blocked`.
- AI generation task domain:
  - Personal AI question submission uses `taskType = ai_question_generation`.
  - Personal AI `paper` submission uses `taskType = ai_paper_generation`.
  - Task status, cancellation, retry, idempotency, quota reservation/finalization, `audit_log`, and `ai_call_log` handling stay in the shared task domain.

This plan owns generated learning content contracts and user-facing access rules after a task succeeds. It does not own provider execution, task worker scheduling, quota ledger point values, or production runtime defaults.

## Future File Structure

Future implementation should keep formal content and personal AI learning content physically separate.

- Create: `src/server/contracts/ai-generated-learning-contract.ts`
  - DTOs for generated question summaries/details, generated `paper` summaries/details, generated practice state, validation status, retention status, and list filters.
- Create: `src/server/models/ai-generated-learning.ts`
  - Internal generated content types, allowed question types, validation status, retention state, and domain constants.
- Create: `src/server/repositories/ai-generated-learning-repository.ts`
  - Persistence boundary for generated question, generated `paper`, generated `paper` question link, generated practice, and owner-only list/detail access.
- Create: `src/server/services/ai-generated-learning-service.ts`
  - Service orchestration for submit task, attach succeeded task output, list, detail, start generated practice, save answer snapshot, and hide expired content.
- Create: `src/server/mappers/ai-generated-learning-mapper.ts`
  - Map internal rows to camelCase DTOs without numeric ids, raw prompt, raw provider payload, secret, token, or plaintext `redeem_code`.
- Create: `src/server/validators/ai-generated-learning.ts`
  - Normalize question generation constraints, `paper` generation constraints, list filters, and generated practice answer input.
- Create only if REST surface is in scope: `src/server/services/ai-generated-learning-route.ts`.
- Create only if REST surface is in scope: `src/app/api/v1/ai-generated-learning/**/route.ts`.
- Test: `src/server/services/ai-generated-learning-service.test.ts`.
- Test: `src/server/mappers/ai-generated-learning-mapper.test.ts`.
- Test: `src/server/validators/ai-generated-learning.test.ts`.
- Test: `tests/unit/phase-31-advanced-edition-personal-ai-generation-implementation.test.ts`.

Do not modify in this task group unless a later implementation task explicitly permits it:

- `src/db/schema/**`
- `drizzle/**`
- package or lock files
- env/secret files
- real provider runtime files
- formal `question`, `paper`, `practice`, `mock_exam`, `exam_report`, or `mistake_book` write paths

## Domain Contract

### Content Types

First-release personal AI learning content should distinguish these internal content types:

- `ai_generated_question`
- `ai_generated_paper`
- `ai_generated_paper_question`
- `ai_generated_practice`
- `ai_generated_answer_record`

These names describe the isolated AI learning domain. They must not be aliases for formal `question`, formal `paper`, formal `paper_question`, formal `practice`, formal `mock_exam`, formal `answer_record`, formal `exam_report`, or formal `mistake_book`.

### Supported Question Types

First-release generated question validation supports:

- `single_choice`
- `multi_choice`
- `true_false`
- `short_answer`

Deferred question types:

- `fill_blank`
- `case_analysis`
- `calculation`

Generated content may read formal `question`, formal `paper`, and `knowledge_node` metadata within the user's authorized scope, but generated content must be stored in the personal AI learning domain.

### Generated Question DTO Shape

The public DTO should include:

| Field                     | Requirement                                                                                |
| ------------------------- | ------------------------------------------------------------------------------------------ |
| `publicId`                | Public id of the generated question.                                                       |
| `taskPublicId`            | Source `ai_generation_task` public id.                                                     |
| `ownerPublicId`           | Public id of the personal owner.                                                           |
| `authorizationSource`     | Must be `personal_auth` for personal generation.                                           |
| `authorizationPublicId`   | Effective `personal_auth` public id.                                                       |
| `profession`              | Authorized profession.                                                                     |
| `level`                   | Authorized level.                                                                          |
| `subject`                 | `theory` or `skill`.                                                                       |
| `questionType`            | First-release supported question type.                                                     |
| `stem`                    | Generated stem safe for owner display.                                                     |
| `material`                | Generated material or `null`.                                                              |
| `questionOptions`         | Generated options; `[]` for `short_answer`.                                                |
| `standardAnswer`          | Generated standard answer.                                                                 |
| `analysis`                | Generated `analysis` or `null`; separate from `ai_explanation`.                            |
| `scoringPoints`           | Required for `short_answer`, otherwise `[]` unless future scoring needs them.              |
| `knowledgeNodePublicIds`  | Authorized knowledge nodes only.                                                           |
| `evidenceStatus`          | `sufficient`, `weak`, or `none`.                                                           |
| `citations`               | Redacted `citation` list; no raw chunk body in public DTOs.                                |
| `validationStatus`        | `valid`, `invalid`, or `needs_review`.                                                     |
| `retentionStatus`         | `active`, `expired_hidden`, or future governance states owned by retention/log governance. |
| `createdAt` / `expiresAt` | ISO 8601 timestamps.                                                                       |

### Generated Paper DTO Shape

The public DTO should include:

| Field                      | Requirement                                                                                 |
| -------------------------- | ------------------------------------------------------------------------------------------- |
| `publicId`                 | Public id of the generated `paper`.                                                         |
| `taskPublicId`             | Source `ai_generation_task` public id.                                                      |
| `ownerPublicId`            | Public id of the personal owner.                                                            |
| `authorizationSource`      | Must be `personal_auth` for personal generation.                                            |
| `profession`               | Authorized profession.                                                                      |
| `level`                    | Authorized level.                                                                           |
| `subject`                  | `theory` or `skill`.                                                                        |
| `title`                    | User-visible generated title.                                                               |
| `totalScore`               | Sum of generated `paper` questions.                                                         |
| `questionCount`            | Count of generated `paper` questions.                                                       |
| `paperSections`            | Generated `paper_section`-style grouping, but isolated from formal `paper_section` records. |
| `questionTypeDistribution` | Requested and generated question type distribution summary.                                 |
| `knowledgeNodeCoverage`    | Requested and generated knowledge node coverage summary.                                    |
| `evidenceStatus`           | Aggregate `evidence_status`.                                                                |
| `validationStatus`         | `valid`, `invalid`, or `needs_review`.                                                      |
| `retentionStatus`          | `active`, `expired_hidden`, or future governance states owned by retention/log governance.  |
| `createdAt` / `expiresAt`  | ISO 8601 timestamps.                                                                        |

Generated `paper` is not a formal `paper` and must never be listed by `student-paper-service` or formal `mock_exam` flows. If the user practices a generated `paper`, the resulting practice is `ai_generated_practice`, not formal `practice` or formal `mock_exam`.

## Service Rules

### Submit AI Question Generation

- Require authenticated user context.
- Resolve advanced authorization context for selected `profession + level + subject`.
- Require `effectiveEdition = advanced`.
- Require `authorizationSource = personal_auth`.
- Require `canGenerateAiQuestion = true`.
- Validate first-release question type and generation constraints before task creation.
- Submit through AI task domain using `taskType = ai_question_generation`.
- Return task public id and task status; do not wait for provider output.
- Do not write formal `question`, formal `practice`, formal `mock_exam`, formal `exam_report`, or formal `mistake_book`.

### Submit AI Paper Generation

- Require authenticated user context.
- Resolve advanced authorization context for selected `profession + level + subject`.
- Require `effectiveEdition = advanced`.
- Require `authorizationSource = personal_auth`.
- Require `canGenerateAiPaper = true`.
- Validate rule-constrained `paper` request: profession, level, subject, question type counts, total score, and knowledge node coverage.
- Submit through AI task domain using `taskType = ai_paper_generation`.
- Return task public id and task status; do not wait for provider output.
- Do not create formal `paper`, formal `paper_question`, formal `mock_exam`, formal `exam_report`, or formal `mistake_book`.

### Attach Succeeded Task Output

- Only a succeeded task owned by the same user may attach generated content.
- Generated output must pass schema validation before becoming visible as active content.
- Valid weak-evidence or no-evidence output may be visible to the owner when structurally valid, with explicit `evidenceStatus`.
- Invalid output must stay unavailable as generated learning content and keep failure/validation summary in task/audit evidence.
- Attaching content must preserve source task, authorization, owner, quota owner, `model_config` snapshot, `prompt_template` snapshot, `citation` snapshot, and validation summary.

### Owner Access

- Owner can list and view their own generated questions and generated `paper`.
- Another user receives not-found behavior and cannot infer existence.
- Organization admin may only see aggregate/consumption summaries in later analytics planning; they cannot view a user's generated content body here.
- Platform operations admin may use controlled audit summaries, not ordinary content detail.
- Platform content teacher adoption is out of this personal plan and must not be exposed for personal content.

### Generated Practice

- Owner may start an `ai_generated_practice` from a generated question or generated `paper`.
- Generated practice must not call formal `practice-service` write paths.
- Generated practice answer records must not become formal `answer_record`.
- Generated practice results must not become formal `exam_report`.
- Generated mistakes must not become formal `mistake_book`.
- First release can keep generated practice feedback lightweight and local to the generated learning domain.

### Retention

- Personal AI learning generated content uses the confirmed 90-day retention period.
- Expired content becomes hidden according to the future retention/log governance plan.
- Recovery within the confirmed 30-day window belongs to the retention/log governance plan.
- This plan may store `expiresAt` and `retentionStatus`, but does not define hard-delete behavior.

## Implementation Order

### Task 1: Contract And Validation

**Files:**

- Create: `src/server/contracts/ai-generated-learning-contract.ts`
- Create: `src/server/models/ai-generated-learning.ts`
- Create: `src/server/validators/ai-generated-learning.ts`
- Test: `src/server/validators/ai-generated-learning.test.ts`

- [ ] Define generated question, generated `paper`, generated practice, list filter, and detail DTOs.
- [ ] Define first-release question type allowlist.
- [ ] Add validation tests for `single_choice`, `multi_choice`, `true_false`, and `short_answer`.
- [ ] Add validation tests rejecting deferred question types.
- [ ] Add validation tests for `paper` constraints: question type counts, total score, and knowledge node coverage.
- [ ] Verify DTOs use camelCase fields and optional values use `null`.

### Task 2: Service Submission Boundary

**Files:**

- Create: `src/server/services/ai-generated-learning-service.ts`
- Test: `src/server/services/ai-generated-learning-service.test.ts`

- [ ] Add failing tests for advanced personal AI question submission.
- [ ] Add failing tests for advanced personal AI `paper` submission.
- [ ] Add blocked tests for standard edition, missing `personal_auth`, missing capability, missing production configuration, and insufficient quota precheck.
- [ ] Add tests proving submission delegates task lifecycle to `ai-generation-task-service`.
- [ ] Add tests proving submit responses include task status but no generated content.

### Task 3: Generated Content Persistence Boundary

**Files:**

- Create: `src/server/repositories/ai-generated-learning-repository.ts`
- Test: `src/server/repositories/ai-generated-learning-repository.test.ts`

- [ ] Define repository methods for create generated question, create generated `paper`, list by owner, find by owner, and attach succeeded task output.
- [ ] Use public ids and redacted snapshots only in repository contract tests.
- [ ] Keep formal `question`, formal `paper`, formal `practice`, formal `mock_exam`, formal `exam_report`, and formal `mistake_book` out of repository write methods.
- [ ] Keep schema and migration work out unless a later implementation task explicitly authorizes it.

### Task 4: List And Detail Mapping

**Files:**

- Create: `src/server/mappers/ai-generated-learning-mapper.ts`
- Test: `src/server/mappers/ai-generated-learning-mapper.test.ts`

- [ ] Map generated question and generated `paper` rows to owner-facing DTOs.
- [ ] Verify another user's content maps through not-found service behavior, not a visible forbidden detail.
- [ ] Verify raw prompt, raw model output, provider payload, secret, token, plaintext `redeem_code`, and numeric ids are absent.
- [ ] Verify `evidenceStatus`, `validationStatus`, `retentionStatus`, `createdAt`, and `expiresAt` are present.

### Task 5: Generated Practice Boundary

**Files:**

- Modify: `src/server/services/ai-generated-learning-service.ts`
- Test: `src/server/services/ai-generated-learning-service.test.ts`
- Test: `tests/unit/phase-31-advanced-edition-personal-ai-generation-implementation.test.ts`

- [ ] Add tests for starting generated practice from one generated question.
- [ ] Add tests for starting generated practice from one generated `paper`.
- [ ] Add tests proving generated practice does not create formal `practice`.
- [ ] Add tests proving generated practice does not create formal `mock_exam`, formal `exam_report`, or formal `mistake_book`.
- [ ] Add tests for owner-only generated practice access.

### Task 6: Optional Route Surface

**Files:**

- Create only if API surface is in scope: `src/server/services/ai-generated-learning-route.ts`
- Create only if API surface is in scope: `src/app/api/v1/ai-generated-learning/**/route.ts`
- Test: route-level tests if routes are added.

- [ ] Add thin route handlers after service tests pass.
- [ ] Keep responses in `{ code, message, data, pagination? }`.
- [ ] Use public ids in route paths.
- [ ] Use verb subpaths only for actions such as submit, cancel, or start generated practice.
- [ ] Keep resource nesting within the two-level API boundary.

## Required Acceptance Tests

- Generated question is not visible as formal `question`.
- Generated `paper` is not visible as formal `mock_exam`.
- Generated `paper` is not listed by formal student `paper` list unless it has gone through a separate platform content teacher adoption flow, which is blocked in this personal plan.
- Owner can access their own generated learning content.
- Another user cannot access generated learning content and cannot infer existence.
- Personal AI question generation binds `authorizationSource = personal_auth`, `ownerType = personal`, and `quotaOwnerType = personal`.
- Personal AI `paper` generation binds `authorizationSource = personal_auth`, `ownerType = personal`, and `quotaOwnerType = personal`.
- Standard edition or missing advanced capability blocks submission.
- Missing production configuration blocks with `production_enablement_blocked`.
- Deferred question types are rejected in first release.
- Generated practice does not create formal `practice`, `mock_exam`, `exam_report`, or `mistake_book`.
- DTOs contain no numeric ids, plaintext `redeem_code`, raw prompt, raw model output, provider payload, secret, or token.

## Blocked Work

- Direct formal content adoption without platform content teacher review remains blocked.
- Personal generated content adoption into formal `question` or formal `paper` remains blocked.
- Real provider calls remain blocked.
- Provider cost measurement and production behavior cost point defaults remain blocked.
- Production timeout, retry, concurrency, peak threshold, and quota point defaults remain unconfirmed.
- Database schema and migration work require a separate implementation task if needed.
- env/secret, staging/prod/cloud/deploy, payment, and external-service actions remain blocked.

## Handoff To Downstream Plans

- Organization training planning can reuse generated question and generated `paper` validation ideas, but must keep organization ownership and employee answer records separate.
- Organization analytics planning must treat personal AI learning content as owner-private body content and use only aggregate summaries where allowed.
- Operations authorization and quota planning must provide quota reservation/finalization and visible consumption summaries for `personal_auth` users.
- Retention/log governance must apply the confirmed 90-day retention and 30-day recovery window to personal AI learning generated content.
