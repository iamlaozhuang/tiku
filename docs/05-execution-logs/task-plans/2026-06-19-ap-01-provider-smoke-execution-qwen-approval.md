# AP-01 Provider Smoke Execution Qwen Approval Task Plan

## Task

- Task id: `ap-01-provider-smoke-execution-qwen-approval`
- AP id: `AP-01`
- Use case id: `UC-STD-AI-SCORING-EXPLANATION`
- Branch: `codex/ap-01-provider-smoke-execution-qwen-approval`
- Scope: docs/state/evidence/audit only. No `.env*` read/write, no provider call, no product/test/schema/dependency
  change.

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
- `docs/05-execution-logs/evidence/2026-06-19-ap-01-provider-smoke-execution-approval-detailing.md`
- `docs/05-execution-logs/evidence/2026-06-19-ap-01-provider-smoke-execution-deepseek-env-local-ready.md`
- `scripts/ai/run-personal-ai-provider-smoke.mjs`
- `package.json`

## Boundary

Qwen execution remains blocked in this task. This task only records the second-provider approval boundary and user-managed
local secret handoff:

- provider adapter: `alibaba`
- model: `qwen-plus`
- env key alias: `ALIBABA_API_KEY`
- local file destination for user-managed key only: `D:\tiku\.env.local`
- allowed user line shape: `ALIBABA_API_KEY=<your Alibaba Cloud Bailian/DashScope API key>`
- max requests for the future execution task: `1`
- max output tokens: `8`
- timeout: `30000` ms
- retry limit: `0`
- max spend: `USD 0.05`
- evidence mode: redacted envelope only

## Blocked Gates

- Qwen provider call until the user confirms `ALIBABA_API_KEY` has been written and a fresh execution task is opened.
- `.env*` read, write, output, copy, stage, or commit by Codex in this task.
- Provider configuration, application route execution, DB writes, Cost Calibration Gate, staging/prod/cloud/deploy,
  payment/external-service, dependency, schema/migration, product source, tests/e2e changes, PR, push, force-push,
  destructive DB, and raw sensitive evidence.

## Validation Plan

- `git check-ignore -v .env.local`
- `node scripts/ai/run-personal-ai-provider-smoke.mjs --provider alibaba --model qwen-plus --env-key ALIBABA_API_KEY --max-requests 1 --timeout-ms 30000 --dry-run`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2LocalCapabilityGate.ps1 -TaskId ap-01-provider-smoke-execution-qwen-approval -Capability providerKey -Intent declare_adapter`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2LocalCapabilityGate.ps1 -TaskId ap-01-provider-smoke-execution-qwen-approval -Capability providerCall -Intent declare_adapter`
- Scoped Prettier write/check for the changed docs/state files.
- `git diff --check`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId ap-01-provider-smoke-execution-qwen-approval`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId ap-01-provider-smoke-execution-qwen-approval`
