# Content Admin Test-Owned Account Stage B Repair Plan

## Task

- Task id: `content-admin-test-owned-account-stage-b-repair-2026-06-28`
- Branch: `codex/content-admin-account-stage-b-repair-20260628`
- Goal alignment: unblock and rerun the two `content_admin` AI generation rows from the owner-facing checklist.

## SSOT Read List

- `AGENTS.md`
- `docs/01-requirements/00-index.md`
- `docs/01-requirements/advanced-edition/00-index.md`
- `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`
- `docs/01-requirements/modules/06-admin-ops.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/01-requirements/traceability/2026-06-28-owner-facing-role-gap-capture-scope.md`
- `docs/05-execution-logs/evidence/2026-06-28-full-acceptance-content-admin-ai-generation-detail-session-proof.md`

## Materialized Boundary

Allowed files:

- task-scoped state, queue, requirement, plan, evidence, audit, and acceptance files.

Read-only private input:

- `D:\tiku-local-private\acceptance\role-separated-local-accounts-2026-06-23.md`

Read-only source discovery:

- existing localhost UI/API account creation or role/session flow files only.

Blocked actions:

- Provider execution/config/credentials, prompts, raw AI IO.
- Direct DB write, schema, migration, seed, destructive operation.
- Source/test/package/lockfile changes.
- AI generation submit.
- Screenshots, traces, raw DOM evidence, credentials, sessions, localStorage, tokens, Authorization headers.
- Staging/prod/deploy, PR, force push, release readiness, final Pass, Cost Calibration.

## Execution Steps

1. Read the mandatory owner-facing checklist before browser, DB, source, or account execution.
2. Reconfirm the previous blocker from the session-proof evidence.
3. Use read-only source/UI discovery to identify an existing localhost account repair or account creation flow.
4. Use approved `ops_admin` account/session switching only if required by the existing local flow.
5. Create or repair only the test-owned `content_admin` local account through localhost UI/API.
6. Run Stage D read-only aggregate proof before and after repair, with counts/status labels only.
7. Establish `content_admin` session without recording session material.
8. Rerun `/content/ai-question-generation` and `/content/ai-paper-generation` read-only and record redacted category
   counts.
9. Record evidence, audit review, and acceptance decision.
10. Run focused unit baseline, scoped formatting, diff, and Module Run v2 gates.

## Completion Rule

This task can close only the account-repair blocker and the two scoped `content_admin` AI generation detail-control rows,
or record a smaller localhost UI/API account-flow blocker. The full durable goal remains active until every applicable
owner-facing checklist row passes.

## Closure Note

Execution closed on the smaller blocker path. Existing localhost UI/API does not expose a `content_admin` admin account
creation or role-assignment flow, and this task cannot use direct DB writes, seed execution, schema/migration, source
repair, or Provider execution.
