# Full Chain Scenario 1 Admin Role Bootstrap Repair Decision

Task id: `full-chain-scenario-1-admin-role-bootstrap-2026-07-04`

Status: blocked; repair approved through centralized continuity package.

Centralized continuity package:
`docs/05-execution-logs/acceptance/2026-07-04-full-chain-centralized-approval-and-continuity-addendum.md`

## Decision Needed

Scenario 1 cannot honestly continue through browser/e2e because the current product runtime exposes no governed
`super_admin` flow to create platform backend admins with `admin_role = ops_admin` or `admin_role = content_admin`.

The next safe task is a source repair that adds the minimal product capability needed for Scenario 1, with strict
authorization and redaction boundaries.

## Proposed Repair Task

Task id: `full-chain-scenario-1-admin-account-creation-flow-repair-2026-07-04`

Proposed branch: `codex/full-chain-scenario-1-admin-account-creation-flow-repair-2026-07-04`

Goal: add a governed admin-domain account creation product flow that lets `super_admin` create platform backend
`ops_admin` and `content_admin` accounts, without granting `ops_admin` the same power and without touching organization
admin bindings.

## Proposed Scope

Allowed:

- Read the same Scenario 1 SSOT plus admin account source/tests.
- Add or extend a minimal service/repository/API/UI path for `super_admin` to create admin-domain accounts.
- Enforce server-side authorization before mutation.
- Preserve admin-domain and learner/employee-domain phone uniqueness checks.
- Hash private passwords through existing credential mechanisms.
- Return no plaintext password except the user-submitted value already held in the current form/session context.
- Write redacted audit summaries only.
- Add focused unit tests for success, duplicate/collision, non-`super_admin` denial, and response redaction.
- Optionally add focused browser/e2e only if the repair task explicitly needs it after source tests pass.
- Write evidence/audit with labels and counts only.
- Commit, fast-forward merge, push, and delete short branch only if fresh approval grants closeout.

Blocked:

- No DB migration, schema change, seed, destructive DB operation, or `drizzle-kit push`.
- No fixture expansion that pre-creates `ops_admin` or `content_admin`.
- No weakening of role checks.
- No use of local acceptance synthetic sessions as creation proof.
- No Provider, staging, production, deployment, payment, Cost Calibration, release readiness, final Pass, or production
  usability claim.
- No evidence containing credentials, phone, email, connection string, token, session, cookie, localStorage,
  Authorization header, raw DB rows, internal id, screenshot, raw DOM, trace, Provider payload, raw Prompt, raw AI I/O,
  full content, employee answers, or plaintext card values.

## Fresh Approval Text

Approve repair task `full-chain-scenario-1-admin-account-creation-flow-repair-2026-07-04` on branch
`codex/full-chain-scenario-1-admin-account-creation-flow-repair-2026-07-04`: implement the minimal governed product flow
for `super_admin` to create admin-domain `ops_admin` and `content_admin` accounts, with server-side authorization,
admin-domain separation, collision checks, password hashing through existing credential mechanisms, redacted audit and
evidence only, focused tests, no schema/migration/seed/fixture expansion/destructive DB operation, no Provider/staging/
prod/Cost/release/final/production claim; after validation, commit, fast-forward merge to `master`, push
`origin/master`, delete the short branch, then rerun Scenario 1 from the blocked node.

## Continuity Approval Alternative

The centralized addendum supersedes this narrow repair approval. The next concrete task is still the same Scenario 1
admin-account creation repair, but future local acceptance, repair/provisioning, validation, closeout, and rerun steps
can continue under the centralized boundary without pausing for this same class of local-only authorization again.

Approval source: `current_user_approved_full_chain_centralized_local_continuity_authorization_2026_07_04`
