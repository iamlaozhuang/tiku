# 2026-07-03 System Admin User Management Source Landing Plan

## Task

`system-admin-user-management-source-landing-2026-07-03`

## Required Reads

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/03-standards/ui-code.md`
- `docs/02-architecture/adr/`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/01-requirements/00-index.md`
- `docs/01-requirements/advanced-edition/00-index.md`
- `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`
- `docs/02-architecture/adr/adr-007-edition-aware-authorization-source-of-truth.md`
- `docs/01-requirements/modules/06-admin-ops.md`
- `docs/01-requirements/stories/epic-06-admin-ops.md`
- `docs/01-requirements/traceability/2026-07-02-current-thread-requirement-reconciliation-ledger.md`
- `docs/01-requirements/traceability/2026-07-02-role-auth-training-ops-decision-package.md`
- `docs/01-requirements/traceability/2026-07-02-ui-ux-requirement-design-baseline-gap-analysis.md`
- `docs/01-requirements/traceability/2026-07-03-source-landing-16-package-execution-map.md`

## Source Observations

- Existing `AdminUserOrgAuthOpsBaseline.tsx` already provides an operations workbench shell for users, organizations, authorizations, redeem codes, and admin roles.
- Current user rows are too coarse: they do not expose no-auth, standard, advanced, employee, disabled, or backend-admin categories as first-class filters/status badges.
- Current service DTOs expose public identifiers and basic user status, but not account-domain, phone immutability, no-delete, role-management boundary, or one-time reset-distribution metadata.
- Existing password reset service returns `data: null`; it does not express the first-release one-time distribution window or session-revocation notice.
- Existing admin-role summaries list only super/ops/content roles and do not represent organization admin roles or ops scoped-maintenance boundary.

## Implementation Plan

1. Extend the admin user/org/auth ops contract with user category, account-domain, authorization filter, reset distribution, and organization-admin role scope fields.
2. Expand the local service fixtures to cover no-auth personal, standard personal, advanced personal, employee, disabled, and backend-admin cases.
3. Constrain reset-password behavior so `super_admin` can manage backend-admin credentials, while `ops_admin` cannot manage ops/content admin accounts through this baseline.
4. Render user-management filters, status badges, phone immutable/no-delete guidance, reset distribution window, and role-boundary cues in the existing baseline UI.
5. Update focused unit tests for contract defaults, service/route DTOs, role denial, rendered filters/badges, reset distribution, and no internal ID exposure.

## Boundaries

- No schema, migration, seed, dependency, package/lockfile, Provider call, env secret access, browser/dev-server/e2e, direct DB connection, staging/prod deploy, PR, force push, Cost Calibration, release readiness, final Pass, or production-readiness claim.
- Evidence must not record credentials, sessions, cookies, auth headers, env values, raw DB rows, PII, plaintext `redeem_code`, Provider payloads, raw Prompt/full Prompt text, raw AI IO, raw employee answers, full question/paper/material/resource/chunk content, screenshots, traces, or raw DOM.

## Validation

- `npm.cmd run test:unit -- tests/unit/admin-user-org-auth-ops-baseline.test.ts`
- `npm.cmd run typecheck`
- `npm.cmd run lint`
- `npm.cmd run format:check`
- `git diff --check`
- Module Run v2 pre-commit, closeout, and pre-push readiness gates for this task id.
