# AI Generation Ordinary UI Internal Wording Repair Audit

## Scope Audit

- Task id: `ai-generation-ordinary-ui-internal-wording-repair-2026-07-01`
- Branch: `codex/ai-generation-ordinary-ui-internal-wording-repair`
- Scope: source/test/docs/state repair for ordinary AI 出题 / AI组卷 UI wording.
- Out of scope: database access or mutation, Provider runtime call, dependency/package/lockfile changes, schema/migration/seed changes, `.env*` read/write, e2e, staging/prod/cloud/deploy, Cost Calibration, release readiness, final Pass.

## Adversarial Review Checklist

- [x] Tests fail before implementation for local-preview / owner-preview wording.
- [x] Admin shared AI page no longer renders internal local-preview or governance wording to ordinary operators.
- [x] Student AI page regression guard remains active.
- [x] Visible generation instruction sources avoid local-preview wording without weakening safety boundaries.
- [x] No role-specific duplicate UI path is introduced.
- [x] Evidence does not include credentials, cookies, tokens, sessions, `.env*`, raw DOM, screenshots, traces, raw DB rows, internal ids, PII, raw prompt, Provider payload, raw AI output, or full content.
- [x] Validation commands pass before closeout.

## Result

- Status: pass
- Reviewer notes: The fix is intentionally narrow: shared admin UI copy and visible generation instruction seed wording now use business language, with focused tests guarding against local-preview / owner-preview regression. This does not claim resource-grounding completion; that remains in the next queued task.
