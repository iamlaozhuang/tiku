# AP-01 Qwen Provider Smoke Base URL Failure Diagnosis Task Plan

## Task

- Task id: `ap-01-qwen-provider-smoke-base-url-failure-diagnosis`
- Branch: `codex/ap-01-qwen-provider-smoke-base-url-failure-diagnosis`
- Task kind: `docs_state_provider_failure_diagnosis`
- Date: `2026-06-19`
- User approval: open a read-only diagnosis task after the explicit-base-URL Qwen one-request smoke returned sanitized
  `provider_error`.

## Scope

Allowed files:

- `docs/04-agent-system/state/local-experience-coverage-matrix.yaml`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/2026-06-19-ap-01-qwen-provider-smoke-base-url-failure-diagnosis.md`
- `docs/05-execution-logs/evidence/2026-06-19-ap-01-qwen-provider-smoke-base-url-failure-diagnosis.md`
- `docs/05-execution-logs/audits-reviews/2026-06-19-ap-01-qwen-provider-smoke-base-url-failure-diagnosis.md`

Read-only inputs:

- Official Alibaba Cloud DashScope/Bailian public documentation.
- `scripts/ai/run-personal-ai-provider-smoke.mjs`
- `tests/unit/run-personal-ai-provider-smoke.test.ts`
- `package.json`
- installed local provider package files under `node_modules/@ai-sdk/alibaba/**` and
  `node_modules/@ai-sdk/openai-compatible/**`
- Previous AP-01 Qwen evidence files.

Blocked files and actions:

- `.env*` reads, writes, copies, staging, commits, or value output.
- Provider/model call, Qwen retry, second provider execution, or Cost Calibration Gate.
- Product source, test, e2e, schema, migration, dependency, or lockfile changes.
- Staging/prod/cloud/deploy, payment, external-service, PR, push, force-push, destructive DB.
- Raw provider payload, raw prompt, raw response, raw provider error, token, Authorization header, key value, or secret
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
- `docs/05-execution-logs/evidence/2026-06-19-ap-01-qwen-provider-config-approval-package.md`
- `docs/05-execution-logs/evidence/2026-06-19-ap-01-qwen-provider-smoke-runner-base-url-config.md`
- `docs/05-execution-logs/evidence/2026-06-19-ap-01-qwen-provider-smoke-execution-base-url-ready.md`

## Diagnosis Plan

1. Confirm `.env.local` is git-ignored without reading its content.
2. Inspect official Alibaba Cloud DashScope/Bailian documentation for OpenAI-compatible base URL, API key scope, model
   name, and region/workspace constraints.
3. Inspect local smoke runner and installed provider package read-only for:
   - whether `@ai-sdk/alibaba` expects `apiKey`, `baseURL`, and model id as used;
   - whether it uses Chat Completions-compatible paths;
   - whether OpenAI-compatible path is a safer next retry candidate.
4. Compare confirmed facts with the last redacted one-request result.
5. Produce a no-secret, no-call diagnosis with:
   - confirmed local alignment;
   - unverified console-side checks the user must perform;
   - next retry package recommendation, if any.

## Validation Commands

- `git check-ignore -v .env.local`
- read-only official documentation lookup.
- read-only local runner/provider package inspection.
- `npx.cmd prettier --write --ignore-unknown <changed docs/state files>`
- `npx.cmd prettier --check --ignore-unknown <changed docs/state files>`
- `git diff --check`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId ap-01-qwen-provider-smoke-base-url-failure-diagnosis`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId ap-01-qwen-provider-smoke-base-url-failure-diagnosis`

## Stop Conditions

- Any need to read or output `.env.local` secret values.
- Any need to execute a provider/model call.
- Any need to change runner behavior, provider configuration, dependencies, package/lockfile, product source, tests, e2e,
  schema, or migration files.
- Any request to record raw provider details or sensitive evidence.
