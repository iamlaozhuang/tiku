# AP-01 Qwen Provider Config Approval Package Task Plan

## Task

- Task id: `ap-01-qwen-provider-config-approval-package`
- Branch: `codex/ap-01-qwen-provider-config-approval-package`
- Task kind: `docs_state_provider_config_approval_package`
- Date: `2026-06-19`
- Result target: prepare a recoverable AP-01 Qwen provider configuration approval package after the previous redacted
  Qwen smoke failed with sanitized `provider_error`.

## Scope

Allowed files:

- `docs/04-agent-system/state/local-experience-coverage-matrix.yaml`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/2026-06-19-ap-01-qwen-provider-config-approval-package.md`
- `docs/05-execution-logs/evidence/2026-06-19-ap-01-qwen-provider-config-approval-package.md`
- `docs/05-execution-logs/audits-reviews/2026-06-19-ap-01-qwen-provider-config-approval-package.md`

Blocked files and actions:

- `.env*`
- `package.json`, lockfiles, dependency changes
- `scripts/**`, `src/**`, `tests/**`, `e2e/**`, `drizzle/**`
- provider/model calls, provider retry, provider configuration execution, Cost Calibration Gate
- staging/prod/cloud/deploy, payment, external-service, PR, push, force-push
- raw prompt, raw provider payload, raw response, raw error, secret, token, Authorization header, database URL, raw DB row

## Documents Read

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/adr-001-tech-stack-selection.md`
- `docs/02-architecture/adr/adr-002-runtime-architecture-and-multi-client-contract.md`
- `docs/02-architecture/adr/adr-003-workplace-desktop-web-compatibility.md`
- `docs/02-architecture/adr/adr-004-environment-isolation-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-005-staging-architecture-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-006-runtime-dependency-alignment.md`
- `docs/04-agent-system/sop/task-lifecycle-governance.md`
- `docs/04-agent-system/sop/local-first-validation-governance.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/04-agent-system/state/local-experience-coverage-matrix.yaml`
- `docs/05-execution-logs/evidence/2026-06-19-ap-01-provider-smoke-execution-qwen-env-local-ready.md`
- `docs/05-execution-logs/audits-reviews/2026-06-19-ap-01-provider-smoke-execution-qwen-env-local-ready.md`
- Alibaba Cloud Bailian / Model Studio official docs listed in evidence.
- Read-only local runner/package inspection:
  - `scripts/ai/run-personal-ai-provider-smoke.mjs`
  - `node_modules/@ai-sdk/alibaba/dist/index.d.ts`
  - `node_modules/@ai-sdk/alibaba/dist/index.mjs`

## Verified Facts To Record

- Official Bailian OpenAI-compatible Qwen calls require aligning API key, `BASE_URL`, and model name.
- Official OpenAI-compatible Beijing base URL is `https://dashscope.aliyuncs.com/compatible-mode/v1`.
- Official OpenAI-compatible HTTP endpoint is `POST https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions`.
- Official examples use `DASHSCOPE_API_KEY` and often use `qwen-plus` as the sample model.
- Region and workspace matter. Singapore, Japan, Germany, and some sub-workspace routes require a `{WorkspaceId}` domain;
  Virginia uses `https://dashscope-us.aliyuncs.com/compatible-mode/v1`.
- `@ai-sdk/alibaba` supports a `baseURL` option and defaults API key lookup to `ALIBABA_API_KEY`.
- `@ai-sdk/alibaba` defaults its OpenAI-compatible chat base URL to
  `https://dashscope-intl.aliyuncs.com/compatible-mode/v1` when `baseURL` is not supplied.
- Current project Qwen smoke runner calls `createAlibaba({ apiKey, includeUsage: true })` and does not pass `baseURL`.

## Approach

1. Create docs-only AP-01 approval package artifacts.
2. Update queue/state/matrix so the current handoff points to a provider configuration approval package rather than a
   blind retry.
3. Record a user-facing `.env.local` guidance shape without reading or changing `.env.local`.
4. Keep provider execution blocked until a later fresh-approved runner configuration task.
5. Run scoped formatting and Module Run v2 readiness checks.
6. Create one local commit only. Do not merge, push, or create a PR.

## Validation Commands

- `npx.cmd prettier --write --ignore-unknown docs/04-agent-system/state/local-experience-coverage-matrix.yaml docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-06-19-ap-01-qwen-provider-config-approval-package.md docs/05-execution-logs/evidence/2026-06-19-ap-01-qwen-provider-config-approval-package.md docs/05-execution-logs/audits-reviews/2026-06-19-ap-01-qwen-provider-config-approval-package.md`
- `npx.cmd prettier --check --ignore-unknown docs/04-agent-system/state/local-experience-coverage-matrix.yaml docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-06-19-ap-01-qwen-provider-config-approval-package.md docs/05-execution-logs/evidence/2026-06-19-ap-01-qwen-provider-config-approval-package.md docs/05-execution-logs/audits-reviews/2026-06-19-ap-01-qwen-provider-config-approval-package.md`
- `git diff --check`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId ap-01-qwen-provider-config-approval-package`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId ap-01-qwen-provider-config-approval-package`

## Stop Conditions

- Any need to read, print, copy, or modify `.env*`.
- Any need to run another provider request.
- Any need to modify `scripts/**`, `src/**`, test files, dependencies, schema, migration, or lockfiles.
- Any validation failure that shows the docs/state approval package violates allowedFiles or blocked gates.
