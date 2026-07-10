# 2026-07-10 0704 Private Account Usage Guide

## Purpose

Future localhost 0704 role acceptance must not guess which private file contains the correct account. Start from the private index, read the canonical private catalog, run a redacted readiness preflight, and only then run the business validation.

## Mandatory Lookup Order

1. Read `D:\tiku-local-private\acceptance\0704-role-credential-index.private.md`.
2. Open only the canonical catalog referenced by that index:
   `D:\tiku-local-private\acceptance\0704-role-credential-catalog.private.md`.
3. Keep credential values in process memory only.
4. Confirm the local service targets the 0704 app database without printing DB URLs or secrets.
5. Run redacted login and authorization readiness preflight.
6. If readiness fails, stop the business acceptance and create a separate account-readiness task.

## Private File Meanings

| Private path                                                                    | Meaning                                             | Current use rule                                                             |
| ------------------------------------------------------------------------------- | --------------------------------------------------- | ---------------------------------------------------------------------------- |
| `D:\tiku-local-private\acceptance\0704-role-credential-index.private.md`        | Private lookup index.                               | Start here; do not guess source files.                                       |
| `D:\tiku-local-private\acceptance\0704-role-credential-catalog.private.md`      | Canonical 0704 credential catalog for 9 core roles. | Use as the only active credential source for localhost 0704 role acceptance. |
| `D:\tiku-local-private\acceptance\archive\superseded-2026-07-10\`               | Archived superseded credential source files.        | Read only for forensic recovery; do not use as the active lookup source.     |
| `D:\tiku-local-private\acceptance\design-boards`, `runtime-logs`, `screenshots` | Non-credential private artifacts.                   | Not part of credential lookup unless a later task explicitly scopes them.    |

## Readiness States

Only these status labels should be used in task plans, evidence, and audits:

- `ready_0704_verified`
- `seeded`
- `usable_recent_0704_fixture`
- `created_by_product_path_2026-07-09`
- `created_by_manual_fixture`
- `not_ready_in_current_0704_db_as_of_2026-07-09`
- `not_ready_in_current_0704_db_as_of_2026-07-10`
- `login_failed`
- `credential_mismatch`
- `missing_auth_binding`
- `disabled_or_locked`
- `unknown_needs_preflight`

Current 2026-07-10 readiness status after canonical-catalog consolidation: all 9 core role labels are `ready_0704_verified` by redacted localhost preflight.

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
