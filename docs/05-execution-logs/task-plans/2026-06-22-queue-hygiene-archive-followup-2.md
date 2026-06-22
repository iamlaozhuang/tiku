# Task Plan: Queue Hygiene Archive Follow-Up 2

taskId: `queue-hygiene-archive-followup-2-2026-06-22`

## Scope

Process the current terminal archive candidates reported after the Module Run v2 total closeout recheck. This task
archives terminal active queue packets, updates the June archive and task history index, and makes the local experience
bridge proposal diagnostic treat archived history entries as terminal so archived bridge markers do not reappear.

## Required Context Read

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/04-agent-system/state/archive/task-queue-archive-2026-06.yaml`
- `docs/04-agent-system/state/task-history-index.yaml`
- `scripts/agent-system/Get-ModuleRunV2QueueSlimmingSelfRepair.ps1`
- `scripts/agent-system/Get-ModuleRunV2LocalExperienceBridgeProposal.ps1`

## Plan

1. Move the 6 reported terminal archive candidates to the June archive.
2. Also archive the one displaced old terminal task created by this follow-up so the terminal recovery window remains
   clean.
3. Update `task-history-index.yaml` for all moved packets.
4. Update bridge proposal diagnostics to read terminal status from the task history index when a bridge marker has been
   archived.
5. Record evidence/audit and validate with queue slimming, project status, next action, bridge proposal, smoke tests,
   formatting, diff check, lint/typecheck, and Module Run v2 readiness gates.

## Risk Boundary

No product source, tests, e2e specs, schema, migrations, seed/database operations, package or lockfile changes,
env/secret access, Provider/model calls, browser/dev-server/e2e runtime, deploy, PR, force push, payment/external
service, org_auth runtime change, staging/prod data access, or Cost Calibration Gate execution.
