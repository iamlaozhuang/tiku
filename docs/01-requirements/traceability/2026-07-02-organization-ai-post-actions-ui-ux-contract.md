# 2026-07-02 Organization AI Post-Actions UI/UX Contract

## Status

This is package 4 of the serial UI/UX requirement contract closeout.

It is documentation-only. It does not approve product source changes, tests, schema, migration, database access,
Provider execution, env/secret access, browser/runtime validation, staging/prod deployment, payment, external-service
work, Cost Calibration, release readiness, final Pass, or production usability claims.

## Scope

This contract covers the first-release organization AI generation post-actions for eligible `org_advanced_admin` users:

- organization backend `AI出题` / `AI组卷` entries;
- task history, status, and generated-output review;
- copying organization-owned AI output into organization training draft workflow;
- `evidence_status` handling for `none`, `weak`, and `sufficient`;
- redaction and role boundaries around Prompt, Provider payloads, raw AI IO, logs, and employee learner AI output.

It does not cover content-admin formal adoption, learner AI history, model configuration, Prompt registry, global log
governance, or resource management except as explicit boundaries.

## Required Sources Read

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/03-standards/ui-code.md`
- `docs/02-architecture/adr/`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/01-requirements/00-index.md`
- `docs/01-requirements/advanced-edition/00-index.md`
- `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`
- `docs/02-architecture/adr/adr-007-edition-aware-authorization-source-of-truth.md`
- `docs/01-requirements/advanced-edition/modules/08-organization-ai-generation.md`
- `docs/01-requirements/advanced-edition/stories/epic-07-organization-ai-generation.md`
- `docs/01-requirements/traceability/2026-07-02-ai-generation-requirements-ssot-alignment.md`
- `docs/01-requirements/traceability/2026-07-02-phase4-requirements-agent-baseline-alignment.md`
- `docs/05-execution-logs/evidence/2026-07-02-ai-generation-goal-completion-audit.md`
- `docs/05-execution-logs/evidence/2026-07-02-ai-generation-acceptance-baseline-normalization.md`
- `docs/01-requirements/traceability/2026-07-02-role-auth-training-ops-decision-package.md`
- `docs/01-requirements/traceability/2026-07-02-current-thread-requirement-reconciliation-ledger.md`
- `docs/01-requirements/traceability/2026-07-02-ui-ux-requirement-design-baseline-gap-analysis.md`
- relevant current implementation files under `src/features/admin/ai-generation`,
  `src/features/admin/organization-portal`, `src/app/(admin)/organization/ai-question-generation`,
  `src/app/(admin)/organization/ai-paper-generation`, and `src/server/**admin-ai-generation**`.

## Existing Requirement Decisions

The following points are already decided and are not reopened by this contract:

- `org_advanced_admin` can access organization `AI出题` and `AI组卷` only inside valid advanced `org_auth` and own
  organization scope.
- `org_standard_admin` must not see or use organization AI generation; direct routes must deny access or show a
  standard-unavailable/upgrade-guided state.
- Organization AI generated output belongs to the `organization` draft domain.
- Organization AI output must not directly create platform formal `question`, `paper`, `practice`, `mock_exam`,
  `exam_report`, or `mistake_book` records.
- Eligible `org_advanced_admin` users may inspect own organization AI task status/history and generated output needed
  to review or copy stem/options/`standard_answer`/`analysis` into organization training drafts.
- Generated-output visibility does not authorize access to raw Prompt, Provider payload, raw AI input/output, global AI
  logs, out-of-scope raw task payloads, raw employee learner AI outputs, or unredacted evidence/audit content.
- Copying organization AI output into training does not consume additional enterprise AI quota.
- Organization admins do not see enterprise AI quota consumption summaries in the first release.
- Shared AI generation task-count semantics, structured preview parsing, Provider instruction contracts, route/service
  contracts, and cross-surface UI regression baselines must not be forked per role.
