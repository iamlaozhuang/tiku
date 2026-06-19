# AP-01 Qwen Route-Integrated User-Visible Result Materialization Approval Evidence

result: pass
executionDecision: pass_docs_state_user_visible_result_materialization_approval_no_call

## Result

- Task id: `ap-01-qwen-route-integrated-user-visible-result-materialization-approval`
- Result: `pass_docs_state_user_visible_result_materialization_approval_no_call`
- Batch range: AP-01 Qwen route-integrated user-visible result materialization approval only.
- Branch: `codex/ap-01-qwen-route-integrated-user-visible-result-materialization-approval`
- Commit: `863039a6`
- Provider calls executed by this task: `0`
- `.env.local` read by this task: `false`
- Product source changed: `false`
- Test source changed: `false`
- Schema/migration/dependency/script/e2e changes: `false`
- Cost Calibration Gate: `blocked`

## RED / GREEN

- RED: route-integrated Qwen one-request execution passed, but the provider output was intentionally not exposed or
  persisted as a user-visible result.
- GREEN: this docs-only approval defines the next implementation boundary for controlled, redacted result materialization
  without executing any provider call or reading `.env.local`.

## Approval Decision

- Provider output may become user-visible only as controlled local `dev` result materialization after a separate
  implementation task.
- User-visible content must be redacted by default:
  - response/detail routes may return `contentPreviewMasked`, `contentDigest`, `contentVisibility=redacted_snapshot`, and
    `redactionStatus=redacted`;
  - response/detail routes must not return raw generated text, raw provider response, raw prompt, provider payload, API
    key, token, Authorization header, database URL, or `.env*` content.
- `personal_ai_generation_result` writes are approved for the next implementation task only if the write uses the existing
  table contract:
  - `content_redacted_snapshot`
  - `content_digest`
  - `content_preview_masked`
  - `citation_redacted_snapshot`
  - `evidence_status`
  - `citation_count`
  - `ai_call_log_public_id`
  - `is_formal_adoption_blocked=true`
- Raw provider output persistence is not approved. The implementation may derive a digest and masked preview from
  provider output in memory, but the persisted record must not contain raw model text.
- Formal adoption of generated content remains blocked. `formalAdoptionRequested=true` must continue to fail until a
  separate approval.
- The next implementation task must not execute a real provider call. It may use a deterministic fake executor or existing
  sanitized fixture-shaped in-memory output to prove materialization behavior.

## Next Implementation Boundary

- Approved next task: `ap-01-qwen-route-integrated-user-visible-result-materialization-implementation`
- Task type: source/test implementation with no provider call.
- Allowed implementation direction:
  - wire route-integrated provider execution summary into result materialization only behind server-side explicit local
    control;
  - keep default app route provider execution blocked;
  - keep client request body unable to enable provider execution or persistence escalation;
  - create or reuse `personal_ai_generation_result` only through server-owned repository/service paths;
  - keep result history/detail redacted by default.
- Follow-up real provider request after implementation still requires fresh approval.

## Request Limits For Later Real Materialization Request

These limits are not consumed by this docs-only task. A later fresh approval may authorize one request only with:

- Provider: `openai_compatible`
- Provider name: `alibaba-qwen`
- Model: `qwen3.7-max`
- Base URL host: `dashscope.aliyuncs.com`
- Env key alias: `ALIBABA_API_KEY`
- Max requests: `1`
- Max retries: `0`
- Max output tokens: `8`
- Timeout: `30000` ms
- Max spend: `0.10` USD
- Streaming: `blocked`
- Stop after first request regardless of pass or fail.

## Failure Rollback And Stop Conditions

- If redaction fails, stop before writing `personal_ai_generation_result`; return sanitized failure state only.
- If persistence fails, stop without retrying provider calls; record only sanitized failure category.
- If a draft result already exists for the same task, reuse it instead of inserting duplicate content.
- If the route response would expose raw generated text or raw provider payload, block materialization and mark
  `redactionStatus=blocked`.
- If token counts exceed the prior one-request observation thresholds, stop and require a fresh Cost Calibration Gate
  approval before additional provider measurement.
- If any implementation requires schema, migration, dependency, `.env*`, provider configuration, staging/prod/deploy, or
  external-service changes, stop and create a separate approval task.

## Redaction Boundary

Evidence may record command names, pass/fail, task ids, file paths, request limits, content visibility labels, digest
presence, masked preview presence, redaction pass/fail, and blocked gates.

Evidence must not record `.env*` contents, provider key values, raw prompt, raw response, raw model output, provider
payload, provider error text, request body, raw answer, raw standard answer, raw analysis, raw question body, raw DB rows,
screenshots, traces, HTML reports, database URL, token, Authorization header, or secret.

## Residual Blocked Gates

- localFullLoopGate: blocked until a follow-up implementation proves redacted user-visible/persistent materialization
  without provider calls, then a separate fresh approval authorizes at most one real provider materialization request.
- threadRolloverGate: not required; this task stays in the current thread through evidence, audit, state sync, and local
  commit.
- automationHandoffPolicy: stop after approval materialization and recommend the next implementation task.
- nextModuleRunCandidate: `ap-01-qwen-route-integrated-user-visible-result-materialization-implementation`
- blocked remainder: provider/model call, `.env.local` read, extra provider calls, provider retry, streaming, raw
  sensitive evidence, `.env*` writes, env secret output, staging/prod/cloud/deploy, payment/external service,
  dependency/schema/migration changes, destructive DB work, PR, push, force push, and Cost Calibration Gate remain
  blocked.

Cost Calibration Gate remains blocked.

## Validation

| Command                                                                                                                                                                                                       | Result | Notes                                       |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ | ------------------------------------------- |
| `git switch -c codex/ap-01-qwen-route-integrated-user-visible-result-materialization-approval`                                                                                                                | pass   | Short-lived approval branch created.        |
| `npx.cmd prettier --write --ignore-unknown <changed docs/state files>`                                                                                                                                        | pass   | Changed docs/state files formatted.         |
| `npx.cmd prettier --check --ignore-unknown <changed docs/state files>`                                                                                                                                        | pass   | Prettier check passed.                      |
| `git diff --check`                                                                                                                                                                                            | pass   | No whitespace errors.                       |
| `npm.cmd run lint`                                                                                                                                                                                            | pass   | ESLint passed.                              |
| `npm.cmd run typecheck`                                                                                                                                                                                       | pass   | `tsc --noEmit` passed.                      |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId ap-01-qwen-route-integrated-user-visible-result-materialization-approval`      | pass   | Scope and sensitive evidence checks passed. |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId ap-01-qwen-route-integrated-user-visible-result-materialization-approval` | pass   | Module closeout readiness passed.           |
