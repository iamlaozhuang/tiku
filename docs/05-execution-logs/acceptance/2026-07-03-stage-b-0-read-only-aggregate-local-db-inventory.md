# 2026-07-03 Stage B-0.1 Read-Only Aggregate Local DB Inventory

## Scope

This report records the read-only aggregate local DB inventory requested before any DB-backed Stage B acceptance.

## Target And Selector Decision

| Item                         | Decision                                                                                                                    |
| ---------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| Target                       | Local Docker Compose PostgreSQL service `tiku-postgres`, container `tiku-postgres-dev`.                                     |
| Selector 1                   | Public schema base-table aggregate row counts.                                                                              |
| Selector 2                   | Namespace aggregate match counts for `stage-b`, `local-full-loop`, `credential-backed`, `test-owned`, and `source-landing`. |
| Mutation                     | blocked.                                                                                                                    |
| Stage B DB-backed acceptance | not started.                                                                                                                |

## Inventory Result

| Area                                         | Result                                                            |
| -------------------------------------------- | ----------------------------------------------------------------- |
| Docker Compose target                        | pass; local `tiku-postgres` service observed running and healthy. |
| Public schema base tables inventoried        | 46 tables.                                                        |
| Public schema aggregate row counts           | captured in redacted evidence.                                    |
| Namespace aggregate pattern matches          | 0 matches over selected safe text-like columns.                   |
| Raw rows or raw values emitted into evidence | no.                                                               |
| DB mutation/cleanup/reset/seed/migration/DDL | no.                                                               |
| Stage B DB-backed acceptance                 | not started.                                                      |

## Decision For Next Step

The inventory does not block the next planning step, but it does not authorize cleanup or DB-backed Stage B acceptance by
itself. The next step should decide whether to keep the current local aggregate baseline as-is or request a separate,
explicit cleanup/reset approval with concrete selectors.

## Non-Claims

- No DB mutation, cleanup, seed, migration, reset, or DDL.
- No Provider, staging/prod, deploy, dev server, browser acceptance, Cost Calibration, release readiness, final Pass, or
  production usability claim.
