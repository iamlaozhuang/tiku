# 2026-07-05 AI Generation Learning Session Loop Acceptance

## Coverage

- `advanced_student`: personal advanced learner AI generated question draft learning session.
- `org_advanced_employee`: organization advanced employee AI generated question draft learning session.

## Acceptance Checks

- Parsed AI question draft summaries with sufficient grounding can become an isolated AI learning session.
- Supported question types are normalized to canonical values.
- Objective questions can be answered and scored deterministically inside the isolated session.
- Short-answer questions stay review-required and are not AI-scored in this task.
- Formal writes to question, paper, practice, answer_record, exam_report, and mistake_book are explicitly blocked.
- Paper draft summaries without usable generated questions are rejected and are not represented as complete practice papers.
- No Provider, Cost Calibration, staging/prod, dependency, schema, migration, seed, DB connection, DB mutation, browser runtime, or dev server work is introduced.

## Evidence Rules

Allowed evidence: task id, branch, file paths, role labels, aggregate counts, command names, pass/fail/block, redacted summary.

Forbidden evidence: credentials, connection strings, env values, tokens, sessions, cookies, headers, raw rows, internal ids, phone/email/password, plaintext card values, raw Prompt, Provider payload, raw AI I/O, full material/question/paper content, screenshots, traces, raw DOM, private fixture contents.

## Current Status

- Status: `closed`
- Result: `pass_ai_generation_learning_session_loop_no_provider_db_formal_write`
