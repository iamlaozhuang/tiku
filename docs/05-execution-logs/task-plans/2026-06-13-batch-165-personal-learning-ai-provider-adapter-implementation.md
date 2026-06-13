# Task Plan: batch-165-personal-learning-ai-provider-adapter-implementation

## Scope

- Task: `batch-165-personal-learning-ai-provider-adapter-implementation`
- Branch: `codex/batch-165-personal-learning-ai-provider-adapter-implementation`
- Baseline: `0f97110cda079097dad0209829b6e901c0939269`
- Task kind: server-side provider adapter implementation.

## Readiness

- Re-read `AGENTS.md`, `docs/03-standards/code-taste-ten-commandments.md`, all ADR files, project state, task queue,
  recent evidence/audit including batch-162 through batch-164, TDD skill guidance, and Vercel AI SDK guidance before
  implementation.
- Confirmed `master`, `HEAD`, and `origin/master` were all `0f97110cda079097dad0209829b6e901c0939269`.
- Confirmed the worktree was clean and no local or remote `codex/*` short branches remained before task branch creation.
- Created short branch `codex/batch-165-personal-learning-ai-provider-adapter-implementation`.
- Ran pre-edit readiness with `Test-GitCompletionReadiness.ps1 -BaseBranch master`; it reported no tracked, staged, or
  untracked changes and no files changed against `origin/master`.
- Consulted official AI SDK docs for Alibaba and OpenAI-compatible provider instance creation and local package type
  definitions for `createAlibaba` and `createOpenAICompatible`.

## Human Approval

- human approval: The user prompt on 2026-06-13 explicitly approved
  `batch-165-personal-learning-ai-provider-adapter-implementation`.
- Approved implementation surface: server-side adapter files and corresponding unit tests under the task allowedFiles.
- Explicitly blocked: real provider calls, env/secret reads or use, `.env.local`, `.env.example`, provider configuration
  files, sandbox execution, generated-content persistence, schema/migration, e2e, deploy, payment, external-service, PR,
  force-push, and Cost Calibration.

## TDD Plan

1. RED: add `src/server/services/ai-generation-task-provider-adapter-service.test.ts` with expected adapter behavior and
   run the targeted unit test to observe failure before production code exists.
2. GREEN: add the minimal contract, validator, and service implementation to pass the targeted test.
3. REFACTOR: keep the adapter focused on server-side model-handle creation only; no provider call, env read, or secret
   use.
4. Run the targeted unit test, then the full validation surface.

## Adapter Boundary

- Runtime status: server-side adapter only.
- Supported providers: `alibaba` and `openai_compatible`.
- Provider factory creation is isolated behind service-level factories.
- The adapter may create a language model handle with empty credential settings for future wiring, but it must not call
  `generateText`, `streamText`, any provider endpoint, or any sandbox.
- The adapter must surface blocked reasons for client-side access, provider calls, env/secret access, provider
  configuration reads, and missing OpenAI-compatible base URL.

## Allowed Files

- `src/ai/**`
- `src/server/services/ai-generation-task-provider-*.ts`
- `src/server/services/ai-generation-task-provider-*.test.ts`
- `src/server/contracts/ai-generation-task-provider-*.ts`
- `src/server/validators/ai-generation-task-provider-*.ts`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/2026-06-13-batch-165-personal-learning-ai-provider-adapter-implementation.md`
- `docs/05-execution-logs/evidence/2026-06-13-batch-165-personal-learning-ai-provider-adapter-implementation.md`
- `docs/05-execution-logs/audits-reviews/2026-06-13-batch-165-personal-learning-ai-provider-adapter-implementation.md`

## Blocked Files And Actions

- `.env.local`, `.env.example`, package/lockfile, e2e, schema/migration, drizzle, materials, paper assets,
  Playwright report, and test-result paths remain blocked.
- Real provider calls, env/secret reads or use, sandbox execution, generated-content writes, deploy, payment,
  external-service, PR, force-push, and Cost Calibration remain blocked.

## Validation Plan

- Targeted RED/GREEN unit command:
  `npm.cmd run test:unit -- src/server/services/ai-generation-task-provider-adapter-service.test.ts`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `npm.cmd run test:unit`
- `npm.cmd run build`
- `git diff --check`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId batch-165-personal-learning-ai-provider-adapter-implementation`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId batch-165-personal-learning-ai-provider-adapter-implementation`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId batch-165-personal-learning-ai-provider-adapter-implementation`
