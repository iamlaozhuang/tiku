# 2026-07-05 Full-chain AI Paper Visible Draft Review Experience Repair Evidence

## Task

- Task id: `full-chain-ai-paper-visible-draft-review-experience-repair-2026-07-05`
- Branch: `codex/full-chain-ai-paper-visible-draft-review-experience-repair-2026-07-05`
- Evidence mode: redacted summaries only.

## Redaction Boundary

- No credentials, connection strings, env values, tokens, sessions, cookies, headers, raw rows, internal ids, phone/email/password, plaintext card values, raw Prompt, Provider payload, raw AI I/O, full material/question/paper content, screenshots, traces, raw DOM, or private fixture contents are recorded here.

## Initial Read Gate

- Status: `pass`
- Read set: governance, ADRs, advanced edition requirements, AI generation traceability, latest AI generation closeout baseline, and relevant source/test files.

## RED Test Gate

- Status: `pass`
- Command: `npm.cmd exec -- vitest run ...`
- Result: targeted RED tests failed before source repair.
- Redacted failure summary:
  - AI paper instruction did not request question draft fields under `paperSections`.
  - Paper structured preview did not expose product-visible paper section summaries.
  - Admin and learner paper surfaces rendered only summary/count information instead of paper draft body.

## Source Repair

- Status: `pass`
- Summary:
  - AI paper output contract now requests structured paper sections and question draft fields for product UI.
  - Structured preview parser now retains paper section summaries and nested question draft fields when present.
  - Admin and learner AI paper surfaces render structured paper draft sections and nested question cards ahead of secondary status/count details.
  - Persisted/history/evidence summaries remain redacted.

## Focused Validation

- Status: `pass`
- Commands:
  - `npm.cmd exec -- vitest run src/server/services/route-integrated-provider-instruction-service.test.ts src/server/services/route-integrated-provider-execution-service.test.ts src/server/services/admin-ai-generation-runtime-bridge-service.test.ts src/server/services/personal-ai-generation-route-integrated-provider-execution-service.test.ts tests/unit/admin-ai-generation-entry-surface.test.ts tests/unit/student-personal-ai-generation-ui.test.ts`
  - `npm.cmd run typecheck`
  - `npm.cmd run lint`
- Result:
  - Focused tests: `pass`, 6 files, 107 tests.
  - Typecheck: `pass`.
  - Lint: `pass`.

## Browser Smoke

- Status: `pass`
- Scope: local browser smoke only, no Provider trigger, no screenshots, no raw DOM, no trace.
- Result:
  - Existing `3106` runtime returned HTTP 200 for the paper route and `/api/v1/sessions`.
  - Fresh approval accepted for in-memory private role credential use and browser role-session switching.
  - Four role browser smoke passed with exact `AI组卷` route/surface signals:
    - `content_admin` on `content_ai_paper_generation`: `pass`, login signal `0`, forbidden signal `0`, AI paper signal `1`, paper parameter signal `1`, button count `6`, link count `7`.
    - `org_advanced_admin` on `organization_ai_paper_generation`: `pass`, login signal `0`, forbidden signal `0`, AI paper signal `1`, paper parameter signal `1`, button count `4`, link count `5`.
    - `org_advanced_employee` on `learner_ai_generation`: `pass`, login signal `0`, forbidden signal `0`, AI paper signal `1`, paper parameter signal `1`, button count `10`, link count `3`.
    - `advanced_student` on `learner_ai_generation`: `pass`, login signal `0`, forbidden signal `0`, AI paper signal `1`, paper parameter signal `1`, button count `10`, link count `3`.
  - Next development log tail showed no compile error in the observed window.
  - No Provider execution, DB mutation, screenshot, trace, raw DOM capture, or private credential output was performed.

## Closeout Gates

- Scoped Prettier: `pass`
- `git diff --check`: `pass_no_output`
- Blocked path diff: `pass_no_output`
- Module Run v2 pre-commit: `pass`
- Module Run v2 pre-push: `pass`

## Result

- Status: `pass_ai_paper_visible_draft_review_experience_repair_no_provider_db_schema_dependency`
- Completed at: `2026-07-05T12:03:04-07:00`
