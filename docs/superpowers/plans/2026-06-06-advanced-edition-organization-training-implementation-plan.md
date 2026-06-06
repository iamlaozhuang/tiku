# Advanced Edition Organization Training Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let an advanced organization admin create, review, publish, take down, and copy organization training content while employees can answer each published training version once and organization admins can view only approved summaries.

**Architecture:** Keep the existing Next.js monolith layering: route handlers / server actions -> service -> repository -> model. Organization training must consume the advanced authorization context and AI generation task domain, while keeping organization training content and organization training answer records separate from formal `question`, `paper`, `practice`, `mock_exam`, `exam_report`, and `mistake_book` records.

**Tech Stack:** TypeScript, existing API response contract, existing organization and employee session runtime, reviewed advanced authorization context planning, reviewed AI generation task lifecycle planning, Vitest unit tests, no new dependency.

---

## Current Code Facts

- Existing employee and organization session context: `src/server/auth/local-session-runtime.ts`.
- Existing organization and employee account runtime: `src/server/repositories/admin-organization-org-auth-runtime-repository.ts`.
- Existing effective authorization repository and service: `src/server/repositories/effective-authorization-repository.ts` and `src/server/services/effective-authorization-service.ts`.
- Existing formal `practice` and formal `answer_record` service path: `src/server/services/practice-service.ts`.
- Existing formal student `paper` service path: `src/server/services/student-paper-service.ts`.
- Existing formal content runtime and organization metadata joins: `src/server/repositories/admin-flow-runtime-repository.ts`.
- Existing redacted `audit_log` and `ai_call_log` runtime: `src/server/services/admin-ai-audit-log-runtime.ts` and `src/server/repositories/admin-ai-audit-log-runtime-repository.ts`.

The current code has organization, employee, authorization, formal `paper`, formal `practice`, formal `mock_exam`, and formal `answer_record` paths. It does not yet provide an isolated organization training draft, version, publication, employee answer, takedown, or summary domain.

## Dependency Contract

This plan depends on the reviewed upstream plans:

- Advanced authorization context:
  - Organization admin training management requires `effectiveEdition = advanced`.
  - Organization admin training management binds `authorizationSource = org_auth`.
  - Organization training binds `ownerType = organization` and `quotaOwnerType = organization`.
  - Organization admin visibility is constrained by the admin's bound `organization` and visible descendant organization scope.
  - Employee answering requires `canAnswerOrganizationTraining = true` in the employee's current organization context.
- AI generation task domain:
  - AI-generated organization training draft creation uses `taskType = organization_training_generation`.
  - Task status, cancellation, retry, idempotency, quota reservation/finalization, `audit_log`, and `ai_call_log` handling stay in the shared task domain.
- Personal AI generation plan:
  - Reuse question type validation, `evidence_status`, `citation` snapshot, and generated content redaction ideas.
  - Do not reuse personal ownership, personal quota ownership, or generated practice storage for organization training.

This plan owns organization training lifecycle rules and employee answer boundaries. It does not own provider execution, cost point values, production runtime defaults, organization analytics formulas beyond the minimal lifecycle summaries, or retention hard-delete behavior.

## Future File Structure

Future implementation should keep organization training physically separate from formal learning content.

- Create: `src/server/contracts/organization-training-contract.ts`
  - DTOs for draft list/detail, published version list/detail, employee visible training, answer draft, submission result, takedown result, copy-to-new-draft result, and lifecycle filters.
- Create: `src/server/models/organization-training.ts`
  - Internal status values, version lifecycle types, supported question types, scope snapshot types, and privacy constants.
- Create: `src/server/repositories/organization-training-repository.ts`
  - Persistence boundary for draft, version, question snapshot, publish scope snapshot, employee answer draft, official submission, answer-time organization snapshot, takedown, and copy-to-new-draft.
