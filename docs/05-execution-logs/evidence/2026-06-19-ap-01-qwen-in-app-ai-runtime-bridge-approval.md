# AP-01 Qwen In-App AI Runtime Bridge Approval Evidence

result: pass
executionDecision: pass_bridge_implementation_boundary_approved_provider_call_blocked

## Result

- Task id: `ap-01-qwen-in-app-ai-runtime-bridge-approval`
- Result: `pass_bridge_implementation_boundary_approved_provider_call_blocked`
- Batch range: AP-01 Qwen in-app AI runtime bridge approval only.
- Branch: `codex/ap-01-qwen-in-app-ai-runtime-bridge-approval`
- Base commit: `7bdab5a0`
- Provider calls executed: `0`
- `.env.local` read: `false`
- Product source changed: `false`
- Test/e2e source changed: `false`
- Cost Calibration Gate: `blocked`

## RED / GREEN

- RED: AP-01 in-app approval detailing confirmed the student AI route is still `local_contract_only`, so a real Qwen
  in-app call remains unsafe without a verified local bridge or equivalent controlled runner.
- GREEN: this task approves a future local-only, default-blocked bridge or equivalent controlled runner boundary without
  executing any provider call, reading secrets, or changing source code.

## Approved Bridge Boundary

This approval is limited to the next implementation task. It does not approve a real provider request.

### Acceptable Implementation Options

1. Runtime bridge option:
   - connect the student personal AI generation route/service boundary to the existing service-level AI explanation/hint
     runner abstraction;
   - keep the route default as `local_contract_only` or `provider_call_blocked`;
   - require an explicit local-only switch before the bridge path can execute;
   - validate with deterministic fake runner behavior or a provider-call-blocked runner.
2. Controlled runner option:
   - exercise the same service-level explanation/hint redaction and result mapping without browser route execution;
   - record clearly that this is controlled-runner evidence rather than full in-app route evidence;
   - use only deterministic fake runner behavior or provider-call-blocked behavior.

### Required Default-Blocked Behavior

- No bridge implementation may read `.env.local`.
- No bridge implementation may read `ALIBABA_API_KEY`.
- No bridge implementation may send a provider call.
- No bridge implementation may retry, stream, or execute cost calibration.
- No bridge implementation may change provider/model/base URL configuration.
- The bridge must default to blocked unless an explicit local-only test/runtime switch is present.
- The default student route behavior must remain safe when the switch is absent.

### Redaction Requirements

Evidence and runtime logs must not include:

- raw prompt,
- raw model response,
- raw model output,
- raw provider request payload,
- raw provider response payload,
- raw provider error text,
- raw user/student answer,
- raw standard answer,
- raw teacher analysis,
- raw question body,
- full paper/material content,
- database URL,
- API key, token, Authorization header, cookie, session, or secret,
- raw DB rows,
- screenshots, traces, HTML reports, or full browser snapshots.

Evidence may include:

- command name and pass/fail,
- route or controlled runner name,
- provider/model/base URL host as configured metadata only,
- `providerCallExecuted=false`,
- `envSecretAccessed=false`,
- redacted content hashes or lengths,
- public non-secret ids when necessary for local traceability,
- stop condition category.

### Future Implementation Validation

The next implementation task should validate:

- default route behavior remains `local_contract_only` or `provider_call_blocked`;
- local bridge switch is required;
- provider call count remains `0`;
- env secret access remains `false`;
- redaction snapshots are used before any output is returned or persisted;
- raw prompt/response/payload/error/source material does not appear in evidence;
- focused unit tests cover the default-blocked path and the controlled bridge path.

## Residual Blocked Gates

- localFullLoopGate: not executed; this is a docs/state approval task only.
- threadRolloverGate: not required; this task stays in the current thread through evidence, audit, state sync, and local
  commit.
- automationHandoffPolicy: stop after bridge boundary approval; do not implement source code or run provider calls in
  this task.
- nextModuleRunCandidate: `ap-01-qwen-in-app-ai-runtime-bridge-implementation`.
- blocked remainder: real in-app Qwen execution, provider calls, retries, streaming, `.env.local` reads/writes, env
  secret output, provider/model/base URL configuration changes, Cost Calibration Gate, staging/prod/cloud/deploy,
  payment/external service, dependency/schema/migration changes, PR, push, force push, destructive DB cleanup, raw
  prompt, raw response, raw provider payload, raw provider error, raw DB rows, raw source material, and raw sensitive
  evidence remain blocked.

Cost Calibration Gate remains blocked.

## Next Recommended Task

- `ap-01-qwen-in-app-ai-runtime-bridge-implementation`

That task may implement the approved local-only default-blocked bridge or equivalent controlled runner and validate it
without provider calls. After that bridge passes, a separate fresh approval is required for exactly one real in-app Qwen
request.

## Validation

| Command                                                                                                                                                                           | Result | Notes                                         |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ | --------------------------------------------- |
| `git status --short --branch`                                                                                                                                                     | pass   | Clean branch baseline before branch creation. |
| `git switch -c codex/ap-01-qwen-in-app-ai-runtime-bridge-approval`                                                                                                                | pass   | Short-lived branch created.                   |
| `npx.cmd prettier --write --ignore-unknown <changed docs/state files>`                                                                                                            | pass   | Evidence file formatted.                      |
| `npx.cmd prettier --check --ignore-unknown <changed docs/state files>`                                                                                                            | pass   | All matched files use Prettier code style.    |
| `git diff --check`                                                                                                                                                                | pass   | No whitespace errors.                         |
| `npm.cmd run lint`                                                                                                                                                                | pass   | ESLint passed.                                |
| `npm.cmd run typecheck`                                                                                                                                                           | pass   | `tsc --noEmit` passed.                        |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId ap-01-qwen-in-app-ai-runtime-bridge-approval`      | pass   | Scope and sensitive evidence checks passed.   |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId ap-01-qwen-in-app-ai-runtime-bridge-approval` | pass   | Module closeout readiness passed.             |
