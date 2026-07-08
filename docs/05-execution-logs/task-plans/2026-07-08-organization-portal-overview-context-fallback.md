# 2026-07-08 organization portal overview context fallback

## Scope

- Branch: `codex/organization-portal-overview-context-fallback`.
- Goal: fix `/api/v1/organization-portal-overviews` so the readonly organization portal overview does not fail for a valid organization admin session that has organization context but no service-computed organization capability summary.
- In scope:
  - organization portal overview route admin context resolver;
  - route tests for fallback organization context;
  - redacted evidence and adversarial audit.
- Out of scope:
  - operations write endpoints;
  - employee import/create/update/disable/unbind/password reset;
  - `org_auth` create/update/cancel/upgrade;
  - organization training, analytics, organization AI, Provider, DB schema, migration, seed, fixture, env, dependency, package/lockfile, staging/prod/deploy, Cost Calibration.

## SSOT Read List

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/01-requirements/00-index.md`
- `docs/01-requirements/advanced-edition/00-index.md`
- `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`
- `docs/01-requirements/advanced-edition/modules/04-organization-training.md`
- `docs/01-requirements/traceability/2026-06-24-role-separated-mvp-requirement-alignment.md`
- `docs/01-requirements/traceability/role-experience-fulfillment-matrix.md`
- `docs/01-requirements/traceability/2026-07-02-ui-ux-requirement-design-baseline-gap-analysis.md`
- `docs/01-requirements/traceability/2026-07-02-role-auth-training-ops-decision-package.md`
- `docs/01-requirements/traceability/2026-07-02-current-thread-requirement-reconciliation-ledger.md`
- `docs/01-requirements/traceability/2026-07-07-full-role-ui-remediation-baseline.md`
- `docs/01-requirements/traceability/2026-07-07-full-role-uiux-source-implementation-entry.md`
- `docs/01-requirements/traceability/2026-07-07-full-role-uiux-batch-2-org-admin-workspace.md`
- `docs/05-execution-logs/task-plans/2026-07-08-organization-portal-readonly-overview.md`

## Root Cause

The frontend organization portal allows `/organization/portal` when the session has an organization admin role and an organization context. The newly added overview API requires a stricter service-computed `org_auth` capability summary before it even reads the readonly overview. That makes a valid organization admin portal session fail with a business error before the repository can return a safe readonly overview or a null authorization state.

## Requirement Mapping Result

- `CT-REQ-010`, `CT-REQ-050`, and `CT-REQ-054`: organization admins may view scoped roster/status and authorization/status, while employee and authorization writes remain platform-owned.
- `CT-REQ-055` and ADR-007: advanced-only capabilities still require service-computed effective edition and must not be granted by UI visibility.
- Batch 2 organization admin workspace baseline: the portal is the basic context/status surface for both standard and advanced organization admins.

## Implementation Plan

1. Add a red route test proving an organization admin with organization context but missing capability summary should still reach the readonly overview reader.
2. Change only `organization-portal-overview-route.ts` resolver logic:
   - keep role and organization context required;
   - prefer service-computed capability when available;
   - fallback to session `organizationPublicId` and `effectiveEdition = "standard"` for readonly portal overview only;
   - pass `authorizationPublicId = null` so the repository can resolve active authorization summary without trusting client input.
3. Preserve denials for missing admin role or missing organization context.
4. Run focused portal tests plus adjacent organization guard tests, lint, typecheck, prettier check, diff check, and Module Run v2 gates.

## Risk Controls

- No package/lockfile/dependency changes.
- No DB/schema/migration/seed/fixture changes.
- No Provider/env/staging/prod/deploy work.
- No raw DB rows, internal ids, credentials, session/cookie/token/localStorage, Provider payload, raw prompts, raw AI output, full question/paper/material/resource content in evidence.
- No organization admin mutation permission is added.
- Advanced training/analytics/AI routes remain guarded by service-computed advanced capability checks.
