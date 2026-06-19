# AP-01 Qwen Provider Smoke Base URL Failure Diagnosis Audit Review

## Result

- Decision: APPROVE diagnosis closeout.
- Task id: `ap-01-qwen-provider-smoke-base-url-failure-diagnosis`
- Evidence:
  `docs/05-execution-logs/evidence/2026-06-19-ap-01-qwen-provider-smoke-base-url-failure-diagnosis.md`
- Plan:
  `docs/05-execution-logs/task-plans/2026-06-19-ap-01-qwen-provider-smoke-base-url-failure-diagnosis.md`

## Review

- Scope is limited to docs/state/evidence/audit updates, official public docs lookup, and local read-only inspection of
  the existing runner/provider package.
- `.env.local` secret values are not read, output, copied, staged, committed, or modified.
- No provider/model request is executed.
- No retry is run.
- Diagnosis distinguishes locally confirmed facts from user-console checks that cannot be verified without secret value
  or provider API access.
- Local runner/provider behavior aligns with the official OpenAI-compatible `/chat/completions` path when the explicit
  Beijing base URL is supplied.
- Remaining likely causes are account-side or console-side: key region, workspace/sub-workspace, model permission,
  model entitlement, key type, or model/API-mode mismatch.
- Cost Calibration Gate remains blocked.

## Residual Risk

- A read-only diagnosis cannot prove whether the current key is valid, whether the workspace entitlement is active, or
  whether a retry will pass.
- Switching to the generic `openai_compatible` path can only isolate provider wrapper behavior; it will not resolve
  region/workspace/model permission issues if those are the root cause.
