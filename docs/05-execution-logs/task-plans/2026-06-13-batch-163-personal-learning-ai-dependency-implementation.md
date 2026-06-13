# Task Plan: batch-163-personal-learning-ai-dependency-implementation

## Scope

- Task: `batch-163-personal-learning-ai-dependency-implementation`
- Branch: `codex/batch-163-personal-learning-ai-dependency-implementation`
- Baseline: `48bed19a69c5e6d0019f1a9b0d34e82d6728657b`
- Task kind: dependency implementation gate.

## Readiness

- Re-read `AGENTS.md`, `docs/03-standards/code-taste-ten-commandments.md`, all ADR files,
  `docs/04-agent-system/state/project-state.yaml`, `docs/04-agent-system/state/task-queue.yaml`, and batch-162
  evidence/audit before edits.
- Confirmed `master`, `HEAD`, and `origin/master` were all `48bed19a69c5e6d0019f1a9b0d34e82d6728657b`.
- Confirmed the worktree was clean and no local or remote `codex/*` short branches remained before task branch creation.
- Created short branch `codex/batch-163-personal-learning-ai-dependency-implementation`.
- Ran pre-edit readiness with `Test-GitCompletionReadiness.ps1 -BaseBranch master`; it reported no tracked, staged, or
  untracked changes and no files changed against `origin/master`.

## Human Approval

- human approval: The user prompt on 2026-06-13 explicitly approved
  `batch-163-personal-learning-ai-dependency-implementation`.
- Approved dependency candidates: `ai`, `@ai-sdk/alibaba`, and `@ai-sdk/openai-compatible`.
- Approved package surfaces: `package.json` and `pnpm-lock.yaml`.
- Required isolation: dependency changes must be committed independently from later implementation tasks.
- Explicitly blocked: source, tests, e2e, schema, drizzle, env/secret, provider execution, deploy, payment,
  external-service, sandbox execution, generated-content persistence, and Cost Calibration.

## Dependency Gate Record

| Package                     | Current registry version | Change type | Purpose                                                                                                      | OSS grant compatibility                         | Import boundary                                             |
| --------------------------- | ------------------------ | ----------- | ------------------------------------------------------------------------------------------------------------ | ----------------------------------------------- | ----------------------------------------------------------- |
| `ai`                        | `6.0.204`                | add         | Vercel AI SDK runtime surface selected by ADR-001/ADR-006 for future personal-learning-ai provider adapters. | Apache-2.0, verified from npm package metadata. | Future server-side project-owned AI adapter modules only.   |
| `@ai-sdk/alibaba`           | `1.0.28`                 | add         | Alibaba/Qwen provider integration package selected by ADR-001 for approved future provider adapters.         | Apache-2.0, verified from npm package metadata. | Future server-side provider adapter only; no client import. |
| `@ai-sdk/openai-compatible` | `2.0.50`                 | add         | OpenAI-compatible provider bridge for future provider abstraction/fallback surfaces.                         | Apache-2.0, verified from npm package metadata. | Future server-side provider adapter only; no client import. |

Alternatives considered:

- Defer all AI SDK packages: rejected because batch-165 adapter implementation is dependent on the approved SDK surface.
- Hand-roll provider HTTP clients: rejected because ADR-001 selected Vercel AI SDK provider architecture and wrappers can
  isolate third-party naming behind project-owned modules.

Risk notes:

- Abandonment/maintenance risk is limited by the AI SDK ecosystem selected in ADR-001 and isolated by future project-owned
  adapter modules.
- Bundle/client risk is controlled by batch-165 server-side-only adapter boundaries; this task does not add imports.
- Secret/provider risk remains blocked because no provider configuration, key, env file, or model request is allowed.

## Allowed Files

- `package.json`
- `pnpm-lock.yaml`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/2026-06-13-batch-163-personal-learning-ai-dependency-implementation.md`
- `docs/05-execution-logs/evidence/2026-06-13-batch-163-personal-learning-ai-dependency-implementation.md`
- `docs/05-execution-logs/audits-reviews/2026-06-13-batch-163-personal-learning-ai-dependency-implementation.md`

## Blocked Files And Actions

- `.env.local`, `.env.example`, `src/**`, `tests/**`, `e2e/**`, `src/db/schema/**`, `drizzle/**`, `materials/**`,
  `paper_assets/**`, `playwright-report/**`, and `test-results/**` remain blocked.
- Provider calls, model requests, env/secret reads or writes, sandbox execution, generated-content writes, schema/migration,
  deploy, payment, external-service, PR, force-push, and Cost Calibration remain blocked.

## Implementation Plan

1. Install only the three approved runtime dependencies with `pnpm add ai @ai-sdk/alibaba @ai-sdk/openai-compatible`.
2. Confirm the diff is limited to `package.json`, `pnpm-lock.yaml`, task state, task queue, plan, evidence, and audit.
3. Record dependency gate evidence, including command, resolved versions, lockfile/package changes, and blocked-surface
   confirmations.
4. Commit batch-163 as an isolated dependency commit, then fast-forward merge to `master`, validate on `master`, push
   `origin master`, and delete the merged short branch.

## Validation Plan

- `git diff --check`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `npm.cmd run test:unit`
- `npm.cmd run build`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId batch-163-personal-learning-ai-dependency-implementation`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId batch-163-personal-learning-ai-dependency-implementation`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId batch-163-personal-learning-ai-dependency-implementation`
