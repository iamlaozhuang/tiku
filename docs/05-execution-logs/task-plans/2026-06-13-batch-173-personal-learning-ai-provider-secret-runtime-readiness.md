# Task Plan: batch-173-personal-learning-ai-provider-secret-runtime-readiness

## Scope

- Task: `batch-173-personal-learning-ai-provider-secret-runtime-readiness`
- Branch: `codex/batch-173-personal-learning-ai-provider-secret-runtime-readiness`
- Baseline: `5f27290d84712eff4d6d023f1a6560143a99a089`
- Task kind: docs-only provider secret/runtime readiness gate.

## Readiness

- Re-read `AGENTS.md`.
- Re-read `docs/03-standards/code-taste-ten-commandments.md`.
- Re-read `docs/02-architecture/adr/*.md`.
- Re-read `docs/04-agent-system/state/project-state.yaml`.
- Re-read `docs/04-agent-system/state/task-queue.yaml`.
- Re-read recent batch-172 evidence/audit and batch-162 evidence/audit anchors.
- Confirmed `HEAD`, `master`, and `origin/master` are all `5f27290d84712eff4d6d023f1a6560143a99a089`.
- Confirmed the worktree is clean before edits.
- Confirmed no local or remote `codex/*` branches remained before task branch creation.
- Created short branch `codex/batch-173-personal-learning-ai-provider-secret-runtime-readiness`.
- Ran pre-edit readiness with `Test-GitCompletionReadiness.ps1 -BaseBranch master`; it passed.

## Human Approval

- human approval: The user prompt on 2026-06-13 approved executing
  `batch-173-personal-learning-ai-provider-secret-runtime-readiness`.
- Approved scope:
  - docs/state/queue/task-plan/evidence/audit only;
  - record the readiness gate;
  - record the human-operated secret configuration boundary;
  - record the conditions required before entering batch-174.
- Not approved:
  - reading, creating, or modifying `.env.local`;
  - reading, creating, modifying, or printing any real secret, env file, or provider configuration;
  - provider calls, model requests, sandbox execution, Cost Calibration;
  - source, test, schema, Drizzle, dependency, package, or lockfile changes.

## Allowed Files

- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/2026-06-13-batch-173-personal-learning-ai-provider-secret-runtime-readiness.md`
- `docs/05-execution-logs/evidence/2026-06-13-batch-173-personal-learning-ai-provider-secret-runtime-readiness.md`
- `docs/05-execution-logs/audits-reviews/2026-06-13-batch-173-personal-learning-ai-provider-secret-runtime-readiness.md`

## Blocked Files And Actions

- `.env.local`, `.env.example`, `package.json`, `pnpm-lock.yaml`, package lockfiles.
- `src/**`, `tests/**`, `e2e/**`, `src/db/schema/**`, `drizzle/**`, `playwright-report/**`, `test-results/**`.
- Provider calls, model requests, local provider sandbox execution, env/secret access, provider configuration access,
  schema/migration, dependency changes, source/test/e2e changes, staging/prod/cloud, deploy, payment, external-service,
  PR, force-push, formal generated-content adoption, and Cost Calibration.

## Readiness Gate Design

- This task records that runtime readiness cannot be machine-verified under the current approval because real env/secret
  and provider configuration access is blocked.
- The allowed outcome is a closed docs-only gate that defines what a human must confirm outside this task before
  `batch-174-personal-learning-ai-local-provider-sandbox-smoke` can be considered for fresh approval.
- `batch-174` must remain blocked after this task.

## Batch-174 Entry Conditions

Future approval for `batch-174` must explicitly name:

- provider and model;
- exact sandbox command;
- maximum request count;
- spend or quota ceiling;
- timeout;
- redaction rules;
- stop conditions;
- whether the command may read local env/secret configuration;
- evidence fields allowed to be recorded.

The future task must still avoid recording raw prompts, provider payloads, provider responses, Authorization headers,
API keys, secrets, tokens, database URLs, row data, or raw generated output.

## Validation Plan

- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`
- `npx.cmd prettier --check --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-06-13-batch-173-personal-learning-ai-provider-secret-runtime-readiness.md docs/05-execution-logs/evidence/2026-06-13-batch-173-personal-learning-ai-provider-secret-runtime-readiness.md docs/05-execution-logs/audits-reviews/2026-06-13-batch-173-personal-learning-ai-provider-secret-runtime-readiness.md`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `git diff --check`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId batch-173-personal-learning-ai-provider-secret-runtime-readiness`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId batch-173-personal-learning-ai-provider-secret-runtime-readiness`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId batch-173-personal-learning-ai-provider-secret-runtime-readiness`

## Validation Boundary

- `npm.cmd run test:unit` may be run if it stays within normal test execution and does not require env/secret access.
- `npm.cmd run build` is intentionally not planned because local Next.js build has previously reported loading
  `.env.local`, which conflicts with this task's explicit no real env/secret access approval boundary.

## Rollback And Recovery

- Revert the batch branch before merge if validation fails.
- No runtime rollback is required because this task changes no source, schema, migration, dependency, env/secret,
  provider configuration, sandbox command, deployment, or generated-content behavior.
