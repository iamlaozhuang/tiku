# batch-241 organization training employee answer lifecycle plan

## Task

- taskId: `batch-241-organization-training-employee-answer-lifecycle-local-role-flow`
- branch: `codex/batch-241-organization-employee-answer-flow`
- module: `organization-training`
- targetClosureItem: employee answer lifecycle local role flow

## Read Norms

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/adr-001-tech-stack-selection.md`
- `docs/02-architecture/adr/adr-002-runtime-architecture-and-multi-client-contract.md`
- `docs/02-architecture/adr/adr-003-workplace-desktop-web-compatibility.md`
- `docs/02-architecture/adr/adr-004-environment-isolation-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-005-staging-architecture-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-006-runtime-dependency-alignment.md`
- `docs/02-architecture/adr/adr-007-edition-aware-authorization-source-of-truth.md`

## Approval And Boundaries

- Approval: current `autoDriveLocalImplementationApproval for module organization-training`.
- Allowed files:
  - `src/server/models/**`
  - `src/server/contracts/**`
  - `src/server/validators/**`
  - `src/server/services/**`
  - `docs/04-agent-system/state/project-state.yaml`
  - `docs/04-agent-system/state/task-queue.yaml`
  - `docs/05-execution-logs/task-plans/**`
  - `docs/05-execution-logs/evidence/**`
  - `docs/05-execution-logs/audits-reviews/**`
- Blocked files:
  - `.env.local`
  - `.env.example`
  - `package.json`
  - `pnpm-lock.yaml`
  - `package-lock.yaml`
  - `package-lock.json`
  - `src/db/schema/**`
  - `drizzle/**`

## Implementation Strategy

1. Run the pre-edit auto-seed readiness gate.
2. Materialize the task plan path and current task metadata before WorkReadiness.
3. Inspect existing employee visible-list, draft-save, submit, and readonly-summary service/route coverage.
4. Prefer no source change if existing implementation already satisfies the target closure item.
5. If a real gap is found, make the smallest allowed `src/server/services/**` or related allowed server-layer test change.
6. Run focused organization-training service/route tests, lint, typecheck, diff check, module closeout readiness, pre-commit hardening, and pre-push readiness.
7. Record redacted evidence and audit review before commit.

## Risk Controls

- No provider/model call.
- No env/secret/token/database URL/Authorization header read or output.
- No dependency/package/lockfile change.
- No schema/migration change and no local DB migration apply.
- No deploy, payment, PR, force-push, or Cost Calibration Gate.
- Evidence records only commands, results, task ids, role/use-case summaries, and redacted metadata.