- Create: `src/server/services/organization-training-service.ts`
  - Service orchestration for manual draft creation, AI draft submission, edit draft, publish, takedown, copy-to-new-draft, employee list/detail, save answer draft, submit once, and owner summary reads.
- Create: `src/server/mappers/organization-training-mapper.ts`
  - Map internal rows to camelCase DTOs without numeric ids, raw prompt, raw provider payload, secret, token, plaintext `redeem_code`, employee original subjective answers, or item-level correctness in admin DTOs.
- Create: `src/server/validators/organization-training.ts`
  - Normalize draft input, AI generation constraints, publish input, takedown reason, copy input, employee answer draft input, and submit input.
- Create only if REST surface is in scope: `src/server/services/organization-training-route.ts`.
- Create only if REST surface is in scope: `src/app/api/v1/organization-trainings/**/route.ts`.
- Create only if Web surface is in scope: `src/app/(admin)/organization-training/**`.
- Create only if Web surface is in scope: `src/app/(student)/organization-training/**`.
- Test: `src/server/services/organization-training-service.test.ts`.
- Test: `src/server/mappers/organization-training-mapper.test.ts`.
- Test: `src/server/validators/organization-training.test.ts`.
- Test: `tests/unit/phase-31-advanced-edition-organization-training-implementation.test.ts`.

Do not modify in this task group unless a later implementation task explicitly permits it:

- `src/db/schema/**`
- `drizzle/**`
- package or lock files
- env/secret files
- real provider runtime files
- formal `question`, `paper`, `practice`, `mock_exam`, `exam_report`, or `mistake_book` write paths

## Domain Contract

### Content Types

First-release organization training should distinguish these internal content types:

- `organization_training_draft`
- `organization_training_version`
- `organization_training_question`
- `organization_training_answer_draft`
- `organization_training_answer_record`
- `organization_training_summary`

These names describe the isolated organization training domain. They must not be aliases for formal `question`, formal `paper`, formal `paper_question`, formal `practice`, formal `mock_exam`, formal `answer_record`, formal `exam_report`, or formal `mistake_book`.

### Status Model

Organization training draft and version lifecycle should use stable states:

| Status       | Meaning                                                                |
| ------------ | ---------------------------------------------------------------------- |
| `draft`      | Editable organization training draft not visible to employees.         |
| `published`  | Immutable training version visible to employees in the scope snapshot. |
| `taken_down` | Published training version no longer accepts new answers or re-entry.  |

Employee answer lifecycle should use stable states:

| Status        | Meaning                                                                 |
| ------------- | ----------------------------------------------------------------------- |
| `in_progress` | Employee has saved draft answers before official submission.            |
| `submitted`   | Employee has completed the one allowed official submission for version. |
| `read_only`   | Submitted or takedown-visible historical summary state for display.     |

`expired_hidden` is reserved for the retention/log governance plan. This organization training lifecycle plan may store `expiresAt` for unpublished drafts, but must not invent auto takedown or auto hard-delete behavior.

### Supported Question Types

First-release organization training validation supports:

- `single_choice`
- `multi_choice`
- `true_false`
- `short_answer`

Deferred question types:

- `fill_blank`
- `case_analysis`
- `calculation`

Organization training content may read formal `question`, formal `paper`, `knowledge_node`, and generated draft metadata inside the authorized organization scope, but published training versions and employee answers must be stored in the organization training domain.

### Draft DTO Shape

The organization admin draft DTO should include:

