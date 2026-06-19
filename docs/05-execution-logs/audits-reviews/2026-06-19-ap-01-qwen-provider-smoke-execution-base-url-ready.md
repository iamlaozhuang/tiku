# AP-01 Qwen Provider Smoke Execution Base URL Ready Audit Review

## Result

- Decision: APPROVE_BLOCKED_EVIDENCE_CLOSEOUT.
- Task id: `ap-01-qwen-provider-smoke-execution-base-url-ready`
- Evidence:
  `docs/05-execution-logs/evidence/2026-06-19-ap-01-qwen-provider-smoke-execution-base-url-ready.md`
- Plan:
  `docs/05-execution-logs/task-plans/2026-06-19-ap-01-qwen-provider-smoke-execution-base-url-ready.md`

## Review

- Scope is limited to docs/state/evidence/audit updates and one read-only provider smoke execution through the existing
  runner.
- `.env.local` may be read only for `ALIBABA_API_KEY` and must not be output, copied, staged, committed, or modified.
- The provider call is limited to exactly one `alibaba/qwen-plus` request with explicit base URL host
  `dashscope.aliyuncs.com`, max requests `1`, max output tokens `8`, timeout `30000` ms, retry limit `0`, and max spend
  ceiling USD `0.05`.
- Evidence records only sanitized envelope fields, not raw prompt, raw response, raw provider error, provider
  payload, full URL with secrets, token, Authorization header, or key value.
- The one allowed provider request executed and returned sanitized `failureCategory: provider_error` with
  `requestCount: 1`, `providerCallExecuted: true`, and `redactionStatus: passed`.
- No retry or second provider call was run.
- Cost Calibration Gate remains blocked.

## Residual Risk

- Qwen provider reachability is still not proven because the single request failed with a sanitized provider error.
- The task deliberately does not record raw provider error details; follow-up diagnosis must remain redacted.
- Any diagnosis, model/base URL change, alternate invocation path, second request, or retry requires a new fresh task.
- Cost calibration, staging/prod readiness, payment, OCR, export, application AI scoring correctness, and release
  readiness remain unproven and blocked.
