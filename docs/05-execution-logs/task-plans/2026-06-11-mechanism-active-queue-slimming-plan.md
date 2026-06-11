# Mechanism Active Queue Slimming Plan

## Task

- id: `mechanism-active-queue-slimming-plan`
- branch: `codex/mechanism-active-queue-slimming`
- task kind: `docs_only`
- productClosureContribution: `none; mechanism budget item`

## Sources Read

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/04-agent-system/operating-manual.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/04-agent-system/state/task-history-index.yaml`
- `docs/04-agent-system/sop/task-queue-archival-and-index-governance.md`

## Scope

Create a planning-only queue slimming policy. Do not move, delete, archive, or rewrite task entries in this task.

Allowed changes:

- active queue slimming plan document;
- operating manual and mechanism index references;
- durable state and task queue pointers;
- task plan, evidence, and audit review.

Blocked changes:

- actual task queue archival or deletion;
- product code, dependencies, lockfiles, schema, migrations, env/secret, provider, staging/prod/cloud/deploy, payment,
  external-service, PR, force push, and Cost Calibration Gate execution.

## Implementation

1. Define active queue membership.
2. Define archive eligibility.
3. Define non-blocking historical finding treatment.
4. Define a future archival task boundary and validation minimum.
5. Register the plan in durable state and index.

## Validation

- scoped Prettier check;
- required anchor `Select-String`;
- `git diff --check`.

## Risk Defense

- Planning-only; no queue movement happens in this task.
- Current task and handoff pointers remain explicit.
- Cost Calibration Gate remains blocked.
