# Verify Session Login Response Credential Boundary Audit Review

## Review Result

- Finding id: `role-inv-001`
- Severity: high
- Verdict: `confirmed_needs_repair_pending_fresh_source_test_approval`
- Source/test repair executed: false

## Review Notes

The scoped static review confirms a mismatch between implementation and the post-login contract. The login service produces a success payload with a client-visible credential field, and the route returns that payload after using the credential for server-session cookie persistence. The contract requires server-session persistence without client bearer credential exposure.

Existing focused tests pass, but current coverage does not prove sanitized login JSON. This should be fixed in a separate source/test task with explicit fresh approval.

## Risk

- Primary risk: client-visible login JSON credential exposure.
- Secondary risk: existing tests can pass while the credential boundary remains violated.
- No DB, Provider, browser, release, dependency, package, lockfile, schema, migration, or seed action was performed.

## Required Follow-Up

- Materialize and approve `repair-session-login-response-credential-boundary-2026-06-29`.
- Repair should preserve server-session cookie behavior while removing client-visible credential exposure from JSON.
- Add focused tests that assert sanitized login JSON without recording literal credential values in evidence.
