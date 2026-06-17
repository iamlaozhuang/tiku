# Advanced Organization Analytics Postgres Repository Factory Boundary TDD

## Scope

- Task id: `advanced-organization-analytics-postgres-repository-factory-boundary-tdd`
- Approved by: user prompt "批准执行" in this Codex thread.
- Task type: local repository contract implementation.
- Goal: add a narrow Postgres repository factory boundary for organization analytics without executing a real database connection.

## Required Reading

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

## TDD Plan

1. Claim the pending task in durable state while preserving blocked gates.
2. RED: add scoped unit tests in `src/server/repositories/organization-analytics-repository.test.ts` proving:
   - the Postgres factory is fail-closed when no gateway is injected;
   - an injected gateway delegates through the existing aggregate-only repository boundary.
3. Verify RED with `npm.cmd run test:unit -- "src/server/repositories/organization-analytics-repository.test.ts"`.
4. GREEN: add the minimal factory boundary to `src/server/repositories/organization-analytics-repository.ts`.
5. Verify GREEN and run all task validation commands.
6. Write evidence and audit.
7. Local commit is allowed by this fresh approval; fast-forward merge and push remain blocked because the queued task has `approved: false` for those closeout actions.

## Boundaries

- No real DB access or database connection execution.
- No App Router runtime wiring.
- No service, mapper, validator, contract, model, schema, Drizzle, package, lockfile, UI, e2e/browser/dev-server, provider/model, staging/prod/cloud/deploy/payment/external-service, PR, force-push, or Cost Calibration Gate work.
- Do not read, output, summarize, or modify `.env*`.
- Evidence must remain redacted and must not include secrets, tokens, DB URLs, provider payloads, raw prompts, raw answers, row/private data, or publicId lists.
