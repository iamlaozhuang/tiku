# Phase 24 Readiness Audit Closeout Task Plan

## Required Reading

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/03-standards/local-ci.md`
- `docs/03-standards/testing-tdd.md`
- `docs/02-architecture/adr/`
- `docs/04-agent-system/sop/automation-loop.md`
- `docs/04-agent-system/sop/security-review-gate.md`
- `docs/04-agent-system/sop/fresh-local-dev-db-validation-playbook.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/04-agent-system/state/blocked-gates.yaml`
- Phase 24 child evidence files.

## Scope

- Task id: `phase-24-readiness-audit-closeout`
- Branch: `codex/phase-24-fresh-validation-operationalization`
- Allowed files:
  - `docs/04-agent-system/state/project-state.yaml`
  - `docs/04-agent-system/state/task-queue.yaml`
  - `docs/05-execution-logs/task-plans/2026-06-01-phase-24-readiness-audit-closeout.md`
  - `docs/05-execution-logs/evidence/2026-06-01-phase-24-readiness-audit-closeout.md`
  - `docs/05-execution-logs/audits-reviews/2026-06-01-phase-24-readiness-audit-closeout-security-review.md`
- Blocked:
  - `.env.local` commits or evidence values
  - `.env.example`
  - package/lockfile/dependency changes
  - schema/migration edits
  - raw SQL and destructive DB actions
  - staging/prod/cloud/deploy/real provider/external service

## Validation Commands

```powershell
git diff --check
npm.cmd run test:unit
npm.cmd run test:e2e
npm.cmd run build
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-AgentSystemReadiness.ps1
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-NamingConventions.ps1
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Invoke-QualityGate.ps1
```

## Closeout Steps

1. Run all validation commands and record pass/fail.
2. Confirm changed file scope excludes forbidden files.
3. Complete security review with verdict.
4. Commit the batch on the short-lived branch.
5. Merge to `master`, push `master`, and delete the merged branch only because the user prompt explicitly approved these actions for this batch.
6. Verify final `master` alignment with `origin/master`, local branches, worktrees, and clean status.

## Evidence

- Evidence path: `docs/05-execution-logs/evidence/2026-06-01-phase-24-readiness-audit-closeout.md`
