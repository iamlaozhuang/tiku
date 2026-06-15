# Unified Post Repair Next Queue Seeding Plan

## Task

- Task id: `unified-post-repair-next-queue-seeding`
- Branch: `codex/unified-post-repair-next-queue-seeding`
- Date: 2026-06-15
- Task kind: docs-only queue/state seeding.

## Fresh Instruction

The user approved the recommended next step after confirming the nine requested repair/planning candidates were already
closed: seed a small, safe next queue so the project can continue without re-claiming completed repair tasks.

## Required Reading Completed

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/*.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/04-agent-system/milestones-goals/mvp-roadmap.md`
- `docs/05-execution-logs/evidence/2026-06-15-unified-repair-candidates-completion-state-reconciliation.md`
- `docs/05-execution-logs/evidence/2026-06-14-fix-student-login-local-session-token.md`
- `docs/05-execution-logs/audits-reviews/2026-06-14-fix-student-login-local-session-token.md`

## Start Baseline

- `master` and `origin/master`: `91cefe353588cc91fdd580e1f08a96f6a660950a`
- `master...origin/master`: `0 0`
- Worktree before branch creation: clean.
- Local and remote `codex/*` residue: none observed.
- Active queue pending count: `0`.

## Scope

Allowed writes:

- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/2026-06-15-unified-post-repair-next-queue-seeding.md`
- `docs/05-execution-logs/evidence/2026-06-15-unified-post-repair-next-queue-seeding.md`
- `docs/05-execution-logs/audits-reviews/2026-06-15-unified-post-repair-next-queue-seeding.md`

Blocked files and actions:

- Source code, tests, e2e specs, scripts, schema/migration, package/lockfile, env/secret/provider configuration,
  provider/model calls, quota/cost measurement, staging/prod/cloud/deploy, payment/external-service, PR, force-push,
  and Cost Calibration Gate.
- Do not reopen the nine closed repair candidates.
- Do not resolve `fix-student-login-local-session-token` in this docs-only seeding task.

## Queue Seeding Plan

Seed the smallest useful post-repair queue:

1. `unified-post-repair-master-health-gap-audit`
   - Docs-only/read-only audit.
   - Verifies queue health, blocked task posture, roadmap phase target, and remaining local acceptance gaps.
   - Must not change source code or tests.
2. `fix-student-login-session-policy-decision`
   - Docs-only session policy decision package.
   - Records whether the project keeps `server_session` and updates stale client-token tests later, or whether a future
     high-risk task should request approval for client bearer-token persistence.
   - Must not change auth behavior or tests.
3. `phase-22-post-repair-local-acceptance-reaudit-planning`
   - Docs-only Phase 22 planning task based on the roadmap.
   - Defines the local acceptance re-audit matrix and later explicit approval gates for local verification.
   - Must not run e2e or modify runtime code.

## Validation Plan

- `git diff --check`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId unified-post-repair-next-queue-seeding`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId unified-post-repair-next-queue-seeding`

## Risk Controls

- The first seeded task is docs-only and should be the next claim target.
- The login session conflict remains blocked for implementation until a fresh decision task closes.
- Phase 22 local verification remains planning-only until a later task records explicit local-only verification approval.
- All evidence remains redacted and records only task ids, statuses, command names, file paths, and commit SHAs.
