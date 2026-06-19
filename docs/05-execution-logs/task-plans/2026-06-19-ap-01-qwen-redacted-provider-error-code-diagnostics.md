# AP-01 Qwen Redacted Provider Error Code Diagnostics Task Plan

## Task

- Task id: `ap-01-qwen-redacted-provider-error-code-diagnostics`
- Branch: `codex/ap-01-qwen-redacted-provider-error-code-diagnostics`
- Task kind: `implementation_tdd`
- Date: `2026-06-19`
- User approval: add redacted provider error diagnostics to the existing smoke runner, then require separate fresh
  approval before any new provider request.

## Scope

Allowed files:

- `scripts/ai/run-personal-ai-provider-smoke.mjs`
- `tests/unit/run-personal-ai-provider-smoke.test.ts`
- `docs/04-agent-system/state/local-experience-coverage-matrix.yaml`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/2026-06-19-ap-01-qwen-redacted-provider-error-code-diagnostics.md`
- `docs/05-execution-logs/evidence/2026-06-19-ap-01-qwen-redacted-provider-error-code-diagnostics.md`
- `docs/05-execution-logs/audits-reviews/2026-06-19-ap-01-qwen-redacted-provider-error-code-diagnostics.md`

Blocked files and actions:

- `.env*` reads, writes, copies, staging, commits, or value output.
- Provider/model call, Qwen retry, second provider execution, or Cost Calibration Gate.
- Product source outside `scripts/ai/run-personal-ai-provider-smoke.mjs`.
- Tests outside `tests/unit/run-personal-ai-provider-smoke.test.ts`.
- E2E, schema, migration, dependency, package/lockfile changes.
- Staging/prod/cloud/deploy, payment, external-service, PR, push, force-push, destructive DB.
- Raw provider error text, raw prompt, raw payload, raw response, key, token, Authorization header, database URL, or
  secret evidence.

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
- `docs/05-execution-logs/evidence/2026-06-19-ap-01-qwen-openai-compatible-one-request-isolation-smoke.md`
- `scripts/ai/run-personal-ai-provider-smoke.mjs`
- `tests/unit/run-personal-ai-provider-smoke.test.ts`

## Implementation Plan

1. Add a failing unit test for provider failure evidence containing only sanitized status/code fields.
2. Verify RED by running the focused smoke runner unit test.
3. Implement minimal error summary extraction in the smoke runner:
   - record numeric HTTP status if present on known error object fields;
   - record a normalized provider error code if present on known error object fields;
   - do not record raw error message/body/response/payload.
4. Verify GREEN with the focused unit test.
5. Run a dry-run CLI command only; do not read `.env.local` and do not execute provider requests.
6. Update docs/state/evidence/audit with redacted results and next approval boundary.
7. Run scoped Prettier, `git diff --check`, lint, typecheck, and Module Run v2 gates.
8. Create one local commit only; no merge, push, PR, cleanup, or provider request.

## Validation Commands

- `npm.cmd run test:unit -- tests/unit/run-personal-ai-provider-smoke.test.ts`
- `node scripts/ai/run-personal-ai-provider-smoke.mjs --provider openai_compatible --provider-name alibaba-qwen --base-url https://dashscope.aliyuncs.com/compatible-mode/v1 --model qwen-plus --env-key ALIBABA_API_KEY --max-requests 1 --timeout-ms 30000 --dry-run`
- `npx.cmd prettier --write --ignore-unknown <changed files>`
- `npx.cmd prettier --check --ignore-unknown <changed files>`
- `git diff --check`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId ap-01-qwen-redacted-provider-error-code-diagnostics`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId ap-01-qwen-redacted-provider-error-code-diagnostics`

## Stop Conditions

- Any need to read `.env.local`.
- Any need to send a provider/model request.
- Any need to record raw provider error details.
- Any need to change provider configuration, dependencies, package/lockfile, product source outside the runner, tests
  outside the focused unit file, e2e, schema, migrations, staging/prod/cloud/deploy, or payment/external-service files.
