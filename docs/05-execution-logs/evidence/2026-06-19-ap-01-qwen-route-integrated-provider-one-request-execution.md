# AP-01 Qwen Route-Integrated Provider One-Request Execution Evidence

result: pass
executionDecision: pass_route_integrated_one_request_qwen_provider_succeeded_redacted

## Result

- Task id: `ap-01-qwen-route-integrated-provider-one-request-execution`
- Result: `pass_route_integrated_one_request_qwen_provider_succeeded_redacted`
- Batch range: AP-01 Qwen route-integrated provider one-request execution only.
- Branch: `codex/ap-01-qwen-route-integrated-provider-one-request-execution`
- Commit: `72f37954`
- Provider: `openai_compatible`
- Provider name: `alibaba-qwen`
- Model: `qwen3.7-max`
- Base URL host: `dashscope.aliyuncs.com`
- Env key alias: `ALIBABA_API_KEY`
- Provider call approval: exactly `1` route-integrated request.
- Provider retry: `blocked`
- Streaming: `blocked`
- Cost Calibration Gate: `blocked`

## RED / GREEN

- RED: the route-integrated provider execution service was implemented and approval was materialized, but no real
  route-integrated provider request had been executed under the route service path.
- GREEN: exactly one approved local route-integrated Qwen request succeeded through the server-side controlled route
  service path, and evidence contains only sanitized summary fields.

## Execution Boundary

- Target route service: `src/server/services/personal-ai-generation-request-route.ts`
- Target submit route: `POST /api/v1/personal-ai-generation-requests`
- Target mode: `local_browser_experience`
- Max requests: `1`
- Max retries: `0`
- Max output tokens: `8`
- Timeout: `30000` ms
- Max spend: `0.10` USD
- Stop condition: stop after the first request regardless of pass or fail.

## One-Request Execution Summary

- Command: `node_modules\.bin\tsx.cmd --tsconfig tsconfig.json - <redacted route-integrated one-request runner via stdin>`
- Result: `pass`
- Route response code: `0`
- Bridge status: `provider_call_succeeded`
- Request count: `1`
- Provider call executed: `true`
- Env secret accessed: `true`
- Provider configuration read: `true`
- Provider retry attempted: `false`
- Provider streaming enabled: `false`
- Cost calibration executed: `false`
- HTTP status: `not_applicable`
- Provider error code: `not_applicable`
- Duration ms: `9796`
- Usage summary:
  - input tokens: `26`
  - output tokens: `482`
  - total tokens: `508`
  - reasoning tokens: `476`
  - cached input tokens: `0`
- Redaction status: `passed`
- Blocked reasons count: `0`

## Pre-Provider Diagnostics

- `node_modules\.bin\tsx.cmd --tsconfig tsconfig.json - <tsx stdin diagnostic>`: `pass`; provider requests: `0`.
- `node_modules\.bin\tsx.cmd --tsconfig tsconfig.json - <route import diagnostic>`: `pass`; provider requests: `0`.
- `node_modules\.bin\tsx.cmd --tsconfig tsconfig.json - <route fake executor diagnostic>`: `pass`; external provider
  requests: `0`.
- Initial runner invocation failed before route/provider execution because the stdin TS module import shape required using
  the module default export object. Sanitized result: provider call executed `false`, request count `0`.

## Mechanism Diagnostics

- Initial local commit attempt failed in the pre-commit hook because `project-state.yaml` `currentTask` still pointed to
  the previous approval task, so the hook used the approval task allowedFiles and rejected this task's new evidence files.
- Correction: update `currentTask` to `ap-01-qwen-route-integrated-provider-one-request-execution`, rerun hardening and
  closeout readiness, then commit again.

## Redaction Boundary

Evidence records only sanitized summary values. It must not record `.env*` contents, provider key values, raw prompt, raw
response, raw model output, provider payload, provider error text, request body, raw answer, raw standard answer, raw
analysis, raw question body, raw DB rows, screenshots, traces, HTML reports, database URL, token, Authorization header, or
secret.

## Residual Blocked Gates

- localFullLoopGate: passed for exactly one route-integrated local Qwen request under the approved limits; release remains
  blocked by the residual gates below.
- threadRolloverGate: not required; this task stays in the current thread through evidence, audit, state sync, and local
  commit.
- automationHandoffPolicy: stop after one-request execution evidence and recommend the next AP-01 or release-gate approval
  task based on the sanitized result.
- nextModuleRunCandidate: `ap-01-qwen-route-integrated-user-visible-result-materialization-approval`
- blocked remainder: additional provider calls, provider retry, streaming, raw sensitive evidence, `.env*` writes, env
  secret output, staging/prod/cloud/deploy, payment/external service, dependency/schema/migration/source/test/e2e/script
  changes, destructive DB work, PR, push, force push, and Cost Calibration Gate remain blocked.

Cost Calibration Gate remains blocked.

## Validation

| Command                                                                                                                                                                                         | Result | Notes                                                     |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ | --------------------------------------------------------- |
| `git switch -c codex/ap-01-qwen-route-integrated-provider-one-request-execution`                                                                                                                | pass   | Short-lived execution branch created.                     |
| `node_modules\.bin\tsx.cmd --tsconfig tsconfig.json - <redacted route-integrated one-request runner via stdin>`                                                                                 | pass   | One real Qwen provider request executed and succeeded.    |
| `npx.cmd prettier --write --ignore-unknown <changed docs/state files>`                                                                                                                          | pass   | Changed docs/state files formatted.                       |
| `npx.cmd prettier --check --ignore-unknown <changed docs/state files>`                                                                                                                          | pass   | Prettier check passed.                                    |
| `git diff --check`                                                                                                                                                                              | pass   | No whitespace errors.                                     |
| `npm.cmd run lint`                                                                                                                                                                              | pass   | ESLint passed.                                            |
| `npm.cmd run typecheck`                                                                                                                                                                         | pass   | `tsc --noEmit` passed.                                    |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId ap-01-qwen-route-integrated-provider-one-request-execution`      | pass   | Scope, sensitive evidence, and terminology checks passed. |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId ap-01-qwen-route-integrated-provider-one-request-execution` | pass   | Module closeout readiness passed.                         |
