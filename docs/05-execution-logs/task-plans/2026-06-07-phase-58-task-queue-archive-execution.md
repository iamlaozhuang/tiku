# Phase 58 Task Queue Archive Execution Task Plan

## Task Boundary

Execute the approved docs-only task queue archive task. Move archive-eligible terminal historical task entries out of `docs/04-agent-system/state/task-queue.yaml`, preserve those entries in archive files, and create a lightweight history index.

This task does not delete historical task data. It does not rewrite archived task semantics. It does not approve product code, code-stage queue seeding, schema, migration, API, service, UI, tests, e2e, scripts, dependency, package, lockfile, provider, env/secret, staging/prod/cloud/deploy, payment, external-service, or Cost Calibration Gate work.

## Required Reading

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/04-agent-system/sop/task-queue-archival-and-index-governance.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/evidence/2026-06-07-phase-57-docs-slimming-readonly-inventory.md`

## Archive Scope

Archive entries that meet all of these conditions:

- existing terminal status in `task-queue.yaml`;
- not part of the recent recovery window `phase-53` through `phase-57`;
- evidence path exists on disk;
- no active pending, claimed, planned, blocked, or retrying task depends on it without index support.

Keep entries in active queue when any of these conditions apply:

- recent recovery window task: `phase-53`, `phase-54`, `phase-55`, `phase-56`, or `phase-57`;
- evidence path is missing and needs separate reconciliation;
- current phase-58 task entry.

Initial readonly analysis found:

- 478 existing queue entries.
- 5 recent recovery entries retained.
- 26 evidence-gap historical entries retained.
- 447 archive-eligible historical entries.
- Archive split: 313 entries to `task-queue-archive-2026-05.yaml`, 134 entries to `task-queue-archive-2026-06.yaml`.

## Files

Modify:

- `docs/04-agent-system/state/task-queue.yaml`
- `docs/04-agent-system/state/project-state.yaml`

Create:

- `docs/04-agent-system/state/archive/task-queue-archive-2026-05.yaml`
- `docs/04-agent-system/state/archive/task-queue-archive-2026-06.yaml`
- `docs/04-agent-system/state/task-history-index.yaml`
- `docs/05-execution-logs/task-plans/2026-06-07-phase-58-task-queue-archive-execution.md`
- `docs/05-execution-logs/evidence/2026-06-07-phase-58-task-queue-archive-execution.md`
- `docs/05-execution-logs/audits-reviews/2026-06-07-phase-58-task-queue-archive-execution.md`

## Execution Steps

1. Parse `task-queue.yaml` into task blocks without changing task field semantics.
2. Classify each existing task as archived, recent retained, or evidence-gap retained.
3. Write archive files with original task blocks under `tasks:`.
4. Rewrite active `task-queue.yaml` with retained tasks plus the phase-58 task entry.
5. Create `task-history-index.yaml` with one index entry per archived task.
6. Update `project-state.yaml` to phase-58 and keep `automation.mode` as `semi_auto`.
7. Write evidence and audit review.
8. Run validation commands and record results.

## Validation Plan

- `git diff --check`
- YAML parse validation for active queue, archive files, and task history index.
- Count validation: active queue retained count, archive count, index count, and no duplicate ids across active queue plus archives.
- Evidence path validation for archived tasks.
- `node .\node_modules\prettier\bin\prettier.cjs --check` for changed Markdown/YAML files.
- Required phrase search for archive sections and project terms.
- Added-line scan for blocked non-project terms.
- Verify `automation.mode` remains `semi_auto`.
- Git inventory check against allowed files.

## Risk Controls

- Do not archive entries with missing evidence paths.
- Do not delete historical task content.
- Do not edit source-of-truth requirements, ADRs, standards, SOPs, or advanced edition implementation plans.
- Do not infer product implementation or runtime completion from queue archive work.
- Keep Cost Calibration Gate blocked.
