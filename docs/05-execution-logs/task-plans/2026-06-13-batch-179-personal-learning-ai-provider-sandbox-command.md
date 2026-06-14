# Task Plan: batch-179-personal-learning-ai-provider-sandbox-command

## Scope

- Task: `batch-179-personal-learning-ai-provider-sandbox-command`
- Branch: `codex/batch-179-personal-learning-ai-provider-sandbox-command`
- Goal: add a local provider smoke sandbox command that future `batch-174` approval can name exactly.
- Human approval: the user approved a small task to add the sandbox command before approving `batch-174` to execute it.

## Read Before Edit

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/*.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- Recent `docs/05-execution-logs/evidence/` and `docs/05-execution-logs/audits-reviews/`, especially batch-172 and batch-173

## Boundaries

Allowed:

- Add a standalone local sandbox command under `scripts/ai/`.
- Add focused unit tests for the command under the existing `tests/unit/` Vitest surface.
- Update state, queue, task plan, evidence, and audit artifacts for this task.
- Run dry-run command validation that does not read secrets and does not call providers.

Blocked:

- Provider calls, model requests, quota use, Cost Calibration, sandbox execution with real provider access.
- Reading, creating, modifying, or printing `.env.local` or any real secret/env/provider configuration.
- Package or lockfile changes.
- Source product code, e2e, schema, Drizzle migration, deploy, payment, or external-service work.
- Formal generated-content writes or adoption.

## Implementation Approach

1. Record `batch-179` in the queue with strict allowedFiles and blockedFiles.
2. Add a TDD unit test for the CLI argument validation, dry-run output, execution approval guard, and redaction boundary.
3. Implement `scripts/ai/run-personal-ai-provider-smoke.mjs` as a standalone ESM CLI:
   - default-safe dry-run behavior;
   - real execution requires `--execute` and `TIKU_PROVIDER_SMOKE_APPROVED=1`;
   - max requests limited to `1`;
   - process environment lookup only for the named env var during real execution;
   - no dotenv loader and no `.env.local` read;
   - no prompt, payload, raw response, raw generated output, Authorization header, API key, token, or database URL in output;
   - standard `{ code, message, data }` envelope.
4. Update `batch-174` to depend on this command task and to reference the exact approved command template for future approval.

## Validation Plan

- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`
- `npm.cmd run test:unit -- tests/unit/run-personal-ai-provider-smoke.test.ts`
- `node scripts/ai/run-personal-ai-provider-smoke.mjs --provider alibaba --model qwen-plus --env-key ALIBABA_API_KEY --max-requests 1 --timeout-ms 30000 --dry-run`
- `npx.cmd prettier --check --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-06-13-batch-179-personal-learning-ai-provider-sandbox-command.md docs/05-execution-logs/evidence/2026-06-13-batch-179-personal-learning-ai-provider-sandbox-command.md docs/05-execution-logs/audits-reviews/2026-06-13-batch-179-personal-learning-ai-provider-sandbox-command.md scripts/ai/run-personal-ai-provider-smoke.mjs tests/unit/run-personal-ai-provider-smoke.test.ts`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `npm.cmd run test:unit`
- `git diff --check`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId batch-179-personal-learning-ai-provider-sandbox-command`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId batch-179-personal-learning-ai-provider-sandbox-command`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId batch-179-personal-learning-ai-provider-sandbox-command`

`npm.cmd run build` will not be run if it reads `.env.local`; that safety tradeoff will be recorded in evidence.

## Risks

- The command can only prove CLI and redaction behavior in this task; real provider behavior remains unvalidated until `batch-174` receives fresh approval.
- Provider package runtime behavior may still fail during `batch-174`; evidence must record sanitized failure category only.
- The script must not become an implicit approval to call a provider.
