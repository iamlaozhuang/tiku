# docs-adr-runtime-dependency-alignment Task Plan

## Task

- Task id: `docs-adr-runtime-dependency-alignment`
- Branch: `codex/docs-adr-runtime-dependency-alignment`
- Task kind: `docs_only`
- Date: 2026-06-12
- Source: health audit follow-up queue

## Documents Read

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- ADR-001 through ADR-005
- `docs/04-agent-system/state/task-queue.yaml`
- `package.json`
- `docs/05-execution-logs/evidence/2026-06-12-health-audit-local-baseline.md`

## Scope

Allowed files:

- `docs/02-architecture/adr/adr-006-runtime-dependency-alignment.md`
- This task plan, evidence, and audit review

Blocked work:

- No product code, tests, dependency/package/lockfile, schema/migration, env/secret, provider, deploy, payment, external-service, PR, force-push, or Cost Calibration Gate work.

## Approach

- Add ADR-006 as an accepted runtime/dependency alignment record.
- Treat ADR-001 as historical technology selection and avoid rewriting it.
- Record current runtime package facts from `package.json`.
- Record deferred AI/RAG/Markdown dependency items and require future dependency gate approval before adding them.

## Validation Commands

- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `git diff --check`

## Stop Conditions

- Stop if the work requires `package.json`, lockfile, source, tests, env, provider, schema, migration, or deployment changes.
