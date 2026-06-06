# Advanced Edition Authorization Context Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Extend the existing effective `authorization` runtime into an advanced edition authorization context that future AI generation, organization training, and operations flows can consume safely.

**Architecture:** Keep the existing Next.js monolith layering: route handlers / server actions -> service -> repository -> model. The new context must be computed in the service layer, backed by repository rows, mapped to API DTOs, and never expose auto-increment ids, plaintext `redeem_code`, prompt text, provider payload, or employee-sensitive detail.

**Tech Stack:** TypeScript, existing API response contract, existing session runtime, existing effective authorization repository/service patterns, Vitest unit tests, no new dependency.

---

## Current Code Facts

- Existing public endpoint: `src/app/api/v1/authorizations/route.ts`.
- Existing route handler: `src/server/services/effective-authorization-route.ts`.
- Existing service: `src/server/services/effective-authorization-service.ts`.
- Existing repository contract: `src/server/repositories/effective-authorization-repository.ts`.
- Existing DTOs: `src/server/contracts/effective-authorization-contract.ts`.
- Existing mapper: `src/server/mappers/effective-authorization-mapper.ts`.
- Existing runtime composition: `src/server/services/student-authorization-redeem-runtime.ts`.
- Existing student paper authorization scope logic already merges `personal_auth` and `org_auth` by `profession + level`.

The existing code can list active `personal_auth` and `org_auth`, but it does not yet expose:

- `effectiveEdition`;
- advanced capability flags;
- `authorizationSource`;
- `authorizationPublicId`;
- `ownerType`;
- `ownerPublicId`;
- `organizationPublicId`;
- `quotaOwnerType`;
- `quotaOwnerPublicId`;
- organization scope visibility for organization admin and employee flows;
- blocked capability state when production configuration is missing.

## Future File Structure

Future implementation should keep changes narrow:

- Modify: `src/server/contracts/effective-authorization-contract.ts`
  - Add advanced context DTOs or export shared authorization context types.
- Modify: `src/server/repositories/effective-authorization-repository.ts`
  - Add row fields needed to compute edition, role, employee, organization, and upgrade state.
- Modify: `src/server/services/effective-authorization-service.ts`
  - Add service method for advanced authorization context resolution.
- Modify: `src/server/mappers/effective-authorization-mapper.ts`
  - Map advanced context rows into API-safe camelCase DTOs.
- Modify: `src/server/services/effective-authorization-route.ts`
  - Expose the new context through the existing authorizations runtime if a REST surface is required.
- Modify: `src/server/services/student-authorization-redeem-runtime.ts`
  - Wire repository and service dependencies without changing session semantics.
- Test: `src/server/services/effective-authorization-service.test.ts`
  - Add service-level context cases.
- Test: `src/server/mappers/effective-authorization-mapper.test.ts`
  - Add DTO mapping and redaction cases.
- Test: `tests/unit/phase-31-advanced-edition-auth-context-implementation.test.ts`
  - Add runtime-level acceptance coverage if route behavior changes.

Do not modify in this task group unless separately approved:

- `src/db/schema/**`
- `drizzle/**`
- package or lock files
- env/secret files
- provider runtime files

## Data Contract Shape

The future DTO should preserve the existing effective authorization list and add a context collection for capability checks.

Required fields for each context item:

| Field                   | Meaning                                                                                                           |
| ----------------------- | ----------------------------------------------------------------------------------------------------------------- |
| `profession`            | Authorized profession.                                                                                            |
| `level`                 | Authorized level.                                                                                                 |
| `effectiveEdition`      | `standard` or `advanced` after applying valid `auth_upgrade`.                                                     |
| `authorizationSource`   | `personal_auth` or `org_auth`.                                                                                    |
| `authorizationPublicId` | Public id of the effective source.                                                                                |
| `ownerType`             | `personal`, `organization`, or `platform`.                                                                        |
| `ownerPublicId`         | Public id of the data owner.                                                                                      |
| `organizationPublicId`  | Owning organization public id for `org_auth`; `null` for personal context.                                        |
| `quotaOwnerType`        | `personal`, `organization`, or `platform`.                                                                        |
| `quotaOwnerPublicId`    | Public id of the quota owner.                                                                                     |
| `capabilities`          | Booleans for first-release advanced capabilities.                                                                 |
| `blockedReason`         | `null` when usable; otherwise a stable reason such as `authorization_missing` or `production_enablement_blocked`. |

