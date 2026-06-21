# Active Queue Slimming 2026-06-21 Edition Packets Window Plan

- Task id: `active-queue-slimming-2026-06-21-edition-packets-window`
- Branch: `codex/active-queue-slimming-2026-06-21-edition-packets-window`
- Fresh approval: user approved continuing the next active queue slimming seed/materialization round; task-end FF merge, push `origin/master`, and merged branch cleanup remain approved by the user's standing task-end closeout authorization in this thread.

## Read Standards

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/**`
- `docs/04-agent-system/sop/active-queue-slimming-plan.md`

## Scope

Archive exactly the latest first five terminal active queue candidates reported by the local queue slimming diagnostic on this branch:

1. `edition-aware-authorization-schema-migration-approval-packet`
2. `edition-aware-authorization-api-contract-packet`
3. `edition-aware-authorization-service-repository-packet`
4. `edition-aware-authorization-ui-context-packet`
5. `edition-aware-authorization-e2e-spec-authoring-packet`

## Guardrails

- Docs/state/archive/index only.
- No product source, tests, e2e, schema, migration, scripts, env, dependency, provider, payment, deploy, PR, force-push, destructive DB, staging/prod/cloud database, or Cost Calibration Gate work.
- Evidence records command/result summaries and candidate ids only.

## Implementation Steps

1. Run WorkReadiness pre-edit with planned files.
2. Move the five terminal task blocks from active `task-queue.yaml` to the June archive.
3. Add matching `task-history-index.yaml` entries.
4. Update `project-state.yaml` current task and queue slimming summary.
5. Run diagnostics, scoped formatting, lint/typecheck, diff check, hardening, closeout, and pre-push readiness.

## Risk Defense

- Stop if any candidate is non-terminal, missing required metadata, or required by an active task in a way that would become unresolvable.
- Stop if archival would require source/test/e2e/schema/script/env/dependency changes.