| Field                     | Requirement                                                                              |
| ------------------------- | ---------------------------------------------------------------------------------------- |
| `publicId`                | Public id of the organization training draft.                                            |
| `sourceTaskPublicId`      | Source `ai_generation_task` public id, or `null` for manual draft.                       |
| `organizationPublicId`    | Owner organization public id.                                                            |
| `authorizationSource`     | Must be `org_auth`.                                                                      |
| `authorizationPublicId`   | Effective `org_auth` public id.                                                          |
| `profession`              | Authorized profession.                                                                   |
| `level`                   | Authorized level.                                                                        |
| `subject`                 | `theory` or `skill`.                                                                     |
| `title`                   | Admin-confirmed draft title.                                                             |
| `description`             | Admin-confirmed draft description or `null`.                                             |
| `questionCount`           | Draft question count.                                                                    |
| `totalScore`              | Sum of draft question scores.                                                            |
| `questionTypeSummary`     | Draft question type distribution.                                                        |
| `evidenceStatus`          | Aggregate `evidence_status`: `sufficient`, `weak`, or `none`.                            |
| `validationStatus`        | `valid`, `invalid`, or `needs_review`.                                                   |
| `retentionStatus`         | `active`, `expired_hidden`, or future governance states owned by retention/log planning. |
| `createdAt` / `expiresAt` | ISO 8601 timestamps.                                                                     |

### Published Version DTO Shape

The organization training version DTO should include:

| Field                              | Requirement                                                  |
| ---------------------------------- | ------------------------------------------------------------ |
| `publicId`                         | Public id of the immutable training version.                 |
| `draftPublicId`                    | Source draft public id.                                      |
| `versionNumber`                    | Version number within the copied training family.            |
| `organizationPublicId`             | Owner organization public id.                                |
| `publishScopeSnapshot`             | Public organization scope snapshot captured at publish time. |
| `profession` / `level` / `subject` | Authorized content scope.                                    |
| `title` / `description`            | Immutable published content metadata.                        |
| `questionCount` / `totalScore`     | Immutable published scoring summary.                         |
| `status`                           | `published` or `taken_down`.                                 |
| `publishedAt`                      | ISO 8601 publish time.                                       |
| `takenDownAt`                      | ISO 8601 takedown time, or `null`.                           |
| `takedownReason`                   | Redacted admin reason, or `null`.                            |

Question bodies, standard answers, and `analysis` may be returned to employees only while the version is answerable and visible to the employee. Organization admin detail DTOs must not expose employee answer bodies or item-level correctness.

### Employee Answer DTO Shape

The employee-facing answer DTO should include:

| Field                        | Requirement                                                         |
| ---------------------------- | ------------------------------------------------------------------- |
| `publicId`                   | Public id of the employee answer draft or official `answer_record`. |
| `trainingVersionPublicId`    | Public id of the organization training version.                     |
| `employeePublicId`           | Employee public id.                                                 |
| `organizationPublicId`       | Employee's current organization public id at answer time.           |
| `answerOrganizationSnapshot` | Public organization hierarchy snapshot captured at answer time.     |
| `answerStatus`               | `in_progress`, `submitted`, or `read_only`.                         |
| `scoreSummary`               | Score summary after submission; `null` before submission.           |
| `submittedAt`                | ISO 8601 submit time, or `null`.                                    |
| `resultSummaryVisible`       | Boolean indicating whether only historical summary may be shown.    |

The ordinary organization admin summary DTO may include employee identity summary, completion status, submitted time, score summary, and answer-time organization snapshot. It must not include employee question-level answer bodies, objective per-question correctness, subjective original answer text, full question bodies, standard answers, `analysis`, prompt text, provider payload, or single AI task detail.

## Service Rules

### Create Manual Draft

- Require authenticated organization admin context.
- Resolve advanced authorization context for selected `profession + level + subject`.
- Require `effectiveEdition = advanced`.
- Require `authorizationSource = org_auth`.
- Require `canCreateOrganizationTraining = true`.
- Require the target organization to be inside the admin's visible organization scope.
- Create an `organization_training_draft` with `ownerType = organization` and `quotaOwnerType = organization`.
- Do not write formal `question`, formal `paper`, formal `practice`, formal `mock_exam`, formal `exam_report`, or formal `mistake_book`.

### Submit AI Draft Generation

