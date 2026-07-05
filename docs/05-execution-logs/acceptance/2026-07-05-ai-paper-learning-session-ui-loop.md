# 2026-07-05 AI Paper Learning Session UI Loop Acceptance

Task id: `ai-paper-learning-session-ui-loop-2026-07-05`

## Acceptance Criteria

- `personal_advanced_student` can start an in-page isolated AI组卷 self-test from a sufficiently grounded current paper
  draft containing usable nested `questionDrafts`.
- `org_advanced_employee` can use the same AI组卷 self-test path under organization authorization context.
- The self-test renders all usable generated paper questions from the current result, accepts objective answers, submits
  deterministic per-question feedback, and shows aggregate score/progress.
- The UI explicitly keeps the result in isolated AI learning and does not claim formal `practice`, `answer_record`,
  `exam_report`, or `mistake_book` writes.
- Insufficient grounding or summary-only paper drafts do not start a self-test.
- No Provider, DB, schema, dependency, browser, staging/prod, release, final Pass, or Cost Calibration work is executed.

## Evidence Policy

Evidence may record task ids, branch name, file paths, public role labels, aggregate counts, command names, and pass/fail
summaries only. It must not record credentials, tokens, sessions, cookies, headers, env values, connection strings, raw DB
rows, internal ids, PII, plaintext `redeem_code`, Provider payloads, prompts, raw AI IO, full generated question/paper
content, raw DOM, screenshots, traces, or private fixture contents.
