# 2026-07-04 Full-Chain Scenario 9 Edition Upgrade Redeem Runtime Repair Audit

Status: closed

## Adversarial Review Checklist

- Upgrade card must not create another `personal_auth`: pass_source_review; upgrade branch writes `auth_upgrade` only after a single matching standard target is found.
- Advanced activation must create advanced `personal_auth`: pass_source_review_and_unit_contract.
- Existing standard redemption remains covered: pass_focused_unit_tests.
- Ambiguous, missing, or already advanced upgrade targets must not consume the card: pass_source_review; target checks occur before card consumption.
- No schema/migration/seed/dependency/Provider/browser/staging/prod/Cost action: pass.
- Evidence remains redacted: pass.

## Residual Risk

- DB-backed runtime proof is intentionally deferred to the Scenario 9 affected-node rerun after this repair is merged.
