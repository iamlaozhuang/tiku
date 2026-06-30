# Post Detail Security Next Scope Approval Package Traceability

## Task

- Task id: `post-detail-security-next-scope-approval-package-2026-06-30`
- Source closeout: `detail-optimization-security-review-goal-closeout-rollup-2026-06-30`
- Base commit: `799ae8fff`
- Purpose: map post-closeout work into actionable approval lanes without executing runtime, DB, Provider, deployment,
  release readiness, final Pass, or Cost Calibration gates.

## Governance Alignment

| Source                                                  | Alignment                                                                                   |
| ------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| `AGENTS.md`                                             | Uses task-first materialization, scoped files, redacted evidence, validation, and closeout. |
| Code Taste Ten Commandments                             | No source/UI/API/DB logic change; checklist remains applicable for delivery.                |
| ADR-004 and ADR-005                                     | Environment, staging, prod, migration, Provider, deployment, and release gates stay split.  |
| ADR-006                                                 | Dependency/package changes remain behind dependency gate and advisory recheck.              |
| ADR-007                                                 | Authorization and quota decisions remain service/source-of-truth tasks, not UI-only claims. |
| Latest detail/security closeout evidence and acceptance | Current local scope is closed; future blocked runtime or decision gates need new approval.  |

## Next-Scope Matrix

| Lane                      | Scope                                                                                         | Approval need      |
| ------------------------- | --------------------------------------------------------------------------------------------- | ------------------ |
| `local_only`              | Static inventory refresh, low-risk backlog review, scoped docs/state rollups, focused tests.  | Task materialized. |
| `fresh_approval_required` | Browser/e2e runtime, DB aggregate proof, schema/migration/seed, Provider, deploy, dependency. | Fresh approval.    |
| `still_blocked`           | Secrets, raw sensitive evidence, staging/prod/deploy, release readiness, final Pass, cost.    | Blocked in task.   |

## Recommended Next Small Task

- Task id: `local-security-static-inventory-refresh-2026-06-30`
- Type: docs/state/source-read-only inventory refresh.
- Reason: it can re-open the next workstream with the lowest runtime and data exposure risk, while preserving all
  current blocked gates.
