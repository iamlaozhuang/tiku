# Task Plan: batch-130-personal-learning-ai-dedicated-local-e2e-spec

## Scope

- Task id: `batch-130-personal-learning-ai-dedicated-local-e2e-spec`
- Branch: `codex/batch-130-personal-learning-ai-dedicated-local-e2e-spec`
- Goal: add a dedicated local Playwright e2e spec for the student personal learning AI request and redacted summary.
- Fresh approval: user approved batch-130 execution and allowed adding a dedicated local e2e spec; provider, env, schema,
  dependency, deploy, payment, external-service, PR, and force-push work remain forbidden.
- Non-goals: source code changes, route changes, persistence, provider execution, schema/migration, dependency/env
  changes, headed/debug e2e mode, full-suite expansion, deployment, PR, and force push.

## Read Before Edit

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
- Recent evidence/audit: batch-129 redacted request history display.

## Allowed Files

- `e2e/personal-ai-generation-local-request.spec.ts`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/2026-06-12-batch-130-personal-learning-ai-dedicated-local-e2e-spec.md`
- `docs/05-execution-logs/evidence/2026-06-12-batch-130-personal-learning-ai-dedicated-local-e2e-spec.md`
- `docs/05-execution-logs/audits-reviews/2026-06-12-batch-130-personal-learning-ai-dedicated-local-e2e-spec.md`

## Implementation Plan

1. Run pre-edit readiness on the short branch.
2. Run the targeted e2e command before adding the spec to capture the missing-spec RED state.
3. Add `e2e/personal-ai-generation-local-request.spec.ts` using the existing local login/session and Playwright patterns.
4. Verify the spec logs in as the local student, opens `/ai-generation`, submits the local request, asserts redacted
   contract/history fields, and asserts sensitive content/session material is absent.
5. Keep evidence redacted: only command names, pass/fail, counts, and bounded summaries.

## Risk Defense

- Spec boundary: only a new local Playwright spec is added.
- Provider boundary: the spec exercises the existing local contract route only and does not enable or call formal provider
  execution.
- Secret boundary: the spec may use existing local dev credentials, but evidence must not record auth headers, session
  values, or private payloads.
- Artifact boundary: do not commit `playwright-report/**` or `test-results/**`.

## Verification Plan

- Pre-edit readiness: `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`
- RED: `npm.cmd run test:e2e -- e2e/personal-ai-generation-local-request.spec.ts`
- GREEN: `npm.cmd run test:e2e -- e2e/personal-ai-generation-local-request.spec.ts`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `npm.cmd run test:unit`
- `npm.cmd run build`
- `git diff --check`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId batch-130-personal-learning-ai-dedicated-local-e2e-spec`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId batch-130-personal-learning-ai-dedicated-local-e2e-spec`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId batch-130-personal-learning-ai-dedicated-local-e2e-spec`
