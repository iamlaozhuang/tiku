# Module Run v2 Auto-Seed Evidence: ai-task-and-provider

## Summary

The auto-seed transaction appended guarded pending implementation tasks for `ai-task-and-provider`.

## Source

- sourcePlanningTask: `phase-70-advanced-ai-task-domain-implementation-planning`
- approvalAnchor: `autoDriveLocalImplementationApproval`
- standingCloseoutApproval: `recorded`
- approvalStatement: User approved autoDriveLocalImplementationApproval for module ai-task-and-provider; low-risk local implementation tasks only; local commit, fast-forward merge to master, push origin/master, merged short-branch cleanup, and worktree parking if any are approved under standingUnattendedLocalCloseoutApproval. High-risk capability gates remain blocked: provider/env/dependency/schema/deploy/payment/PR/force-push/Cost Calibration Gate. No provider/model calls, no env/secret access, no dependency or schema changes, no deployment/payment/PR/force-push.

## Seeded Tasks

- `batch-232-ai-task-and-provider-provider-agnostic-ai-task-lifecycle-contract`: provider-agnostic AI task lifecycle contracts
- `batch-233-ai-task-and-provider-local-task-request-policy-and-result-referen`: local task request policy and result reference contracts
- `batch-234-ai-task-and-provider-redacted-audit-log-and-ai-call-log-evidence`: redacted audit_log and ai_call_log evidence references
- `batch-235-ai-task-and-provider-local-provider-sandbox-proposal-and-evidence`: local_provider_sandbox proposal and evidence rules

## Readiness Anchors

- implementationAutoSeedGate: satisfied by this guarded seed transaction.
- localExperienceClosureGate: planned for seeded local implementation tasks.
- seededImplementationTask: true for every candidate task listed above.
- focused test plan: each seeded task must replace the placeholder with scoped local unit validation before closeout.
- localFullLoopGate: L2

## Boundary

- Cost Calibration Gate remains blocked.
- Local Docker database use remains task_approval_required.
- Project resource reads remain task_approval_required.
- Provider calls remain blocked_without_task_approval.
- Schema migration remains blocked_without_task_approval.

## Closeout Requirement

This seed transaction must be committed and integrated before any seeded implementation task is claimed.
Seeded implementation task closeout is approved only when `standingCloseoutApproval` is `recorded` and all readiness,
validation, pre-push, scope, lease, registry, hygiene, and remote-divergence gates pass.

## Validation

- `git status --short --branch`: clean `master` before branch creation.
- `Get-TikuProjectStatus.ps1`: `seed_proposal_available`, module `ai-task-and-provider`, dirty=false before seed.
- `Get-ModuleRunV2ImplementationSeedProposal.ps1 -MaxBatchCount 8`: proposal available, 4 candidates, blocked remainder none.
- `New-ModuleRunV2ImplementationSeed.ps1 -MaxBatchCount 8 -Apply`: seeded 4 tasks and recorded standing closeout approval.
- `Test-ModuleRunV2ImplementationSeedSelfReview.ps1 -ExpectedModule ai-task-and-provider`: diagnostic failure because the unscoped command also scanned unrelated closed `ops-governance-and-retention` seeded tasks.
- `Test-ModuleRunV2ImplementationSeedSelfReview.ps1 -ExpectedModule ai-task-and-provider -SeedTaskIds batch-232-ai-task-and-provider-provider-agnostic-ai-task-lifecycle-contract,batch-233-ai-task-and-provider-local-task-request-policy-and-result-referen,batch-234-ai-task-and-provider-redacted-audit-log-and-ai-call-log-evidence,batch-235-ai-task-and-provider-local-provider-sandbox-proposal-and-evidence`: passed; MECE complete; gap 0; overlap 0.
- `npx.cmd prettier --write --ignore-unknown ...`: formatted the seed transaction docs/state files.
- `npx.cmd prettier --check --ignore-unknown ...`: passed.
- `npm.cmd run lint`: passed.
- `npm.cmd run typecheck`: passed.
- `git diff --check`: passed with CRLF normalization warning for `task-queue.yaml`.
- `Get-TikuNextAction.ps1 -VerboseHistory`: next executable task is `batch-232-ai-task-and-provider-provider-agnostic-ai-task-lifecycle-contract`; current seed transaction must close before claiming it.
- `Get-TikuProjectStatus.ps1`: dirty worktree acknowledged after seed; next action is to close current changes before `batch-232`.
