# Lean Module Run v3 Governance

> **Superseded/read-only (2026-07-20):** retained for the closed Content Admin Platform program audit. New work uses
> `minimal-safety-kernel.md` and must not materialize R0-R3 transition machinery.

## Scope

This SOP governs the active Content Admin Platform B–F Program. It changes execution mechanics only and does not claim
product behavior, reopen A01–A30, or authorize deployment.

## Canonical Order

The canonical task order and every task profile are owned by
`docs/05-execution-logs/task-plans/2026-07-13-content-admin-platform-b-to-f-serial-program.md`. `project-state.yaml` and
`task-queue.yaml` are projections used for recovery and execution. The Program Guard compares both projections directly
with the serial plan, so changing state and queue together cannot silently reorder work.

## Risk Profiles

- R0: read-only mapping, requirement reconciliation, or documentation decision.
- R1: one page, local component, or local test surface.
- R2: shared component, cross-page contract, or API consumption chain.
- R3: authorization, AI, database, dependency, security, or external behavior.

Each task materializes `executionProfile`, `focusedGates`, `buildRequired`, `fullRegressionPolicy`, `protectedDomains`,
and `reviewMode` in the queue. The Guard rejects missing or downgraded values.

## Artifact Policy

- R0 uses the shortest durable record that preserves the decision and evidence. It does not mechanically create three
  long documents.
- R1 uses a concise plan and evidence; Round 1 and Round 2 may be recorded in evidence.
- R2/R3, and any task with substantive findings, keeps an independent audit with both adversarial rounds.
- Record a fact once. Other artifacts link to its owner rather than copying command output, SHAs, or historical text.

## Validation Policy

- R0: scoped format, links, diff, and Program Guard. Do not run unrelated product tests or builds.
- R1: focused tests, lint, typecheck, changed-files format, diff, and Program Guard.
- R2/R3: focused gates plus impact-triggered validation for the declared protected domains.
- Fixed full-regression nodes are B5, D4, C6, E6, and F5.
- Extra full regression is required when the change affects shared runtime, a core contract, authorization, AI,
  dependencies, build configuration, test infrastructure, or when a failure crosses task/domain boundaries.
- Run heavy gates serially with controlled workers. After an ff-only merge of the tested commit, do not mechanically
  repeat the identical full suite.

## Review Policy

Round 1 attacks correctness, data integrity, requirements, and contracts. Round 2 attacks regressions, authorization
overreach, exceptional paths, cross-page consistency, and over-design. Findings inside the task boundary are fixed and
revalidated before closeout. Independent non-blocking issues enter a later queue item without contaminating the commit.

## Git Closeout

- A normal task has one principal commit.
- Git-derived push result, final SHA, or clean state does not justify an evidence-only follow-up commit.
- Pre-commit performs cheap deterministic structure, scope, sensitive-content, and staged-file checks.
- Pre-push verifies required artifacts, validation/review markers, approval, and closeout readiness; it does not rerun
  the complete product suite.
- Merge is ff-only to `master`; ordinary push is only to `origin/master`; verify remote sync, then remove the merged
  short branch and worktree before claiming the next task.

## Protected Boundaries

The Guard must block downgraded gates, missing review rounds, changed files outside scope, skipped tasks, reordered
projections, sensitive-content leakage, deployment authorization, and early conditional tasks. Deployment, dependency,
schema, provider, secret, destructive data, PR, force-push, and Cost Calibration Gate boundaries remain governed by
their existing approval sources. No fresh current-baseline failure means no reopening of A01–A30 or other closed work.
