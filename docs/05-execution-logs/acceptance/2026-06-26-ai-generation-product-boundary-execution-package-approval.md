# AI Generation Product Boundary Execution Package Approval

Package id: `AI_GENERATION_PRODUCT_BOUNDARY_EXECUTION_PACKAGE_2026_06_26`

Task id: `ai-generation-product-boundary-execution-package-approval-2026-06-26`

Decision status: `PREPARED_FOLLOW_UP_TASKS_BLOCKED_PENDING_FRESH_APPROVAL`

This package is docs/state-only. It creates product boundary decisions and future task boundaries. It does not execute
implementation, DB access, Provider calls, publish, student-visible validation, browser/e2e, staging/prod, payment,
external service, deployment, release readiness, or final Pass.

## Purpose

Unify the next AI generation product boundary before more implementation work happens. Recent evidence has proven parts
of generated-result storage, history/read UI, content-admin formal draft composition, and one local Provider paper
composition smoke. Those facts must not collapse the separate ownership, adoption, publish, and student-visible gates.

## Current Evidence Basis

| Evidence area                         | Current conclusion                                                                                                      |
| ------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| Generated result/history              | Backend admin generated-result storage and redacted history patterns exist, but generated content remains non-formal.   |
| Content-admin formal draft            | A content admin generated `paper` result can be adopted into an editable formal draft with `paper_section` composition. |
| Provider smoke                        | One local `alibaba-qwen` / `qwen3.7-max` smoke passed for draft-only composition; it is not Cost Calibration.           |
| Publish                               | Formal publish and student-visible content remain blocked pending future fresh approval.                                |
| Content/org admin product loop        | Content and organization admin AI loops still require carefully scoped follow-up work before product completion.        |
| Learner/private generation boundaries | Personal and organization employee output must remain private to the owning learner/employee context.                   |

## Boundary Decision 1: Organization Advanced Admin AI Generation

Decision: `ORG_AI_GENERATION_ALLOW_ORGANIZATION_OWNED_DRAFT_BLOCK_PLATFORM_FORMAL_DRAFT`.

Organization advanced admin AI generation should not stop forever at generated_result/history, because the organization
AI requirements say generated output can support organization-managed learning after organization admin confirmation.
However, that adoption can only create organization-owned private draft/training content inside the `organization`
domain.

Allowed future boundary after fresh approval:

- trackable organization AI tasks;
- organization-scoped generated_result/history;
- organization-owned draft lifecycle for internal learning or organization training;
- organization admin confirmation before employee-visible organization-owned training/draft use;
- redacted `audit_log` and `ai_call_log` summaries;
- organization summary analytics that do not reveal employee raw learner AI content.

Blocked without a separate future approval:

- platform formal `question` draft creation from organization admin AI output;
- platform formal `paper` draft creation from organization admin AI output;
- direct publish;
- student-visible platform content;
- bypassing `content_admin` review;
- Provider, DB mutation, schema/migration, browser/e2e, staging/prod, payment, external-service, release readiness, or
  final Pass.

Platform formal content boundary:

- If organization-generated content should ever become platform formal content, it must enter a future content-admin
  intake/review/adoption workflow. The organization admin must not write directly into the platform formal question bank
  or paper library.

## Boundary Decision 2: Personal Advanced And Organization Advanced Employee AI Generation

Decision: `LEARNER_AI_GENERATION_REQUIRES_PRIVATE_RESULT_HISTORY_AND_PRIVATE_USE_LOOP`.

Personal advanced learners and organization advanced employees need more than entry-only or metadata-only status for a
complete AI generation loop. A credible local product closure requires:

- real generated_result storage in the learner AI learning domain;
- result list/history/detail owned by the requesting user;
- a private use/adoption action for generated questions and AI `paper` output;
- discoverable `AI训练` entry with `AI出题` and `AI组卷`;
- standard-denial and organization-context selection boundaries;
- clear Provider-disabled, Provider-executed, or result-unavailable states.

The private use/adoption action must not create formal `question`, formal `paper`, formal `practice`, formal
`mock_exam`, formal `exam_report`, or formal `mistake_book` records. It should remain inside the learner AI learning
content domain, such as a private generated-question practice session or private AI `paper` attempt surface.

Organization advanced employee boundary:

- The generated output is visible to the owning employee/user by default.
- Organization admins may see only organization-scoped usage, quota, and redacted audit summaries.
- Organization admins must not see raw employee generated content, generated content summaries, prompts, raw model
  input/output, single-task details, or task-list summaries.

## Boundary Decision 3: Publish Execution

Decision: `PUBLISH_REMAINS_SEPARATE_FRESH_APPROVAL`.

