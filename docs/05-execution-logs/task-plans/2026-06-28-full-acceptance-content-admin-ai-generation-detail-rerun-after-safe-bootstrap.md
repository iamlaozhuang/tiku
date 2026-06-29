# Content Admin AI Generation Detail Rerun After Safe Bootstrap Plan

## Task

- Task id: `full-acceptance-content-admin-ai-generation-detail-rerun-after-safe-bootstrap-2026-06-28`
- Branch: `codex/content-admin-ai-rerun-after-bootstrap-20260628`
- Goal alignment: rerun the two `content_admin` AI generation owner-facing checklist rows after local safe bootstrap.

## SSOT Read List

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/01-requirements/traceability/2026-06-28-owner-facing-role-gap-capture-scope.md`
- `docs/01-requirements/traceability/2026-06-28-full-acceptance-matrix-unit-baseline-repair.md`
- `docs/05-execution-logs/evidence/2026-06-28-content-admin-local-safe-role-bootstrap-stage-c-repair.md`
- `docs/05-execution-logs/evidence/2026-06-28-content-admin-test-owned-account-stage-b-repair.md`

## Materialized Boundary

Allowed files are task-scoped governance, traceability, plan, evidence, audit, and acceptance files only.

Browser/runtime scope:

- localhost/127.0.0.1 only.
- Use `/api/v1/local-acceptance-sessions` only to set an in-memory `content_admin` acceptance session.
- Visit only `/content/ai-question-generation` and `/content/ai-paper-generation`.
- Record only role, route, workflow, control category, status, and count summaries.

Blocked:

- AI generation submit, Provider call/configuration, prompt execution, raw AI IO.
- Credentials, sessions, cookies, tokens, localStorage, Authorization headers in evidence.
- Raw DOM, screenshots, traces.
- DB access/write, raw rows, schema/migration/seed.
- Source/test/package/lockfile changes.
- Staging/prod/deploy, PR, force push, release readiness, final Pass, Cost Calibration.

## Execution Steps

1. Verify the existing localhost app is reachable; do not start a dev server unless separately needed and materialized.
2. Use the local safe bootstrap route to set a `content_admin` session without recording session material.
3. Visit `/content/ai-question-generation` and record redacted route/control/status counts.
4. Visit `/content/ai-paper-generation` and record redacted route/control/status counts.
5. Run focused unit checks for the bootstrap and shared AI generation entry surface.
6. Write evidence, audit review, and acceptance result.
7. Run Module Run v2 gates, commit, fast-forward merge, push, and branch cleanup if gates pass.

## Completion Rule

This task may close only the two scoped `content_admin` AI generation rows if the route/control/status evidence satisfies
the owner-facing checklist. The durable goal remains active for all other roles and workflows.
