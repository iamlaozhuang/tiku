# Detail Security Next Approval Decision Package Traceability

- Task id: `detail-security-next-approval-decision-package-2026-06-29`
- Branch: `codex/next-approval-decision-package-20260629`
- Scope: docs/state-only decision package for future fresh approvals after blocked remainder consolidation.

## Boundary

This task converts the blocked remainder into approval units only. It does not grant approval, execute repairs, run
runtime validation, mutate dependencies, connect to DB, call Providers, use browser/e2e, touch staging/prod/cloud,
declare release readiness, declare final Pass, or execute Cost Calibration.

Evidence is limited to task IDs, approval unit names, blocker classes, priority, severity, status, count summaries,
validation command names, branch/commit/merge/push/cleanup status, and redacted summaries.

## Requirement Alignment

| Requirement                                            | Status    | Evidence                                                                   |
| ------------------------------------------------------ | --------- | -------------------------------------------------------------------------- |
| Preserve all hard prohibitions                         | satisfied | no dependency, DB, Provider, browser, staging, release, final, or cost run |
| Convert blocked remainder into decision-ready units    | satisfied | five approval units map to the nine blocked top-level tasks                |
| Avoid treating approval gates as confirmed new defects | satisfied | package records blocker classes and future decisions only                  |
| Keep highest-priority next unit visible                | satisfied | dependency/package approval unit carries the p0/high remaining gate        |
| Keep staging outside current goal                      | satisfied | staging/release-boundary unit remains deferred and blocked                 |
| Preserve redacted evidence rules                       | satisfied | no secrets, raw DB rows, raw DOM, screenshots, traces, or Provider data    |

## Fresh Approval Units

| Unit | Approval unit                             | Blocked task coverage | Current status | Future approval required before execution                      |
| ---- | ----------------------------------------- | --------------------- | -------------- | -------------------------------------------------------------- |
| A    | Dependency/package advisory remediation   | 4 tasks               | blocked        | dependency/package-manager/package/lockfile approval           |
| B    | DB migration command guard implementation | 1 task                | blocked        | task-specific source/script approval without DB execution      |
| C    | Provider/browser runtime acceptance       | 1 task                | blocked        | Provider/browser runtime approval and redacted evidence policy |
| D    | DB/browser runtime acceptance             | 1 task                | blocked        | DB/browser runtime approval and redacted evidence policy       |
| E    | Staging/release-boundary execution        | 2 tasks               | blocked        | current goal change plus fresh staging/release approval        |

## Recommended Sequencing

1. Unit A is the highest-priority future decision because it contains the p0/high package-manager advisory remediation
   gate. It still requires fresh dependency approval and package/lockfile scope before any execution.
2. Unit B is a local hardening candidate if the owner wants a non-runtime implementation task and grants exact
   source/script scope while keeping DB execution blocked.
3. Units C and D are acceptance-runtime tasks and should remain blocked until the owner explicitly allows the relevant
   runtime surface and evidence policy.
4. Unit E remains outside the current goal. It requires a future goal change and fresh approval; it must not be inferred
   from any local closeout.

## Non-Approval Statement

This document is not approval to execute any unit. Future execution must materialize a new task-specific state, queue,
task plan, allowedFiles, blockedFiles, DB boundary, AI/Provider boundary, browser boundary, credential boundary, evidence
redaction rule, validation commands, and closeoutPolicy before work starts.
