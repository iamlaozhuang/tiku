# AP-01 Qwen In-App AI Runtime Bridge Implementation

## Task

- Task id: `ap-01-qwen-in-app-ai-runtime-bridge-implementation`
- Branch: `codex/ap-01-qwen-in-app-ai-runtime-bridge-implementation`
- Base commit: `f25afa3c`
- Date: `2026-06-19`
- Scope: local-only, default-blocked runtime bridge or equivalent controlled runner implementation.

## Mandatory Readings

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
- `docs/04-agent-system/state/local-experience-coverage-matrix.yaml`
- `docs/05-execution-logs/evidence/2026-06-19-ap-01-qwen-in-app-ai-runtime-bridge-approval.md`

## Implementation Plan

1. Add a runtime bridge DTO/model/service that always reports `providerCallExecuted=false` and `envSecretAccessed=false`.
2. Default the bridge to `provider_call_blocked` unless a server-side dependency explicitly supplies a local controlled
   runner switch.
3. Attach the bridge state to the existing personal AI local browser experience response without changing the default
   `runtimeStatus=local_contract_only` behavior.
4. Pass bridge control only through server-side route dependencies, never through client request body fields.
5. Use existing redaction snapshot helpers to create only hashed/length metadata for bridge probes.
6. Add focused unit tests for:
   - default bridge blocked behavior,
   - controlled runner behavior with no provider or env access,
   - route-level server dependency wiring.
7. Update evidence, audit, task queue, project state, and coverage matrix after validation.

## Allowed Files

- `src/server/contracts/personal-ai-generation-runtime-bridge-contract.ts`
- `src/server/models/personal-ai-generation-runtime-bridge.ts`
- `src/server/services/personal-ai-generation-runtime-bridge-service.ts`
- `src/server/contracts/personal-ai-generation-local-browser-experience-contract.ts`
- `src/server/services/personal-ai-generation-local-browser-experience-service.ts`
- `src/server/services/personal-ai-generation-request-route.ts`
- `src/server/services/personal-ai-generation-runtime-bridge-service.test.ts`
- `src/server/services/personal-ai-generation-local-browser-experience-service.test.ts`
- `src/server/services/personal-ai-generation-request-route.test.ts`
- `docs/04-agent-system/state/local-experience-coverage-matrix.yaml`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/2026-06-19-ap-01-qwen-in-app-ai-runtime-bridge-implementation.md`
- `docs/05-execution-logs/evidence/2026-06-19-ap-01-qwen-in-app-ai-runtime-bridge-implementation.md`
- `docs/05-execution-logs/audits-reviews/2026-06-19-ap-01-qwen-in-app-ai-runtime-bridge-implementation.md`

## Blocked Files And Capabilities

- `.env*`
- `package.json`
- lockfiles
- `src/db/schema/**`
- `drizzle/**`
- `scripts/**`
- `e2e/**`
- `playwright-report/**`
- `test-results/**`
- Provider/model calls.
- Env secret reads or writes.
- Provider/model/base URL configuration changes.
- Cost Calibration Gate execution.
- Staging/prod/cloud/deploy.
- Payment/external service.
- Dependency/schema/migration changes.
- PR, push, force push.
- Destructive database operations.
- Raw sensitive evidence.

## Expected Validation

- `npm.cmd run test:unit -- src/server/services/personal-ai-generation-runtime-bridge-service.test.ts src/server/services/personal-ai-generation-local-browser-experience-service.test.ts src/server/services/personal-ai-generation-request-route.test.ts`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `npx.cmd prettier --write --ignore-unknown <changed files>`
- `npx.cmd prettier --check --ignore-unknown <changed files>`
- `git diff --check`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId ap-01-qwen-in-app-ai-runtime-bridge-implementation`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId ap-01-qwen-in-app-ai-runtime-bridge-implementation`
