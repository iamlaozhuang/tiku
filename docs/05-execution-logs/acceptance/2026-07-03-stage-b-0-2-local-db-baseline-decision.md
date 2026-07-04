# 2026-07-03 Stage B-0.2 Local DB Baseline Decision

## Decision

Accept the current local Docker Compose PostgreSQL database as the DB-backed Stage B acceptance baseline, as-is and with
constraints. Do not request cleanup/reset approval now.

This is a baseline decision only. It does not start DB-backed Stage B acceptance.

## Rationale

| Fact                                                                                                            | Decision impact                                                                                                                          |
| --------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| The local target is explicit: Docker Compose PostgreSQL service `tiku-postgres`, container `tiku-postgres-dev`. | There is no target ambiguity for later local-only DB-backed work.                                                                        |
| The database is non-empty across learner, authorization, audit, paper, and practice tables.                     | The baseline must be treated as an existing local working dataset, not a clean-slate fixture.                                            |
| Approved namespace patterns returned 0 aggregate matches.                                                       | There is no proven task-owned cleanup selector for `stage-b`, `local-full-loop`, `credential-backed`, `test-owned`, or `source-landing`. |
| Stage B-0 rejected wholesale cleanup and required exact selectors for mutation.                                 | Broad cleanup/reset would be less defensible than accepting the current baseline with fixture preflight controls.                        |

## Constraints On Using This Baseline

1. Future DB-backed Stage B work must use the same explicit local target unless a later task materializes a new target.
2. Future credential-backed execution must first confirm the 8 role test-owned account, organization, and authorization
   preconditions through a redacted fixture preflight task.
3. Evidence may record only role labels, route/workflow labels, aggregate counts, status, and redacted expected/observed
   summaries.
4. The current local DB must not be described as clean, empty, production-like, release-ready, or final-pass-ready.
5. If fixture preflight or DB-backed acceptance fails because of missing/mismatched accounts, organization binding, or
   authorization state, stop and split a repair/provisioning task.
6. If stale local data creates a deterministic ambiguity that cannot be solved by fixture preflight, then request a
   separate cleanup/reset task with exact selector, dry-run aggregate counts, rollback/reset policy, redacted evidence,
   and fresh approval.

## Rejected Options

| Option                                                   | Decision         | Reason                                                                                           |
| -------------------------------------------------------- | ---------------- | ------------------------------------------------------------------------------------------------ |
| Wholesale local DB reset before Stage B                  | rejected         | It would destroy unknown-owner local data and currently lacks rollback/rebuild approval.         |
| Broad table cleanup                                      | rejected         | It would risk account, authorization, audit, and historical learning data.                       |
| Namespace cleanup using approved Stage B patterns        | rejected for now | Stage B-0.1 found 0 aggregate matches, so there is no task-owned data to clean by that selector. |
| Directly start DB-backed Stage B acceptance in this task | rejected         | This task is a decision package only.                                                            |

## Next Step

Open a separate Stage B-0.3 fixture preflight task before DB-backed acceptance. That task should verify, with redacted
aggregate/status evidence only, that the test-owned 8 role accounts, organization bindings, and authorization contexts
needed for DB-backed Stage B are present and usable.

## Non-Claims

- No DB-backed acceptance started.
- No DB connection, query, mutation, cleanup, reset, seed, migration, or DDL executed.
- No credential, `.env*`, Provider, staging/prod, deploy, browser acceptance, e2e, or Cost Calibration executed.
- No release readiness, final Pass, production usability, staging readiness, or Provider readiness claimed.
