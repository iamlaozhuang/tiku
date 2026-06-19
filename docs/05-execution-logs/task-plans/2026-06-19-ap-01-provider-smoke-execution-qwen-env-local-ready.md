# AP-01 Provider Smoke Execution Qwen env.local Ready Task Plan

## Task

- Task id: `ap-01-provider-smoke-execution-qwen-env-local-ready`
- AP id: `AP-01`
- Use case id: `UC-STD-AI-SCORING-EXPLANATION`
- Branch: `codex/ap-01-provider-smoke-execution-qwen-env-local-ready`
- Scope: one redacted local dev provider smoke against Qwen `qwen-plus`, reading only `ALIBABA_API_KEY` from local-only
  `.env.local`.

## Required Reading

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
- `docs/05-execution-logs/evidence/2026-06-19-ap-01-provider-smoke-execution-qwen-approval.md`
- `scripts/ai/run-personal-ai-provider-smoke.mjs`
- `package.json`

## Execution Boundary

- provider adapter: `alibaba`
- model: `qwen-plus`
- env key alias: `ALIBABA_API_KEY`
- local env source: `.env.local`
- max requests: `1`
- max output tokens: `8`
- timeout: `30000` ms
- retry limit: `0`
- max spend: `USD 0.05`
- execution approval flag: `TIKU_PROVIDER_SMOKE_APPROVED=1`
- evidence mode: redacted envelope only

## Secret Handling

- Read only the named `ALIBABA_API_KEY` value from `.env.local`.
- Inject the value only into the child command process environment.
- Do not print, copy, stage, commit, or record the key value.
- Do not read other `.env.local` keys.
- Do not modify any `.env*` file.

## Blocked Gates

- Any additional provider/model execution after the single Qwen smoke.
- Provider configuration, application route execution, DB writes, Cost Calibration Gate, staging/prod/cloud/deploy,
  payment/external-service, dependency, schema/migration, product source, tests/e2e changes, PR, push, force-push,
  destructive DB, and raw sensitive evidence.

## Validation Plan

- `node scripts/ai/run-personal-ai-provider-smoke.mjs --provider alibaba --model qwen-plus --env-key ALIBABA_API_KEY --max-requests 1 --timeout-ms 30000 --dry-run`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2LocalCapabilityGate.ps1 -TaskId ap-01-provider-smoke-execution-qwen-env-local-ready -Capability providerKey -Intent use_capability`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2LocalCapabilityGate.ps1 -TaskId ap-01-provider-smoke-execution-qwen-env-local-ready -Capability providerCall -Intent use_capability`
- Direct PowerShell `.env.local` preflight for `ALIBABA_API_KEY` present redacted.
- Direct PowerShell `.env.local` injection for one Qwen execute command.
- Scoped Prettier write/check for changed docs/state files.
- `git diff --check`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId ap-01-provider-smoke-execution-qwen-env-local-ready`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId ap-01-provider-smoke-execution-qwen-env-local-ready`
