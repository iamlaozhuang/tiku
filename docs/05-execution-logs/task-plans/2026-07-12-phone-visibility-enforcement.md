# Phone Visibility Runtime Enforcement Plan

**Task:** `user-led-phone-visibility-enforcement-2026-07-12`

**Baseline:** `b5182af3944e0ec6a7974ef3cd4d1ddfa3ef1c57`

## Objective

Implement the accepted phone-visibility policy at the server DTO boundary. List, ordinary detail, session, employee-create, and employee-import outputs must be masked. Qualified operations roles receive a separate, single-record, non-cacheable reveal action and a separately auditable copy-request action.

## Required Reading Completed

- `AGENTS.md`, the code-taste commandments, and ADR-001 through ADR-007, with ADR-002 and ADR-007 applied to this runtime boundary.
- Requirement indexes, advanced-edition authorization requirements, user-auth and operations modules/stories, the full-role UI/UX entry, and the accepted phone-visibility decision plus its evidence/audit.
- Current user/admin/employee/session contracts, mappers, route handlers, repositories, operations UI surfaces, audit-log implementation, and focused regression tests.

## SSOT Read List

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/001-governance-doc-framework.md`
- `docs/02-architecture/adr/002-frontend-backend-boundary.md`
- `docs/02-architecture/adr/003-data-lifecycle-archival.md`
- `docs/02-architecture/adr/004-ai-model-and-rag-boundary.md`
- `docs/02-architecture/adr/005-auth-multi-role-rbac.md`
- `docs/02-architecture/adr/006-ui-structure-and-state-boundary.md`
- `docs/02-architecture/adr/007-edition-aware-authorization.md`
- `docs/01-requirements/00-index.md`
- `docs/01-requirements/advanced-edition/00-index.md`
- `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`
- `docs/01-requirements/modules/01-user-auth.md`
- `docs/01-requirements/modules/06-admin-ops.md`
- `docs/01-requirements/stories/epic-01-user-auth.md`
- `docs/01-requirements/stories/epic-06-admin-ops.md`
- `docs/01-requirements/traceability/2026-07-07-full-role-uiux-source-implementation-entry.md`
- `docs/01-requirements/traceability/2026-07-12-phone-visibility-and-prelaunch-ai-paper-history-decision.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/2026-07-12-phone-visibility-decision.md`
- `docs/05-execution-logs/evidence/2026-07-12-phone-visibility-decision.md`
- `docs/05-execution-logs/audits-reviews/2026-07-12-phone-visibility-decision-audit.md`

## Allowed Scope

- Add one shared server masking mapper; use it at every user or employee DTO egress covered by this policy.
- Keep exact server-side phone search unchanged while returning only a masked display value.
- Add `POST /api/v1/users/{publicId}/reveal-phone` and `POST /api/v1/users/{publicId}/copy-phone`. Both must be authenticated, role-gated, identifier-validated, audit metadata redacted, and returned with `Cache-Control: no-store`.
- Expose the explicit reveal/copy control only to the existing qualified operations user-management view. The revealed value stays in component memory only; it must not be placed in the existing list cache.
- Preserve the existing protected `redeem_code` plaintext path, login input, uniqueness, phone immutability, organization ownership, and employee-import input behavior.

## Blocked Scope

- No schema, migration, data backfill/refresh, fixture/seed change, database direct action, Provider action, environment/credential access, dependency/lockfile change, browser runtime, staging/production/deploy, PR, force push, or Cost Calibration action.
- No legacy AI paper reconstruction or changes to the persisted-snapshot restore rule.
- No broad rewrite of authorization or organization visibility rules. The new reveal route uses the current operations visibility boundary only.

## Implementation And Test Order

1. Add failing unit coverage for default masking, exact search preservation, session and import outputs, no-store reveal responses, copy-request audits, unauthenticated/ineligible/malformed/missing fail-closed cases, and protected redeem-code non-regression.
2. Introduce the shared masking mapper and change contract mappers/repositories so no covered ordinary DTO returns raw phone data.
3. Add the user-level disclosure actions through route handler -> service-owned authorization/audit -> repository raw lookup. Keep raw values internal except in the successful reveal response.
4. Add the small operations user-detail control with explicit reveal and copy gestures. Do not cache or log the revealed value client-side.
5. Update only the full-suite contract assertions which expect ordinary session, profile, user-detail, or admin-account DTOs to return raw phone values; retain raw values only as synthetic inputs and disclosure-route expectations. If the complete concurrent suite exposes an unrelated UI test exceeding its five-second default while the same test passes in isolation, increase that test's local timeout only; do not weaken its assertions or application behavior.
6. Run focused mapper, route, and operations-detail UI tests (including `tests/unit/phase-9-admin-ops-runtime-ui-completion.test.ts`), then full tests, lint, typecheck, format check, build, diff check, two adversarial reviews, self-review, Module Run v2 gates, then commit, ff-only merge, master revalidation, push, and cleanup.

## Risk Defenses

- Reject UI-only masking, cacheable disclosures, list-wide raw values, audit/error/export leakage, role expansion, and client-side unmasking.
- Audit requested copy rather than asserting browser clipboard success. Audit metadata contains no phone value, hash, or full user payload.
- Preserve direct URL fail-closed behavior and existing search semantics. Do not infer new cross-organization access from role names.
- Keep all full-phone test data synthetic and exclude it from evidence, screenshots, and runtime logs.
