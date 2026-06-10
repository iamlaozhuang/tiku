# Batch 101 Authorization Read Model Display Contracts Implementation Plan

**Task id:** `batch-101-authorization-and-access-authorization-read-model-and-display-contrac`

**Branch:** `codex/module-run-v2-autopilot-2026-06-10`

**Task kind:** `implementation`

**Goal:** Add local advanced `authorization` read-model and display contract fields to the existing effective authorization runtime without changing schema, dependencies, provider behavior, or real permission enforcement.

**Architecture:** Keep ADR-002 layering intact. Repository row contracts expose only existing local fields, service code computes local display context, mapper produces API-safe camelCase DTOs, and the existing route remains a thin envelope over the service.

**Tech Stack:** TypeScript, Next.js route handler contract, existing Vitest setup, existing API response envelope, no new dependency.

---

## Sources Read

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/adr-001-tech-stack-selection.md`
- `docs/02-architecture/adr/adr-002-runtime-architecture-and-multi-client-contract.md`
- `docs/02-architecture/adr/adr-003-workplace-desktop-web-compatibility.md`
- `docs/02-architecture/adr/adr-004-environment-isolation-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-005-staging-architecture-and-release-boundaries.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/04-agent-system/sop/automated-advancement-governance.md`
- `docs/04-agent-system/sop/task-lifecycle-governance.md`
- `docs/04-agent-system/sop/local-first-validation-governance.md`
- `docs/04-agent-system/sop/dependency-introduction-gate.md`
- `docs/superpowers/plans/2026-06-06-advanced-edition-auth-context-implementation-plan.md`
- `docs/05-execution-logs/task-plans/2026-06-07-phase-69-advanced-authorization-context-implementation-planning.md`
- `docs/05-execution-logs/evidence/2026-06-07-phase-69-advanced-authorization-context-implementation-planning.md`
- `docs/05-execution-logs/audits-reviews/2026-06-07-phase-69-advanced-authorization-context-implementation-planning.md`
- `src/server/contracts/effective-authorization-contract.ts`
- `src/server/mappers/effective-authorization-mapper.ts`
- `src/server/services/effective-authorization-service.ts`
- `src/server/repositories/effective-authorization-repository.ts`
- `src/server/services/effective-authorization-route.ts`
- `src/server/repositories/student-authorization-redeem-runtime-repository.ts`

## Scope

Allowed implementation files:

- `src/server/contracts/effective-authorization-contract.ts`
- `src/server/services/effective-authorization-service.ts`
- `src/server/services/effective-authorization-service.test.ts`
- `src/server/services/effective-authorization-route.test.ts`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/**`
- `docs/05-execution-logs/evidence/**`
- `docs/05-execution-logs/audits-reviews/**`

Blocked surfaces:

- `.env.local`, `.env.example`
- `package.json`, lockfiles
- `src/db/schema/**`, `drizzle/**`
- Provider calls, env/secret reads, staging/prod/cloud/deploy, payment, external-service work
- Cost Calibration Gate

## Implementation Steps

1. Write failing service tests in `src/server/services/effective-authorization-service.test.ts` for:
   - `authorizationContexts` shape with camelCase fields.
   - personal context with personal owner and quota owner.
   - `org_auth` context with organization owner, organization public id, and organization quota owner.
   - personal advanced context enables AI question and AI `paper` display capabilities when local production enablement is explicitly configured in test options.
   - personal standard context keeps advanced capabilities false.
   - missing local production enablement returns `blockedReason: production_enablement_blocked` for advanced AI capabilities.
2. Run targeted service test and confirm RED:
   - `npm.cmd run test:unit -- src/server/services/effective-authorization-service.test.ts`
3. Write route contract test in `src/server/services/effective-authorization-route.test.ts` proving the existing `/api/v1/authorizations` response envelope can carry `authorizationContexts` while preserving unauthenticated `401001`.
4. Run targeted route test:
   - `npm.cmd run test:unit -- src/server/services/effective-authorization-route.test.ts`
5. Implement the minimal contract additions in `src/server/contracts/effective-authorization-contract.ts`:
   - `EffectiveAuthorizationEdition`
   - owner/quota owner types
   - `EffectiveAuthorizationCapabilitiesDto`
   - `EffectiveAuthorizationContextDto`
   - additive `authorizationContexts` list on `EffectiveAuthorizationListDto`
6. Implement context construction inside `src/server/services/effective-authorization-service.ts` so the task stays within queue `allowedFiles`.
7. Extend `createEffectiveAuthorizationService` with a local advanced-capability option. The default remains blocked for production enablement, so runtime does not invent production quota or provider defaults.
8. Add a minimal `phase-69` evidence anchor repair if the task-declared auto-seed readiness command requires source evidence anchors already represented by queue and matrix metadata.
9. Run targeted mapper, service, and route tests until GREEN.
10. Run task validation commands:
    - `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ImplementationAutoSeedReadiness.ps1 -TaskId phase-69-advanced-authorization-context-implementation-planning -CandidateTaskId batch-101-authorization-and-access-authorization-read-model-and-display-contrac`
    - `npm.cmd run lint`
    - `npm.cmd run typecheck`
    - `npm.cmd run test:unit -- src/server/mappers/effective-authorization-mapper.test.ts src/server/services/effective-authorization-service.test.ts src/server/services/effective-authorization-route.test.ts`
    - `git diff --check`
11. Write evidence to `docs/05-execution-logs/evidence/batch-101-authorization-and-access-authorization-read-model-and-display-contrac.md`.
12. Create audit review at `docs/05-execution-logs/audits-reviews/batch-101-authorization-and-access-authorization-read-model-and-display-contrac.md`.

## Risk Defenses

- Preserve existing `/api/v1/authorizations` list behavior; `authorizationContexts` is additive.
- Use public ids only; do not expose auto-increment ids.
- Keep `personal_auth` and `org_auth` distinct.
- Store missing production configuration as `production_enablement_blocked`, not as a placeholder production value.
- Do not add dependencies, schema, migrations, provider calls, env/secret changes, or cloud/deploy changes.
- Evidence must be redacted and must not contain plaintext `redeem_code`, prompts, provider payloads, secrets, tokens, full `paper` content, or employee private answer detail.

## Stop Conditions

Stop before editing further if implementation requires schema/migration work, dependency changes, provider/env/secret access, staging/prod/cloud/deploy work, real permission model changes, external services, Cost Calibration Gate execution, or files outside the allowed task scope.
