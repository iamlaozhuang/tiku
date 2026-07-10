# 2026-07-10 0704 API Route Boundary Acceptance Plan

## Task

- taskId: `0704-api-route-boundary-acceptance-2026-07-10`
- branch: `codex/0704-api-route-boundary-acceptance`
- mode: validation-only source/test acceptance
- target: direct URL/API authorization boundaries for standard-to-advanced escalation, cross-organization access, employee-to-admin access, organization-admin-to-operations/content/model/log access, expired/disabled/stale-session enforcement, and safe error envelopes without source, test, package, lockfile, schema, migration, seed, DB, Provider, browser, staging, prod, deploy, env, secret, screenshot, or raw DOM execution

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
- `docs/01-requirements/modules/01-user-auth.md`
- `docs/01-requirements/modules/03-student-experience.md`
- `docs/01-requirements/modules/06-admin-ops.md`
- `docs/01-requirements/advanced-edition/modules/01-authorization-context.md`
- `docs/01-requirements/advanced-edition/modules/04-organization-training.md`
- `docs/01-requirements/advanced-edition/modules/05-organization-analytics.md`
- `docs/01-requirements/advanced-edition/modules/06-ops-authorization-quota.md`
- `docs/01-requirements/traceability/edition-aware-authorization-acceptance-matrix.md`
- `docs/01-requirements/traceability/role-experience-fulfillment-matrix.md`
- `docs/05-execution-logs/acceptance/2026-07-10-0704-post-peripheral-acceptance-ledger.md`
- recent role-routing, organization admin surface, organization tree, model/log governance, audit/privacy evidence/audit records

Private credential handling:

- metadata-only readiness preflight against `D:/tiku-local-private/acceptance/0704-role-credential-index.private.md`
- evidence records role labels, route labels, boundary categories, status categories, command names, and aggregate test counts only
- credential values remain in memory only and are not written to chat, evidence, audit, logs, or repository files

## Acceptance Standard

Validate these task-14 requirements from the 0704 peripheral ledger and current authorization SSOT:

- direct URL/API calls deny standard-to-advanced escalation
- cross-organization training, employee, analytics, and resource access is denied or empty by category
- employee-to-admin, organization-admin-to-operations, organization-admin-to-content, and organization-admin-to-model/log access is denied
- expired authorization, disabled account, disabled organization, and stale session cannot bypass service-layer checks
- error bodies do not leak internal paths, stack traces, SQL, Provider details, or raw sensitive content

## Validation Method

Use source and focused tests only:

- inspect route guards, route handlers, role capability checks, organization scope checks, error response helpers, and route tests
- run focused API/route boundary tests
- run lint, typecheck, `git diff --check`, and Module Run v2 gates
- no localhost browser/API probing, no direct DB, no Provider, no credential/session capture, no staging/prod/deploy/env/secret action

## Stop Conditions

Stop and open a separate repair task if validation finds a real source defect such as:

- standard roles can reach advanced route handlers by direct call
- cross-organization route checks return foreign data instead of deny/empty status categories
- employee sessions can call admin route handlers
- organization admins can call operations, content, model, or global log route handlers
- disabled/expired/stale session status is not checked at service/route boundary
- error responses expose internal path, stack, SQL, Provider details, raw prompt/output, full content, credentials, or internal identifiers
- source/test failure not attributable to environment or unrelated pre-existing state

## Evidence Boundary

Evidence may record only role labels, route labels, boundary categories, status categories, source marker categories, command names, and test counts.

Evidence must not record credentials, passwords, session/cookie/token/localStorage/Authorization values, env values, DB URLs, raw DB rows, internal numeric ids, Provider payloads, raw prompts, raw AI input/output, full question/paper/material/resource/chunk content, raw employee answers, screenshots, raw DOM, report snapshots, or plaintext `redeem_code`.
