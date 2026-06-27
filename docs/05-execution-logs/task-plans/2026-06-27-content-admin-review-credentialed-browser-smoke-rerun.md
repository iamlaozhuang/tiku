# Content Admin Review Credentialed Browser Smoke Rerun

Task: `content-admin-review-credentialed-browser-smoke-rerun-2026-06-27`

## Flow Under Test

The flow under test is: `/login` with approved local content-admin credentials -> authenticated visits to `/content/ai-question-generation` and `/content/ai-paper-generation` -> batch/retry/diff/history UI visibility and disabled/read-only mutation boundaries.

## Scope

- Allowed: Browser plugin localhost validation, approved local content-admin credential read/fill for login only, local app session creation, docs/state/evidence/audit/acceptance updates.
- Blocked: source edits, tests/e2e edits, Playwright e2e runner, direct DB connection/read/write, Provider call, Provider credential read, Provider payload access, AI generation submit, retry execution, adoption/reject mutation, publish, student-visible runtime, schema/migration/seed, package/lockfile, `.env*` edits, staging/prod/deploy/payment/external service, PR, force push, release readiness, final Pass.

## Evidence Rules

- Record only redacted summary: route, visible state category, selected stable `data-testid` presence, disabled/read-only status, and console error count/category.
- Do not record credential values, tokens, Authorization headers, cookies, local storage, raw page text, screenshots with sensitive values, DB rows, Provider payloads, raw prompts, or generated output.

## Execution Plan

1. Confirm current repo dev server on `127.0.0.1:3000` or reuse the existing current-repo server.
2. Locate an approved local private credential handoff outside the repo, or use an already authenticated browser session if present.
3. Log in at `/login` through Browser only.
4. Visit `/content/ai-question-generation` and `/content/ai-paper-generation`.
5. Check:
   - page identity and nonblank app content;
   - no framework overlay;
   - console errors/warnings;
   - `admin-ai-generation-entry`;
   - `admin-ai-generation-task-history`;
   - `content-admin-review-traceability`;
   - `content-admin-review-batch-retry-diff-history-local-validation`;
   - disabled/read-only adoption/reject controls when present;
   - generation submit remains unclicked.
6. If UI or permission guard fails, record the issue and seed a separate scoped repair task instead of changing source.
7. Run scoped docs formatting and Module Run v2 hardening gates.

## Observed Outcome

- Content-admin localhost login completed using the approved private acceptance handoff outside the repo.
- Both target routes rendered the content-admin review surface after authentication.
- Batch/retry/diff/history local validation UI was visible on both target routes.
- Content-admin review adopt/reject controls remained disabled and unclicked.
- No repair seed was required.
