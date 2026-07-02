# Queue And Execution Log Archive First Batch Plan

## Task

- Task id: `queue-and-execution-log-archive-first-batch-2026-07-02`
- Branch: `codex/queue-and-execution-log-archive-first-batch-2026-07`
- User approval: current user approved executing the next step after the dry-run inventory.
- Scope: move the exact first July archive batch identified by `docs/04-agent-system/state/archive-dry-run-inventory-2026-07-02.yaml`.

## Required Reading

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/04-agent-system/state/archive-dry-run-inventory-2026-07-02.yaml`
- `docs/04-agent-system/sop/task-queue-archival-and-index-governance.md`
- `docs/04-agent-system/sop/execution-log-archival-and-index-governance.md`

## Exact Archive Batch

Archive these closed task ids only:

1. `ai-generation-bounded-monopoly-question-provider-rerun-after-plaintext-acceptance-repair-2026-07-02`
2. `ai-generation-monopoly-question-structured-acceptance-diagnosis-2026-07-02`
3. `ai-generation-shared-structured-contract-goal-plan-2026-07-02`
4. `ai-generation-shared-task-spec-contract-2026-07-02`
5. `ai-generation-structured-preview-parser-hardening-2026-07-02`
6. `ai-generation-provider-instruction-unification-2026-07-02`
7. `ai-generation-route-contract-alignment-2026-07-02`
8. `ai-generation-cross-surface-ui-regression-matrix-2026-07-02`
9. `ai-generation-deterministic-acceptance-matrix-rollup-2026-07-02`
10. `ai-generation-bounded-provider-rerun-after-structured-contract-2026-07-02`

For each task, move the matching task plan, evidence, and audit review Markdown file to:

- `docs/05-execution-logs/archive/2026-07/task-plans/`
- `docs/05-execution-logs/archive/2026-07/evidence/`
- `docs/05-execution-logs/archive/2026-07/audits-reviews/`

## Implementation Steps

1. Materialize this task in `project-state.yaml` and `task-queue.yaml`.
2. Verify `master` and `origin/master` are aligned before movement.
3. Extract the exact 10 closed task blocks from active `task-queue.yaml` without semantic edits.
4. Append those blocks to `docs/04-agent-system/state/archive/task-queue-archive-2026-07.yaml`.
5. Add 10 lookup entries to `docs/04-agent-system/state/task-history-index.yaml`.
6. Move the exact 30 execution-log files with `git mv`.
7. Add 30 lookup entries to `docs/05-execution-logs/execution-log-index.yaml`.
8. Verify candidate ids are absent from active queue, present in archive and indexes, and all archive paths exist.
9. Write redacted evidence and audit review.
10. Run scoped formatting, diff check, Module Run v2 pre-commit, closeout, and pre-push gates.
11. Commit, fast-forward merge to `master`, push `origin/master`, and delete the merged short branch after gates pass.

## Stop Conditions

- Any candidate task is not terminal.
- Any candidate task block, plan, evidence, or audit review file is missing.
- Any active non-terminal task depends on a candidate id without index resolution.
- Any index entry cannot be created before movement.
- Any archive target path is ambiguous.
- Any sensitive content review issue is found.
- Any changed file exceeds docs-only archive and index scope.
- Any product source, test, script behavior, dependency, schema, DB, Provider, browser, staging/prod, deploy, payment, Cost Calibration, release readiness, final Pass, or production usability action becomes necessary.

## Evidence Rules

Record only counts, paths, statuses, branch/commit results, and redacted validation outcomes. Do not record credentials, cookies, tokens, Authorization headers, `.env*` values, DB rows, internal ids, PII, Provider payloads, prompts, AI raw text, full question/paper/material/resource/chunk content, or raw runtime artifacts.
