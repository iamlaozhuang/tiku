# Organization Training UI/UX Contract

## Scope

This contract covers package 2 of the UI/UX requirement design work:

- organization-admin `企业训练` creation, source selection, draft, publish, copy, takedown, and result management;
- organization AI result handoff into an organization training draft;
- platform paper snapshot import into organization training;
- employee `企业训练` list, answer, save draft, submit, and post-submit result experience;
- role, edition, data-boundary, privacy, pagination, and state contracts for the above surfaces.

This is a docs-only contract. It does not change product source, approve schema work, declare source completion, release readiness, production usability, or a final pass.

## Source Baseline

Required governance and architecture inputs read before this package:

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/adr-001-tech-stack-selection.md` through `adr-007-edition-aware-authorization-source-of-truth.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`

Requirement SSOT inputs used for this package:

- `docs/01-requirements/00-index.md`
- `docs/01-requirements/modules/06-admin-ops.md`
- `docs/01-requirements/advanced-edition/00-index.md`
- `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`
- `docs/01-requirements/advanced-edition/modules/04-organization-training.md`
- `docs/01-requirements/advanced-edition/modules/08-organization-ai-generation.md`
- `docs/01-requirements/advanced-edition/stories/epic-02-organization-training.md`
- `docs/01-requirements/traceability/2026-07-02-ai-generation-requirements-ssot-alignment.md`
- `docs/01-requirements/traceability/2026-07-02-phase4-requirements-agent-baseline-alignment.md`
- `docs/01-requirements/traceability/2026-07-02-current-thread-requirement-reconciliation-ledger.md`
- `docs/01-requirements/traceability/2026-07-02-role-auth-training-ops-decision-package.md`
- `docs/01-requirements/traceability/2026-07-02-ui-ux-requirement-design-baseline-gap-analysis.md`

Current source surfaces inspected as implementation evidence:

- `src/features/admin/organization-training/AdminOrganizationTrainingPage.tsx`
- `src/features/student/organization-training/StudentOrganizationTrainingPage.tsx`
- `src/features/admin/organization-portal/AdminOrganizationPortalPage.tsx`
- `src/features/admin/ai-generation/AdminAiGenerationEntryPage.tsx`
- `src/server/contracts/organization-training-contract.ts`
- `src/server/models/organization-training.ts`
- `src/server/validators/organization-training.ts`
- `src/server/services/organization-training-service.ts`
- `src/server/services/organization-training-route.ts`
- `src/server/repositories/organization-training-repository.ts`
- `src/db/schema/organization-training.ts`
- `src/app/(admin)/organization/organization-training/page.tsx`
- `src/app/(admin)/content/organization-training/page.tsx`
- `src/app/(student)/organization-training/page.tsx`
- `src/app/api/v1/organization-trainings/**`

## Existing Decisions

The current requirement tree and current-thread ledger already record the package-2 decision range:

- `CT-REQ-016`: UI label is `企业训练`; creation uses a four-step wizard: choose source, configure training, set publish scope and answer settings, preview and publish. First-release sources are platform paper snapshot, organization AI result, and organization-private manual grouping/questions.
- `CT-REQ-017`: platform paper import lets eligible organization advanced admins view copied stem, options, `standard_answer`, and `analysis`; edits apply only to the copied organization snapshot and never write back to the platform paper.
- `CT-REQ-018`: `mock_exam` is not an organization training source entry.
- `CT-REQ-019`: drafts can be discarded; `evidence_status = none` blocks publish; `weak` requires explicit confirmation; published versions are immutable; copy-to-new-draft is required for changes; takedown stops unstarted and in-progress answers while preserving submitted read-only summaries; `answerDeadlineAt` is optional; reminders are in-app only; `short_answer` uses AI scoring by default; no manual grading in first release.
- `CT-REQ-024`: organization AI output can copy generated stem, options, `standard_answer`, and `analysis` into an editable organization training draft without consuming extra AI quota; it must not directly create formal platform `question` or `paper` records.
- `CT-REQ-036`: `org_advanced_employee` uses learner app entry `企业训练`; list/detail/answer/result must use real question, material, option, and text-answer UI, with save draft, submit confirmation, and post-submit own-answer result review.
- `CT-REQ-037`: organization-admin training management starts from list plus "新建企业训练"; source choice is searchable/filterable and must not require raw `publicId`; draft and published lifecycle actions include copy, discard, takedown, reason capture, redacted timeline, aggregate status, and backend pagination with URL-preserved filters where practical.
- `CT-REQ-048`: organization AI result-to-training draft must preserve all 12 confirmed handoff details: same-scope AI result, no `mock_exam` source, copy only to training draft, generated stem/options/`standard_answer`/`analysis`, editable draft fields, source attribution, `none` publish block, `weak` confirmation, no extra AI quota on copy, four-step preview/publish, immutable published version, and enterprise-training answer/analytics domain.
- `CT-REQ-053`: eligible `org_advanced_admin` users may inspect own organization AI task status/history and generated output needed for training-draft review/copy, but not raw Prompt, Provider payload, raw AI IO, global AI logs, raw task payloads outside scope, raw employee learner AI outputs, or unredacted evidence/audit content.
- `CT-REQ-055`: generic organization-admin wording for enterprise training and organization AI means eligible `org_advanced_admin` only unless a sentence explicitly names both standard and advanced roles.

No new product decision is introduced by this contract. The open items below are implementation or UI detail gaps created by existing decisions.

## Current Code Alignment

| Area                              | Current implementation evidence                                                                                                                                                                 | Alignment                                                                                                                          |
| --------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| Organization advanced entry       | `AdminOrganizationPortalPage` shows `企业训练`, analytics, `AI出题`, and `AI组卷` as advanced organization destinations.                                                                        | Partially aligned for discoverability.                                                                                             |
| Standard organization denial      | organization workspace route guard treats `/organization/organization-training` as advanced-only, and the page renders a standard-unavailable state.                                            | Aligned for primary organization route.                                                                                            |
| Content route exposure            | `src/app/(admin)/content/organization-training/page.tsx` mounts the same training page under content workspace.                                                                                 | Risk; later source work must confirm this does not create a content-admin training management path.                                |
| Admin management UI               | Current page has three side-by-side forms: create draft, bind source metadata, copy version to draft. It uses old "组织培训" wording in many places.                                            | Gap against non-technical four-step wizard and confirmed `企业训练` label.                                                         |
| Source chooser                    | Admin source form asks for raw source business id and metadata. Source type is TypeScript-limited to `paper`; model/schema/validator still allow `paper` and `mock_exam`.                       | Gap; no searchable/filterable source chooser, no organization AI/manual choice, and backend still accepts `mock_exam` source type. |
| Platform paper import preview     | Source metadata validator forbids full question body, `standardAnswer`, and `analysis` in source metadata; UI states it only saves metadata and does not copy full paper content.               | Gap against import preview/full copied answer-analysis visibility.                                                                 |
| Organization AI handoff           | AI generation page shows a next-step panel linking to enterprise training and marks whether the result can be a training source.                                                                | Partially aligned; no one-click scoped copy into editable draft is evidenced.                                                      |
| Manual grouping/questions         | Service can create manual draft metadata and publish accepts question metadata including `standardAnswer` and `analysisSummary`; current UI does not expose manual grouping/question authoring. | Gap.                                                                                                                               |
| Publish flow                      | API/service supports publish with question list and publish-scope public ids; UI does not expose publish step, preview, confirmation, or scope picker.                                          | Gap.                                                                                                                               |
| Evidence gating                   | Validators accept per-question `evidenceStatus`, but service-side publish checks do not evidence `none` block or `weak` explicit confirmation.                                                  | Gap.                                                                                                                               |
| Draft discard                     | Schema has `retentionStatus`; no visible discard action or discard reason flow is evidenced.                                                                                                    | Gap.                                                                                                                               |
| Published immutable/copy/takedown | Service/API support copy-to-new-draft and takedown reason; UI exposes copy form by raw version id, not a detail action; takedown is not visible in the admin page.                              | Partially aligned.                                                                                                                 |
| Deadline/reminders                | No `answerDeadlineAt` or reminder surface was evidenced in schema, contract DTOs, service, or UI.                                                                                               | Gap.                                                                                                                               |
| Employee visible list             | Student page loads `/api/v1/organization-trainings/visible-list`, handles unauthorized/unavailable/empty/error, and renders title, question count, total score, and public id.                  | Partially aligned; missing organization node, profession/level/subject, version, deadline, status, submitted score columns.        |
| Employee answer UI                | Student page records answered question count, score, and total score, then calls draft-save/submit.                                                                                             | Gap; requirement needs actual questions/materials/options/text inputs, not numeric count/score forms.                              |
| Employee result UI                | Student page can load readonly summary and show score summary. DTOs do not include own answer, standard answer, analysis, or scoring-point reasons.                                             | Gap.                                                                                                                               |
| Raw answer/privacy boundary       | Validators forbid raw answer, full question body, `standardAnswer`, `analysis`, prompt, and Provider payload in employee-answer payloads; admin summary DTO is redacted.                        | Aligned for privacy boundary, but separate learner-grade answer/review DTOs are still needed.                                      |
| Formal-domain separation          | Schema/service use `organization_training_*` tables and formal write policy blocks formal `paper`/`mock_exam`/answer records.                                                                   | Aligned directionally.                                                                                                             |

## Role Contract

- `org_standard_admin`: can view scoped organization roster/status and authorization/status surfaces only; no `企业训练`, organization AI, organization analytics, or manual URL access to those advanced routes.
- `org_advanced_admin`: can manage `企业训练` only inside valid advanced `org_auth` and organization scope. It can inspect own scoped organization AI output enough to review and copy into a training draft.
- `super_admin`: may access organization training surfaces for support/governance only when the workspace route still enforces organization context and redacted evidence rules.
- `content_admin`: does not own organization training. It owns formal content and content AI draft/review surfaces. It must not become an organization training management actor through the content route.
- `ops_admin`: owns organization authorization, employee import/mutation, and support operations, but not first-release organization training authoring on behalf of enterprise admins unless a later explicit operations-support flow is approved.
- `org_advanced_employee`: sees assigned `企业训练` in the learner app when valid advanced `org_auth` covers the employee's organization context.
- `org_standard_employee`: does not see or answer `企业训练`; direct route access fails safely.

## Organization Admin UX Contract

### List And Entry

The organization training workspace starts from a list and a primary `新建企业训练` action. The list must show:

- title;
- organization node and publish scope summary;
- profession, level, and subject;
- source type;
- draft or version status;
- version number;
- question count and total score;
- optional `answerDeadlineAt`;
- submitted/completion aggregate;
- last updated or published time.

List behavior:

- backend pagination with default page size 20 and allowed page sizes 50 and 100;
- filters for status, source type, profession, level, subject, organization node, and keyword;
- sort by update/publish/deadline/status where practical;
- filter/sort/page state persisted in URL query where practical;
- loading, empty, error, permission-denied, and standard-unavailable states.

### Four-Step Create Wizard

Creation is a guided four-step wizard optimized for non-technical organization admins.

1. Choose source:
   - source chooser uses searchable/filterable cards or table rows;
   - it must not require manually typing raw `publicId`;
   - first-release source options are platform paper snapshot, organization AI result, and organization-private manual grouping/questions;
   - `mock_exam` is not shown and must be denied by validator/service for first-release organization training source use.
2. Configure training:
   - title, description, profession, level, subject;
   - question grouping and ordering;
   - manual question authoring for `single_choice`, `multi_choice`, `true_false`, and `short_answer`;
   - copied fields from source are editable only inside the training draft.
3. Publish scope and answer settings:
   - publish to current organization node only or current plus descendant nodes;
   - show impacted node/employee counts and quota/authorization warnings;
   - optional `answerDeadlineAt`; `null` means answerable until takedown;
   - in-app reminders/badges only.
4. Preview and publish:
   - preview complete question set and settings;
   - show validation findings and source attribution;
   - block `evidence_status = none`;
   - require explicit confirmation for `evidence_status = weak`;
   - confirm that the published version is immutable.

### Source Contracts

Platform paper snapshot:

- eligible `org_advanced_admin` can view the full copied stem, material, options, `standard_answer`, and `analysis` before publish;
- edits affect only the organization training snapshot;
- no writeback to the platform paper or formal question bank;
- no formal `mock_exam`, `exam_report`, or `mistake_book` record is created.

Organization AI result:

- only same-scope organization AI result can be selected;
- source attribution must be retained;
- generated stem, options, `standard_answer`, and `analysis` are copied into an editable draft;
- copying consumes no additional organization AI quota;
- raw Prompt, Provider payload, raw AI IO, global AI logs, raw task payload, and unredacted evidence remain unavailable to organization admins.

Organization-private manual grouping/questions:

- first release supports `single_choice`, `multi_choice`, `true_false`, and `short_answer`;
- no complex standalone organization question bank is introduced;
- `short_answer` uses AI scoring by default;
- manual grading is out of first-release scope.

### Draft, Publish, And Takedown

- Drafts can be edited, copied, and discarded with reason.
- Published versions are immutable.
- Changes after publish require copy-to-new-draft and publishing a new version.
- Takedown requires reason capture and stops unstarted and in-progress answers.
- Submitted summaries remain read-only after takedown.
- One employee can submit once per published version.
- Detail pages show redacted timeline, source attribution, publish/takedown/copy/discard events, aggregate completion, and validation status.
- Organization admins never see raw employee subjective answer text or per-question correctness detail that violates the privacy boundary.

## Employee UX Contract

### List

The learner app entry label is `企业训练`. The list must show:

- title;
- organization node;
- profession, level, and subject;
- version number;
- question count and total score;
- optional deadline;
- status: not started, in progress, submitted, read-only, taken down, or expired;
- submitted score when result summary is visible.

The page must include loading, empty, error, unauthorized, and standard-unavailable states.

### Answer

The answer UI is a real question-taking experience:

- material and question group rendering where applicable;
- objective options for `single_choice`, `multi_choice`, and `true_false`;
- text input for `short_answer`;
- progress, answered/unanswered state, validation before submit;
- save draft;
- submit confirmation;
- clear deadline and takedown state.

The UI must not rely on employee-entered `answeredQuestionCount`, score, or total score. Scores are system results, not learner input.

### Result

After submit, the employee may see:

- own submitted answer;
- score and total score;
- standard answer;
- analysis;
- subjective scoring-point reasons where available.

This visibility is employee-own-result visibility only. Organization admins still receive redacted aggregate summaries and must not inspect raw employee answers.

## Organization AI To Training Draft Handoff

The interaction contract must preserve these 12 points:

1. source is a same-scope organization AI result;
2. `mock_exam` is not a source;
3. output copies to an organization training draft only;
4. copied fields include stem, options, `standard_answer`, and `analysis`;
5. copied fields are editable in the draft;
6. source attribution is retained;
7. `evidence_status = none` blocks publish;
8. `evidence_status = weak` requires explicit confirmation;
9. copying consumes no additional AI quota;
10. the four-step preview/publish flow still applies;
11. published versions remain immutable;
12. employee answering and analytics remain enterprise-training surfaces, not formal `mock_exam`, `exam_report`, or `mistake_book` surfaces.

## Follow-Up Source Work Register

| ID                  | Source work needed later                                                                                                                    | Reason                                                                                                    |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| ORG-TRAIN-UX-GAP-01 | Replace the current three-form admin page with list plus four-step wizard and role/states contract.                                         | Current UI is technical metadata entry and old "组织培训" wording, not confirmed `企业训练` workflow.     |
| ORG-TRAIN-UX-GAP-02 | Add searchable/filterable source chooser for platform paper snapshot, organization AI result, and manual grouping/questions.                | Current source flow requires raw source id and only exposes paper metadata.                               |
| ORG-TRAIN-UX-GAP-03 | Deny `mock_exam` as first-release training source in UI, validator, and service even if historical enum compatibility is retained.          | Current model/schema/validator still include `mock_exam` source type.                                     |
| ORG-TRAIN-UX-GAP-04 | Implement platform paper snapshot import preview with full copied stem/options/`standard_answer`/`analysis` and no source writeback.        | Current source metadata route forbids full content and records metadata only.                             |
| ORG-TRAIN-UX-GAP-05 | Implement scoped organization AI result copy into editable training draft with source attribution and no extra quota.                       | Current AI next-step only links to configuration.                                                         |
| ORG-TRAIN-UX-GAP-06 | Implement manual grouping/manual question authoring for the four first-release question types.                                              | Current UI does not author real training questions.                                                       |
| ORG-TRAIN-UX-GAP-07 | Add publish preview, publish-scope selector, `answerDeadlineAt`, reminder/badge settings, immutable confirmation, and validation summary.   | Current admin UI does not expose publish.                                                                 |
| ORG-TRAIN-UX-GAP-08 | Enforce `evidence_status = none` publish block and `weak` explicit confirmation in service/UI.                                              | Current publish validation accepts evidence status but no block/confirm behavior is evidenced.            |
| ORG-TRAIN-UX-GAP-09 | Add draft discard with reason and visible lifecycle timeline.                                                                               | Current schema has retention status but no discard action surfaced.                                       |
| ORG-TRAIN-UX-GAP-10 | Add published detail actions for view, copy-to-draft, takedown with reason, read-only submitted summaries, and redacted aggregate timeline. | Current UI only copies by raw version id and does not expose takedown/detail.                             |
| ORG-TRAIN-UX-GAP-11 | Replace employee numeric count/score forms with actual question/material/option/text-answer UI and submit confirmation.                     | Current employee UI lets employees type answered count and scores.                                        |
| ORG-TRAIN-UX-GAP-12 | Add employee post-submit result review DTO/UI for own answer, score, standard answer, analysis, and scoring-point reasons.                  | Current DTO/result UI only exposes score summary.                                                         |
| ORG-TRAIN-UX-GAP-13 | Add backend pagination and URL-preserved filters to organization-admin training lists.                                                      | Current inspected admin page is not list-first.                                                           |
| ORG-TRAIN-UX-GAP-14 | Verify or remove content-workspace training route exposure.                                                                                 | Enterprise training must remain organization advanced workspace capability, not content-admin capability. |

## Non-Claims

- No product source code was changed by this contract.
- No database, schema, migration, seed, runtime, Provider, browser, deployment, dependency, or environment action is authorized here.
- No release readiness, final Pass, or production usability claim is made.
