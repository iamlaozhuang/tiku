# Audit review: AI generation admin idempotency and visible result repair

Task id: `ai-generation-admin-idempotency-visible-result-repair-2026-07-01`.

## Adversarial review checklist

- [x] A fresh admin AI request cannot reuse stale task/result state from an earlier attempt.
- [x] Provider-succeeded and sufficiently grounded requests cannot display `资料不足` because of old persistence state.
- [x] AI paper generation has the same visible-result protection as AI question generation.
- [x] Ordinary admin/student UI does not render local-contract, redaction, raw field-name, or persistence implementation wording.
- [x] Shared admin/student AI components are reused; no role-specific duplicate implementation is introduced.
- [x] No raw prompt, Provider payload, raw AI output, full generated content, credentials, tokens, sessions, DB rows, PII, or internal numeric ids enter evidence.
- [x] No schema, migration, seed, dependency, package, lockfile, `.env*`, browser, DB, Provider, staging/prod, deploy, Cost Calibration, release readiness, or final Pass action is taken in this task.

## Review notes

- The fix intentionally scopes admin generation identity by request. This trades actor-level deduplication for correct per-click generation attempts. A future explicit retry key can restore retry-level idempotency without reintroducing actor-level stale result reuse.
- UI wording changes are in shared admin/student AI components, so content admin, organization advanced admin, personal advanced student, and organization advanced employee surfaces inherit the same product wording guard.
