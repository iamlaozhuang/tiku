# Active Queue Slimming Plan

## Status

Planning-only governance for future active queue slimming. This document does not move, delete, archive, or rewrite any
task entries by itself.

## Purpose

Keep `docs/04-agent-system/state/task-queue.yaml` focused on executable and near-term recovery work while preserving
historical traceability through archive files and indexes.

## Active Queue Definition

The active queue should contain only:

- non-terminal tasks: `pending`, `claimed`, `planned`, `implemented`, `validated`, `reviewed`, `ready_for_closeout`, or
  `blocked`;
- the current recovery pointer from `project-state.yaml`;
- the latest serial mechanism tuning window;
- a short recent closeout window needed for post-closeout recovery;
- pending approval decision records that are expected to become executable soon.

Terminal historical tasks should move to archive only through a separately approved archival task.

## Archive Eligibility

A task is eligible for future archive when all are true:

- status is terminal: `done`, `closed`, `merged`, or `pushed`;
- evidence path exists or the missing evidence is explicitly recorded as historical non-blocking debt;
- audit review path exists when the task changed governance, state, security, scope, approval, evidence, or blocked-gate
  behavior;
- no active task depends on the full in-place block for immediate execution;
- `task-history-index.yaml` or a future index entry can locate the archived block.

## Non-Blocking Historical Findings

Existing historical findings such as old `legacy_done` entries or missing early evidence are diagnostic debt. They must
not block current task selection unless they affect the current dependency chain, current recovery pointer, module
matrix closure, or a requested audit.

Future slimming evidence should list:

- total active queue task count before and after;
- terminal tasks moved;
- terminal tasks retained and why;
- evidence missing count retained as non-blocking;
- archive path and index update path;
- Cost Calibration Gate remains blocked.

## Future Archival Task Boundary

A future archival task may:

- move eligible terminal task blocks from active queue to a dated archive file;
- update `task-history-index.yaml`;
- update `mechanism-source-of-truth-index.yaml` archive references;
- run formatting and diff checks.

It must not:

- change task semantics;
- delete evidence or audit files;
- rewrite current task status;
- modify product code;
- modify dependencies, lockfiles, schema, migrations, env/secret, provider, staging/prod/cloud/deploy, payment, external
  service, PR, force push, or Cost Calibration Gate state.

## Validation For Future Archival

Future archival tasks should validate:

- active queue remains valid YAML;
- moved task ids are present in archive and index;
- active pending dependencies still resolve to terminal tasks through active queue or history index;
- `Get-TikuNextAction.ps1` and `Get-TikuProjectStatus.ps1` still return a deterministic diagnostic;
- scoped Prettier and `git diff --check` pass.

## Stop Conditions

Stop before archival when:

- a terminal task lacks enough metadata to be indexed;
- a pending or blocked task depends on a task that would become unresolvable;
- current task or handoff pointers would become stale;
- evidence would expose secrets, raw prompts, raw generated AI content, cleartext `redeem_code`, full `paper` content,
  private answer text, database URLs, or Authorization headers;
- Cost Calibration Gate execution is requested.
