# 2026-07-10 0704 Role Routing Auth Context Acceptance Plan

## Task

- taskId: `0704-role-routing-auth-context-acceptance-2026-07-10`
- branch: `codex/0704-role-routing-auth-context-acceptance`
- mode: validation-only source/test acceptance
- target: role landing, workspace routing, personal/organization authorization context selection, organization quota owner labels, no-auth guidance, standard-to-advanced direct-route denial, and admin-to-learner-AI-result denial without source, test, package, lockfile, schema, migration, seed, DB, Provider, browser, staging, prod, deploy, env, secret, screenshot, or raw DOM execution

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
- `docs/01-requirements/stories/epic-01-user-auth.md`
- `docs/01-requirements/stories/epic-03-student-experience.md`
- `docs/01-requirements/stories/epic-06-admin-ops.md`
- `docs/01-requirements/advanced-edition/modules/01-authorization-context.md`
- `docs/01-requirements/advanced-edition/modules/06-ops-authorization-quota.md`
- `docs/01-requirements/advanced-edition/stories/epic-04-ops-authorization-quota-governance.md`
- `docs/01-requirements/traceability/edition-aware-authorization-acceptance-matrix.md`
- `docs/01-requirements/traceability/role-experience-fulfillment-matrix.md`
- `docs/01-requirements/traceability/2026-07-07-full-role-uiux-source-implementation-entry.md`
- `docs/05-execution-logs/acceptance/2026-07-10-0704-post-peripheral-acceptance-ledger.md`
- recent role/admin/auth/non-AI learning evidence/audit records

Private credential handling:

- metadata-only readiness preflight against `D:/tiku-local-private/acceptance/0704-role-credential-index.private.md`
- evidence records role labels, route labels, authorization context categories, status categories, command names, and aggregate test counts only
- credential values remain in memory only and are not written to chat, evidence, audit, logs, or repository files

## Acceptance Standard

Validate these task-13 requirements from the 0704 peripheral ledger and current authorization SSOT:

- each role lands in the correct workspace after login
- personal and organization authorization contexts are explicit when both are available
- organization context controls quota owner, eligible surfaces, route labels, and denial categories
- no-auth users are routed to redemption or support surfaces
- standard users cannot reach advanced capability by direct URL
- admin roles cannot reach learner-only AI result surfaces

## Validation Method

Use source and focused tests only:

- inspect authentication mappers, role routing, workspace layout, capability catalog, authorization context, no-auth guidance, and advanced-denial tests
- run focused role-routing/auth-context tests
- run lint, typecheck, `git diff --check`, and Module Run v2 gates
- no localhost browser login, route read/write, DB access, Provider call, screenshot, raw DOM, staging, prod, deploy, env, or secret operation in this task

## Stop Conditions

Stop and open a separate repair task if validation finds a real source defect such as:

- any role maps to the wrong default workspace or can navigate to an unrelated workspace through direct route
- personal and organization contexts are ambiguous when both are present
- organization employee route labels, quota owner, or eligible surfaces are computed from personal authorization instead of `org_auth`
- no-auth learner is not routed to redemption or support guidance
- standard role can reach advanced capability by direct URL
- admin role can reach learner-only AI result surfaces or raw learner AI content
- source/test failure not attributable to environment or unrelated pre-existing state

## Evidence Boundary

Evidence may record only role labels, route labels, authorization context categories, status categories, source marker categories, command names, and test counts.

Evidence must not record credentials, passwords, session/cookie/token/localStorage/Authorization values, env values, DB URLs, raw DB rows, internal numeric ids, Provider payloads, raw prompts, raw AI input/output, full question/paper/material/resource/chunk content, raw employee answers, screenshots, raw DOM, report snapshots, or plaintext `redeem_code`.
