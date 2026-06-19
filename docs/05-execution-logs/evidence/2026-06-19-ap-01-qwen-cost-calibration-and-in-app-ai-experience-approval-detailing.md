# AP-01 Qwen Cost Calibration And In-App AI Experience Approval Detailing Evidence

result: pass
executionDecision: pass_docs_only_in_app_ai_approval_detailing_real_call_blocked

## Result

- Task id: `ap-01-qwen-cost-calibration-and-in-app-ai-experience-approval-detailing`
- Result: `pass_docs_only_in_app_ai_approval_detailing_real_call_blocked`
- Batch range: AP-01 Qwen cost calibration and in-app AI approval detailing only.
- Branch: `codex/ap-01-qwen-cost-calibration-and-in-app-ai-experience-approval-detailing`
- Base commit: `eabc17db`
- Provider calls executed: `0`
- `.env.local` read: `false`
- Product source changed: `false`
- Test/e2e source changed: `false`
- Cost Calibration Gate: `blocked`

## RED / GREEN

- RED: the previous Qwen3.7-Max one-request smoke passed only through a controlled smoke runner, while the candidate
  student in-app route still remained `local_contract_only` and real in-app provider execution remained blocked.
- GREEN: this task documented the exact in-app candidate entry, sample boundary, redaction boundary, request/token/cost
  ceilings, rollback, stop conditions, and the next bridge approval requirement without reading `.env.local` or sending a
  provider call.

## Current Runtime Finding

- Candidate in-app UI entry: `/ai-generation`.
- Page chain:
  - `src/app/(student)/ai-generation/page.tsx`
  - `src/features/student/ai-generation/StudentPersonalAiGenerationPage.tsx`
- Candidate submit route: `POST /api/v1/personal-ai-generation-requests`.
- Candidate history routes:
  - `GET /api/v1/personal-ai-generation-requests`
  - `GET /api/v1/personal-ai-generation-results`
  - `GET /api/v1/personal-ai-generation-results/{resultPublicId}`
- Current UI request mode: `responseMode=local_browser_experience`.
- Current runtime status: `local_contract_only`.
- Current redaction contract: `summary_only` and `redacted`.
- Conclusion: a real provider-backed in-app AI experience is not yet an executable existing app path. It requires a
  fresh-approved runtime bridge, controlled script using existing runner abstractions, or equivalent local-only execution
  path before a real in-app provider request can be approved.

## Prior Provider Smoke Input

- Prior evidence: `docs/05-execution-logs/evidence/2026-06-19-ap-01-qwen3-7-max-one-request-smoke-approval.md`.
- Prior provider: `openai_compatible`.
- Prior provider name: `alibaba-qwen`.
- Prior model: `qwen3.7-max`.
- Prior base URL host: `dashscope.aliyuncs.com`.
- Prior request count: `1`.
- Prior retry limit: `0`.
- Prior redaction status: `passed`.
- Prior aggregate usage:
  - Input tokens: `24`
  - Output tokens: `824`
  - Total tokens: `848`
  - Reasoning tokens: `818`
- Cost calibration implication: reasoning-token usage was observed even under a very low smoke output cap, so the first
  real in-app approval must keep request count, retry count, output cap, timeout, and task budget tightly bounded.

## Proposed Fresh Approval Boundary For First Real In-App AI Experience

This section is a proposed approval package only. It does not grant execution by itself.

### Provider And Model

- Provider: `openai_compatible`.
- Provider name: `alibaba-qwen`.
- Model: `qwen3.7-max`.
- Base URL: `https://dashscope.aliyuncs.com/compatible-mode/v1`.
- Env key alias: `ALIBABA_API_KEY`.
- Env key source: local-only `.env.local`, read only by the approved execution process.
- Model/provider/base URL changes: blocked unless separately approved.

### Application Entry

- Primary UI entry: `/ai-generation`.
- Primary user path: student local browser experience.
- Current app route status: `local_contract_only`.
- Required before execution: fresh approval must identify the exact execution path:
  - either a local-only runtime bridge from the student request route to a provider-backed runner, or
  - a controlled local script that faithfully exercises the same service-level explanation/scoring runner and records
    why it is not full UI in-app execution.

### Sample Material Boundary

- Use one local dev fixture-like sample only.
- Preferred public ids from the current student local browser draft:
  - `question-public-001`
  - `answer-record-public-001`
  - `paper-public-001`
- First function type: `explanation`.
- Edition: `advanced` only if required by the current local browser contract.
- RAG/citation context: disabled or `citationCount=0` unless a later approval explicitly permits redacted citation
  summaries.
- Forbidden sample sources:
  - production data,
  - real student/customer data,
  - complete textbook or exam-paper content,
  - raw PDFs or images,
  - full paper material dumps,
  - plaintext `redeem_code`,
  - non-local DB rows.

### Prompt And Response Redaction

Evidence must not include:

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
- route or script entry name,
- provider/model/base URL host,
- request count,
- retry count,
- timeout,
- output-token cap,
- aggregate token usage,
- sanitized HTTP status,
- sanitized provider error code,
- redacted content hashes or lengths,
- public non-secret identifiers only when necessary for local traceability,
- stop condition category.

