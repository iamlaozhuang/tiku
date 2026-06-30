# Repair Auth Mapper Admin Workspace Capability Source Boundary Traceability

## Requirement Linkage

- ADR-007: `effectiveEdition` and advanced capabilities are service-computed from source authorization and upgrade facts.
- Edition-aware authorization requirements: UI visibility is not an authorization boundary; runtime services must enforce
  effective edition and capability checks.
- Unit B finding: `unit-b-auth-mapper-001`.

## Implementation Mapping

| Requirement                                                                  | File                                                                                | Status |
| ---------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- | ------ |
| Role-derived mapper data is not labeled as trusted service-computed org_auth | `src/server/mappers/auth-mapper.ts`                                                 | pass   |
| Mapper test covers session fallback behavior                                 | `src/server/mappers/auth-mapper.test.ts`                                            | pass   |
| Organization admin source contract expects fallback from session mapper      | `tests/unit/organization-admin-standard-advanced-workspace-source-contract.test.ts` | pass   |
| Governance and closeout evidence remain redacted                             | Scoped task plan, evidence, audit, acceptance, state, and queue                     | pass   |

## Non-Goals

- No schema, migration, seed, DB connection, raw row evidence, or direct data inspection.
- No Provider/AI call, provider configuration, prompt, payload, or raw AI I/O.
- No browser/dev-server/e2e/raw DOM/screenshot/trace.
- No package/lockfile/dependency changes.
- No staging/prod/cloud/deploy, release readiness, final Pass, PR, force-push, or Cost Calibration.
