# Full Acceptance Ops Admin Session Material Completion Plan

## Task

- Task id: `full-acceptance-ops-admin-session-material-completion-2026-06-28`
- Branch: `codex/full-acceptance-ops-admin-session-coverage-20260628`
- Durable goal: full acceptance matrix plus full unit baseline repair.
- Scope: complete the previously blocked `ops_admin` current-session coverage row using the owner-identified
  test-owned local material.

## SSOT Read List

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/adr-001-tech-stack-selection.md`
- `docs/02-architecture/adr/adr-002-runtime-architecture-and-multi-client-contract.md`
- `docs/02-architecture/adr/adr-003-workplace-desktop-web-compatibility.md`
- `docs/02-architecture/adr/adr-004-environment-isolation-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-005-staging-architecture-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-006-runtime-dependency-alignment.md`
- `docs/02-architecture/adr/adr-007-edition-aware-authorization-source-of-truth.md`
- `docs/01-requirements/traceability/2026-06-28-owner-facing-role-gap-capture-scope.md`
- `docs/01-requirements/traceability/2026-06-28-full-acceptance-option-a-session-coverage.md`
- `docs/05-execution-logs/evidence/2026-06-28-full-acceptance-option-a-session-coverage.md`
- `docs/05-execution-logs/acceptance/2026-06-28-full-acceptance-option-a-session-coverage.md`

## Prompt Materialization

The current prompt scope is materialized into:

- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- this task plan

Subsequent browser, DB, AI, source, account-material, documentation, validation, and closeout execution must use these
repository governance files as source of truth and must not expand scope from chat memory.

## Boundaries

Allowed files:

- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/01-requirements/traceability/2026-06-28-full-acceptance-ops-admin-session-material-completion.md`
- `docs/05-execution-logs/task-plans/2026-06-28-full-acceptance-ops-admin-session-material-completion.md`
- `docs/05-execution-logs/evidence/2026-06-28-full-acceptance-ops-admin-session-material-completion.md`
- `docs/05-execution-logs/audits-reviews/2026-06-28-full-acceptance-ops-admin-session-material-completion.md`
- `docs/05-execution-logs/acceptance/2026-06-28-full-acceptance-ops-admin-session-material-completion.md`

Read-only allowed inputs:

- `D:\tiku-local-private\acceptance\role-separated-local-accounts-2026-06-23.md`
- `src/app/**` only if needed to locate safe operations routes

Blocked files and actions:

- `.env*`, package and lockfiles, `src/**` modification, tests, e2e, scripts, schema, migrations, drizzle, seed, archive,
  task history index, Playwright reports, test results, `.next/**`, and owner-facing fixture content.
- DB read/write, schema, migration, seed, Provider, prompts, raw AI IO, local mutation/write-flow, dependency changes,
  staging/prod/deploy, PR, force push, release readiness, final Pass, Cost Calibration.

Credential boundary:

- The private `ops_admin` material may be used as local browser input only.
- Do not record credentials, account identifiers, cookies, tokens, sessions, localStorage, Authorization headers, or raw
  account file content.

Evidence boundary:

- Allowed evidence: role labels, route/workflow labels, pass/fail/blocked status, counts, redacted summary.
- Forbidden evidence: credentials, sessions, env contents, raw DOM, screenshots, traces, raw DB rows, internal ids, PII,
  Provider payloads, prompts, raw AI input/output, complete content.

Closeout policy:

- Local commit: approved.
- Fast-forward merge to `master`: approved.
- Push `origin/master`: approved.
- Delete merged short branch: approved.
- PR, force push, deploy, release readiness, final Pass: blocked.

## Execution Steps

1. Validate the governance materialization by formatting and diff checks.
2. Read the approved private acceptance file only to obtain the `ops_admin` login input; do not write sensitive output.
3. Use localhost browser session switching for `ops_admin`.
4. Verify operations workspace route/status coverage and sampled denied surfaces at redacted status level.
5. Record evidence, audit review, and acceptance summary.
6. Run scoped validation and Module Run v2 gates.
7. Commit, fast-forward merge to `master`, push `origin/master`, and clean the merged short branch.

## Completion Rule

This task can complete only the `ops_admin` current-session coverage gap. The durable goal remains incomplete until the
full owner-facing checklist has complete redacted pass evidence and remaining repair tasks are closed. Final Pass still
requires fresh approval.
