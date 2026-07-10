# 2026-07-10 0704 Private Account Usage Guide

## Purpose

Future localhost 0704 role acceptance must not guess which private file contains the correct account. Start from the private index, run a redacted readiness preflight, and only then run the business validation.

## Mandatory Lookup Order

1. Read `D:\tiku-local-private\acceptance\0704-role-credential-index.private.md`.
2. Use the `credentialSource` and `credentialLookupHint` for the role labels in scope.
3. Keep credential values in process memory only.
4. Confirm the local service targets the 0704 app database without printing DB URLs or secrets.
5. Run redacted login and authorization readiness preflight.
6. If readiness fails, stop the business acceptance and create a separate account-readiness task.

## Private File Meanings

| Private file                                                            | Meaning                                                             | Current use rule                                                                           |
| ----------------------------------------------------------------------- | ------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| `full-chain-isolated-db-bootstrap-super-admin-credential-2026-07-04.md` | Bootstrap super admin credential for the isolated 0704 DB scenario. | Use only for `super_admin` bootstrap or ops entry checks when the task scope allows it.    |
| `full-chain-isolated-db-account-plan-2026-07-04.md`                     | Full-chain account creation plan and selector catalog.              | Treat as a plan, not as proof that every role is login-ready in the current 0704 app DB.   |
| `role-separated-local-accounts-2026-06-23.md`                           | Older role-separated credential catalog.                            | Credential presence does not prove the role exists or is bound in the current 0704 app DB. |
| `explicit-20260704-manual-role-accounts-2026-07-07.private.json`        | Recent manual role fixture subset for 0704 validation.              | Prefer for roles explicitly listed in the private index as usable recent fixtures.         |

## Readiness States

Only these status labels should be used in task plans, evidence, and audits:

- `seeded`
- `usable_recent_0704_fixture`
- `created_by_product_path_2026-07-09`
- `created_by_manual_fixture`
- `not_ready_in_current_0704_db_as_of_2026-07-09`
- `credential_mismatch`
- `missing_auth_binding`
- `disabled_or_locked`
- `unknown_needs_preflight`

## Redacted Preflight Evidence Shape

Allowed:

```text
targetDb: 0704_target
roleLabel: credential_present=true, login=pass_or_fail, auth=redacted_context_category, readiness=state_label
```

Forbidden:

- account value, password, phone number, cookie, token, session, Authorization header, or localStorage;
- env value, DB URL, raw DB row, internal id, Provider payload, raw prompt, or raw AI output;
- full question, full paper, full material, resource, or chunk content.

## Stop Rule

Do not continue into business validation when an in-scope role has `login=fail`, missing authorization context, or an unknown readiness state. First run a separate 0704 account-readiness task and keep its evidence redacted.
