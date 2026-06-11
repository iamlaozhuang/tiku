# Task Plan: batch-110-personal-learning-ai-local-transport-contract

## Task

- id: `batch-110-personal-learning-ai-local-transport-contract`
- branch: `codex/batch-110-personal-ai-transport-contract`
- task kind: `implementation`
- local validation level: `L4 local transport/API/contract`

## Context Read

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/04-agent-system/state/advanced-edition-domain-module-run-matrix.yaml`
- `docs/04-agent-system/state/mechanism-source-of-truth-index.yaml`
- `docs/superpowers/specs/2026-06-06-advanced-edition-mvp-requirements.md`
- `docs/superpowers/specs/2026-06-06-advanced-edition-ops-config-contract.md`
- `docs/superpowers/plans/2026-06-06-advanced-edition-requirements-to-implementation-handoff.md`
- `docs/superpowers/plans/2026-06-06-advanced-edition-doc-source-of-truth-index.md`
- `docs/superpowers/plans/2026-06-06-advanced-edition-personal-ai-generation-implementation-plan.md`
- `docs/05-execution-logs/task-plans/2026-06-11-batch-109-personal-learning-ai-local-transport-contract-planning.md`
- `docs/05-execution-logs/evidence/batch-109-personal-learning-ai-local-transport-contract-planning.md`
- `docs/05-execution-logs/audits-reviews/batch-109-personal-learning-ai-local-transport-contract-planning.md`
- `src/server/models/personal-ai-generation-request.ts`
- `src/server/contracts/personal-ai-generation-request-contract.ts`
- `src/server/validators/personal-ai-generation-request.ts`
- `src/server/services/personal-ai-generation-request-service.ts`
- `src/server/services/personal-ai-generation-request-service.test.ts`
- route patterns in `src/server/services/student-paper-route.ts`, `src/server/services/practice-route.ts`, and
  `src/server/services/redeem-code-route.ts`
- App Router export pattern in `src/app/api/v1/student-papers/route.ts`
- `superpowers:test-driven-development`

## Goal

Implement the local-only L4 transport/API contract for personal AI generation request read-model creation:

```text
POST /api/v1/personal-ai-generation-requests
```

The route must remain a thin adapter over `buildPersonalAiGenerationRequestReadModel`. It must derive `userPublicId`
from a local user resolver and must not trust body-provided `userPublicId`.

## Allowed Files

- `src/server/services/personal-ai-generation-request-route.ts`
- `src/server/services/personal-ai-generation-request-route.test.ts`
- `src/app/api/v1/personal-ai-generation-requests/route.ts`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/**`
- `docs/05-execution-logs/evidence/**`
- `docs/05-execution-logs/audits-reviews/**`

## Blocked Files And Work

- package or lockfile changes
- schema, migration, `src/db/schema/**`, or `drizzle/**`
- env/secret reads or writes
- provider calls, provider configuration, provider cost measurement, or Cost Calibration Gate
- e2e execution or e2e file changes
- staging, prod, cloud, deploy, payment, external-service, destructive DB, PR, or force push
- raw prompts, raw AI output, provider payloads, Authorization headers, database rows, plaintext `redeem_code`, full
  `paper`, or full `material` content in evidence

Cost Calibration Gate remains blocked.

## TDD Plan

### RED

Create `src/server/services/personal-ai-generation-request-route.test.ts` first and run:

```powershell
npm.cmd run test:unit -- src/server/services/personal-ai-generation-request-route.test.ts
```

Expected failure: module `./personal-ai-generation-request-route` does not exist.

Test behaviors:

1. `POST` merges resolver-provided `userPublicId` with the request body and returns the redacted standard envelope.
2. Missing user context returns `401001` and ignores any body-provided user id.
3. Serialized success output excludes numeric `id`, body-provided `userPublicId`, raw prompt, raw answer, generated
   content, token, and plaintext `redeem_code`.
4. Invalid `aiFuncType: "scoring"` returns `400011`.

### GREEN

Add `src/server/services/personal-ai-generation-request-route.ts` with:

- `PersonalAiGenerationRequestUserResolver`
- `createPersonalAiGenerationRequestRouteHandlers(resolveUserContext)`
- `createUnavailablePersonalAiGenerationRequestUserResolver()`
- local `readRequestJson` and `createJsonResponse` helpers following existing route conventions
- `createRouteHandlerWithErrorEnvelope` wrapping the `POST` handler

Add `src/app/api/v1/personal-ai-generation-requests/route.ts` exporting `POST` from the local route handlers with the
unavailable resolver, preserving the standard `401001` response until a runtime session resolver is wired.

### REFACTOR

Keep the adapter minimal. Avoid new abstractions unless the route tests expose duplication that exists inside the new
file only.

## Risk Defense

- No database write, repository call, provider call, or AI generation execution.
- Public identifiers only.
- Body JSON parse failure becomes invalid input through the existing service validator.
- Route response keeps the project standard envelope `{ code, message, data }`.
- API path uses `/api/v1/`, plural kebab-case resource naming, and no numeric id URL segment.

## Validation Commands

1. `npm.cmd run test:unit -- src/server/services/personal-ai-generation-request-route.test.ts`
2. `npm.cmd run lint`
3. `npm.cmd run typecheck`
4. `git diff --check`
5. `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId batch-110-personal-learning-ai-local-transport-contract`
6. `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId batch-110-personal-learning-ai-local-transport-contract`
7. `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId batch-110-personal-learning-ai-local-transport-contract`

## Stop Conditions

- Implementation requires any blocked file or high-risk surface.
- Focused unit test requires dependency changes.
- Local route requires real session, provider, DB, or env access.
- Changed files exceed batch110 `allowedFiles`.
- Remote divergence appears before closeout.
