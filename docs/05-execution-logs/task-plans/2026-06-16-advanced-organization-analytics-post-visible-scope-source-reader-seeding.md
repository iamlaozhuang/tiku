# Advanced Organization Analytics Post Visible Scope Source Reader Seeding Plan

## Scope

- Task id: `advanced-organization-analytics-post-visible-scope-source-reader-seeding`
- Branch: `codex/advanced-organization-analytics-post-visible-scope-seeding`
- Task type: docs/state-only queue reconciliation and next task seeding.
- Approval consumed: user replied `批准执行` after the assistant recommended the docs/state repair and next queue seeding.

## Required References Read

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/adr-001-tech-stack-selection.md`
- `docs/02-architecture/adr/adr-002-runtime-architecture-and-multi-client-contract.md`
- `docs/02-architecture/adr/adr-003-workplace-desktop-web-compatibility.md`
- `docs/02-architecture/adr/adr-004-environment-isolation-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-005-staging-architecture-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-006-runtime-dependency-alignment.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- Recent redacted organization analytics evidence and audit files.

## Baseline

- `git switch master`: pass before branch creation.
- `git fetch --prune origin`: pass with non-blocking Git loose-object maintenance warning.
- `git status --short --branch`: clean `master...origin/master`.
- `git rev-parse HEAD master origin/master`: all `4d35e9b75c4d59e75d39c9fcfb50f09cb80db486`.
- `git for-each-ref --format='%(refname:short)' refs/heads/codex refs/remotes/origin/codex`: no output.
- Queue precondition: `task-queue.yaml` has `pendingCount=0`.

## Implementation Plan

1. Record that `advanced-organization-analytics-postgres-gateway-visible-scope-composition-tdd` was closed out after fresh approval with commit `4d35e9b75c4d59e75d39c9fcfb50f09cb80db486`, fast-forward merge to `master`, push to `origin/master`, and short-branch cleanup.
2. Update `project-state.yaml` to the current docs/state seeding task, current repository SHA checkpoints, and a handoff to one pending follow-up task.
3. Append one pending task: `advanced-organization-analytics-postgres-gateway-source-readers-tdd`.
4. Keep the pending implementation task limited to typed repository source-reader TDD in `src/server/repositories/organization-analytics-repository.ts` and its focused unit test. It must not wire App Router runtime, execute a real DB connection, read `.env*`, modify schema/drizzle/package/lockfile/dependencies, call providers/models, or run e2e/browser/dev-server.
5. Write redacted evidence and audit for this docs/state-only task, then run declared validation commands.

## Risk Controls

- No `.env*` read, output, summary, or modification.
- No product source implementation in this seeding task.
- No direct database execution, row/private data, provider payload, raw prompt, raw answer, secret, token, cookie, Authorization header, DB URL, or public identifier list in evidence.
- No staging/prod/cloud/deploy/payment/external-service, PR, force push, or Cost Calibration Gate.
- No package/lockfile/dependency/schema/drizzle changes.
