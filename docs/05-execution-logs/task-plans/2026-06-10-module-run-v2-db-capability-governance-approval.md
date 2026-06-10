# Module Run v2 DB Capability Governance Approval Plan

## Task

- taskId: `module-run-v2-db-capability-governance-approval`
- branch: `codex/db-capability-governance-approval`
- taskKind: `mechanism_repair`

## Read Before Edit

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/04-agent-system/state/autodrive-control-schema.yaml`
- `docs/04-agent-system/state/mechanism-source-of-truth-index.yaml`
- `docs/04-agent-system/sop/automated-advancement-governance.md`
- latest automation memory and standing closeout evidence

## Implementation Plan

1. Record two durable DB capability governance approvals.
2. Update local capability gate so approved schema migration tasks can pass readiness.
3. Add a distinct `destructiveLocalDockerDatabase` capability that is task-scoped and local-dev-only.
4. Update schema readiness, seed defaults, SOP, and source-of-truth index.
5. Add smoke coverage for approved schema migration, approved destructive local Docker DB, and unsafe destructive values.
6. Validate locally and record evidence before any completion claim.

## Risk Defenses

- No real DB operation, migration execution, schema edit, env/secret access, provider call, dependency/lockfile change,
  deploy, PR, force push, or Cost Calibration Gate action.
- Destructive DB is not global standing approval; it requires task-scoped `approved_destructive_local_dev_only`.
- Evidence must not include database URLs, DB rows, auto-increment ids, secrets, raw prompts, provider payloads, or full
  `paper`/`material` content.
