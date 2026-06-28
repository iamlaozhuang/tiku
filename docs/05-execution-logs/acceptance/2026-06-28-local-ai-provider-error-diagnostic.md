# Local AI Provider Error Diagnostic Acceptance

Task id: `local-ai-provider-error-diagnostic-2026-06-28`

Branch: `codex/local-provider-error-diagnostic-20260628`

## Acceptance Criteria

- The task plan exists before Provider diagnostic execution.
- The previous direct `alibaba` / `qwen-plus` failure is compared with the OpenAI-compatible DashScope route.
- At most one real Provider diagnostic call is executed.
- Evidence is redacted and does not record secrets, prompt, Provider payload, raw AI output, raw answers, or full content.
- `.env*`, source, tests, scripts, package/lockfile, schema, migration, and seed files are not modified.
- Cost Calibration, pricing, quota defaults, release/final Pass, staging/prod/deploy, payment/OCR/export, external
  service, PR, force push, and `drizzle-kit push` remain blocked.

## Acceptance Result

Accepted for the diagnostic scope.

Summary:

- Task plan existed before the real Provider diagnostic call.
- The failed direct `alibaba` / `qwen-plus` path was compared with the OpenAI-compatible DashScope route.
- Exactly one real Provider diagnostic call was executed.
- Diagnostic call passed on `openai_compatible` / `alibaba-qwen` / `qwen3.7-max` / `dashscope.aliyuncs.com`.
- Evidence is redacted and records no key value, prompt, Provider payload, raw AI output, raw answer, or full content.
- `.env*`, source, tests, scripts, package/lockfile, schema, migration, and seed files were not modified by the
  diagnostic implementation.
- Cost Calibration, pricing, quota defaults, release/final Pass, staging/prod/deploy, payment/OCR/export, external
  service, PR, force push, and `drizzle-kit push` remained blocked.

Final closeout gates are recorded in the evidence file after validation.