First-release capability names:

- `canGenerateAiQuestion`
- `canGenerateAiPaper`
- `canCreateOrganizationTraining`
- `canAnswerOrganizationTraining`
- `canViewOrganizationTrainingSummary`
- `canManageAuthorizationQuota`

## Service Rules

- `personal_auth` can create personal AI question and personal AI `paper` contexts only when `effectiveEdition = advanced`.
- `org_auth` can create organization-owned contexts only for users inside the authorized `organization` scope.
- Organization admin contexts must include organization visibility scope but must not include employee private AI task detail.
- Employee contexts must bind `organizationPublicId` and quota owner to the organization authorization source when using enterprise quota.
- Platform operations admin context can manage `authorization`, `redeem_code`, quota package, and quota ledger governance, but cannot receive plaintext `redeem_code`.
- Platform content teacher context can adopt AI drafts into formal `question` / `paper` workflows but cannot manage quota or employee privacy data.
- Missing production default values must produce blocked capability state, not a placeholder production value.
- `Cost Calibration Gate` remains blocked and must not be used to infer production quota or cost defaults.

## Test Plan

### Service Tests

- Personal advanced user receives `canGenerateAiQuestion = true` and `canGenerateAiPaper = true`.
- Personal standard user receives those advanced capability flags as false.
- Employee with valid `org_auth` receives `authorizationSource = org_auth`, `ownerType = organization`, and `quotaOwnerType = organization`.
- Employee outside the organization scope receives blocked context.
- Organization admin receives organization management capabilities but no employee detail capability.
- Platform operations admin receives `canManageAuthorizationQuota = true`.
- Plaintext `redeem_code`, prompt text, provider payload, secret, token, and numeric ids are absent from DTOs.
- Missing production configuration yields `blockedReason = production_enablement_blocked` for affected AI capabilities.

### Mapper Tests

- Mapping uses camelCase fields only.
- `personal_auth` maps `organizationPublicId` to `null`.
- `org_auth` maps organization public id and name without numeric ids.
- Capability flags remain explicit booleans.
- Empty optional values are `null`, not omitted.

### Runtime Tests

- Existing `/api/v1/authorizations` list behavior remains backward compatible.
- New context behavior, if exposed through the same runtime, uses standard `{ code, message, data }`.
- Unauthenticated requests return the existing `401001` session-required response.
- Admin user with no student user type must not be treated as a student context.

## Implementation Order

1. Add failing service tests for personal advanced, personal standard, employee org, organization admin, and operations admin contexts.
2. Add failing mapper tests for DTO shape and redaction.
3. Extend contract types with advanced context DTOs.
4. Extend repository row contracts with only the fields required by the service tests.
5. Implement service context resolution without adding production defaults.
6. Implement mapper behavior.
7. Wire route/runtime only after service and mapper tests pass.
8. Run unit tests for changed service, mapper, and runtime files.
9. Run `npm.cmd run lint` and `npm.cmd run typecheck`.
10. Write evidence before commit.

## Blocked Work

- Database schema and migration work require a separate implementation task and approval if migration is needed.
- Real provider calls remain blocked.
- Production quota point values and behavior cost point values remain blocked.
- env/secret, staging/prod/cloud/deploy, payment, and external service work remain blocked.

## Handoff To Next Plan

After this plan is accepted, the next detailed plan should be `phase-31-advanced-edition-ai-task-domain-implementation-plan`, because AI task ownership, quota owner snapshots, and blocked capability states depend on this authorization context.
