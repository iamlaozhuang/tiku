# Governance Queue Closed Task Archive Candidate Task Plan

## Task

- Task id: `governance-queue-closed-task-archive-candidate-2026-06-30`
- Branch: `codex/governance-queue-archive-candidate-20260630`
- Goal: decide whether the current closed-task queue/history surface should be archived now or split into a later safer archival task.
- Non-goals: no archive file writes, no history index changes, no source/test/package/script changes, no DB, no Provider/AI, no browser/e2e/dev server, no staging/prod/cloud/deploy, no release readiness, no final Pass, no Cost Calibration, no PR, no force-push.

## Required Read List

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/03-standards/open-source-introduction.md`
- `docs/02-architecture/adr/**`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/evidence/2026-06-30-security-dependency-install-script-policy-decision.md`
- `docs/05-execution-logs/acceptance/2026-06-30-security-dependency-install-script-policy-decision.md`

## Writable Scope

- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/01-requirements/traceability/2026-06-30-governance-queue-closed-task-archive-candidate.md`
- `docs/05-execution-logs/task-plans/2026-06-30-governance-queue-closed-task-archive-candidate.md`
- `docs/05-execution-logs/evidence/2026-06-30-governance-queue-closed-task-archive-candidate.md`
- `docs/05-execution-logs/audits-reviews/2026-06-30-governance-queue-closed-task-archive-candidate.md`
- `docs/05-execution-logs/acceptance/2026-06-30-governance-queue-closed-task-archive-candidate.md`

## Read-Only Scope

- Governance, standards, ADR, state/queue, and latest task evidence listed above.
- Path and count summaries from `docs/05-execution-logs/**` and `docs/01-requirements/traceability/**` may be inspected with redacted counts only.

## Decision Candidate

- Do not archive or move closed tasks in this task.
- Record that the queue is large and should only be archived by a future task with exact archive files, index policy, rollback plan, and post-archive validation.
- Keep `docs/04-agent-system/state/archive/**` and `docs/04-agent-system/state/task-history-index.yaml` blocked in this task.

## Validation Commands

```powershell
rg -n "governance-queue-closed-task-archive-candidate-2026-06-30" docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/evidence/2026-06-30-governance-queue-closed-task-archive-candidate.md docs/05-execution-logs/acceptance/2026-06-30-governance-queue-closed-task-archive-candidate.md
npx.cmd prettier --write --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/01-requirements/traceability/2026-06-30-governance-queue-closed-task-archive-candidate.md docs/05-execution-logs/task-plans/2026-06-30-governance-queue-closed-task-archive-candidate.md docs/05-execution-logs/evidence/2026-06-30-governance-queue-closed-task-archive-candidate.md docs/05-execution-logs/audits-reviews/2026-06-30-governance-queue-closed-task-archive-candidate.md docs/05-execution-logs/acceptance/2026-06-30-governance-queue-closed-task-archive-candidate.md
npx.cmd prettier --check --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/01-requirements/traceability/2026-06-30-governance-queue-closed-task-archive-candidate.md docs/05-execution-logs/task-plans/2026-06-30-governance-queue-closed-task-archive-candidate.md docs/05-execution-logs/evidence/2026-06-30-governance-queue-closed-task-archive-candidate.md docs/05-execution-logs/audits-reviews/2026-06-30-governance-queue-closed-task-archive-candidate.md docs/05-execution-logs/acceptance/2026-06-30-governance-queue-closed-task-archive-candidate.md
git diff --check
git diff --name-only -- docs/04-agent-system/state/archive docs/04-agent-system/state/task-history-index.yaml package.json pnpm-lock.yaml pnpm-workspace.yaml src tests scripts src/db drizzle migrations seed e2e playwright-report test-results .next .env package-lock.yaml package-lock.json
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId governance-queue-closed-task-archive-candidate-2026-06-30
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId governance-queue-closed-task-archive-candidate-2026-06-30
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId governance-queue-closed-task-archive-candidate-2026-06-30 -SkipRemoteAheadCheck
```

## Closeout Policy

If validation passes, local commit, fast-forward merge to `master`, push to `origin/master`, and cleanup of the merged short branch are approved by `securityFollowupCentralApproval20260630`.

This is not release readiness, not a final Pass, and not Cost Calibration.
