# Full Acceptance AI Generation Detail Role Rerun Plan

## Task

- Task id: `full-acceptance-ai-generation-detail-role-rerun-2026-06-28`
- Branch: `codex/full-acceptance-ai-generation-detail-rerun-20260628`
- Goal alignment: verify the AI generation detail-control source repair through role-session browser evidence.

## SSOT Read List

- `AGENTS.md`
- `docs/01-requirements/00-index.md`
- `docs/01-requirements/advanced-edition/00-index.md`
- `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`
- `docs/01-requirements/advanced-edition/modules/08-organization-ai-generation.md`
- `docs/01-requirements/modules/06-admin-ops.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/01-requirements/traceability/2026-06-28-owner-facing-role-gap-capture-scope.md`
- `docs/01-requirements/traceability/2026-06-28-ai-generation-detail-controls-source-repair.md`
- `docs/05-execution-logs/evidence/2026-06-28-ai-generation-detail-controls-source-repair.md`

## Materialized Boundary

Allowed files:

- task-scoped state, queue, requirement, plan, evidence, audit, and acceptance files.

Read-only local private input:

- `D:\tiku-local-private\acceptance\role-separated-local-accounts-2026-06-23.md`

Blocked actions:

- Provider execution/config/credentials, prompts, raw AI IO.
- DB read/write, schema, migration, seed.
- local UI/API write-flow mutation or AI generation submit.
- dependency/package/lockfile changes.
- source/test changes in this rerun task.
- screenshots, traces, raw DOM evidence, credentials, sessions, localStorage, tokens, Authorization headers.
- staging/prod/deploy, PR, force push, release readiness, final Pass, Cost Calibration.

## Execution Steps

1. Confirm local app availability on localhost or `127.0.0.1`.
2. Use approved test-owned local account/session switching for `content_admin`.
3. Read-only verify `/content/ai-question-generation` and `/content/ai-paper-generation`.
4. Use approved test-owned local account/session switching for `org_advanced_admin`.
5. Read-only verify `/organization/ai-question-generation` and `/organization/ai-paper-generation`.
6. Record redacted role/route/status/control/count evidence only.
7. If any row fails, record the failure class and route the smallest follow-up repair task. Do not repair source in this
   rerun task.
8. Run focused unit baseline, scoped formatting, diff, and Module Run v2 gates.

## Completion Rule

This task can close only the four scoped AI generation detail-control browser rerun rows. The full durable goal remains
active until every applicable owner-facing checklist row passes.
