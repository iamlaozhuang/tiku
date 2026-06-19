# AP-01 Qwen OpenAI-Compatible One-Request Isolation Smoke Task Plan

## Task

- Task id: `ap-01-qwen-openai-compatible-one-request-isolation-smoke`
- Branch: `codex/ap-01-qwen-openai-compatible-one-request-isolation-smoke`
- Task kind: `provider_smoke_execution`
- Date: `2026-06-19`
- User approval: fresh approval to open and execute exactly one Qwen `qwen-plus` request through the
  `openai_compatible` path.

## Scope

Allowed files:

- `docs/04-agent-system/state/local-experience-coverage-matrix.yaml`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/2026-06-19-ap-01-qwen-openai-compatible-one-request-isolation-smoke.md`
- `docs/05-execution-logs/evidence/2026-06-19-ap-01-qwen-openai-compatible-one-request-isolation-smoke.md`
- `docs/05-execution-logs/audits-reviews/2026-06-19-ap-01-qwen-openai-compatible-one-request-isolation-smoke.md`

Execution boundary:

- Provider: `openai_compatible`
- Provider name: `alibaba-qwen`
- Model: `qwen-plus`
- Env key alias: `ALIBABA_API_KEY`
- Base URL: `https://dashscope.aliyuncs.com/compatible-mode/v1`
- Max requests: `1`
- Max output tokens: `8`
- Timeout: `30000` ms
- Retry limit: `0`
- Spend ceiling: USD `0.05`

Blocked files and actions:

- `.env*` writes, copies, staging, commits, or value output.
- Reading any `.env.local` value other than `ALIBABA_API_KEY` for the scoped provider call.
- Any provider request beyond the single approved request.
- Provider retry, second provider execution, provider configuration changes, or Cost Calibration Gate.
- Product source, test, e2e, schema, migration, dependency, or lockfile changes.
- Staging/prod/cloud/deploy, payment, external-service, PR, push, force-push, destructive DB.
- Raw prompt, raw provider payload, raw response, raw error, key, token, Authorization header, database URL, or secret
  evidence.

## Documents Read

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
- `docs/05-execution-logs/evidence/2026-06-19-ap-01-qwen-provider-smoke-base-url-failure-diagnosis.md`
- `scripts/ai/run-personal-ai-provider-smoke.mjs`

## Execution Plan

1. Confirm `.env.local` is ignored without reading or printing secret values.
2. Run the smoke runner dry-run with the exact `openai_compatible` Qwen arguments.
3. Run local capability gates for `providerKey` and `providerCall`.
4. Perform a direct scoped preflight that confirms only `ALIBABA_API_KEY` is present in `.env.local`, recording only
   `present_redacted`.
5. Execute exactly one child-process provider request with `TIKU_PROVIDER_SMOKE_APPROVED=1`.
6. Record only redacted envelope fields: request count, provider/model/base URL host, result status, failure category,
   token usage summary if available, redaction status, and pass/fail.
7. Stop after the first execution. Do not retry if it fails.
8. Update task queue, project state, coverage matrix, evidence, and audit.
9. Run scoped formatting, lint/typecheck, diff check, and Module Run v2 readiness gates.
10. Create one local commit only; no merge, push, PR, or cleanup.

## Validation Commands

- `git check-ignore -v .env.local`
- `node scripts/ai/run-personal-ai-provider-smoke.mjs --provider openai_compatible --provider-name alibaba-qwen --base-url https://dashscope.aliyuncs.com/compatible-mode/v1 --model qwen-plus --env-key ALIBABA_API_KEY --max-requests 1 --timeout-ms 30000 --dry-run`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2LocalCapabilityGate.ps1 -TaskId ap-01-qwen-openai-compatible-one-request-isolation-smoke -Capability providerKey -Intent use_capability`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2LocalCapabilityGate.ps1 -TaskId ap-01-qwen-openai-compatible-one-request-isolation-smoke -Capability providerCall -Intent use_capability`
- direct PowerShell `.env.local` scoped `ALIBABA_API_KEY` preflight.
- scoped child-process provider call through the runner with `TIKU_PROVIDER_SMOKE_APPROVED=1`.
- `npx.cmd prettier --write --ignore-unknown <changed docs/state files>`
- `npx.cmd prettier --check --ignore-unknown <changed docs/state files>`
- `git diff --check`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId ap-01-qwen-openai-compatible-one-request-isolation-smoke`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId ap-01-qwen-openai-compatible-one-request-isolation-smoke`

## Stop Conditions

- Missing `ALIBABA_API_KEY`.
- Any redaction violation.
- The single provider request returns fail or timeout.
- Any need to retry or inspect raw provider details.
- Any need to change `.env*`, runner behavior, product source, tests, e2e, schema, migrations, dependencies, staging,
  production, deploy, or payment/external-service configuration.
