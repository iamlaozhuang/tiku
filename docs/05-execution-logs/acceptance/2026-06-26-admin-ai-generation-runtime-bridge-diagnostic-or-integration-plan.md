# Admin AI Generation Runtime Bridge Diagnostic Or Integration Decision

Task ID: `admin-ai-generation-runtime-bridge-diagnostic-or-integration-plan-2026-06-26`

## Decision

Select a shared admin runtime bridge path. Do not connect content/org admin routes directly to the existing personal Provider bridge as-is.

The future implementation should extract or introduce a shared Provider execution core for reusable Provider metadata, call limits, redacted execution summary, token/cost summary, latency, and failure classification. Content/org admin routes should call that shared core only through an admin-specific runtime bridge adapter and admin-specific contract.

## Rejected Option: Direct Personal Bridge Reuse

Directly wiring admin routes to `PersonalAiGenerationRuntimeBridgeService` or the personal request route is rejected.

Reasons:

- The personal route persistence path rejects non-personal ownership. It expects `authorizationSource: personal_auth`, `ownerType: personal`, no `organizationPublicId`, and personal quota ownership.
- Personal Provider execution context is shaped around personal task inputs such as `aiFuncType`, `questionPublicId`, and `answerRecordPublicId`.
- Admin content routes use platform/content review pool semantics. Organization admin routes use organization ownership and `org_auth` semantics.
- Admin routes already have separate generated result draft persistence and formal-adoption boundaries. Direct personal reuse would blur personal history/quota/result semantics with admin task history.

## Selected Option: Shared Core Plus Admin Runtime Bridge

The selected direction is:

1. Keep admin routes on their own contract and route handlers.
2. Introduce an admin runtime bridge adapter that accepts admin workflow context:
   - `workspace`: `content` or `organization`
   - `generationKind`: question or paper
   - `taskPublicId`
   - `resultPublicId`
   - `ownerType`
   - `ownerPublicId`
   - `organizationPublicId`
   - `requestPublicId`
3. Reuse or extract shared Provider execution primitives from the existing personal Provider execution implementation where they are not personal-specific:
   - Provider/model metadata shape
   - Provider call cap and retry discipline
   - Redacted execution summary
   - Latency and token/cost summary
   - Failure category normalization
   - Provider-disabled blocked outcome pattern
4. Keep admin route production default as provider-disabled until a later approved source task widens the contract and enables controlled Provider execution.

## Admin Contract Direction

The current admin route contract is provider-disabled-only:

- `bridgeStatus: provider_call_blocked`
- `providerCallExecuted: false`
- `envSecretAccessed: false`
- `providerConfigurationRead: false`
- `costCalibrationExecuted: false`

A later source task may widen this contract to represent route-integrated Provider execution, but only under a separately approved implementation boundary. That future contract should distinguish:

- `provider_call_blocked`
- `provider_call_succeeded`
- `provider_call_failed`

The widened contract must continue to expose only redacted Provider summaries. It must not expose raw prompts, raw outputs, API keys, cookies, Authorization headers, raw Provider payloads, or generated content bodies.

## Non-Decisions

This package does not approve:

- Provider credential reads.
- Provider calls.
- Cost calibration execution.
- Staging/prod usage.
- Payment or external service work.
- Deployment or release readiness.
- Formal `question` or `paper` writes.
- DB schema/migration changes.
- Route smoke, browser smoke, or live DB smoke.

## Follow-Up Task Recommendation

Next implementation task:

`admin-ai-generation-shared-runtime-bridge-contract-tdd-2026-06-26`

Recommended scope:

- Add or refactor shared Provider execution contract primitives and an admin runtime bridge contract.
- Keep default admin execution provider-disabled.
- Add focused unit tests around admin bridge input mapping, redaction, blocked default behavior, and status typing.
- Do not call Provider, read credentials, write formal question/paper records, change staging/prod/payment/release readiness, or execute local DB migration without a separate approval package.

Provider route-integrated execution should remain a later approval package after the admin bridge contract exists.

## Result

PASS for docs-only runtime bridge direction decision.

Provider/Cost, formal generated content adoption, staging/prod, payment, deployment, and release readiness remain outside this approval boundary.
