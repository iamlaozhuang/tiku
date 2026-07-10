# 2026-07-10 0704 Organization Analytics Acceptance Plan

## Task

- taskId: `0704-org-analytics-acceptance-2026-07-10`
- branch: `codex/0704-org-analytics-acceptance`
- mode: validation-only source/test acceptance
- target: 0704 localhost organization analytics closure without source, schema, dependency, DB, Provider, browser, staging, prod, deploy, env, secret, screenshot, or raw DOM execution

## Read Gate

Read before validation:

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/01-requirements/00-index.md`
- `docs/01-requirements/advanced-edition/00-index.md`
- `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`
- `docs/01-requirements/advanced-edition/modules/05-organization-analytics.md`
- `docs/01-requirements/advanced-edition/stories/epic-03-employee-answer-statistics.md`
- `docs/01-requirements/traceability/2026-07-02-role-auth-training-ops-decision-package.md`
- `docs/01-requirements/traceability/2026-07-02-current-thread-requirement-reconciliation-ledger.md`
- `docs/01-requirements/traceability/2026-07-02-ui-ux-requirement-design-baseline-gap-analysis.md`
- `docs/01-requirements/traceability/2026-07-07-full-role-uiux-source-implementation-entry.md`
- `docs/05-execution-logs/acceptance/2026-07-10-0704-post-peripheral-acceptance-ledger.md`
- recent organization admin/training and organization analytics evidence/audit records

Private credential handling:

- metadata-only readiness preflight against `D:/tiku-local-private/acceptance/0704-role-credential-index.private.md`
- evidence records role labels and status categories only
- credential values remain in memory only and are not written to chat, evidence, audit, logs, or repository files

## Acceptance Standard

Validate these task-10 requirements from the 0704 peripheral ledger and current organization analytics SSOT:

- organization overview, training detail, employee summary, date filters, empty states, and small-sample warning categories behave as specified
- analytics are organization-scoped
- enterprise training metrics stay separate from formal `practice` / `mock_exam` aggregate signals
- organization admins see summaries/status only, not employee raw answers or raw AI content
- enterprise AI quota consumption summary remains hidden from organization admins in first release
- export remains unavailable in first release

## Validation Method

Use source and focused tests only:

- inspect organization analytics contract, model, mapper, validator, route, service, repository, UI entry, and organization admin entry tests
- run focused organization analytics tests
- run lint, typecheck, `git diff --check`, and Module Run v2 gates
- no localhost browser login unless a later task-specific approval changes the boundary

## Stop Conditions

Stop and open a separate repair task if validation finds a real source defect such as:

- raw employee answer or raw learner AI content exposure
- enterprise AI quota summary visible to organization admins
- formal learning aggregate signals mixed into enterprise-training metrics
- missing advanced-only organization admin boundary
- cross-organization analytics visibility
- source/test failure not attributable to environment or unrelated pre-existing state

## Evidence Boundary

Evidence may record only role labels, route labels, status categories, source marker categories, command names, and test counts.

Evidence must not record credentials, passwords, session/cookie/token/localStorage/Authorization values, env values, DB URLs, raw DB rows, internal numeric ids, Provider payloads, raw prompts, raw AI input/output, full question/paper/material/resource/chunk content, raw employee answers, screenshots, raw DOM, or plaintext `redeem_code`.
