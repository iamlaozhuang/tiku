# Content Admin Platform D2 Material List Consistency Plan

Date: 2026-07-13

Task: `content-admin-platform-d2-material-list-consistency-2026-07-13`

Branch: `codex/content-admin-platform-d2-material-list-consistency`

Profile: R1 / `evidence_two_rounds`

Baseline: `master == origin/master == 8fcc33fe178a44f502eb6cf6235d4d1fbf6fa677`

## Goal

Complete material-list parity with the D1 question request contract: retain current material rows and announce an
accessible refreshing state while the current filter/page request is pending, with latest-intent ownership unchanged.

## Required Reading

- `AGENTS.md`.
- `docs/04-agent-system/state/project-state.yaml` and `docs/04-agent-system/state/task-queue.yaml`.
- `docs/03-standards/code-taste-ten-commandments.md` and `docs/02-architecture/adr/`.
- `docs/01-requirements/00-index.md`, admin operations/question/material requirements and stories, and current full-role
  remediation traceability.
- B–F serial plan, standing authorization, D0/D1 evidence, B1/B2 contracts, Lean Module Run v3, closeout SOP and PIC
  ledger.

## Implementation

1. Reuse D1's view-owned request classification and shared `AdminAsyncState`; generalize only the presentation message
   for the active resource view.
2. Convert `[D2 RED]` to a normal material regression. Leave both D3 contracts expected-failing.
3. Preserve material lifecycle/lock semantics, URL/pagination contracts, question behavior, endpoints, response shapes,
   authorization, dependencies, database, Provider, build configuration and deployment.

## Validation And Review

- Run the focused question/material suite, lint, typecheck, changed-file Prettier, diff check and governance guards.
- Round 1 attacks material row retention, accessibility, latest-intent ownership and question/material parity.
- Round 2 attacks question regressions, lifecycle/lock drift, stale state, D3 leakage, over-design and protected domains.

Closeout uses one principal commit, ff-only merge, push, remote equality verification and cleanup; D3 starts
automatically.