- Require the same organization admin and `org_auth` checks as manual draft creation.
- Validate first-release question type, score, count, and knowledge node constraints before task creation.
- Submit through AI task domain using `taskType = organization_training_generation`.
- Return task public id and task status; do not wait for provider output.
- When a succeeded task is attached, generated output must pass organization training schema validation before becoming a publishable draft.
- Weak or no RAG evidence may remain publishable only when structurally valid, with explicit `evidenceStatus`.
- Regeneration creates or updates draft content according to explicit admin action and consumes quota through the AI task domain.

### Edit Draft

- Allow editing only while status is `draft`.
- Admin must confirm title, description, question list, question type, score, standard answer, and `analysis` summary before publish.
- Bad questions can be removed from draft or regenerated before publish.
- Unpublished draft retention is 90 days; expired-hidden behavior belongs to the retention/log governance plan.

### Publish Version

- Require status `draft`.
- Validate all publish-blocking fields: title, description, question list, question type, score, standard answer, `analysis` summary, organization scope, and capability context.
- Create an immutable `organization_training_version`.
- Snapshot visible organization scope at publish time.
- Published content is visible to employees in current organization scope that intersects the publish scope snapshot.
- Published content is long-term retained. Takedown is not deletion.
- First release has no mandatory deadline, no reminder, no overdue marker, no makeup, no auto stop, and no auto takedown.

### Change Published Training

- Published content cannot be directly edited.
- Allowed operations are takedown, copy-to-new-draft, and publish a new independent version.
- New version must not overwrite old version content, publish organization scope snapshot, employee `organization_training_answer_record`, statistics summary, or `audit_log`.
- Copy-to-new-draft must preserve source lineage while producing a fresh editable draft public id.

### Employee Answering

- Require authenticated employee context.
- Require visible `organization_training_version` inside the employee's current organization context and publish scope snapshot.
- Allow employee to save draft answers before official submission.
- Allow exactly one official submission per employee per training version.
- After official submission, the employee result for that version is read-only.
- Submitted training score does not enter formal `exam_report`.
- Training mistakes do not enter formal `mistake_book`.
- Employee training answers do not create formal `practice`, formal `mock_exam`, or formal `answer_record`.
- Statistics use official submissions only, not draft saves.

### Takedown

- Require organization admin context inside the training owner organization scope.
- Require explicit takedown reason.
- After takedown, no new answers, no draft saves, and no re-entry into question detail, standard answer, or `analysis`.
- Employee may view only their own historical result summary.
- Preserve history, official submissions, statistics summaries, quota ledger references, and `audit_log`.
- Takedown does not return quota. Any compensation belongs to operations quota governance through `manual_adjustment`.

### Privacy And Summary Visibility

- Organization admin can view training-level and employee-level summaries only.
- Organization admin cannot view employee question-level answers, objective per-question correctness, subjective original answers, full questions, standard answers, `analysis`, prompt text, provider payload, or single AI task detail.
- First release does not provide employee statistics export, organization aggregate export, generated export file, or export download flow.
- Platform operations admin may access controlled audit summaries, not ordinary employee sensitive detail.

## Implementation Order

### Task 1: Contract And Validation

**Files:**

- Create: `src/server/contracts/organization-training-contract.ts`
- Create: `src/server/models/organization-training.ts`
- Create: `src/server/validators/organization-training.ts`
- Test: `src/server/validators/organization-training.test.ts`

- [ ] Define draft, published version, takedown, copy-to-new-draft, employee answer, and summary DTOs.
- [ ] Define first-release question type allowlist.
- [ ] Add validation tests for `single_choice`, `multi_choice`, `true_false`, and `short_answer`.
- [ ] Add validation tests rejecting deferred question types.
- [ ] Add validation tests for required publish confirmation fields.
- [ ] Add validation tests for takedown reason and copy-to-new-draft input.
- [ ] Verify DTOs use camelCase fields and optional values use `null`.

### Task 2: Draft Lifecycle Service

**Files:**

