# AP-01 Qwen Route-Integrated Provider Execution Implementation Task Plan

taskId: ap-01-qwen-route-integrated-provider-execution-implementation

## Objective

Wire a server-side controlled provider execution path into the personal AI generation request route service while keeping
default route behavior blocked and executing zero real provider calls in this implementation task.

## Required Context Read

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/*.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/04-agent-system/state/local-experience-coverage-matrix.yaml`
- `docs/05-execution-logs/evidence/2026-06-19-ap-01-qwen-in-app-ai-one-request-execution.md`
- `docs/05-execution-logs/evidence/2026-06-19-ap-01-qwen-route-integrated-provider-execution-implementation-approval.md`
- `src/server/services/personal-ai-generation-request-route.ts`
- `src/server/services/personal-ai-generation-local-browser-experience-service.ts`
- `src/server/services/personal-ai-generation-runtime-bridge-service.ts`
- `src/server/services/ai-generation-task-provider-adapter-service.ts`
- `scripts/ai/run-personal-ai-provider-smoke.mjs`

## Implementation Scope

- Extend the personal AI runtime bridge contract/model to represent a server-side, route-integrated provider execution
  result without exposing raw prompts, responses, provider payloads, provider errors, or secrets.
- Add a narrow route-integrated provider execution service that supports a redacted Qwen/OpenAI-compatible execution
  boundary through injected dependencies.
- Update the personal AI local-browser experience service and request route service so only server-side route dependencies
  can enable provider execution.
- Preserve default blocked behavior and the existing client-body cannot-enable-provider guarantee.
- Add focused unit tests before implementation.

## TDD Plan

1. RED: add a route test proving a server-side execution control invokes a fake route-integrated provider executor once
   and returns only sanitized execution metadata.
2. RED: add a service/bridge test proving client/default paths remain blocked with `providerCallExecuted=false` and
   `envSecretAccessed=false`.
3. GREEN: implement the smallest service/contract changes to pass those tests.
4. REFACTOR: keep naming aligned with glossary terms and preserve route/service layering.

## Guardrails

- Do not read `.env.local`.
- Do not execute a real provider/model call.
- Do not change `src/app/**`; route service factory integration only.
- Do not change scripts, e2e specs, schema, migrations, packages, lockfiles, provider/model/base URL configuration, or
  environment files.
- The first real route-integrated Qwen request after this task still requires fresh approval.
- Provider retry, streaming, additional provider execution, Cost Calibration Gate, staging/prod/cloud/deploy,
  payment/external-service, PR, push, and force-push remain blocked.

## Redaction Boundary

Evidence and DTOs may expose only pass/fail, boolean gate state, provider/model/base URL host identifiers, sanitized
failure category, sanitized HTTP status/provider error code, aggregate usage counts, and duration.

Evidence and DTOs must not expose raw prompt, raw response, raw model output, provider payload, provider error text,
request body, Authorization header, API key, token, secret, `.env*` content, database URL, raw DB rows, raw question, raw
answer, raw standard answer, raw analysis, raw material, screenshots, traces, or HTML reports.

## Validation Plan

- `npm.cmd run test:unit -- src/server/services/personal-ai-generation-route-integrated-provider-execution-service.test.ts src/server/services/personal-ai-generation-runtime-bridge-service.test.ts src/server/services/personal-ai-generation-local-browser-experience-service.test.ts src/server/services/personal-ai-generation-request-route.test.ts`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `npx.cmd prettier --write --ignore-unknown <changed allowed files>`
- `npx.cmd prettier --check --ignore-unknown <changed allowed files>`
- `git diff --check`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId ap-01-qwen-route-integrated-provider-execution-implementation`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId ap-01-qwen-route-integrated-provider-execution-implementation`

## Non-Goals

- No real provider/model execution.
- No `.env.local` read.
- No provider retry, streaming, Cost Calibration Gate, staging/prod/deploy, payment, external service, schema, migration,
  dependency, app route, UI, script, e2e, PR, push, or force-push work.
