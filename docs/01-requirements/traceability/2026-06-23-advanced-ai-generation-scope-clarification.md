# Advanced AI Generation Scope Clarification

**Date:** 2026-06-23
**Decision status:** product requirement clarification recorded; implementation remains gated.
**Source instruction:** product owner clarified advanced learner, organization, and content admin AI generation scope.

## Confirmed Requirement

| audience                            | required AI capabilities                         | required entry                                                                                              | output owner                                                                           | formal content boundary                                                                                                                                                                     |
| ----------------------------------- | ------------------------------------------------ | ----------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Personal advanced learner           | AI question generation and AI `paper` generation | Discoverable learner entry after login; URL-only access is not acceptable.                                  | Owning `user` under valid `personal_auth`.                                             | Output stays in the personal AI learning content domain and must not automatically write formal `question` or `paper`.                                                                      |
| Organization advanced employee      | AI question generation and AI `paper` generation | Discoverable learner entry after login under valid organization context; URL-only access is not acceptable. | Owning `employee`/`user` within the valid `org_auth` and `organization` context.       | Output stays in the learner organization AI content domain and must not automatically write platform formal `question`, `paper`, `practice`, `mock_exam`, `exam_report`, or `mistake_book`. |
| Advanced organization admin backend | AI question generation and AI `paper` generation | Discoverable organization backend entry; URL-only access is not acceptable.                                 | Owning `organization`; managed by organization admins under valid advanced `org_auth`. | Output is enterprise-managed organization content and must not enter the platform formal question bank or paper library unless a separate governed adoption path is approved.               |
| Content admin backend               | AI question generation and AI `paper` generation | Discoverable content backend entry; URL-only access is not acceptable.                                      | Platform content operations review domain until adopted.                               | Output may only become formal `question` or `paper` through governed review, validation, attribution, and `audit_log`; direct publish or direct formal write is forbidden.                  |

## Edition Boundary

- Standard edition remains excluded from AI question generation and AI `paper` generation.
- Advanced capability checks must use service-computed `effectiveEdition` from `personal_auth`, `org_auth`, upgrade state, expiry, revocation, and scope.
- Content admin AI generation is a platform content operations capability. It is not unlocked by learner `personal_auth` or `org_auth`, but it must follow the same AI generation and formal content governance boundaries.
- Frontend visibility is an entry requirement but is not an authorization boundary.
- A visible entry must still be backed by server-side authorization checks.

## Formal Content And Ownership Rules

1. Learner AI generation produces personal or organization-scoped learning content, not formal platform content.
2. Organization admin AI generation produces organization-owned drafts or managed content, not platform formal content.
3. Content admin AI generation produces isolated reviewable drafts or suggestions before any formal adoption.
4. Formal adoption into `question` or `paper` requires human review, validation, reviewer attribution, source attribution, and `audit_log`.
5. AI `paper` generation may propose paper structure, candidate questions, and selection rationale; it must not publish a `paper` or make it available to students in the same action.
6. AI question generation may propose draft fields, options, `standard_answer`, `analysis`, `scoring_point`, `material`, or `question_group`; it must not create formal records without a governed adoption workflow.

## Previously Confirmed Decisions

The following points were already decided by the advanced edition MVP source documents and are not open product questions:

1. Organization admins cannot view employees' raw learner AI outputs, prompts, raw AI input/output, generated content summaries, single-task details, or task-list summaries. They can view organization-scoped statistics, quota consumption summaries, and redacted audit summaries only.
2. If an employee uses organization authorization and organization quota for learner AI generation, the generated learning content still belongs to the employee/user. The organization can see summary-level statistics and quota consumption, not raw content.
3. Organization-owned generated content follows the organization training/content lifecycle: unpublished drafts are editable, published content is versioned/locked for direct edit, changes require copy/new draft/new version, and takedown stops new answering while preserving history summaries.
4. Content admin adoption into formal `question` or `paper` is already a governed two-step flow: AI output first lands in an isolated review surface; a content admin reviews/edits/validates/adopts it into an editable formal draft; existing formal validation and publish rules still apply.
5. Content admin adoption must not bypass duplicate detection, canonical `question_type` normalization, material binding rules, paper count limits, source attribution, reviewer attribution, `audit_log`, snapshot semantics, or publish validation.
6. Authorization context selection is already defined: the system exposes selectable authorization contexts; personal learning entrypoints default to personal context when available; organization entrypoints or an explicit "use organization authorization" choice use organization context; the system must not auto-switch context to obtain higher `effectiveEdition` or more quota.

## Required Entry Surfaces

Future implementation acceptance must prove discoverable entries instead of requiring manual URL input:

- Learner experience: an obvious AI training or AI generation entry for advanced personal learners and advanced organization employees.
- Organization admin backend: an obvious organization AI generation entry for organization-owned question and paper generation.
- Content backend: an obvious content AI generation entry for platform content operators.

Exact placement, labels, and mobile adaptation remain implementation design decisions, but hiding the feature behind an unpublished URL fails acceptance.

## Pending UI/UX Entry Decision

The advanced MVP business scope is decided. The only unresolved item found in this review is the UI/UX decision for exact entry naming and placement. It should be decided using the project's UI/UX standards and, for later visual exploration or design QA, the Product Design skill workflow.

Recommended baseline for the UI/UX decision package:

1. Learner side is Mobile-first. Put a visible `AI训练` entry on the learner home primary action area, with explicit actions for `AI出题` and `AI组卷`. If both personal and organization contexts are available, show the active context clearly and require an explicit organization-context choice before consuming organization quota.
2. Organization admin backend is Desktop-first. Put an organization-owned AI entry in the organization backend sidebar, near organization training/content management, with page-level actions for `AI出题` and `AI组卷`.
3. Content backend is Desktop-first. Put a content AI draft/review entry in the content backend sidebar, near `question` and `paper` management, with page-level actions for `AI出题` and `AI组卷` and visible adoption status.
4. The UI must not rely on hidden routes, manual URL entry, or explanatory copy outside the workflow to make the capability discoverable.
5. Exact Chinese labels, icon choice, mobile layout, sidebar grouping, and interaction details should be finalized in a scoped UI/UX contract before implementation.

## Blocked Gates

This clarification does not approve:

- source code, route, UI, test, fixture, or e2e changes;
- schema, migration, seed, or database changes;
- `package.json` or lockfile changes;
- Provider calls, prompt/provider payload handling, `.env` work, secret creation, model output persistence, or Cost Calibration Gate execution;
- staging, production, cloud, deploy, payment, external-service, PR, force-push, or runtime verification.

Any implementation must be split into scoped tasks with explicit allowed files, fresh approvals, redacted evidence, and passing gates.
