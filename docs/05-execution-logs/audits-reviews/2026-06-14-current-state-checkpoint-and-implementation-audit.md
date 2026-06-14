# Audit Review: current-state-checkpoint-and-implementation-audit

Decision: APPROVE_AUDIT_ARTIFACT_WITH_IMPLEMENTATION_FINDINGS

## Findings

### P1 - Static personal AI request identifiers can collide and block durable request creation

The student page sends fixed `requestPublicId`, `taskPublicId`, and `idempotencyKeyHash` values from a module-level
draft (`src/features/student/ai-generation/StudentPersonalAiGenerationPage.tsx:96`) and copies that fixed draft into
every POST body (`src/features/student/ai-generation/StudentPersonalAiGenerationPage.tsx:139`). The repository reuses
rows by owner/idempotency (`src/server/repositories/personal-ai-generation-request-repository.ts:138`) and the database
also has global unique indexes on task `public_id` and `request_public_id`
(`src/db/schema/ai-rag.ts:392`). The insert conflict target only covers owner/idempotency
(`src/server/repositories/personal-ai-generation-request-repository.ts:252`), so another user or a new submission with
the same public ids can hit a global unique violation that is not handled by that conflict clause. The route then catches
persistence errors and falls back to the original local payload (`src/server/services/personal-ai-generation-request-route.ts:265`),
so the UI can receive success without a durable request.

Impact: the current UI cannot reliably create multiple independent personal AI requests, and cross-user submissions can
degrade into unpersisted local responses.

### P1 - Personal request API does not enforce personal user type before applying personal ownership semantics

`createPersonalAiGenerationRequestUserResolver` rejects only null user types
(`src/server/services/personal-ai-generation-request-route.ts:306`) and then returns the session user public id. The
local browser request builder later stamps `authorizationSource: "personal_auth"`, `ownerType: "personal"`, and
`quotaOwnerType: "personal"` (`src/server/services/personal-ai-generation-request-route.ts:152`). Current tests cover a
missing user context (`src/server/services/personal-ai-generation-request-route.test.ts:252`), but there is no negative
coverage for an authenticated `employee` session.

Impact: an employee session can potentially enter a personal-auth request path and be recorded under personal ownership
semantics unless a downstream policy blocks it. That is a business authorization boundary issue.

### P2 - Persistence failures are masked as successful local contract responses

`createRequestInputWithPersistentRequestMetadata` catches repository errors and returns the original input
(`src/server/services/personal-ai-generation-request-route.ts:265`). The route then builds and returns a standard success
local browser experience. This behavior is explicitly covered by a unit test expecting `code: 0` after a persistence
error (`src/server/services/personal-ai-generation-request-route.test.ts:669`).

Impact: users and follow-up automation can see an accepted local request even when no history row was created. This is
acceptable for a smoke/demo path only if the UI explicitly labels it as non-durable; it is risky for a real request flow.

### P3 - Mock provider constructs a secret-like provider payload before redaction

The local mock provider returns a provider request payload with a secret-like key field
(`src/ai/mock-provider.ts:46`). The runtime passes provider payloads through `createAiCallLogRedactedSnapshots`
(`src/server/services/ai-mock-provider-runtime.ts:50`), and the redactor treats secret-like keys as redacted snapshots
(`src/server/models/ai-rag.ts:379`). Current tests verify redaction in API/evidence surfaces.

Impact: no API leakage was found in this read-only audit, but keeping a secret-shaped payload in the mock path increases
the chance that a future real adapter or diagnostic log reuses the unsafe shape.

## Status Classification

- Implemented:
  - Standard API envelopes for the personal AI request route.
  - Session-backed GET/POST route surface for local personal AI request history and local browser experience.
  - Redacted request history DTOs with public ids only.
  - Draft result persistence with redacted references and formal adoption blocked by default.
  - Admin content review gate for formal adoption, with redacted audit evidence.
  - UI loading, empty, error, unauthorized, history, and local contract states.
- Partially implemented:
  - Personal AI generation is `local_contract_only`; it has no real provider-backed generation worker in this surface.
  - Persistence exists but can silently degrade to a non-durable success response.
  - UI request input is static and not a real user-selected generation request.
  - Formal adoption review records a gate, not target writes.
- Not implemented:
  - Real staging/provider/deploy execution.
  - Real provider quota/smoke outside prior approved local evidence.
  - Formal writes into business target resources.
  - Production release readiness.
- Blocked by governance:
  - env/secret access, provider configuration/calls, package/lockfile changes, schema/migration, e2e execution,
    staging/prod/cloud/deploy/payment/external-service operations, PR creation, force-push, and further Cost Calibration.

## Test Coverage Gaps

- Add a unit test that submits the student personal AI action twice and expects unique request/task/idempotency metadata
  when the flow is promoted beyond local contract mode.
- Add a repository/route regression test for cross-user public-id collision behavior.
- Add a route test proving an `employee` session cannot submit a personal-auth request unless a future requirement
  explicitly allows that path.
- Add a test that distinguishes persistence failure from durable acceptance before this endpoint is treated as a real
  task creation API.
- E2E was not executed in this task and remains outside the approved boundary.
- Provider, staging, deploy, env/secret, and Cost Calibration validation remain out of scope.

## High-Risk Boundary Review

- `.env.local`, `.env.*`, real secret files, and provider configuration files were not read.
- No raw provider payload, raw provider response, raw prompt, raw generated answer, database URL, row data, API key,
  Authorization header, token, password, production data, or customer/customer-like private content is recorded here.
- No provider call, model request, quota use, schema/migration, dependency, staging/prod/cloud/deploy/payment,
  external-service, PR, force-push, e2e, or source/test/script fix was performed.

## Follow-Up Recommendations

- Seed a focused implementation task for dynamic personal AI request identifiers and durable submission semantics.
- Seed a focused authorization task for personal-vs-employee request boundaries.
- Decide whether persistence failure should return a non-zero error before the personal AI route leaves local contract
  mode.
- Keep real staging/provider/deploy tasks blocked until a fresh prompt names exact resources, commands, quotas, evidence
  fields, and stop conditions.

## Validation Review

- `Test-GitCompletionReadiness`: pass.
- `git diff --check`: pass.
- `npm.cmd run lint`: pass.
- `npm.cmd run typecheck`: pass.
- `npm.cmd run test:unit`: pass, 253 test files and 933 tests.
- Module Run v2 precommit hardening: pass, all 5 changed files were in scope.
- Module Run v2 closeout readiness: pass after evidence anchor repair.
- Module Run v2 pre-push readiness: pass on the short branch.