The preferred redaction implementation is the existing `createAiCallLogRedactedSnapshots` contract or an equivalent
sanitized evidence layer with the same intent.

### Request, Token, Timeout, And Cost Ceiling

- Maximum provider requests: `1`.
- Maximum retries: `0`.
- Streaming: blocked for first execution.
- Timeout: `30000` ms.
- Maximum output tokens: `32` for the first in-app attempt unless the approved runtime bridge proves this cannot be
  enforced.
- Post-response stop threshold:
  - stop if total tokens are greater than `2000`,
  - stop if reasoning tokens are greater than `1800`,
  - stop if token usage is unavailable or malformed.
- Task-level spend ceiling: `USD 0.10` equivalent maximum for the single local validation task.
- No automatic second request may be sent to complete cost calibration.

### Rollback And Cleanup

- No schema, migration, dependency, staging/prod, or provider configuration changes are allowed.
- If the execution path writes local dev request/result rows, those rows are treated as local audit artifacts and are not
  deleted in the same task unless destructive cleanup is separately approved.
- If the bridge introduces any temporary local-only switch, the task must document the switch and ensure it defaults to
  provider-call blocked.
- Child process environment containing the key must terminate after the single request.
- Any provider error or redaction failure stops the task without retry.

### Stop Conditions

Stop immediately if any of the following occurs:

- `.env.local` is missing `ALIBABA_API_KEY`.
- Any non-localhost, staging, prod, cloud, deploy, or external release target is detected.
- The execution path is still only `local_contract_only` and no fresh-approved bridge exists.
- The run would require a model/provider/base URL change.
- More than one provider call would be required.
- Retry would be required.
- Raw prompt/response/error/payload would need to be recorded.
- Sensitive raw question, answer, analysis, material, DB row, key, token, or Authorization data appears in evidence.
- Token usage exceeds the proposed stop threshold.
- Spend cannot be bounded to the proposed single-task ceiling.
- Provider returns an error; record only sanitized status/code and stop.

## Residual Blocked Gates

- localFullLoopGate: not executed; this is a docs-only approval-detailing task, and the current app route is still
  `local_contract_only`.
- threadRolloverGate: not required; this task stays in the current thread through evidence, audit, state sync, and local
  commit.
- automationHandoffPolicy: stop after docs/state closeout; do not run provider calls or change runtime code in this task.
- nextModuleRunCandidate: `ap-01-qwen-in-app-ai-runtime-bridge-approval`.
- blocked remainder: real in-app provider execution, Cost Calibration Gate, additional provider calls and retries,
  provider/model/base URL configuration changes, staging/prod/cloud/deploy, payment/external service,
  dependency/schema/migration/product/test/e2e changes, PR, push, force push, destructive DB cleanup, `.env*` writes or
  value output, raw prompt, raw response, raw provider payload, raw provider error, raw DB rows, raw source material, and
  raw sensitive evidence remain blocked.

Cost Calibration Gate remains blocked.

## Blocked Gates Detail

- Real in-app provider execution.
- Cost Calibration Gate.
- Additional provider calls and retries.
- Provider/model/base URL configuration changes.
- Staging/prod/cloud/deploy.
- Payment/external service.
- Dependency/schema/migration/product/test/e2e changes.
- PR, push, force push.
- Destructive DB cleanup.
- Raw sensitive evidence.

## Next Recommended Task

Open a fresh approval task for one of these paths:

1. `ap-01-qwen-in-app-ai-runtime-bridge-approval` to approve a local-only, default-blocked runtime bridge from the
   student in-app request flow to an existing redacted AI runner, with no provider call during implementation.
2. `ap-01-qwen-controlled-runner-in-app-equivalence-approval` if the next step intentionally uses a controlled script
   rather than the UI route, clearly stating that it is not full in-app execution.

Only after that bridge/equivalence task passes should a separate fresh approval run exactly one real Qwen in-app request.

## Validation

| Command                                                                                                                                                                                                      | Result | Notes                                                                   |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------ | ----------------------------------------------------------------------- |
| `git status --short --branch`                                                                                                                                                                                | pass   | Clean branch baseline before docs/state edits.                          |
| `git switch -c codex/ap-01-qwen-cost-calibration-and-in-app-ai-experience-approval-detailing`                                                                                                                | pass   | Short-lived branch created.                                             |
| `npx.cmd prettier --write --ignore-unknown <changed docs/state files>`                                                                                                                                       | pass   | Evidence file formatted.                                                |
| `npx.cmd prettier --check --ignore-unknown <changed docs/state files>`                                                                                                                                       | pass   | All matched files use Prettier code style.                              |
| `git diff --check`                                                                                                                                                                                           | pass   | No whitespace errors.                                                   |
| `npm.cmd run lint`                                                                                                                                                                                           | pass   | ESLint passed.                                                          |
| `npm.cmd run typecheck`                                                                                                                                                                                      | pass   | `tsc --noEmit` passed.                                                  |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId ap-01-qwen-cost-calibration-and-in-app-ai-experience-approval-detailing`      | pass   | Scope and sensitive evidence checks passed.                             |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId ap-01-qwen-cost-calibration-and-in-app-ai-experience-approval-detailing` | pass   | Module closeout readiness passed after evidence anchors were completed. |
