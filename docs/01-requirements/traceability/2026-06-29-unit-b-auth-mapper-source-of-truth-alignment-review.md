# Unit B Auth Mapper Source Of Truth Alignment Review Traceability

## Source Requirements

| Source                                                                                                      | Requirement                                                                                       |
| ----------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| `docs/02-architecture/adr/adr-007-edition-aware-authorization-source-of-truth.md`                           | `effectiveEdition` is service-computed and derived, not a UI/session source-of-truth replacement. |
| `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`                         | Runtime services enforce capability checks below UI visibility.                                   |
| `docs/05-execution-logs/evidence/2026-06-29-security-unit-b-auth-role-boundary-static-review.md`            | Session/auth mapper alignment was deferred and must be separately reviewed.                       |
| `docs/05-execution-logs/evidence/2026-06-29-detail-security-local-continuation-approval-materialization.md` | Unit B auth mapper read-only review is centrally approved after task-level materialization.       |

## Review Matrix

| Surface                                        | Review status              | Redacted observation                                                                                                                            |
| ---------------------------------------------- | -------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/server/mappers/auth-mapper.ts`            | candidate risk             | Projects organization workspace capability from admin role and organization public id while labeling it `service_computed`.                     |
| `src/server/contracts/auth-contract.ts`        | covered                    | DTO can carry capability summary without exposing raw DB rows, internal ids, or session token in auth context.                                  |
| Admin workspace role guard contract            | covered                    | Guard rejects `session_fallback` and missing `org_auth` summaries for advanced organization routes.                                             |
| Server services consuming capability summaries | covered with mapper caveat | Analytics, AI generation, and training routes require service-computed capability summary, but trust the mapper label.                          |
| Focused tests covering fallback summaries      | candidate risk             | Tests cover fallback rejection, but one source contract test currently asserts mapper-produced role-derived summary as service-side capability. |

## Follow-Up Task Split

- Task id: `repair-auth-mapper-admin-workspace-capability-source-boundary-2026-06-29`.
- Status: pending task materialization under centralized local security repair authorization.
- Planned minimal source/test surface:
  - `src/server/mappers/auth-mapper.ts`
  - `src/server/mappers/auth-mapper.test.ts`
  - `tests/unit/organization-admin-standard-advanced-workspace-source-contract.test.ts`
- No source/test repair is authorized by this review task.
