# Content Admin Platform D1 Question List Consistency Plan

Date: 2026-07-13

Task: `content-admin-platform-d1-question-list-consistency-2026-07-13`

Branch: `codex/content-admin-platform-d1-question-list-consistency`

Profile: R1 / `evidence_two_rounds`

Baseline: `master == origin/master == a448b6edb8df21d42336a24dece81d9aa8e7bc58`

## Goal

Apply the shared list request contract to the question consumer: a filter or page request keeps the current question rows
operable, announces an accessible `refreshing` state, and accepts only the latest intent. Preserve canonical URL,
pagination, lifecycle and question mutation behavior. D2 retains ownership of the equivalent material behavior.

## Required Reading

- `AGENTS.md`.
- `docs/04-agent-system/state/project-state.yaml` and `docs/04-agent-system/state/task-queue.yaml`.
- `docs/03-standards/code-taste-ten-commandments.md` and `docs/02-architecture/adr/`.
- `docs/01-requirements/00-index.md`, admin operations/question requirements and stories, and current full-role
  remediation traceability.
- B–F serial plan, standing authorization, D0 plan/evidence/audit, B1/B2 contracts, Lean Module Run v3, closeout SOP,
  and the PIC ledger.
- Question/material client, shared async/list primitives, request-intent helper and focused unit tests.

## Implementation

1. Extend the list data hook with an explicit refreshing signal that is distinct from initial loading and remains governed
   by the current request intent.
2. Render the B1 `AdminAsyncState` refreshing contract for question requests while retaining current rows.
3. Convert only `[D1 RED]` from executable expected failure to a normal regression. Leave D2/D3 contracts active and
   expected-failing; an accidental early pass is a scope failure.
4. Do not change endpoints, response contracts, pagination defaults, content lifecycle, authorization, dependencies,
   database, provider behavior, build configuration or deployment.

## Validation And Review

- Run the focused question/material suite, lint, typecheck, changed-file Prettier, diff check and governance guards.
- Round 1 attacks correctness, latest-intent ownership, row retention, accessibility and URL/pagination contracts.
- Round 2 attacks material scope leakage, stale-response state corruption, error/unauthorized paths, regressions,
  over-design and deployment/privilege expansion.

Closeout is one principal implementation/evidence commit, ff-only merge, push to `origin/master`, remote equality check
and branch/worktree cleanup. D2 starts automatically.
