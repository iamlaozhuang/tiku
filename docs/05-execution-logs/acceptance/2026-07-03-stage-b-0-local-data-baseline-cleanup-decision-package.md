# 2026-07-03 Stage B-0 Local Data Baseline Cleanup Decision Package

## Decision

Do not perform a wholesale cleanup of existing local data before DB-backed Stage B.

Stage B should protect credential-backed and test-owned fixtures by isolation first. Cleanup is allowed only in a later
task that has an exact DB target, a dry-run selector, task-owned ownership proof, rollback/reset policy, and redacted
aggregate evidence.

## Data Classification

| Class                    | Data category                                                                                                                             | Stage B-0 decision         | Reason                                                                                        |
| ------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------- | -------------------------- | --------------------------------------------------------------------------------------------- |
| Keep                     | 8 role test-owned accounts and account source material                                                                                    | preserve                   | Credential-backed acceptance depends on stable role identities.                               |
| Keep                     | `user`, admin role, `organization`, employee binding, `personal_auth`, `org_auth`, `auth_upgrade`, `redeem_code` baselines                | preserve                   | Authorization and role-boundary acceptance depends on these rows and their history.           |
| Keep                     | Migration, schema, seed, and dev baseline data                                                                                            | preserve                   | These are environment and schema boundary inputs, not disposable acceptance residue.          |
| Keep                     | Redacted task plans, acceptance reports, evidence, and audits                                                                             | preserve                   | They are the current traceable evidence chain.                                                |
| Isolate                  | AI task history, generated draft metadata, training attempts, answer results, RAG/resource smoke data                                     | prefer namespace isolation | These may be useful for regression comparison and must not be deleted by broad selectors.     |
| Cleanup candidate        | Rows or files with exact task-owned prefixes such as `local-full-loop`, `credential-backed`, `stage-b`, or future `test-owned` run labels | later dry-run only         | Cleanup can be safe only when ownership is proven by a precise namespace and aggregate count. |
| Never clean in this task | Unknown rows, account/auth/org/redeem baselines, audit logs, AI call logs, object storage data, staging/prod data, env/secret material    | blocked                    | Ownership, compliance, and redaction risk are too high without a separate approval.           |

## Required Before Any Cleanup

| Requirement         | Minimum acceptable evidence                                                                                                                                 |
| ------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Exact target        | Environment label only, for example local dev DB; no connection string.                                                                                     |
| Ownership selector  | Prefix, public label, task id, or namespace that proves task ownership without raw rows.                                                                    |
| Dry-run inventory   | Aggregate counts by table/category and action class only.                                                                                                   |
| Rollback/reset plan | Backup point or rebuild command category, owner, and stop condition.                                                                                        |
| Redaction policy    | No raw rows, internal ids, PII, credentials, plaintext `redeem_code`, Prompt text, Provider payload, raw AI I/O, full content, screenshots, traces, or DOM. |
| Approval            | Fresh task-scoped approval for read-only aggregate DB inventory, and separate approval for mutation if cleanup is still needed.                             |

## Recommended Stage B Data Strategy

1. Prefer namespaced Stage B fixtures over cleanup.
2. Use deterministic test-owned labels for future DB-backed runs.
3. Keep credential-backed accounts stable and outside committed evidence.
4. If stale local data causes ambiguity, stop and run a read-only aggregate inventory task before any reset or cleanup.
5. If cleanup remains needed, split a mutation task with exact selectors, dry-run counts, rollback, and post-clean aggregate verification.

## Stop Conditions

- Exact DB target is missing or ambiguous.
- Any command would print credentials, env values, connection strings, raw DB rows, internal ids, PII, plaintext
  `redeem_code`, Provider payloads, Prompt text, raw AI I/O, full content, screenshot, trace, DOM, or export data.
- Selector is broad, table-wide, or not provably task-owned.
- Rollback/reset policy is absent.
- Cleanup would affect accounts, organizations, authorization, `redeem_code`, audit logs, AI call logs, migrations,
  schema, seed data, staging, prod, or Provider state.

## Next Task Recommendation

Run `stage-b-0-read-only-aggregate-local-db-inventory-2026-07-03` only after the exact local DB target and allowed
aggregate query boundary are materialized. If that inventory is clean enough, proceed to DB-backed Stage B using
namespaced test-owned fixtures; if it finds ambiguity, split a cleanup or fixture hardening task before Stage B.

## Non-Claims

- No DB connection, read, write, migration, seed, reset, or cleanup executed.
- No Provider, staging/prod, deploy, Cost Calibration, dev server, browser acceptance, or release readiness executed.
- No final Pass, production usability, Provider readiness, staging readiness, or Cost Calibration completion claimed.
