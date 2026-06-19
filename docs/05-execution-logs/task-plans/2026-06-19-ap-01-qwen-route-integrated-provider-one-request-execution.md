# AP-01 Qwen Route-Integrated Provider One-Request Execution Task Plan

taskId: ap-01-qwen-route-integrated-provider-one-request-execution
status: in_progress

## Scope

- Execute exactly one local route-integrated Qwen request through the server-side controlled personal AI generation route
  service path.
- Approved provider: `openai_compatible` / `alibaba-qwen`.
- Approved model: `qwen3.7-max`.
- Approved base URL host: `dashscope.aliyuncs.com`.
- Approved env key alias: `ALIBABA_API_KEY`.
- Approved limits: `maxRequests=1`, `maxRetries=0`, `maxOutputTokens=8`, `timeoutMs=30000`, `maxSpendUsd=0.10`.
- Stop after the first provider request regardless of pass or fail.

## Read Before Execution

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
- `docs/05-execution-logs/evidence/2026-06-19-ap-01-qwen-route-integrated-provider-execution-implementation.md`
- `docs/05-execution-logs/evidence/2026-06-19-ap-01-qwen-route-integrated-provider-one-request-execution-approval.md`

## Execution Approach

1. Create the short-lived execution branch from the approved one-request approval branch.
2. Add this execution task to the queue with narrow docs/state/evidence/audit write scope.
3. Run a local `tsx` inline route-service runner that imports the existing route service and runtime bridge service.
4. Read `.env.local` only inside the runner and only to obtain the `ALIBABA_API_KEY` value.
5. Call the existing route-integrated provider execution path exactly once with server-side explicit runtime bridge control.
6. Print and record only sanitized summary fields: request count, result status, sanitized provider error code/status,
   aggregate token counts, duration, provider/model/base URL host, and redaction status.
7. Update evidence, audit review, project state, and coverage matrix. Do not change source, tests, schema, migrations,
   scripts, dependencies, lockfiles, or `.env*`.

## Evidence Redaction

Allowed evidence fields:

- command name
- pass/fail
- request count
- provider/model/base URL host
- sanitized HTTP status
- sanitized provider error code
- aggregate token counts
- duration in ms
- redaction pass/fail

Blocked evidence fields:

- `.env*` contents
- provider key values
- raw prompt
- raw response
- raw model output
- raw provider error text
- provider payload
- request body
- raw answer
- raw standard answer
- raw analysis
- raw question body
- raw DB rows
- screenshots
- traces
- HTML reports
- database URL
- token
- Authorization header
- secret

## Validation Commands

- `node_modules\.bin\tsx.cmd --tsconfig tsconfig.json - <redacted route-integrated one-request runner via stdin>`
- `npx.cmd prettier --write --ignore-unknown <changed docs/state files>`
- `npx.cmd prettier --check --ignore-unknown <changed docs/state files>`
- `git diff --check`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId ap-01-qwen-route-integrated-provider-one-request-execution`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId ap-01-qwen-route-integrated-provider-one-request-execution`

## Blocked Gates

- Additional provider calls
- Provider retry
- Streaming
- Provider/model/base URL configuration changes
- Cost Calibration Gate
- `.env*` writes
- Env secret output
- Staging/prod/cloud/deploy
- Payment/external-service work
- Dependency/package/lockfile changes
- Schema/migration changes
- Source/test/e2e/script changes
- PR, push, and force push

Cost Calibration Gate remains blocked.
