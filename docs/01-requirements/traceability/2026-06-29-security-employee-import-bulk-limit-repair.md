# Security Employee Import Bulk Limit Repair Traceability

- Task id: `security-employee-import-bulk-limit-repair-2026-06-29`
- Finding id: `db-query-003`
- Branch: `codex/security-employee-import-bulk-limit-20260629`
- Status: implementation complete, validation in progress
- Cost Calibration Gate remains blocked.

## Source Finding

| Source                                                        | Finding                                                                                                                            | Severity | Repair target                                                                 |
| ------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- | -------- | ----------------------------------------------------------------------------- |
| `security-db-repository-query-construction-review-2026-06-29` | employee import JSON arrays and parsed CSV/TSV rows had no explicit reviewed upper bound before DB-facing or account-creation work | medium   | service-level row limit before repository import or employee account creation |

## Requirement Mapping

| Requirement                                                                                                              | Implementation evidence                                                                            | Verification evidence        |
| ------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------- | ---------------------------- |
| Oversized JSON `employees` arrays are rejected before repository import                                                  | `src/server/services/admin-organization-org-auth-runtime.ts` adds a 100 row/item import limit      | focused unit RED/GREEN       |
| Oversized CSV/TSV data rows are rejected before account creation                                                         | same service-level limit after header detection and before row normalization                       | focused unit RED/GREEN       |
| Legitimate employee import behavior remains accepted                                                                     | existing CSV import, duplicate/invalid row handling, and forbidden scope header tests remain green | focused unit GREEN           |
| No DB, Provider, browser, dependency, schema, migration, seed, release readiness, final Pass, or Cost Calibration action | task plan, evidence, and validation command inventory                                              | governance gates in progress |

## Scope Control

- Source/test changed:
  - `src/server/services/admin-organization-org-auth-runtime.ts`
  - `tests/unit/phase-20-ra-01-04-employee-import.test.ts`
- Governance docs/state changed:
  - `docs/04-agent-system/state/project-state.yaml`
  - `docs/04-agent-system/state/task-queue.yaml`
  - `docs/05-execution-logs/task-plans/2026-06-29-security-employee-import-bulk-limit-repair.md`
  - this traceability file
  - task evidence, audit, and acceptance files

## Residual Risk

- This task fixes employee import bulk item and parsed row count boundaries only.
- Runtime DB behavior was not executed because DB access is blocked for this task.
- Other import surfaces must remain separately reviewed if new import paths are added later.
