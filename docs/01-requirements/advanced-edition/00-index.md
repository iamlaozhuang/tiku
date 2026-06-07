# Advanced Edition Requirements Index

## Purpose

This directory is the derived requirement reading surface for the advanced edition. It helps readers navigate advanced edition modules and user stories from the same requirement tree as the standard edition.

These files do not replace the advanced edition source documents. If a conflict exists, the source documents listed below remain authoritative until a follow-up decision resolves the conflict.

## Source Documents

Primary sources:

- `docs/superpowers/specs/2026-06-05-advanced-edition-ai-generation-design.md`
- `docs/superpowers/specs/2026-06-06-advanced-edition-mvp-requirements.md`
- `docs/superpowers/specs/2026-06-06-advanced-edition-ops-config-contract.md`
- `docs/superpowers/plans/2026-06-06-advanced-edition-requirements-to-implementation-handoff.md`
- `docs/superpowers/plans/2026-06-06-advanced-edition-doc-source-of-truth-index.md`

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

- personal user AI question generation and AI `paper` generation;
- organization admin creates organization training;
- employee answer statistics;
- platform operations governance for `authorization`, `redeem_code`, quota, `audit_log`, and `ai_call_log`.

## Modules

| Module                             | File                                                                               |
| ---------------------------------- | ---------------------------------------------------------------------------------- |
| Authorization context              | [modules/01-authorization-context.md](./modules/01-authorization-context.md)       |
| AI task domain                     | [modules/02-ai-task-domain.md](./modules/02-ai-task-domain.md)                     |
| Personal AI generation             | [modules/03-personal-ai-generation.md](./modules/03-personal-ai-generation.md)     |
| Organization training              | [modules/04-organization-training.md](./modules/04-organization-training.md)       |
| Organization analytics             | [modules/05-organization-analytics.md](./modules/05-organization-analytics.md)     |
| Operations authorization and quota | [modules/06-ops-authorization-quota.md](./modules/06-ops-authorization-quota.md)   |
| Retention and log governance       | [modules/07-retention-log-governance.md](./modules/07-retention-log-governance.md) |

## Stories

| Story                                         | File                                                                                                             |
| --------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| Personal AI generation                        | [stories/epic-01-personal-ai-generation.md](./stories/epic-01-personal-ai-generation.md)                         |
| Organization training                         | [stories/epic-02-organization-training.md](./stories/epic-02-organization-training.md)                           |
| Employee answer statistics                    | [stories/epic-03-employee-answer-statistics.md](./stories/epic-03-employee-answer-statistics.md)                 |
| Operations authorization and quota governance | [stories/epic-04-ops-authorization-quota-governance.md](./stories/epic-04-ops-authorization-quota-governance.md) |
| Formal content separation                     | [stories/epic-05-formal-content-separation.md](./stories/epic-05-formal-content-separation.md)                   |
| Retention and log governance                  | [stories/epic-06-retention-log-governance.md](./stories/epic-06-retention-log-governance.md)                     |

## Cross-Cutting Boundaries

- AI generated learning content must not automatically write to formal `question`, `paper`, `practice`, `mock_exam`, `exam_report`, or `mistake_book`.
- Organization training answer statistics must not be mixed into formal `exam_report` or formal `mistake_book`.
- `audit_log` and `ai_call_log` evidence must use redacted summaries.
- Cost Calibration Gate remains blocked pending fresh explicit approval.
- Provider, env/secret, staging/prod/cloud/deploy, payment, and external-service work remain out of scope.
- Code-stage queue seeding remains paused unless explicitly approved later.
