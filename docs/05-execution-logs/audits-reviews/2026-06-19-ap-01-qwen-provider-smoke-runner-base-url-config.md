# AP-01 Qwen Provider Smoke Runner Base URL Config Audit Review

## Result

- Decision: APPROVE runner config closeout.
- Task id: `ap-01-qwen-provider-smoke-runner-base-url-config`
- Evidence:
  `docs/05-execution-logs/evidence/2026-06-19-ap-01-qwen-provider-smoke-runner-base-url-config.md`
- Plan:
  `docs/05-execution-logs/task-plans/2026-06-19-ap-01-qwen-provider-smoke-runner-base-url-config.md`

## Review

- Scope stayed limited to smoke runner wiring, the existing runner unit test, and governance evidence/state files.
- No `.env*` file was read, changed, copied, staged, or committed.
- No provider/model request was executed.
- The runner records only `baseUrlHost` in dry-run evidence, not a full URL, provider payload, prompt, raw response, raw
  error, or secret.
- The Alibaba provider factory receives `baseURL` only when an explicit CLI base URL is supplied.
- Existing `openai_compatible` base URL requirement remains intact.

## Residual Risk

- This task proves runner wiring and dry-run command shape only. It does not prove Qwen provider success.
- A future retry still needs fresh approval for `.env.local` read, one provider request, request/cost limits, and
  redacted evidence.
- Cost Calibration Gate remains blocked.
- Staging/prod/cloud/deploy, payment/external-service, PR, push, force-push, raw sensitive evidence, dependencies,
  schema/migration, product source outside smoke runner, and e2e changes remain blocked unless a later task approves
  them.