- Create: `src/server/services/organization-training-service.ts`
- Create: `src/server/repositories/organization-training-repository.ts`
- Test: `src/server/services/organization-training-service.test.ts`

- [ ] Add failing tests for organization admin manual draft creation.
- [ ] Add failing tests for organization admin AI draft task submission through `organization_training_generation`.
- [ ] Add blocked tests for standard edition, missing `org_auth`, missing capability, out-of-scope organization, missing production configuration, and insufficient quota precheck.
- [ ] Add edit-draft tests proving only `draft` content is editable.
- [ ] Add tests proving draft creation and editing do not write formal `question`, `paper`, `practice`, `mock_exam`, `exam_report`, or `mistake_book`.

### Task 3: Publish, Version, Takedown, And Copy

**Files:**

- Modify: `src/server/services/organization-training-service.ts`
- Modify: `src/server/repositories/organization-training-repository.ts`
- Test: `src/server/services/organization-training-service.test.ts`

- [ ] Add publish tests proving organization scope is snapshotted.
- [ ] Add publish tests proving published content is immutable.
- [ ] Add copy-to-new-draft tests proving a fresh draft is created without overwriting the old version.
- [ ] Add takedown tests proving new answers and question detail re-entry are blocked.
- [ ] Add tests proving old version content, scope snapshot, employee answer records, summaries, quota references, and `audit_log` remain preserved.

### Task 4: Employee Answer Lifecycle

**Files:**

- Modify: `src/server/services/organization-training-service.ts`
- Modify: `src/server/repositories/organization-training-repository.ts`
- Test: `src/server/services/organization-training-service.test.ts`
- Test: `tests/unit/phase-31-advanced-edition-organization-training-implementation.test.ts`

- [ ] Add employee visible list/detail tests constrained by current organization context and publish scope snapshot.
- [ ] Add save-draft answer tests.
- [ ] Add official submission tests.
- [ ] Add duplicate official submission rejection tests.
- [ ] Add read-only-after-submit tests.
- [ ] Add takedown historical-summary-only tests.
- [ ] Add tests proving employee answers do not create formal `practice`, `mock_exam`, formal `answer_record`, `exam_report`, or `mistake_book`.

### Task 5: Summary And Privacy Mapping

**Files:**

- Create: `src/server/mappers/organization-training-mapper.ts`
- Test: `src/server/mappers/organization-training-mapper.test.ts`
- Test: `tests/unit/phase-31-advanced-edition-organization-training-implementation.test.ts`

- [ ] Map admin training summaries without sensitive answer detail.
- [ ] Map employee result summaries without exposing other employees.
- [ ] Verify numeric ids, plaintext `redeem_code`, raw prompt, raw model output, provider payload, secret, token, employee original subjective answers, item-level correctness, standard answers, and `analysis` are absent from admin summaries.
- [ ] Verify employee answer-time organization snapshot fields are present in summary DTOs.
- [ ] Verify export surfaces are absent in first release.

### Task 6: Optional Route And Web Surfaces

**Files:**

- Create only if API surface is in scope: `src/server/services/organization-training-route.ts`
- Create only if API surface is in scope: `src/app/api/v1/organization-trainings/**/route.ts`
- Create only if Web surface is in scope: `src/app/(admin)/organization-training/**`
- Create only if Web surface is in scope: `src/app/(student)/organization-training/**`
- Test: route-level tests if routes are added.
- Test: Web surface tests if pages are added.

- [ ] Add thin route handlers after service tests pass.
- [ ] Keep responses in `{ code, message, data, pagination? }`.
- [ ] Use public ids in route paths.
- [ ] Use verb subpaths only for actions such as publish, take down, copy, save answer draft, and submit answer.
- [ ] Keep resource nesting within the two-level API boundary.
- [ ] Add organization admin draft list, draft detail, publish confirmation, published version list, takedown, and copy-to-new-draft states when Web pages are included.
- [ ] Add employee visible training list, answer detail, draft save, submit, submitted read-only, and takedown history summary states when Web pages are included.
- [ ] Verify Loading, Empty, Error, Permission Blocked, Takedown, and Submitted states.
- [ ] Clearly mark organization training as separate from formal `paper`, `practice`, and `mock_exam`.

