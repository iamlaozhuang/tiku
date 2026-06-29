# Security DB Schema Migration Risk Inventory Traceability

- Task id: `security-db-schema-migration-risk-inventory-2026-06-29`
- Branch: `codex/security-db-schema-migration-inventory-20260629`
- Scope: source-read-only DB/schema/migration risk inventory
- DB runtime budget: zero
- Migration execution budget: zero
- Status: closed

## Governance Boundary

| Boundary                                      | Status       | Evidence                                                                                           |
| --------------------------------------------- | ------------ | -------------------------------------------------------------------------------------------------- |
| Task materialized before inventory writes     | pass         | state, queue, and task plan created before scoped inventory docs                                   |
| Source/test/schema/migration modification     | not executed | docs/state-only inventory task                                                                     |
| DB connection/raw row/mutation                | not executed | no DB command, no raw row read, no schema/migration/seed execution                                 |
| Provider/AI execution                         | not executed | no Provider call, no Provider config, no prompt or payload capture                                 |
| Browser/dev server/runtime                    | not executed | blocked by task boundary                                                                           |
| Dependency/package/lockfile                   | not executed | blocked by task boundary                                                                           |
| Release readiness/final Pass/Cost Calibration | not executed | all gates remain blocked                                                                           |
| Sensitive evidence capture                    | not executed | evidence records paths, counts, boundary labels, risk categories, and redacted summaries only      |
| Destructive SQL output                        | not recorded | destructive-pattern inventory records migration labels/counts only, not full SQL or execution logs |

## Surface Index

| Surface                               | Count | Inventory Use                                               |
| ------------------------------------- | ----: | ----------------------------------------------------------- |
| `src/db/schema/**`                    |    13 | schema table/index/FK/redaction-relevant area inventory     |
| `drizzle/**`                          |    39 | generated migration and journal inventory                   |
| `drizzle/*.sql`                       |    19 | generated migration label count                             |
| `drizzle/meta/_journal.json` entries  |    19 | migration journal count alignment                           |
| `migrations/**`                       |     0 | legacy/custom migration directory inventory                 |
| `src/server/repositories/**`          |    65 | repository DB boundary and query-construction inventory     |
| `tests/unit/*repository*`             |     2 | repository-focused unit surface inventory                   |
| `.env.local`/`DATABASE_URL` path hits |    24 | local DB/env boundary watch list; env values not accessed   |
| `sql` template path hits              |    10 | query-construction review candidates                        |
| `.execute`/raw/unsafe pattern hits    |    10 | DB adapter and repository abstraction review candidates     |
| destructive migration pattern matches |     2 | historical migration labels requiring future replay caution |

## Findings Matrix

| Id         | Risk Family                               | Severity | Status                  | Evidence Summary                                                                                                                                              | Follow-up                                                                                            |
| ---------- | ----------------------------------------- | -------- | ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| db-inv-001 | DB/env connection boundary drift          | medium   | needs_scoped_review     | DB runtime setup and Drizzle config include local `.env.local`/`DATABASE_URL` path references; this task did not read env files or execute DB connections.    | `security-db-runtime-connection-boundary-hardening-2026-06-29` after fresh source/test materializing |
| db-inv-002 | destructive migration replay risk         | medium   | guarded_watch           | Generated migration inventory contains 2 historical labels matching drop/relaxation patterns; migration journal count aligns with SQL migration count.        | `security-db-migration-replay-guard-review-2026-06-29` before any future migration execution         |
| db-inv-003 | raw SQL/query-construction review surface | medium   | needs_scoped_review     | 10 paths use Drizzle SQL template patterns and 10 paths match execute/raw/unsafe path patterns; sampled paths use typed inputs/white-listed paging surfaces.  | `security-db-repository-query-construction-review-2026-06-29`                                        |
| db-inv-004 | repository internal ID exposure boundary  | low      | monitor                 | Repository internals use numeric IDs for joins and public IDs for external DTO/lookup boundaries; no raw row or external URL exposure was recorded here.      | Fold into future API contract/security review tasks when source changes are authorized               |
| db-inv-005 | unbounded/N+1 repository query risk       | medium   | needs_performance_scan  | Repository list/detail paths generally use pageSize/limit/order inputs, but deeper aggregation paths need a focused non-DB source review before optimization. | `security-db-repository-query-construction-review-2026-06-29`                                        |
| db-inv-006 | schema drift or missing migration journal | low      | covered_watch           | `drizzle/*.sql` count and journal entry count both equal 19; no legacy `migrations/**` files were found.                                                      | Continue journal-count check in any future schema/migration task                                     |
| db-inv-007 | migration/seed evidence boundary drift    | medium   | blocked_by_current_goal | `src/db/dev-seed.ts` exists as source-read-only surface, but current goal forbids seed execution, DB mutation, raw rows, and sensitive evidence.              | None in current goal; future seed task needs fresh DB-specific authorization                         |

## Task Split

| Future Task Id                                                 | Type                 | Suggested Priority | Approval Needed                                                                                                       |
| -------------------------------------------------------------- | -------------------- | ------------------ | --------------------------------------------------------------------------------------------------------------------- |
| `security-db-runtime-connection-boundary-hardening-2026-06-29` | source/test repair   | p1                 | fresh materialized allowedFiles for DB runtime source/tests; no env read; no DB connection unless separately approved |
| `security-db-repository-query-construction-review-2026-06-29`  | source-read review   | p1                 | fresh materialized read-only/source-test boundaries; no DB runtime by default                                         |
| `security-db-migration-replay-guard-review-2026-06-29`         | docs/source review   | p2                 | fresh materialized migration-read boundary; no migration execution unless separately approved                         |
| `security-dependency-supply-chain-inventory-2026-06-29`        | docs/state inventory | p1                 | already queued next broad security lane; no package/lockfile changes                                                  |

## Next Recommended Task

The next smallest safe task after this inventory is
`security-dependency-supply-chain-inventory-2026-06-29`, unless the owner chooses to prioritize the DB runtime connection
boundary hardening task first.

This recommendation does not approve DB connection, schema/migration/seed, source/test changes, dependency changes,
Provider execution, browser runtime, release readiness, final Pass, or Cost Calibration.