- The first 20 AI generation issue classes are closed or superseded by the 2026-07-02 AI generation baseline and must
  not be reopened without fresh current-baseline failure evidence.

Primary decision anchors:

- `ADV-MOD-08` - organization AI generation.
- `ADV-STORY-07` - organization AI generation acceptance scenario.
- `CT-REQ-024` - organization AI cannot directly create formal content and can copy generated output to organization
  training draft.
- `CT-REQ-048` - confirmed 12-point result-to-training-draft handoff.
- `CT-REQ-053` - generated-output visibility correction.
- `CT-REQ-055` - generic organization-admin wording resolves to `org_advanced_admin` for advanced-only surfaces.
- `UX-REQ-09` - AI generation post-actions split by surface.

## Role And Access Contract

| Actor                | Required result                                                                                                                                             |
| -------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `org_advanced_admin` | Can access own organization `AI出题` / `AI组卷`, review generated output, and start explicit copy into organization training draft workflow.                |
| `org_standard_admin` | Cannot access organization AI generation; direct URL must show denied, unavailable, or upgrade-guided state.                                                |
| `super_admin`        | May inspect support/admin surfaces only with explicit organization context and the same redaction boundaries; this does not create raw Prompt/log access.   |
| `ops_admin`          | Does not author organization AI output. May see separate redacted governance/log summaries only where approved, not organization generated-content details. |
| `content_admin`      | Uses content AI draft/review surfaces; cannot own organization AI output or copy it into enterprise training.                                               |
| Employee or learner  | Cannot access organization-admin AI task history or generated output; employee training remains a published enterprise-training surface.                    |

UI visibility is not the authorization boundary. Services must enforce `effectiveEdition`, valid `org_auth`,
organization scope, expiry, revocation, quota owner, and role/capability checks.

## Information Architecture Contract

Organization AI post-actions should be one continuous work surface:

1. Entry from organization backend navigation: `AI出题` or `AI组卷`.
2. Generation form using the shared AI generation contract and organization context.
3. Task status and history list with request time, status, generation kind, organization scope, evidence state, and
   redacted result reference.
4. Generated-output review panel with business-readable preview and field coverage.
5. Explicit next action: copy to organization training draft.
6. Training draft handoff confirmation that enters the organization training draft workflow.

The page must avoid implying that organization AI creates platform formal question bank items, formal paper-library
items, formal `mock_exam`, formal `exam_report`, or formal `mistake_book` entries.

## Generated-Output Visibility Contract

Eligible `org_advanced_admin` users need enough generated output to decide whether it can become training draft content.

Allowed display:

- task status/history;
- result reference and created time;
- generation kind, profession, level, subject, and organization scope;
- evidence status and citation count/status;
- redacted source attribution;
- generated stem, options, `standard_answer`, and `analysis` needed for review/copy;
- structured preview for AI `paper` output, including module/question-count summaries;
- field-level warnings when a required field is missing or cannot be copied.

Forbidden display:

- raw Prompt;
- Provider request/response payload;
- raw AI input/output logs;
- global `ai_call_log` or `audit_log`;
- out-of-scope task payloads;
- raw employee learner AI output;
- unredacted evidence/audit content;
- enterprise AI quota consumption summary for organization admins.

If a source DTO currently contains only masked preview text, a later source task must add a scoped generated-output
review DTO rather than exposing raw Provider payload or global logs.

## Training Draft Handoff Contract

The confirmed handoff has 12 mandatory details:

