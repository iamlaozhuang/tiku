# Evidence: edition-aware-authorization-schema-migration-approval-packet

result: blocked

## Approval Package Status

- Task id: `edition-aware-authorization-schema-migration-approval-packet`
- Approval package status: materialized.
- Execution status: blocked.
- Schema/migration execution performed: false.
- Source/schema/drizzle changes performed: false.
- Database read/write or migration performed: false.
- Cost Calibration Gate remains blocked.

## Future Execution Boundary

This package records the minimum future approval surface for edition-aware authorization schema work. The future schema
execution task must separately approve exact allowed files, migration commands, rollback, local DB boundary, and redacted
evidence.

## Candidate Future Scope

- Add source `edition` to `personal_auth` and `org_auth`.
- Add `redeem_code_type` to `redeem_code`.
- Add `auth_upgrade` as the source of truth for standard-to-advanced upgrades.
- Interpret unversioned historical authorization as `standard`.
- Keep `effectiveEdition` service-computed and never written back over source `edition`.

## Blocked Remainder

Schema/migration edits, `drizzle-kit generate`, migration execution, database reads/writes, API, service, repository, UI,
tests, e2e, scripts, env/secret, provider/model call, dependency changes, payment, deployment, PR, force-push,
destructive DB, and Cost Calibration Gate remain blocked until future fresh approval.

## Redaction Boundary

No secret values, token values, database URLs, Authorization headers, provider payloads, raw prompts, raw generated AI
content, raw database rows, plaintext `redeem_code`, full `paper`, full `material`, raw employee answer text,
screenshots, traces, or DOM dumps are recorded.
