# Task Plan: module-run-v2-auto-seed-authorization-and-access

## Scope

Apply the next Module Run v2 implementation seed for `authorization-and-access`. The goal is to let future low-risk
local implementation work proceed with fewer manual interruptions while preserving code quality gates.

This task only appends pending seeded implementation tasks and writes seed evidence/audit templates. It does not perform
product implementation, run provider calls, read or write env/secrets, change dependencies or lockfiles, change schema
or migrations, run e2e, deploy, touch payment or external-service state, create PRs, force-push, or execute Cost
Calibration Gate.

## Approval

The user approved starting the recommended Phase 3 seed flow and stated the goal is to let the automatic advancement
mechanism proceed smoothly under code quality protection with minimal manual intervention.

Approval anchors to be recorded in the seed transaction:

- `autoDriveLocalImplementationApproval`: approve controlled auto-seeding for the `authorization-and-access` low-risk
  local implementation batch.
- `standingUnattendedLocalCloseoutApproval`: use the existing project-state standing approval for low-risk local
  implementation tasks only, including local commit, fast-forward merge to master, push origin/master, merged
  short-branch cleanup, and worktree parking when all gates pass.
- High-risk capability gates remain blocked.

## Required Reads

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/04-agent-system/sop/code-stage-task-seeding-governance.md`
- `docs/04-agent-system/sop/automated-advancement-governance.md`
- `scripts/agent-system/Get-ModuleRunV2ImplementationSeedProposal.ps1`
- `scripts/agent-system/New-ModuleRunV2ImplementationSeed.ps1`
- `scripts/agent-system/Test-ModuleRunV2ImplementationSeedSelfReview.ps1`

## Baseline Proposal

Read-only proposal command:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Get-ModuleRunV2ImplementationSeedProposal.ps1 -MaxBatchCount 4
```

Observed proposal:

- `seedProposalDecision: proposal_available`
- `seedModule: authorization-and-access`
- `seedSourcePlanningTask: phase-69-advanced-authorization-context-implementation-planning`
- `seedCandidateTaskCount: 4`
- `seedRequiredApproval: autoDriveLocalImplementationApproval for module authorization-and-access`

Seed candidates:

- `batch-115-authorization-and-access-authorization-read-model-and-display-contrac`
- `batch-116-authorization-and-access-personal-auth-and-org-auth-local-summaries`
- `batch-117-authorization-and-access-paper-and-mock-exam-access-context-without-c`
- `batch-118-authorization-and-access-redeem-code-audit-log-and-ai-call-log-redact`

## Required Seed Shape

New seeded implementation tasks must include `validationCommandLifecycle` with these phases:

- `pre_edit`
- `post_edit`
- `advisory_baseline`
- `closeout`

Do not backfill historical implementation tasks.

## Expected Files

Modify:

- `docs/04-agent-system/state/task-queue.yaml`

Create:

- `docs/05-execution-logs/task-plans/2026-06-11-module-run-v2-auto-seed-authorization-and-access.md`
- `docs/05-execution-logs/evidence/2026-06-11-module-run-v2-auto-seed-authorization-and-access.md`
- `docs/05-execution-logs/audits-reviews/2026-06-11-module-run-v2-auto-seed-authorization-and-access.md`
- `docs/05-execution-logs/evidence/batch-115-authorization-and-access-authorization-read-model-and-display-contrac.md`
- `docs/05-execution-logs/audits-reviews/batch-115-authorization-and-access-authorization-read-model-and-display-contrac.md`
- `docs/05-execution-logs/evidence/batch-116-authorization-and-access-personal-auth-and-org-auth-local-summaries.md`
- `docs/05-execution-logs/audits-reviews/batch-116-authorization-and-access-personal-auth-and-org-auth-local-summaries.md`
- `docs/05-execution-logs/evidence/batch-117-authorization-and-access-paper-and-mock-exam-access-context-without-c.md`
- `docs/05-execution-logs/audits-reviews/batch-117-authorization-and-access-paper-and-mock-exam-access-context-without-c.md`
- `docs/05-execution-logs/evidence/batch-118-authorization-and-access-redeem-code-audit-log-and-ai-call-log-redact.md`
- `docs/05-execution-logs/audits-reviews/batch-118-authorization-and-access-redeem-code-audit-log-and-ai-call-log-redact.md`

## Execution Steps

1. Run the read-only seed proposal.
2. Apply the seed transaction with explicit approval anchors.
3. Run seed self-review for `authorization-and-access`.
4. Verify each new task has `validationCommandLifecycle` phases and no broad focused baseline in legacy
   `validationCommands`.
5. Format changed YAML/Markdown files.
6. Run local quality and mechanism gates.
7. Commit, fast-forward merge, push, and clean up the short-lived worktree if gates pass.

## Validation Plan

- PyYAML parse for `task-queue.yaml`.
- New seeded task structure check: four pending tasks, `seededImplementationTask: true`, taskKind `implementation`,
  lifecycle phases present, `advisory_baseline` present, high-risk gates blocked.
- `Test-ModuleRunV2ImplementationSeedSelfReview.ps1 -ExpectedModule authorization-and-access -SeedTaskIds <batch-115..118>`.
- `New-ModuleRunV2ImplementationSeed.Smoke.ps1`.
- `Test-ModuleRunV2ImplementationSeedSelfReview.Smoke.ps1`.
- Scoped Prettier check for changed YAML/Markdown files.
- `npm.cmd run lint`.
- `npm.cmd run typecheck`.
- `git diff --check`.
- `Test-GitCompletionReadiness.ps1 -BaseBranch master`.
- `Test-ModuleRunV2PreCommitHardening.ps1` with changed files if applicable.
- `Test-ModuleRunV2PrePushReadiness.ps1` before push.

## Risk Controls

- No historical task backfill.
- No product code execution in this seed task.
- No e2e, provider, env/secret, dependency, schema/migration, deploy, payment, external-service, PR, force-push, or Cost
  Calibration Gate work.
- The next implementation tasks must still be individually claimed and validated before their product code changes.