1. Entry is from an organization AI result, not from `mock_exam`.
2. Source result must belong to the same allowed `organization` scope.
3. Copying creates or updates an organization training draft, never formal platform `question` or `paper`.
4. Generated stem, options, `standard_answer`, and `analysis` are copied into the draft snapshot.
5. Copied fields are editable before publish.
6. Source attribution to the AI task/result remains visible in draft history.
7. `evidence_status = none` blocks publish.
8. `evidence_status = weak` requires explicit confirmation before publish.
9. Copying to a training draft does not consume additional enterprise AI quota.
10. Draft publish still goes through the four-step training wizard and preview.
11. Published versions remain immutable; later changes copy to a new draft/version.
12. Employee answering and analytics remain enterprise-training surfaces, not formal `mock_exam`, `exam_report`, or
    `mistake_book`.

First-release UX should default to an explicit "copy to training draft" action. If a later implementation supports both
creating a new draft and appending to an existing unpublished draft, the destination must be explicitly selected and
validated against the same organization scope. Silent merge into an existing draft is not allowed.

## Evidence Status Contract

| `evidence_status` | Result review state                                                                 | Training draft handoff state                                                                                   |
| ----------------- | ----------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| `none`            | Show generated result as insufficient/unusable for publish.                         | Copy may be withheld or allowed only as blocked draft material; publish must be blocked.                       |
| `weak`            | Show visible low-confidence warning and require explicit confirmation before usage. | Copy can create/edit draft with warning; publish requires explicit confirmation before the final publish step. |
| `sufficient`      | Show usable source state with attribution and normal validation.                    | Copy can proceed to editable draft and normal four-step preview/publish validation.                            |

The UI must distinguish "copy to draft" from "publish". A copied draft is not employee-visible until the organization
training publish flow succeeds.

## Organization Training Integration Contract

After copy, the user should land in or be routed to the enterprise training workflow already defined by the organization
training UI/UX contract:

- source step shows the AI task/result attribution;
- configure step allows editing copied stem/options/`standard_answer`/`analysis`;
- publish-scope step uses current node or current plus descendant scope rules;
- preview/publish step shows evidence status, warning/confirmation needs, and immutable-version consequences.

The copied organization AI content remains outside formal platform content. It may later be copied to a new training
version, but it must not become formal question-bank or paper-library content without a separate approved content-admin
formal adoption design.

## States Contract

Required states:

- loading;
- permission denied;
- standard unavailable;
- invalid or expired organization authorization;
- quota blocked for generation request;
- generation pending/running/succeeded/failed/cancelled;
- retry available for failed retryable tasks;
- no task history;
- generated result unavailable;
- evidence insufficient (`none`);
- weak evidence confirmation required;
- source organization mismatch;
- training draft copy unavailable;
- copy in progress;
- copy succeeded and routed to draft;
- copy failed with retry guidance;
- published training immutable state.

Empty and blocked states must use business-readable wording for non-technical organization admins and avoid exposing
internal policy keys as the primary visible text.

## Current Source Alignment

Static source inspection found partial implementation, not runtime acceptance.

Aligned or directionally aligned:

- Organization portal links to `AI出题` and `AI组卷`.
- Organization route pages mount `AdminAiGenerationEntryPage` with `workspace="organization"`.
- `AdminAiGenerationEntryPage` resolves organization workspace access through the organization page access guard.
- Standard organization access has a standard-unavailable message for `AI出题` / `AI组卷`.
- Organization copy labels identify the surface as organization advanced AI draft/organization draft pool.
- Task history has pagination, status labels, result visibility labels, evidence status, citation count, and generated
  result reference.
- `OrganizationAiGenerationDraftNextStepPanel` shows organization private draft next-step wording and links to
  `/organization/organization-training`.
- Local contracts and persistence boundaries include `organization_private`,
  `allowed_as_organization_private_draft`, and `allowed_as_organization_private_training_source`.
- Organization owner/quota owner boundary checks require organization ownership and organization quota owner.
- Content formal adoption route is content-scoped, and repository tests reject organization generated results from
  platform formal adoption.

Gaps or conflicts with the confirmed contract:

- No source route or UI action was found that actually copies organization AI generated output into an organization
  training draft.
