# 2026-07-05 AI Question Learning Session UI Loop Acceptance

## Coverage

- `advanced_student`: personal advanced learner current AI question draft practice loop.
- `org_advanced_employee`: organization advanced employee current AI question draft practice loop.

## Acceptance Checks

- A sufficiently grounded parsed AI question draft enables the learner to start an isolated learning session.
- The learner can select an objective option and submit it.
- The learner sees deterministic correct/incorrect feedback and standard answer/analysis where available.
- The UI states formal practice, answer_record, exam_report, and mistake_book writes are blocked.
- Insufficient grounding and paper summary-only content do not become usable practice.
- No Provider, Cost Calibration, staging/prod, dependency, schema, migration, seed, DB connection, DB mutation, browser runtime, or dev server work is introduced.

## Evidence Rules

Allowed evidence: task id, branch, file paths, role labels, aggregate counts, command names, pass/fail/block, redacted summary.

Forbidden evidence: credentials, connection strings, env values, tokens, sessions, cookies, headers, raw rows, internal ids, phone/email/password, plaintext card values, raw Prompt, Provider payload, raw AI I/O, full material/question/paper content, screenshots, traces, raw DOM, private fixture contents.

## Current Status

- Status: `closed`
- Result: `pass_ai_question_learning_session_ui_loop_no_provider_db_formal_write`
