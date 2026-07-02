# AI generation owner preview closeout audit task plan

## Task

- Task id: `ai-generation-owner-preview-closeout-audit-2026-07-02`
- Branch: `codex/ai-generation-owner-preview-closeout-audit`
- Goal: review the AI出题 / AI组卷 owner-preview repair chain and estimate the remaining task count without changing runtime code.

## Scope

- Docs/state-only closeout audit.
- No source/test/runtime/API/schema/dependency changes.
- No localhost browser actions, Provider calls, env access, DB access, e2e, staging/prod/cloud/deploy, Cost Calibration, release readiness, or final Pass claim.

## Read List

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- Recent AI generation task plans, evidence, and audit reviews under `docs/05-execution-logs/`.

## Audit Method

1. Build a successor chain from each recent `completed_with_findings` AI generation task to its follow-up repair and rerun.
2. Separate current-goal product blockers from future-scope or data-coverage blockers.
3. Record the minimum remaining task estimate:
   - mandatory tasks to close the current scoped goal,
   - conditional tasks if final audit finds an unclosed product blocker,
   - optional broader tasks for full resource coverage or larger acceptance scope.
4. Keep evidence redacted and summary-only.

## Validation

- `npm.cmd exec -- prettier --check --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-07-02-ai-generation-owner-preview-closeout-audit.md docs/05-execution-logs/evidence/2026-07-02-ai-generation-owner-preview-closeout-audit.md docs/05-execution-logs/audits-reviews/2026-07-02-ai-generation-owner-preview-closeout-audit.md`
- `git diff --check`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId ai-generation-owner-preview-closeout-audit-2026-07-02`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId ai-generation-owner-preview-closeout-audit-2026-07-02 -SkipRemoteAheadCheck`
