# Git Submit Push Hardening Implementation Plan

**Task id:** `phase-2-git-submit-push-hardening`

**Goal:** Harden the semi-automation mechanism for task commits, local merges, push decisions, closeout evidence, and worktree cleanup based on the Phase 2 auth/session delivery experience.

## Context Read

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/03-standards/git-workflow.md`
- `docs/03-standards/local-ci.md`
- `docs/04-agent-system/sop/automation-loop.md`
- `docs/04-agent-system/sop/dependency-introduction-gate.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `scripts/agent-system/Test-AgentSystemReadiness.ps1`
- `scripts/agent-system/Invoke-QualityGate.ps1`

## Scope

Allowed files:

- `AGENTS.md`
- `docs/03-standards/git-workflow.md`
- `docs/03-standards/local-ci.md`
- `docs/04-agent-system/sop/automation-loop.md`
- `docs/04-agent-system/sop/dependency-introduction-gate.md`
- `scripts/agent-system/Test-GitCompletionReadiness.ps1`
- `scripts/agent-system/Test-AgentSystemReadiness.ps1`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/2026-05-17-git-submit-push-hardening.md`
- `docs/05-execution-logs/evidence/2026-05-17-git-submit-push-hardening.md`

Blocked files:

- `package.json`
- `pnpm-lock.yaml`
- `package-lock.json`
- `src/**`
- `drizzle/**`
- `.env.example`

## Implementation Steps

1. Add an ad hoc governance task to `task-queue.yaml` and claim it in `project-state.yaml`.
2. Strengthen `AGENTS.md` with commit/push discipline:
   - task done -> evidence -> commit -> next task
   - dependency changes require isolated commits
   - merge does not imply push
   - post-merge validation precedes cleanup
3. Strengthen `docs/03-standards/git-workflow.md` with:
   - one task, one commit default
   - staged/untracked diff inventory commands
   - local merge, push decision, and closeout evidence rules
   - Windows long-path cleanup fallback for `.worktrees/` residue
4. Strengthen `docs/04-agent-system/sop/automation-loop.md` with:
   - task commit barrier
   - dependency commit barrier
   - push decision gate
   - closeout evidence requirements
5. Add `scripts/agent-system/Test-GitCompletionReadiness.ps1` as a read-only helper that prints branch state, changed tracked files, untracked files, staged summary, upstream ahead/behind, and base compare commits.
6. Register the new helper in `Test-AgentSystemReadiness.ps1`.
7. Run validation:
   - PowerShell parser check for all `scripts/agent-system/*.ps1`
   - `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`
   - `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-AgentSystemReadiness.ps1`
   - `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Invoke-QualityGate.ps1`
   - `npm.cmd run format:check`
8. Write evidence, mark the governance task done, and set handoff back to `claim_phase_2_user_registration_baseline`.

## Self-Review

- Spec coverage: covers the observed issues from recent delivery: bundled commits, dependency/task mixing, missing push decision point, untracked file visibility, closeout evidence, and Windows worktree cleanup.
- Placeholder scan: no placeholder/TBD steps remain.
- Type/name consistency: script and task names use `git-completion-readiness` / `phase-2-git-submit-push-hardening` consistently; no business glossary terms are introduced.
- Risk: this is governance/tooling only; no business code, dependencies, schema, migrations, or environment files are touched.