- Current organization next step is a generic link to enterprise training configuration, not a field-level handoff.
- Current generated-result history DTO exposes masked preview, evidence status, and citation count, but not the
  generated stem/options/`standard_answer`/`analysis` needed for review and copy.
- Current UI labels include "正式采用" and "需后续评审" in shared panels; organization UI should avoid suggesting content
  formal adoption and should instead say "训练草稿使用" or equivalent business wording.
- Current grounded check treats only `sufficient` plus citations as training-source allowed; the confirmed contract also
  needs explicit `weak` handling with confirmation before publish.
- No draft-history source attribution UI was found for AI task/result after copy.
- No same-organization destination validation UI was found for selecting or creating the target training draft.
- No copy-state UI was found for copying, success, failure, or retry.
- No first-release confirmation path was found for `evidence_status = weak`.
- No explicit proof was found that copy performs no additional enterprise AI quota consumption because the copy action
  itself is not implemented in the inspected source.

## Follow-Up Source Gap Register

| Id                 | Follow-up source task direction                                                                                                                                     |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `ORG-AI-UX-GAP-01` | Add organization AI result-to-training-draft copy route/service/UI action with explicit organization-scope validation.                                              |
| `ORG-AI-UX-GAP-02` | Add generated-output review DTO/UI for stem/options/`standard_answer`/`analysis` without exposing raw Prompt, Provider payload, raw AI IO, or global logs.          |
| `ORG-AI-UX-GAP-03` | Replace organization "正式采用" wording with enterprise-training-draft wording and keep platform formal adoption language content-only.                             |
| `ORG-AI-UX-GAP-04` | Implement `none` publish block and `weak` confirmation behavior inside the organization training draft publish workflow.                                            |
| `ORG-AI-UX-GAP-05` | Preserve AI task/result source attribution in organization training draft history and detail timeline.                                                              |
| `ORG-AI-UX-GAP-06` | Add destination handling for create-new draft and, if later approved, append-to-existing unpublished draft with explicit selection and same-scope validation.       |
| `ORG-AI-UX-GAP-07` | Add copy progress, success, failure, retry, and unavailable states.                                                                                                 |
| `ORG-AI-UX-GAP-08` | Verify the copy action does not reserve, deduct, or display additional enterprise AI quota.                                                                         |
| `ORG-AI-UX-GAP-09` | Keep `org_standard_admin`, employees, learners, `ops_admin`, and `content_admin` denied or unavailable for organization AI generated-output review and copy action. |
| `ORG-AI-UX-GAP-10` | Add focused tests that preserve shared AI generation semantics while limiting role-specific differences to authorization, ownership, route, and state presentation. |
| `ORG-AI-UX-GAP-11` | Avoid raw Prompt, Provider payload, raw AI IO, unredacted evidence/audit, and raw employee learner AI output in UI, API, logs, tests, and evidence.                 |
| `ORG-AI-UX-GAP-12` | Keep generated employee answering and analytics in enterprise-training surfaces, not formal `mock_exam`, `exam_report`, or `mistake_book`.                          |

## Decision Items

No blocking product decision is required from this package. The required handoff details have already been confirmed in
`CT-REQ-048`.

One implementation-level design choice remains for later source planning:

- First-release recommended default is "copy into a new organization training draft". Supporting "append to an existing
  unpublished draft" is allowed only if the UI forces explicit destination selection, same-organization validation, and
  source attribution. Silent automatic merge is not allowed.

If a later source task proposes direct platform formal adoption, direct `mock_exam` creation, automatic merge into an
existing draft, organization-admin enterprise AI quota consumption summaries, or raw Prompt/Provider/raw AI viewers, it
must stop and request a new product decision because that would supersede current requirements.

## Non-Claims

- No source implementation is complete by this contract.
- No runtime acceptance is claimed.
- No Provider, database, schema, migration, dependency, staging/prod, payment, Cost Calibration, release readiness,
  final Pass, or production usability is claimed.
