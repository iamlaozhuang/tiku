# AP-01 Qwen Provider Smoke Runner Base URL Config Task Plan

## Task

- Task id: `ap-01-qwen-provider-smoke-runner-base-url-config`
- Branch: `codex/ap-01-qwen-provider-smoke-runner-base-url-config`
- Task kind: `implementation_tdd`
- Date: `2026-06-19`
- User approval: fresh approval to add explicit Alibaba base URL support to the provider smoke runner only, verify by
  dry-run/tests, and keep real provider calls blocked.

## Scope

Allowed files:

- `scripts/ai/run-personal-ai-provider-smoke.mjs`
- `tests/unit/run-personal-ai-provider-smoke.test.ts`
- `docs/04-agent-system/state/local-experience-coverage-matrix.yaml`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/2026-06-19-ap-01-qwen-provider-smoke-runner-base-url-config.md`
- `docs/05-execution-logs/evidence/2026-06-19-ap-01-qwen-provider-smoke-runner-base-url-config.md`
- `docs/05-execution-logs/audits-reviews/2026-06-19-ap-01-qwen-provider-smoke-runner-base-url-config.md`

Blocked files and actions:

- `.env*`
- `package.json`, lockfiles, dependency changes
- `src/**`, `e2e/**`, `drizzle/**`, schema/migration files
- provider/model execution, Qwen retry, secret reads, provider payload/output logging
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
- `docs/05-execution-logs/evidence/2026-06-19-ap-01-qwen-provider-config-approval-package.md`
- `scripts/ai/run-personal-ai-provider-smoke.mjs`
- `tests/unit/run-personal-ai-provider-smoke.test.ts`

## Implementation Plan

1. Add a test proving Alibaba smoke config accepts and preserves explicit `--base-url`.
2. Add a test proving a dry-run with Alibaba `--base-url` does not read secrets or call providers.
3. Add a testable provider factory dependency seam so `createProviderModel` can be verified without real provider calls.
4. Pass `baseURL` to `createAlibaba()` only when an explicit base URL is supplied.
5. Keep current `openai_compatible` behavior unchanged.
6. Record docs/state/evidence/audit and keep Qwen retry blocked for a follow-up task.

## Validation Commands

- `npm.cmd run test:unit -- tests/unit/run-personal-ai-provider-smoke.test.ts`
- `node scripts/ai/run-personal-ai-provider-smoke.mjs --provider alibaba --model qwen-plus --env-key ALIBABA_API_KEY --base-url https://dashscope.aliyuncs.com/compatible-mode/v1 --max-requests 1 --timeout-ms 30000 --dry-run`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `npx.cmd prettier --write --ignore-unknown scripts/ai/run-personal-ai-provider-smoke.mjs tests/unit/run-personal-ai-provider-smoke.test.ts docs/04-agent-system/state/local-experience-coverage-matrix.yaml docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-06-19-ap-01-qwen-provider-smoke-runner-base-url-config.md docs/05-execution-logs/evidence/2026-06-19-ap-01-qwen-provider-smoke-runner-base-url-config.md docs/05-execution-logs/audits-reviews/2026-06-19-ap-01-qwen-provider-smoke-runner-base-url-config.md`
- `npx.cmd prettier --check --ignore-unknown scripts/ai/run-personal-ai-provider-smoke.mjs tests/unit/run-personal-ai-provider-smoke.test.ts docs/04-agent-system/state/local-experience-coverage-matrix.yaml docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-06-19-ap-01-qwen-provider-smoke-runner-base-url-config.md docs/05-execution-logs/evidence/2026-06-19-ap-01-qwen-provider-smoke-runner-base-url-config.md docs/05-execution-logs/audits-reviews/2026-06-19-ap-01-qwen-provider-smoke-runner-base-url-config.md`
- `git diff --check`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId ap-01-qwen-provider-smoke-runner-base-url-config`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId ap-01-qwen-provider-smoke-runner-base-url-config`

## Stop Conditions

- Any need to read or write `.env*`.
- Any need to execute a provider/model call.
- Any need to change dependencies, schema, migrations, product runtime outside the smoke runner, or e2e files.
- Any validation failure showing evidence redaction or allowedFiles/blockedFiles violation.
