# Task Plan: phase-3-question-paper-readiness-evidence

## Goal

Close Phase 3 question/paper readiness by collecting final evidence after all queued Phase 3 dependencies are done, running the task-declared validation gates, and advancing durable state for the next phase.

## Required Reading

- `AGENTS.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/04-agent-system/milestones-goals/mvp-roadmap.md`
- `docs/01-requirements/stories/`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/02-architecture/interfaces/question-paper-contract.md`
- `docs/03-standards/git-workflow.md`
- `docs/03-standards/local-ci.md`
- `docs/03-standards/testing-tdd.md`
- `docs/04-agent-system/sop/automation-loop.md`
- `docs/04-agent-system/sop/security-review-gate.md`
- `docs/05-execution-logs/evidence/2026-05-19-phase-3-admin-paper-ui-baseline.md`
- `docs/05-execution-logs/evidence/2026-05-19-browser-verification-hardening.md`

## Scope

- Task id: `phase-3-question-paper-readiness-evidence`
- Branch: `codex/phase-3-question-paper-readiness-evidence`
- Worktree: `F:\tiku\.worktrees\phase-3-question-paper-readiness-evidence`
- Base: `master`

Allowed by queue:

- `docs/05-execution-logs/evidence/2026-05-19-phase-3-question-paper-readiness.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`

Additional mandatory agent-discipline artifact:

- `docs/05-execution-logs/task-plans/2026-05-19-phase-3-question-paper-readiness.md`

Blocked files:

- `package.json`
- `pnpm-lock.yaml`
- `package-lock.json`
- `src/**`
- `src/db/schema/**`
- `drizzle/**`
- `.env.example`

## Implementation Notes

1. Do not create or modify runtime source code, schemas, migrations, dependency manifests, lockfiles, or environment examples.
2. Summarize completed Phase 3 work from existing evidence files and queue status.
3. Mark `phase-3-question-paper-readiness-evidence` done only after the task-declared commands pass or any failure is recorded.
4. Advance `project.currentPhase` to `phase-4-student-experience` after readiness is recorded.
5. Set `handoff.nextRecommendedAction` to `plan_phase_4_student_experience`.
6. Keep final evidence explicit about merge, push, and cleanup because the user approved this closeout flow for `origin/master`.

## Validation Commands

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-AgentSystemReadiness.ps1
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-NamingConventions.ps1
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Invoke-QualityGate.ps1
npm.cmd run build
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master
```

## Risk Controls

- Dependency change: no.
- Database migration: no.
- Runtime API or authorization behavior: no.
- Security review: not required as a separate artifact because this task only records evidence and state; previous Phase 3 implementation tasks carried their own security reviews where required.
- Push: explicitly requested by the user for this run; evidence must record remote target and result.

## Evidence Plan

- Record dependency status for the Phase 3 queue.
- Record validation command outputs and exit status.
- Record changed files inventory.
- Record commit, fast-forward merge, master validation, push, and cleanup status.
- Include the required taste compliance checklist in the final handoff.
