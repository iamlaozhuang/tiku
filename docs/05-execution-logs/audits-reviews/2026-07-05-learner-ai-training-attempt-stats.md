# 2026-07-05 Learner AI Training Attempt Stats Audit

## Review Summary

- Root cause: the existing learner AI learning session created generated questions and returned immediate feedback, but answer feedback was not part of the repository contract and no resumable progress/statistics read model existed.
- Fix: persisted answer feedback through the repository interface and added a service-level progress DTO that calculates resumable learner AI statistics from latest saved feedback.
- Role coverage: personal advanced student and organization advanced employee ownership contexts are covered by focused tests.

## Adversarial Review

- Formal learning boundary: still blocked. The implementation does not write or imply formal `practice`, `answer_record`, `exam_report`, or `mistake_book` records.
- Actor isolation: organization employee progress is readable only by the original actor; cross-actor reads return `actor_not_allowed`.
- Duplicate feedback: progress statistics use the latest feedback per generated question, preventing repeated submissions from inflating counts.
- Raw content exposure: no organization-admin aggregate read path was added, so raw employee generated content is not exposed.
- DB realism gap: this task defines reusable service/repository behavior only. A separate bounded DB/API task is still required for actual database-backed persistence.

## Taste Checklist

- Code reuses the existing learner AI learning-session service and DTO boundary instead of adding role-specific duplicate services.
- API/DTO fields stay camelCase; storage/schema naming was not changed.
- No dependency, schema, migration, seed, Provider, env, or DB action was introduced.
- No UI color, spacing, or token changes were made.
- No sensitive values, Provider payloads, raw prompts, raw AI output, full generated questions, full papers, or material text were recorded.
