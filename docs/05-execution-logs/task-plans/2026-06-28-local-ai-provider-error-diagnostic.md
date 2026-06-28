# Local AI Provider Error Diagnostic Task Plan

Task id: `local-ai-provider-error-diagnostic-2026-06-28`

Sprint id: `local-full-loop-acceleration-2026-06-28`

Branch: `codex/local-provider-error-diagnostic-20260628`

Cost Calibration Gate remains blocked.

## Approval Boundary

The user fresh-approved Provider error diagnostics after the previous local Provider smoke consumed one approved request
and returned a redacted `provider_error`.

This task may:

- read `D:\tiku\.env.local` only for `ALIBABA_API_KEY`;
- inject the key only into the current command process;
- execute at most one real Provider diagnostic call;
- compare the previous direct `alibaba` / `qwen-plus` failure with the historically passing OpenAI-compatible DashScope
  route;
- record only redacted status fields.

This task must not:

- output, copy, persist, or modify the key;
- modify `.env*`, Provider configuration, source, tests, scripts, package, lockfile, schema, migration, or seed files;
- record prompt, Provider payload, raw Provider response, raw AI output, raw answer, full question/paper/resource/chunk
  content, credentials, cookies, localStorage, Authorization headers, connection strings, DB rows, internal ids, emails,
  phone numbers, or plaintext `redeem_code`;
- execute Cost Calibration, cost measurement, pricing, quota default decisions, release/final Pass, staging/prod/deploy,
  payment/OCR/export/external-service, PR, force push, or `drizzle-kit push`.

## Read Standards

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/04-agent-system/sop/failure-retry-and-human-takeover-governance.md`
- `docs/04-agent-system/sop/advanced-edition-evidence-redaction-template.md`
- `docs/04-agent-system/sop/advanced-edition-cost-calibration-blocked-gate.md`
- `docs/01-requirements/00-index.md`
- `docs/01-requirements/advanced-edition/00-index.md`
- Provider, AI generation, organization AI generation, and local Provider smoke traceability/evidence documents.

## Diagnostic Premise

The immediate failed path is the previous direct Provider smoke:

- provider label: `alibaba`
- model label: `qwen-plus`
- result: redacted `provider_error`
- request count: `1`
- retry count: `0`

The historical passing path and current route-integrated metadata point to:

- provider label: `openai_compatible`
- provider name: `alibaba-qwen`
- model label: `qwen3.7-max`
- base URL host: `dashscope.aliyuncs.com`
- env key alias: `ALIBABA_API_KEY`

The working hypothesis is that the local failure is likely path/model/compatibility-mode specific, not proof that the
local key or Provider account is globally unusable.

## Execution Plan

1. Record this task in state/queue before any Provider diagnostic call.
2. Static-check the existing smoke runner and route-integrated metadata; do not edit source.
3. Run the existing smoke runner in dry-run mode for the OpenAI-compatible DashScope route.
4. If the dry-run boundary is healthy, execute exactly one real diagnostic Provider call through the existing smoke
   runner using the OpenAI-compatible DashScope route.
5. Record only redacted status fields in evidence, audit, acceptance, and state/queue.
6. Run scoped Prettier, `git diff --check`, `Get-TikuProjectStatus`, Module Run v2 pre-commit, and pre-push readiness.

## Risk Defense

- The diagnostic call count is capped at one and retry count is zero.
- No source/runtime configuration is changed; the diagnostic uses existing scripts and existing metadata only.
- The command wrapper must suppress key values and must not print raw Provider output.
- If the diagnostic fails, stop; do not broaden to more models, endpoints, Provider config, package changes, or env edits.
- If the diagnostic succeeds, record the path-specific conclusion and recommend a separate post-Provider rollup task.
