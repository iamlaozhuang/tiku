# AP-01 Qwen Route-Integrated Provider Execution Implementation Approval Task Plan

taskId: ap-01-qwen-route-integrated-provider-execution-implementation-approval

## Objective

Materialize the approval decision for whether the next task may wire real provider execution into the personal AI
generation route. This task is docs/state approval only.

## Required Context Read

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/*.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/04-agent-system/state/local-experience-coverage-matrix.yaml`
- `docs/05-execution-logs/evidence/2026-06-19-ap-01-qwen-in-app-ai-one-request-execution.md`

## Approval Decision

Approve a next implementation task:

- Next task: `ap-01-qwen-route-integrated-provider-execution-implementation`
- Goal: wire a route-integrated, server-side controlled provider execution path into
  `POST /api/v1/personal-ai-generation-requests` for the personal AI generation local browser experience.
- Provider boundary: `openai_compatible` / `alibaba-qwen` / `qwen3.7-max`.
- Base URL boundary: `https://dashscope.aliyuncs.com/compatible-mode/v1`.
- Env key alias boundary: `ALIBABA_API_KEY`.

## Implementation Guardrails For Next Task

- Default behavior must remain provider-call blocked.
- Client request body must not be able to enable real provider execution.
- Real provider execution must require an explicit server-side local execution control or equivalent local-only runner
  dependency.
- Implementation task must not read `.env.local`.
- Implementation task must not execute a provider/model call.
- Implementation task must not output, modify, copy, stage, or commit any `.env*` content.
- Provider retries, streaming, additional provider calls, Cost Calibration Gate, staging/prod/cloud/deploy, payment,
  external service, schema/migration, dependency changes, PR, push, and force-push remain blocked.

## Proposed Next Task Scope

Allowed source/test surfaces for the next implementation task should be limited to the personal AI route/provider bridge:

- `src/server/services/personal-ai-generation-request-route.ts`
- `src/server/services/personal-ai-generation-local-browser-experience-service.ts`
- `src/server/services/personal-ai-generation-runtime-bridge-service.ts`
- `src/server/contracts/personal-ai-generation-runtime-bridge-contract.ts`
- `src/server/models/personal-ai-generation-runtime-bridge.ts`
- a narrowly scoped new server service under `src/server/services/` if needed
- focused tests for the same service/route surfaces
- docs/state/evidence/audit files for that implementation task

## Redaction Boundary

Evidence may record only pass/fail, provider/model/base URL host, boolean gate state, aggregate unit test counts, and
sanitized route-integration readiness status.

Evidence must not record raw prompt, raw response, raw model output, provider payload, provider error text, request body,
Authorization header, API key, token, secret, `.env*` content, database URL, raw DB rows, raw question, raw answer, raw
standard answer, raw analysis, raw material, screenshots, traces, or HTML reports.

## Validation Plan

- `npx.cmd prettier --write --ignore-unknown <changed docs/state files>`
- `npx.cmd prettier --check --ignore-unknown <changed docs/state files>`
- `git diff --check`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId ap-01-qwen-route-integrated-provider-execution-implementation-approval`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId ap-01-qwen-route-integrated-provider-execution-implementation-approval`

## Non-Goals

- No provider/model call.
- No `.env.local` read.
- No source/test/schema/migration/script/package/lockfile/e2e change in this approval task.
- No route-integrated implementation in this approval task.
- No Cost Calibration Gate execution.
