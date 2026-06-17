# Advanced organization analytics post-runtime handoff seeding

## Scope

- Task: `advanced-organization-analytics-post-runtime-handoff-seeding`.
- Branch: `codex/organization-analytics-post-runtime-handoff-seeding`.
- User approval: current-thread approval to execute, commit, fast-forward merge to `master`, push `origin/master`, clean up, and recommend the next work item.

## Required context read

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/*.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/04-agent-system/sop/code-stage-task-seeding-governance.md`
- `docs/04-agent-system/sop/docs-only-fast-lane-governance.md`
- Latest dashboard summary Postgres runtime wiring evidence and audit.

## Plan

1. Confirm baseline `master == origin/master`, clean status, and no `codex/*` refs.
2. Confirm there are no current `pending` queue tasks.
3. Add this docs/state-only seeding task as closed with evidence and audit.
4. Seed one pending readonly recheck task:
   `advanced-organization-analytics-dashboard-summary-postgres-runtime-wiring-readonly-recheck`.
5. Refresh `project-state.yaml` handoff to recommend the new pending task.
6. Run declared local validation and close out through commit, fast-forward merge, push, and branch cleanup.

## Boundaries

- Only docs/state/task-plan/evidence/audit files may change.
- No product source, tests, scripts, schema, migration, drizzle, package, lockfile, dependency, provider/model, e2e, Browser, dev-server, staging/prod/cloud/deploy/payment/external-service, PR, force push, or Cost Calibration Gate work.
- Do not read, output, summarize, or modify `.env*`.
- Evidence must not include secrets, tokens, cookies, Authorization headers, database URLs, provider payloads, raw prompts, raw answers, raw rows, private data, or public identifier inventories.
