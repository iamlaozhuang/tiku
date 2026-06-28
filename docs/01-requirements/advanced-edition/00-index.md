# Advanced Edition Requirements Index

## Purpose

This directory is the derived requirement reading surface for the advanced edition. It helps readers navigate advanced edition modules and user stories from the same requirement tree as the standard edition.

These files do not replace the advanced edition source documents. If a conflict exists, the source documents listed below remain authoritative until a follow-up decision resolves the conflict.

Advanced edition tasks must also follow
`docs/04-agent-system/sop/requirement-ssot-reading-governance.md`. The standard requirement root remains
`docs/01-requirements/00-index.md`; this file is the additional required entry for advanced edition, edition-aware
authorization, quota, AI generation, organization training, and role-separated advanced capability work.

`docs/05-execution-logs/` may explain why a gap was observed, but advanced edition implementation scope must map back to
this index, the relevant advanced module or story, and the latest traceability decision.

## Source Documents

Primary sources:

- `docs/superpowers/specs/2026-06-05-advanced-edition-ai-generation-design.md`
- `docs/superpowers/specs/2026-06-06-advanced-edition-mvp-requirements.md`
- `docs/superpowers/specs/2026-06-06-advanced-edition-ops-config-contract.md`
- `docs/01-requirements/traceability/2026-06-23-advanced-ai-generation-scope-clarification.md`
- `docs/01-requirements/traceability/2026-06-24-role-separated-mvp-requirement-alignment.md`
- `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`
- `docs/superpowers/plans/2026-06-06-advanced-edition-requirements-to-implementation-handoff.md`
- `docs/superpowers/plans/2026-06-06-advanced-edition-doc-source-of-truth-index.md`

Maintenance rule:

- `docs/04-agent-system/sop/advanced-edition-requirements-reading-surface-maintenance.md`

Implementation planning references:

- `docs/superpowers/plans/2026-06-06-advanced-edition-auth-context-implementation-plan.md`
- `docs/superpowers/plans/2026-06-06-advanced-edition-ai-task-domain-implementation-plan.md`
- `docs/superpowers/plans/2026-06-06-advanced-edition-personal-ai-generation-implementation-plan.md`
- `docs/superpowers/plans/2026-06-06-advanced-edition-organization-training-implementation-plan.md`
- `docs/superpowers/plans/2026-06-06-advanced-edition-organization-analytics-implementation-plan.md`
- `docs/superpowers/plans/2026-06-06-advanced-edition-ops-auth-quota-implementation-plan.md`
- `docs/superpowers/plans/2026-06-06-advanced-edition-retention-log-governance-implementation-plan.md`

## MVP Main Loop

Advanced edition MVP focuses on:

- personal advanced learner and organization advanced employee AI question generation and AI `paper` generation;
- organization admin AI question generation and AI `paper` generation for organization-owned content;
- organization admin creates organization training;
- employee answer statistics;
- platform operations governance for `authorization`, `redeem_code`, quota, `audit_log`, and `ai_call_log`.

## Modules

| Cross-cutting requirement          | File                                                                                         |
| ---------------------------------- | -------------------------------------------------------------------------------------------- |
| Edition-aware authorization source | [edition-aware-authorization-requirements.md](./edition-aware-authorization-requirements.md) |

| Module                             | File                                                                                   |
| ---------------------------------- | -------------------------------------------------------------------------------------- |
| Authorization context              | [modules/01-authorization-context.md](./modules/01-authorization-context.md)           |
| AI task domain                     | [modules/02-ai-task-domain.md](./modules/02-ai-task-domain.md)                         |
| Learner AI generation              | [modules/03-personal-ai-generation.md](./modules/03-personal-ai-generation.md)         |
| Organization training              | [modules/04-organization-training.md](./modules/04-organization-training.md)           |
| Organization analytics             | [modules/05-organization-analytics.md](./modules/05-organization-analytics.md)         |
| Operations authorization and quota | [modules/06-ops-authorization-quota.md](./modules/06-ops-authorization-quota.md)       |
| Retention and log governance       | [modules/07-retention-log-governance.md](./modules/07-retention-log-governance.md)     |
| Organization AI generation         | [modules/08-organization-ai-generation.md](./modules/08-organization-ai-generation.md) |

## Stories

| Story                                         | File                                                                                                             |
| --------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| Personal AI generation                        | [stories/epic-01-personal-ai-generation.md](./stories/epic-01-personal-ai-generation.md)                         |
| Organization training                         | [stories/epic-02-organization-training.md](./stories/epic-02-organization-training.md)                           |
| Employee answer statistics                    | [stories/epic-03-employee-answer-statistics.md](./stories/epic-03-employee-answer-statistics.md)                 |
| Operations authorization and quota governance | [stories/epic-04-ops-authorization-quota-governance.md](./stories/epic-04-ops-authorization-quota-governance.md) |
| Formal content separation                     | [stories/epic-05-formal-content-separation.md](./stories/epic-05-formal-content-separation.md)                   |
| Retention and log governance                  | [stories/epic-06-retention-log-governance.md](./stories/epic-06-retention-log-governance.md)                     |
| Organization AI generation                    | [stories/epic-07-organization-ai-generation.md](./stories/epic-07-organization-ai-generation.md)                 |

## Cross-Cutting Boundaries

- AI generated learning content must not automatically write to formal `question`, `paper`, `practice`, `mock_exam`, `exam_report`, or `mistake_book`.
- Advanced learner, organization admin, and content admin AI generation entries must be discoverable; URL-only access fails acceptance.
- Organization-owned AI generated content must remain separate from the platform formal question bank and paper library unless a later governed adoption path is explicitly approved.
- Content admin AI generated content must remain in an isolated review surface until governed formal adoption is complete.
- Organization training answer statistics must not be mixed into formal `exam_report` or formal `mistake_book`.
- `effectiveEdition` is service-computed from source authorization, `edition`, upgrade state, expiry, revocation, and scope; UI visibility is not an authorization boundary.
- `audit_log` and `ai_call_log` evidence must use redacted summaries.
- Role-separated runtime acceptance remains blocked until all 8 mandatory roles pass strict runtime observation; `Covered` UI/UX contract status is not runtime Pass.
- `personal_standard_student`, `org_standard_employee`, and `org_standard_admin` must not receive advanced AI or enterprise training capabilities from frontend visibility alone or by manual URL access.
- `personal_advanced_student`, `org_advanced_employee`, `org_advanced_admin`, and `content_admin` require discoverable entries for their approved AI or enterprise-training capabilities.
- `ops_admin`, `content_admin`, and organization admins require separated backend workspaces, role-aware landing, visible logout, scoped menus, and unrelated-surface denial.
- Backend UI/UX optimization for enterprise, content, and operations workspaces must follow
  `docs/01-requirements/traceability/2026-06-27-standard-advanced-backend-ux-design-first-contract.md` before source implementation. The contract defines information architecture, routes, component reuse, states, role/edition boundaries, and allowed implementation scope.
- Next organization backend standard/advanced UX polish work follows
  `docs/01-requirements/traceability/2026-06-28-standard-advanced-next-ux-polish-queue-planning.md` and remains split into source-only UI, permission contract, and local browser validation tasks that require fresh approval.
- Cost Calibration Gate remains blocked pending fresh explicit approval.
- Provider, env/secret, staging/prod/cloud/deploy, payment, and external-service work remain out of scope.
- Code-stage queue seeding remains paused unless explicitly approved later.
