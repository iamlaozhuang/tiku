# Content AI 0704 Account Matrix Recovery Plan

## Task

- Task id: `content-ai-0704-account-matrix-recovery-2026-07-09`
- Branch: `codex/content-ai-0704-account-matrix-recovery`
- Mode: docs-only recovery record for local 0704 role credential readiness.

## Read Baseline

- `AGENTS.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/adr-007-edition-aware-authorization-source-of-truth.md`
- `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`
- Current private acceptance material under `D:/tiku-local-private/acceptance`
- Current private owner-facing employee import material under `D:/tiku-local-private/owner-facing-fixtures`

## Boundary

- No source, test, package, lockfile, schema, migration, seed, env, provider, staging, production, deploy, Cost Calibration, screenshot, raw DOM, or direct DB operation.
- Private account values are read only in memory and never copied to repository evidence or chat.
- Runtime login checks use localhost only and record only role labels, HTTP/app status categories, and authorization capability categories.
- Login checks may create ordinary local session rows through the product session endpoint; no session, cookie, token, localStorage, or auth header is recorded.

## Implementation

1. Supersede the earlier incomplete exact selector conclusion with a narrower corrected account-matrix recovery record.
2. Record which role labels can be validated from structured JSON, scenario markdown, bootstrap markdown, and employee import CSV sources.
3. Record personal and organization effective edition summaries without public ids or raw authorization rows.
4. Update project state and queue to point at the superseding recovery evidence.

## Validation

- Scoped prettier write/check for changed docs/state files.
- `git diff --check`
- `corepack pnpm@10.26.1 lint`
- `corepack pnpm@10.26.1 typecheck`
- Module Run v2 pre-commit hardening for this task id.
- Module Run v2 pre-push readiness for this task id.
