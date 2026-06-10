# Module Run v2 Mechanic Unattended Readiness Lines Plan

## Task

- Mechanic automation id: `tiku-module-run-v2-mechanic-2`
- Target autopilot id: `tiku-module-run-v2-autopilot-2`
- Branch: `codex/mechanic-unattended-readiness-lines-20260610`
- Scope: mechanism-only repair for the latest stopped primary autopilot run.

## Sources Read

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/04-agent-system/state/autodrive-control-schema.yaml`
- `docs/04-agent-system/state/mechanism-source-of-truth-index.yaml`
- Relevant Module Run v2 SOPs and `scripts/agent-system/`
- Latest primary autopilot memory and prior mechanism evidence/audit

## Diagnosis

The primary visible autopilot stopped before task claim during serial unattended readiness for
`batch-101-authorization-and-access-authorization-read-model-and-display-contrac`.

Reproduction showed `Test-ModuleRunV2UnattendedReadiness.ps1` failed with:

- `HARD_BLOCK_ERROR Cannot bind argument to parameter 'Lines' because it is an empty string.`

Root cause: the script passed `Get-Content` output from YAML files into mandatory `string[]` parameters that did not
allow empty string elements. `task-queue.yaml` contains blank separator lines, so PowerShell rejected the array before
the parser function body could run.

Related mechanism drift: active mechanism state still wrote or declared the historical autopilot id
`tiku-module-run-v2-autopilot` instead of the primary visible id `tiku-module-run-v2-autopilot-2`.

## Implementation Plan

- Allow empty strings and empty collections for YAML line/block/pattern arrays in unattended readiness parsing helpers.
- Add smoke coverage with blank YAML separator lines.
- Allow pending pre-claim tasks to proceed when evidence/audit paths are declared but the files do not exist yet; those
  files are produced after task claim and work execution.
- Make unattended readiness run registry heartbeats record `tiku-module-run-v2-autopilot-2`.
- Align active mechanism state and smoke fixtures to the primary visible autopilot id.
- Add a bounded `mechanic_repair` pre-commit scope so mechanism repairs are not forced through the previous business
  task's allowed file list.
- Stabilize the unattended readiness smoke so post-closeout handoff ancestry coverage does not depend on whether local
  `master` is temporarily ahead of `origin/master` before the allowed push.
- Align serial unattended readiness with startup readiness for explicit `accepted_ancestor_checkpoint` repository SHA
  semantics, requiring real Git ancestry before continuing.
- Repair the post-commit advisory blank-line parser defect surfaced by the follow-up mechanism commit.
- Keep edits limited to mechanism scripts/state and execution logs.

## Validation Plan

- Run focused unattended readiness smoke.
- Re-run the previously failing live readiness command with `-NoWrite`.
- Run startup, dispatcher, schema, hygiene, runner, and control-loop smoke/readiness checks needed to prove next autopilot
  takeover.
- Run `git diff --check`, `npm run lint`, and `npm run typecheck` with `D:\tiku\node_modules\.bin` on `PATH` when
  available.

## Blocked Scope

No business implementation, dependency/package/lockfile change, env/secret access, provider call, schema/migration,
Docker DB operation, e2e, deploy, PR, force push, or Cost Calibration Gate execution is in scope.
