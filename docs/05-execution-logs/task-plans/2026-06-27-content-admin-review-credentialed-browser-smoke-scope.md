# Content Admin Review Credentialed Browser Smoke Scope

Task: `content-admin-review-credentialed-browser-smoke-scope-approval-2026-06-27`

## Scope

- Fresh user instruction: run the credentialed content-admin Browser smoke sequence and authorize credential read/fill for local login.
- This task is scope approval only. It does not run Browser, read credential values, start Provider work, or change source.
- The approved next runtime task may use credentials only for `http://127.0.0.1:3000/login`.
- The login session side effect is limited to local auth session creation through the app. Codex must not make direct DB connections or DB reads/writes.
- Product mutations remain blocked: no AI generation submit, retry, adoption, publish, Provider call, Cost Calibration, staging/prod/deploy, payment, external service, PR, force push, release readiness, or final Pass.

## Read List

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/04-agent-system/operating-manual.md`
- `docs/04-agent-system/sop/task-lifecycle-governance.md`
- `docs/04-agent-system/sop/local-first-validation-governance.md`
- Browser and frontend validation skills

## Evidence Rules

- Evidence may record route, role class, visible state category, test-id presence, disabled/read-only status, and console error counts.
- Evidence must not record credentials, tokens, Authorization headers, session values, local storage values, cookies, screenshots with sensitive data, raw page text dumps, DB rows, Provider payloads, raw prompts, raw generated output, or private account data.

## Next Task

The approved follow-up task is `content-admin-review-credentialed-browser-smoke-rerun-2026-06-27`.
