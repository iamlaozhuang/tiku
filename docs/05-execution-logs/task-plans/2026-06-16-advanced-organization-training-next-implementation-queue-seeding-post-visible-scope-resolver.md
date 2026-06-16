# Task Plan: advanced-organization-training-next-implementation-queue-seeding-post-visible-scope-resolver

## Metadata

- Task id: `advanced-organization-training-next-implementation-queue-seeding-post-visible-scope-resolver`
- Branch: `codex/organization-training-next-implementation-seeding`
- Baseline: `master == origin/master == 10a9e5670aedaf76f5dc7e383628f94aa1ddd545`
- Started at: `2026-06-16T05:49:08-07:00`
- Approval: current 2026-06-16 Codex thread, explicit `批准执行` after next-step recommendation.

## Read Scope

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/*.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/04-agent-system/sop/docs-only-fast-lane-governance.md`
- `docs/05-execution-logs/evidence/2026-06-15-module-run-v2-docs-only-fast-lane-mechanism.md`
- `docs/05-execution-logs/audits-reviews/2026-06-15-module-run-v2-docs-only-fast-lane-mechanism.md`
- `scripts/agent-system/Get-ModuleRunV2ImplementationSeedProposal.ps1`
- `scripts/agent-system/New-ModuleRunV2ImplementationSeed.ps1`
- `scripts/agent-system/Test-ModuleRunV2ImplementationSeedSelfReview.ps1`

## Objective

Seed the next organization-training implementation wave after the visible organization scope admin organization
repository resolver readonly recheck closed with no blocking findings.

This task is docs/state-only. It does not implement product behavior.

## Candidate Decision

Use the existing Module Run v2 auto-seed proposal and transaction scripts to append four guarded pending implementation
tasks:

- `batch-181-organization-training-organization-admin-training-draft-publish-ta`
- `batch-182-organization-training-employee-answer-lifecycle-local-role-flow`
- `batch-183-organization-training-paper-and-mock-exam-context-usage-without-ex`
- `batch-184-organization-training-audit-log-redacted-reference`

Rationale:

- The queue has no `pending` or `in_progress` tasks.
- The proposal script selects `organization-training` as the next incomplete execution module.
- The four candidate tasks are generated from the approved execution matrix and preserve provider, env, schema, deploy,
  dependency, DB, e2e/browser/dev-server, payment, external-service, PR, force-push, and Cost Calibration Gate blocks.

## Execution Plan

1. Record repository readiness and no pending queue state.
2. Add a closed docs/state-only seeding task for this queue update.
3. Run `New-ModuleRunV2ImplementationSeed.ps1 -Apply` with the approved autonomy and closeout statement.
4. Run implementation seed self-review for the four generated batch tasks.
5. Record evidence and audit with blocked gates preserved.
6. Run declared validation commands.
7. Close out, commit, fast-forward merge to `master`, push `origin/master`, delete the short branch, fetch prune, and
   confirm clean state.

## Blocked Gates

- No `.env*` read/write/output.
- No DB access and no direct row/private data read.
- No provider/model call or provider configuration.
- No provider payload, raw prompt, or raw answer inspection.
- No quota/cost measurement and no Cost Calibration Gate work.
- No dev server, Browser, Playwright, or e2e.
- No staging/prod/cloud/deploy/payment/external-service access.
- No schema, drizzle, scripts, package, lockfile, or dependency changes.
- No product source implementation in this seeding task.
- No route, service, repository, mapper, API runtime, contract, model, validator, or UI changes in this seeding task.
- No formal content write and no formal target write.
- No public identifier value list exposure.
- No PR and no force push.

## Validation Plan

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Get-ModuleRunV2ImplementationSeedProposal.ps1 -TaskId advanced-organization-training-publish-version-route-visible-organization-scope-admin-organization-repository-resolver-readonly-recheck -MaxBatchCount 4
powershell.exe -NoProfile -ExecutionPolicy Bypass -Command "& '.\scripts\agent-system\Test-ModuleRunV2ImplementationSeedSelfReview.ps1' -SeedTaskIds @('batch-181-organization-training-organization-admin-training-draft-publish-ta','batch-182-organization-training-employee-answer-lifecycle-local-role-flow','batch-183-organization-training-paper-and-mock-exam-context-usage-without-ex','batch-184-organization-training-audit-log-redacted-reference') -ExpectedModule organization-training"
git diff --check
npm.cmd run lint
npm.cmd run typecheck
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId advanced-organization-training-next-implementation-queue-seeding-post-visible-scope-resolver
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId advanced-organization-training-next-implementation-queue-seeding-post-visible-scope-resolver
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId advanced-organization-training-next-implementation-queue-seeding-post-visible-scope-resolver
```
