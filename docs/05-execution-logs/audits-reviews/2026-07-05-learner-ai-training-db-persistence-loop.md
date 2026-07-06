# 2026-07-05 Learner AI Training DB Persistence Loop Audit

## Review Summary

- Root cause: learner AI self-test state existed only in service/UI memory and had no database schema for resumable sessions or saved answer feedback.
- Fix: added dedicated learner AI session and answer-feedback schema tables plus generated migration artifacts.
- This is a DB foundation task only. API and UI wiring are still required before claiming the learner AI闭环 is fully product-complete.

## Adversarial Review

- Formal-domain separation: the new tables do not include `practice_id`, `answer_record_id`, `mock_exam_id`, `exam_report_id`, or `mistake_book_id`.
- Provider/privacy separation: the new tables do not include prompt, Provider payload, raw AI input, or raw AI output columns.
- Role isolation foundation: session rows retain `owner_type`, `owner_public_id`, and `actor_public_id`; feedback rows retain `actor_public_id`.
- Migration blast radius: generated SQL creates only `personal_ai_learning_session`, `personal_ai_learning_answer_feedback`, their indexes, and two FKs.
- Runtime risk: no DB migrate, raw row read, seed, reset, cleanup, Provider call, browser runtime, or dependency change was executed.

## Taste Checklist

- DB names use `snake_case`; JSON/TS DTO changes were not part of this task.
- Table/index/FK names stay bounded and glossary-aligned.
- Schema avoids formal learning and Provider payload columns.
- Migration was generated through Drizzle Kit, then renamed to the project timestamp convention.
- No sensitive values, raw DB rows, Provider payloads, raw prompts, raw AI output, full generated questions, full papers, or material text were recorded.
