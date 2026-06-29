# Full Acceptance Content Admin AI Generation Detail Session Proof Plan

## Task

- Task id: `full-acceptance-content-admin-ai-generation-detail-session-proof-2026-06-28`
- Branch: `codex/content-admin-ai-generation-session-proof-20260628`
- Goal alignment: complete the two blocked `content_admin` AI generation detail-control rows from the owner-facing
  checklist.

## SSOT Read List

- `AGENTS.md`
- `docs/01-requirements/00-index.md`
- `docs/01-requirements/advanced-edition/00-index.md`
- `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`
- `docs/01-requirements/modules/06-admin-ops.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/01-requirements/traceability/2026-06-28-owner-facing-role-gap-capture-scope.md`
- `docs/01-requirements/traceability/2026-06-28-full-acceptance-ai-generation-detail-role-rerun.md`
- `docs/05-execution-logs/evidence/2026-06-28-full-acceptance-ai-generation-detail-role-rerun.md`

## Materialized Boundary

Allowed files:

- task-scoped state, queue, requirement, plan, evidence, audit, and acceptance files.

Read-only private input:

- `D:\tiku-local-private\acceptance\role-separated-local-accounts-2026-06-23.md`

Blocked actions:

- Provider execution/config/credentials, prompts, raw AI IO.
- DB write, schema, migration, seed, password reset, destructive operation.
- local UI/API write-flow mutation except normal login/session switching.
- AI generation submit.
- dependency/package/lockfile changes.
- source/test changes.
- screenshots, traces, raw DOM evidence, credentials, sessions, localStorage, tokens, Authorization headers.
- staging/prod/deploy, PR, force push, release readiness, final Pass, Cost Calibration.

## Execution Steps

1. Confirm local app availability on localhost or `127.0.0.1`.
2. Read the mandatory owner-facing checklist before browser or DB execution.
3. Read the approved private account file only as local login input for `content_admin`; do not emit values.
4. Attempt normal visible login/session proof for `content_admin`.
5. If session proof succeeds, rerun `/content/ai-question-generation` and `/content/ai-paper-generation` read-only and
   record redacted category counts.
6. If session proof fails, perform only local DB read-only aggregate/status proof when needed to classify whether the
   account exists, is active, or is locked. Do not output raw rows, identifiers, phone, or credentials.
7. Record redacted evidence, audit review, and acceptance decision.
8. Run focused unit baseline, scoped formatting, diff, and Module Run v2 gates.

## Completion Rule

This task can close only the two scoped `content_admin` AI generation detail-control rows or record a smaller
session-material blocker. The full durable goal remains active until every applicable owner-facing checklist row passes.
