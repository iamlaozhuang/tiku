# Batch 189 Authorization Read Model And Display Contract Plan

## Scope

- Task: `batch-189-authorization-and-access-authorization-read-model-and-display-contrac`
- Target closure: authorization read-model and display contracts.
- Execution profile: `local_unit_tdd`
- Allowed code surfaces: `src/server/models/**`, `src/server/contracts/**`, `src/server/validators/**`, `src/server/services/**`.
- Blocked surfaces: `.env*`, package and lock files, `src/db/schema/**`, `drizzle/**`, provider/model calls, staging/prod/cloud/deploy/payment/external-service, PR, force push, and Cost Calibration Gate.

## Read Standards

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/adr-001-tech-stack-selection.md`
- `docs/02-architecture/adr/adr-002-runtime-architecture-and-multi-client-contract.md`
- `docs/02-architecture/adr/adr-003-workplace-desktop-web-compatibility.md`
- `docs/02-architecture/adr/adr-004-environment-isolation-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-005-staging-architecture-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-006-runtime-dependency-alignment.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/04-agent-system/state/execution-profiles.yaml`
- `docs/04-agent-system/state/mechanism-source-of-truth-index.yaml`
- `docs/05-execution-logs/evidence/batch-115-authorization-and-access-authorization-read-model-and-display-contrac.md`
- `docs/05-execution-logs/evidence/2026-06-07-phase-69-advanced-authorization-context-implementation-planning.md`

## Local Reality

The earlier Batch 115 already added `contextDisplayStatus: "display_only"` to the effective authorization context. Batch 189 will avoid duplicating that work and instead harden the separate `authorization-display-summary` read model so downstream consumers can distinguish:

- the read-model boundary: `readModelStatus: "read_model_only"`;
- the display authorization boundary: `displayStatus: "display_only"`.

## TDD Plan

1. RED: update `authorization-display-summary-service.test.ts` to require `readModelStatus: "read_model_only"` in the standard API response and confirm sensitive source fields still do not serialize.
2. GREEN: add the minimal model/contract/service mapping needed to return `readModelStatus`.
3. Refactor only if needed; do not touch schema, repositories, routes, UI, dependencies, or provider/env surfaces.

## Validation Commands

- `npm.cmd run test:unit -- src/server/services/authorization-display-summary-service.test.ts`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ImplementationAutoSeedReadiness.ps1 -TaskId phase-69-advanced-authorization-context-implementation-planning -CandidateTaskId batch-189-authorization-and-access-authorization-read-model-and-display-contrac`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `git diff --check`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId batch-189-authorization-and-access-authorization-read-model-and-display-contrac`

## Evidence Rules

- Record only command, result, changed files, redaction status, blocked remainder, and residual risk.
- Do not record secrets, env values, DB URLs, Authorization headers, provider payloads, raw prompts, raw answers, publicId inventories, row data, private data, or raw protected content.
