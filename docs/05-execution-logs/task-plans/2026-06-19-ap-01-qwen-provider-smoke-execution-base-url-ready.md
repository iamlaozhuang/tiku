# AP-01 Qwen Provider Smoke Execution Base URL Ready Task Plan

## Task

- Task id: `ap-01-qwen-provider-smoke-execution-base-url-ready`
- Branch: `codex/ap-01-qwen-provider-smoke-execution-base-url-ready`
- Task kind: `provider_smoke_execution`
- Date: `2026-06-19`
- User approval: fresh approval to run exactly one redacted local Qwen provider smoke after explicit Alibaba base URL
  support was added to the runner.

## Scope

Allowed files:

- `docs/04-agent-system/state/local-experience-coverage-matrix.yaml`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/2026-06-19-ap-01-qwen-provider-smoke-execution-base-url-ready.md`
- `docs/05-execution-logs/evidence/2026-06-19-ap-01-qwen-provider-smoke-execution-base-url-ready.md`
- `docs/05-execution-logs/audits-reviews/2026-06-19-ap-01-qwen-provider-smoke-execution-base-url-ready.md`

Read-only runtime inputs:

- `scripts/ai/run-personal-ai-provider-smoke.mjs`
- `.env.local`, only for the single key alias `ALIBABA_API_KEY`

Blocked files and actions:

- `.env*` writes, copies, staging, commits, or value output
- provider retry or any second provider call
- provider configuration outside the explicit CLI `--base-url`
- product source, test, e2e, schema, migration, dependency, or lockfile changes
- application route execution, database writes, destructive DB, dev server, browser runtime
- staging/prod/cloud/deploy, payment, external-service, PR, push, force-push, Cost Calibration Gate

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
- `docs/05-execution-logs/evidence/2026-06-19-ap-01-provider-smoke-execution-qwen-env-local-ready.md`
- `docs/05-execution-logs/evidence/2026-06-19-ap-01-qwen-provider-smoke-runner-base-url-config.md`
- `scripts/ai/run-personal-ai-provider-smoke.mjs`

## Execution Plan

1. Confirm `.env.local` remains git-ignored.
2. Run Qwen dry-run with explicit Alibaba base URL and confirm zero provider requests.
3. Run provider key and provider call capability gates for this task id.
4. Read only `ALIBABA_API_KEY` from `.env.local`, output only `present_redacted`, and inject the value only into the
   child process environment.
5. Run exactly one `alibaba/qwen-plus` provider smoke request with:
   - base URL: `https://dashscope.aliyuncs.com/compatible-mode/v1`
   - max requests: `1`
   - max output tokens: `8`
   - timeout: `30000` ms
   - retry limit: `0`
   - max spend ceiling: USD `0.05`
6. Record only sanitized result fields in evidence.
7. Stop regardless of pass or fail; any retry requires a new fresh task.

## Validation Commands

- `git check-ignore -v .env.local`
- `node scripts/ai/run-personal-ai-provider-smoke.mjs --provider alibaba --model qwen-plus --env-key ALIBABA_API_KEY --base-url https://dashscope.aliyuncs.com/compatible-mode/v1 --max-requests 1 --timeout-ms 30000 --dry-run`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2LocalCapabilityGate.ps1 -TaskId ap-01-qwen-provider-smoke-execution-base-url-ready -Capability providerKey -Intent use_capability`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2LocalCapabilityGate.ps1 -TaskId ap-01-qwen-provider-smoke-execution-base-url-ready -Capability providerCall -Intent use_capability`
- direct PowerShell `.env.local` preflight for `ALIBABA_API_KEY present_redacted`
- direct PowerShell `.env.local` injection for one Qwen execute command with explicit base URL
- `npx.cmd prettier --write --ignore-unknown <changed docs/state files>`
- `npx.cmd prettier --check --ignore-unknown <changed docs/state files>`
- `git diff --check`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId ap-01-qwen-provider-smoke-execution-base-url-ready`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId ap-01-qwen-provider-smoke-execution-base-url-ready`

## Stop Conditions

- `.env.local` key is missing or empty.
- Any command would output a secret, raw provider payload, raw prompt, raw response, or raw provider error.
- The single provider request returns pass or fail; no retry is allowed in this task.
- Any validation failure shows allowedFiles/blockedFiles or redaction violation.
