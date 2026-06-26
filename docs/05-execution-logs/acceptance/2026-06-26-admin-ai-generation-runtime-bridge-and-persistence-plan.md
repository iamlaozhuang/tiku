# Admin AI Generation Runtime Bridge And Persistence Plan

Task id: `admin-ai-generation-runtime-bridge-and-persistence-plan-2026-06-26`

Decision type: `docs_only_runtime_bridge_and_persistence_plan`

## Decision Summary

The next admin AI source task should not directly reuse the personal AI generation route.

Approved source direction for the next low-risk implementation task:

- Add an explicit admin runtime bridge contract that remains Provider-disabled by default.
- Reuse the shared Provider execution summary shape and redaction rules from the personal route-integrated Provider
  service.
- Keep real Provider execution injectable only through a later Provider-approved task.
- Keep DB persistence out of the immediate source task unless a separate task approves DB runtime mutation.

## Rationale

Personal AI generation route and repository are personal-context specific:

- `runtimeBridgeControl` exists as an optional dependency in `personal-ai-generation-request-route.ts`.
- `createPersistentRequestInput` rejects non-`personal_auth` and non-`ownerType: personal` requests.
- `personal-ai-generation-request-repository.ts` hardcodes `owner_type: personal` and personal history filters.

Admin AI generation uses different ownership:

- content admin uses platform/content review ownership;
- organization advanced admin uses organization ownership;
- formal adoption remains separate from generated-result creation;
- organization standard admin must remain unavailable or denied.

Directly wiring admin routes through the personal route would mix authorization, ownership, quota, and history semantics.

## Source Task Boundary

Recommended task:

`admin-ai-generation-provider-disabled-runtime-bridge-contract-tdd-2026-06-26`

Allowed product change:

- Extend `AdminAiGenerationLocalContractRuntimeBridgeDto` to carry a redacted execution summary compatible with later
  Provider evidence.
- Add an injectable admin runtime bridge control to `createAdminAiGenerationLocalContractRouteHandlers`.
- Keep production/default admin route behavior Provider-disabled:
  - `providerCallExecuted: false`
  - `envSecretAccessed: false`
  - `providerConfigurationRead: false`
  - `costCalibrationExecuted: false`
- Add focused unit tests proving content/admin and organization/admin local contracts still return summary-only and
  Provider-disabled behavior.

Blocked from the source task:

- Provider calls;
- credential/env reads;
- DB connection or writes;
- schema/migration/seed;
- formal `question`/`paper` adoption;
- browser/e2e/dev-server runtime;
- package/lockfile changes;
- staging/prod/payment/external service.

## Persistence Boundary

Durable persistence is not approved for the immediate source task.

Reason:

- Admin persistence would need platform/organization owner semantics, not the current personal-only repository.
- Even if existing `ai_generation_task` schema can represent platform or organization owner types, enabling route-level
  DB writes is a runtime DB mutation path.
- DB runtime mutation needs a separate task with explicit capability, validation, and redacted evidence.

Recommended later persistence task:

`admin-ai-generation-task-persistence-contract-and-repository-tdd-2026-06-26`

That later task should use fake repository tests first and must separately decide whether existing `ai_generation_task`
is enough or whether isolated review-result storage needs a schema task.

## Provider Boundary

Provider/Cost must not run until after the provider-disabled bridge contract exists and the owner approves a new
Provider/Cost smoke against that product bridge.

The prior Provider smoke proved local model reachability only. It did not prove admin product route integration.

## Formal Adoption Boundary

Formal adoption into `question` or `paper` remains blocked. Generated admin output, when later persisted, must remain an
isolated review draft or organization-owned draft until a governed adoption task is approved.

## Non-Decision Statement

This plan is not source implementation, not DB persistence approval, not Provider readiness, not Cost Calibration Pass,
not formal content adoption approval, not staging/prod readiness, not release readiness, and not final Pass.
