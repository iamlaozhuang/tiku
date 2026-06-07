# Phase 35 Doc Encoding Safe Repair

## Scope

- Task id: `phase-35-doc-encoding-safe-repair`
- Task kind: docs-only governance repair review
- Dependency: `phase-34-doc-encoding-audit-and-repair-plan`

## Decision Input

Phase 34 found no high-confidence project documentation encoding defect under `docs/`.

## Allowed Files

- `docs/05-execution-logs/task-plans/2026-06-06-phase-35-doc-encoding-safe-repair.md`
- `docs/05-execution-logs/audits-reviews/2026-06-06-phase-35-doc-encoding-safe-repair-review.md`
- `docs/05-execution-logs/evidence/2026-06-06-phase-35-doc-encoding-safe-repair.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`

## Safe Repair Rule

A file may be repaired automatically only when all conditions hold:

- the file is under `docs/`;
- the defect is deterministic, such as invalid UTF-8, UTF-8 BOM, mixed line endings, replacement characters, or a reversible mojibake conversion with clear improvement;
- the repair does not alter requirement meaning, authorization boundaries, `paper` / `mock_exam` terminology, or evidence history;
- post-repair validation confirms UTF-8, formatting, and no new blocked-scope changes.

## Outcome

No file met the safe repair rule. This task records a no-op safe repair to prevent speculative rewriting.