This package does not execute formal publish and does not validate student-visible runtime. Formal publish must remain a
future task with fresh approval that names:

- local environment and exact route/service path;
- one target formal draft `paper`;
- maximum publish calls;
- rollback/archive strategy;
- whether student-visible local verification is allowed;
- redaction fields and blocked evidence;
- confirmation that staging/prod, Provider/Cost, payment, external service, release readiness, and final Pass remain
  separate gates.

## Boundary Decision 4: Organization Backend Statistics UX

Decision: `SECOND_LAYER_ACCEPTANCE_ENHANCEMENT_NOT_CURRENT_GENERATION_CLOSURE`.

Organization statistics UX is required for mature organization administration, but it is not the minimum current AI
generation closure unless the organization-owned draft/training task makes employee-visible organization training
available.

Current closure needs only:

- redacted task/result counts;
- Provider/blocked status summary;
- quota usage summary when approved;
- no raw employee answers or raw learner AI content.

Second-layer enhancement should add:

- training participation and answer statistics UX;
- completion, score, and timing summaries;
- generated-draft usage rollups;
- empty/error/loading states for organization analytics;
- no export and no raw subjective answer text.

## Boundary Decision 5: Content Operations Review UX

Decision: `MIXED_REQUIRED_AND_SECOND_LAYER_REVIEW_UX`.

Necessary for the basic content-admin AI closed loop:

- single-result review detail;
- edit/validate-before-adopt state;
- explicit adopt/reject action;
- source attribution and reviewer attribution;
- `audit_log` record;
- generated result to formal draft traceability;
- no direct publish.

Second-layer enhancements:

- batch review;
- failed adoption retry;
- generated-result-to-formal-draft diff view;
- adoption history timeline;
- duplicate/result comparison dashboard;
- multi-item queue bulk operations.

Batch review and retry are not required for the first closed loop, but adoption traceability is required before any
formal draft adoption can be considered complete.

## Batch Execution Package Boundary Table

All child tasks below are recorded as blocked queue boundaries. They are not executable until a future fresh approval
changes their status and scope.

| Order | Future task id                                                                       | Purpose                                                                                    | Default status | High-risk gates still blocked                                    |
| ----- | ------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------ | -------------- | ---------------------------------------------------------------- |
| 1     | `org-ai-generation-owned-draft-boundary-and-local-contract-loop-approval-2026-06-26` | Define/approve organization-owned generated_result, history, and organization draft loop.  | `blocked`      | DB/schema, Provider, publish, browser/e2e, staging/prod          |
| 2     | `learner-ai-generation-private-result-use-loop-approval-2026-06-26`                  | Define/approve personal and employee private generated-result/history/use loop.            | `blocked`      | formal writes, org admin raw access, Provider, DB/schema         |
| 3     | `formal-publish-student-visible-content-execution-approval-2026-06-26`               | Prepare/approve a separate publish execution task if owner wants local publish validation. | `blocked`      | publish until fresh approval, student-visible runtime by default |
| 4     | `organization-admin-ai-usage-statistics-ux-enhancement-approval-2026-06-26`          | Scope second-layer organization statistics UX enhancement.                                 | `blocked`      | raw answers, export, browser/e2e, source implementation          |
| 5     | `content-admin-ai-review-ux-enhancement-approval-2026-06-26`                         | Scope required and second-layer content review UX improvements.                            | `blocked`      | batch mutation, retry execution, publish, raw generated evidence |

## Package-Wide Blocked Gates

- Source/test/e2e/script/package/lockfile/schema/drizzle/env changes.
- DB connection, DB write, migration, seed, account mutation, cleanup delete.
- Provider/model call, Provider configuration, credential read, Cost Calibration.
- Browser/e2e/dev server runtime validation.
- Formal publish or student-visible content.
- Staging/prod/cloud/deploy, payment, external-service work.
- PR, force push, release readiness, production readiness, final Pass.

## Evidence Redaction Policy

Future tasks and this package may record only decision categories, command statuses, counts, public-id presence states,
workflow labels, and redacted summaries. Evidence must not record raw prompts, raw model outputs, Provider payloads,
credentials, `.env*` values, DB URLs, raw DB rows, public identifier lists, internal numeric ids, full `question`, full
`paper`, raw generated content, private answer text, plaintext `redeem_code`, cookies, tokens, Authorization headers,
screenshots, traces, or DOM dumps.

## Final Boundary

This package creates boundary and task-splitting evidence only. It deliberately does not claim Advanced MVP AI
generation completion, Provider/Cost final Pass, formal publish readiness, student-visible runtime readiness,
staging/prod/release readiness, production readiness, or final acceptance Pass.