## Required Acceptance Tests

- Organization admin can create a manual organization training draft with `authorizationSource = org_auth`.
- Organization admin can submit AI draft generation through `taskType = organization_training_generation`.
- Standard edition, missing `org_auth`, missing capability, out-of-scope organization, insufficient quota, or missing production configuration blocks creation.
- Organization training draft is not visible as formal `question`, formal `paper`, formal `practice`, or formal `mock_exam`.
- Published training cannot be directly edited.
- Copying a published training creates a fresh draft without overwriting original version content or scope snapshot.
- Employee visible training list is constrained by current organization context and publish scope snapshot.
- Employee can save draft answers before official submission.
- Employee can officially submit once per training version.
- Employee cannot officially submit the same training version twice.
- Official organization training submission does not create formal `practice`, formal `mock_exam`, formal `answer_record`, formal `exam_report`, or formal `mistake_book`.
- Takedown prevents new answer, draft save, and question detail re-entry.
- After takedown, employee can view only their own historical result summary.
- Organization admin summary does not expose employee item-level answer detail, objective per-question correctness, subjective original answer, full question body, standard answer, `analysis`, prompt text, provider payload, or single AI task detail.
- First release has no deadline, reminder, overdue marker, makeup, retake, best-score policy, latest-score policy, auto stop, auto takedown, or export flow.
- DTOs contain no numeric ids, plaintext `redeem_code`, raw prompt, raw model output, provider payload, secret, or token.

## Blocked Work

- Direct formal content adoption remains blocked for organization training first release.
- Writing organization training content into formal `question`, `paper`, `practice`, `mock_exam`, `exam_report`, or `mistake_book` remains blocked.
- Real provider calls remain blocked.
- Provider cost measurement and point calibration remain blocked.
- Production timeout, retry, concurrency, peak threshold, and quota point defaults remain unconfirmed.
- Forced deadline, reminder, overdue marker, makeup, retake, best-score policy, latest-score policy, auto stop, and auto takedown remain blocked.
- Employee statistics export, organization aggregate export, generated export file, export download, and export file governance remain blocked.
- Database schema and migration work require a separate implementation task if needed.
- env/secret, staging/prod/cloud/deploy, payment, and external-service actions remain blocked.

## Handoff To Downstream Plans

- Organization analytics planning should reuse publish scope snapshots and answer-time organization snapshots defined here, then define exact summary metric formulas.
- Operations authorization and quota planning should provide quota reservation/finalization, `manual_adjustment`, quota ledger summaries, and operations-visible consumption summaries for `org_auth`.
- Retention/log governance must apply 90-day retention to unpublished organization training drafts, long-term retention to published organization training, and redaction rules to `audit_log`, `ai_call_log`, and evidence.
- Future code implementation tasks must split schema/migration, service, route, and Web work according to the project gate policy instead of treating this planning document as implementation approval.

## Self-Review

- Requirement coverage: covers draft, AI draft, edit, publish, takedown, copy-to-new-draft, employee answer, summary privacy, and first-release exclusions.
- Terminology coverage: uses project terms `authorization`, `org_auth`, `organization`, `employee`, `question`, `paper`, `mock_exam`, `answer_record`, `audit_log`, `ai_call_log`, and `redeem_code`.
- Boundary coverage: keeps organization training out of formal `question`, `paper`, `practice`, `mock_exam`, `exam_report`, and `mistake_book`.
- Privacy coverage: blocks organization admin access to employee answer-level, item-level, prompt-level, provider-payload-level, and export data.
- Blocked work coverage: keeps Cost Calibration Gate, provider, cost, production defaults, env/secret, staging/prod/cloud/deploy, payment, and external-service actions out of scope.
