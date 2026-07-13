# Content Admin Platform D3 List Return Recovery Plan

Date: 2026-07-13

Task: `content-admin-platform-d3-list-return-recovery-2026-07-13`

Branch: `codex/content-admin-platform-d3-list-return-recovery`

Profile: R2 / `independent_audit`

Baseline: `master == origin/master == 7cfc3aae421073644c1575ef883b9d4dafb7a10f`

## Goal

Make the canonical list URL restorable after browser history navigation and restore focus plus captured scroll when the
inline edit workspace returns to its originating row. Direct URL and missing-target fallbacks must remain predictable.

## Required Reading

- `AGENTS.md`.
- `docs/04-agent-system/state/project-state.yaml` and `docs/04-agent-system/state/task-queue.yaml`.
- `docs/03-standards/code-taste-ten-commandments.md` and `docs/02-architecture/adr/`.
- `docs/01-requirements/00-index.md`, admin operations/question/material requirements and stories, and current full-role
  remediation traceability.
- B–F serial plan, standing authorization, D0-D2 evidence/audits, B2/B3 contracts, Lean Module Run v3, closeout SOP and
  PIC ledger.
- Current URL parser/history effect, list interaction state, question/material edit triggers, cancel/save paths, Drawer
  focus restoration and analogous focus/scroll return implementations.

## Implementation

1. On `popstate`, parse the canonical current URL and atomically restore filters plus list query without writing a
   competing history entry.
2. Capture the edit trigger and current scroll position when opening an existing question/material editor. On cancel or
   successful save, close the workspace then restore scroll and focus after React commits; fall back safely when the
   trigger is disconnected or no origin exists.
3. Convert both D3 expected-failure contracts to normal regressions and add adversarial fallback coverage if required.
4. Do not change API, response, pagination defaults, content lifecycle/locks, authorization, dependencies, database,
   Provider, build configuration or deployment.

## Validation And Review

- Run focused tests, lint, typecheck, changed-file format, diff check, guards and an independent two-round audit.
- Round 1 attacks URL source identity, effect loops, filter/query atomicity, focus/scroll timing and all close paths.
- Round 2 attacks stale targets, direct URL, disconnected controls, question/material parity, regressions, scope and
  over-design.

Closeout uses one principal commit, ff-only merge, push, remote equality verification and cleanup; D4 starts
automatically.
