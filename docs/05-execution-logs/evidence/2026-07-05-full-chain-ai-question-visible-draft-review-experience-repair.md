# 2026-07-05 Full-chain AI Question Visible Draft Review Experience Repair Evidence

## Task

- Task id: `full-chain-ai-question-visible-draft-review-experience-repair-2026-07-05`
- Branch: `codex/full-chain-ai-question-visible-draft-review-experience-repair-2026-07-05`
- Evidence mode: redacted summaries only.

## Redaction Boundary

- No credentials, connection strings, env values, tokens, sessions, cookies, headers, raw rows, internal ids, phone/email/password, plaintext card values, raw Prompt, Provider payload, raw AI I/O, full material/question/paper content, screenshots, traces, raw DOM, or private fixture contents are recorded here.

## Initial Read Gate

- Status: `pass`
- Read set: governance, ADRs, advanced edition requirements, AI generation traceability, latest AI generation evidence/audit, and relevant source/test files.

## RED Test Gate

- Status: `pass`
- Command: `npm.cmd exec -- vitest run ...`
- Result: targeted RED tests failed before source repair.
- Redacted failure summary:
  - Instruction contract still requested summary-only question output.
  - Structured preview did not retain product-visible draft fields.
  - Admin and learner surfaces did not render structured question draft bodies.

## Source Repair

- Status: `pass`
- Summary:
  - AI question output contract now requests bounded structured draft fields for product UI.
  - Structured preview parser now retains product-visible draft fields when present.
  - Admin and learner AI question surfaces render structured draft cards ahead of secondary status/details.
  - Persisted/history/evidence summaries remain redacted.

## Focused Validation

- Status: `pass`
- Commands:
  - `npm.cmd exec -- vitest run src/server/services/route-integrated-provider-instruction-service.test.ts src/server/services/route-integrated-provider-execution-service.test.ts src/server/services/admin-ai-generation-runtime-bridge-service.test.ts src/server/services/personal-ai-generation-route-integrated-provider-execution-service.test.ts tests/unit/admin-ai-generation-entry-surface.test.ts tests/unit/student-personal-ai-generation-ui.test.ts`
  - `npm.cmd run typecheck`
  - `npm.cmd run lint`
- Result:
  - Focused tests: `pass`, 6 files, 105 tests.
  - Typecheck: `pass`.
  - Lint: `pass`.

## Browser Smoke

- Status: `pass`
- Scope: local browser smoke only, no Provider trigger, no screenshots, no raw DOM, no trace.
- Result: route/surface counters confirmed one admin AI generation entry, detail controls, submit action, and history surface on local AI question route.

## Closeout Gates

- Scoped Prettier: `pass`
- `git diff --check`: `pass`
- Blocked path diff: `pass_no_output`
- Module Run v2 pre-commit: `pass`
- Module Run v2 pre-push: `pass_after_repository_checkpoint_alignment`
- Repository checkpoint alignment: `pass`

## Result

- Status: `pass_ai_question_visible_draft_review_experience_repair_no_provider_db_schema_dependency`
- Completed at: `2026-07-05T11:20:58-07:00`
