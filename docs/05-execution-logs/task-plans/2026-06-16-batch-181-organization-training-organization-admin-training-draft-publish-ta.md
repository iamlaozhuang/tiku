# Task Plan: batch-181-organization-training-organization-admin-training-draft-publish-ta

## Metadata

- Task id: `batch-181-organization-training-organization-admin-training-draft-publish-ta`
- Branch: `codex/organization-training-batch-181-draft-publish-flow`
- Baseline: `master == origin/master == 4462a5dc4ee322bf2fb3cde340ab8d30dad95222`
- Started at: `2026-06-16T06:10:46-07:00`
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
- `docs/05-execution-logs/evidence/batch-181-organization-training-organization-admin-training-draft-publish-ta.md`
- `docs/05-execution-logs/audits-reviews/batch-181-organization-training-organization-admin-training-draft-publish-ta.md`
- `docs/superpowers/plans/2026-06-06-advanced-edition-organization-training-implementation-plan.md`
- `docs/01-requirements/advanced-edition/modules/04-organization-training.md`
- `docs/01-requirements/advanced-edition/stories/epic-02-organization-training.md`
- `src/server/models/organization-training.ts`
- `src/server/contracts/organization-training-contract.ts`
- `src/server/validators/organization-training.ts`
- `src/server/validators/organization-training.test.ts`
- `src/server/services/organization-training-service.ts`
- `src/server/services/organization-training-service.test.ts`
- `src/server/services/organization-training-route.ts`

## Objective

Close the organization admin training draft, publish, takedown, and copy-to-new-draft service lifecycle boundary for the
organization-training module.

## Current Findings

- Manual draft creation and publish-version service behavior already exist with tests.
- Takedown and copy-to-new-draft service methods are not present.
- `Test-ModuleRunV2ImplementationAutoSeedReadiness.ps1` first failed before implementation because the source planning
  evidence `docs/05-execution-logs/evidence/2026-06-07-phase-72-advanced-organization-training-implementation-planning.md`
  lacks auto-seed readiness text anchors. Candidate task scope and validation command anchors passed.

## Execution Plan

1. Repair the source planning evidence with the minimal required auto-seed text anchors:
   `implementationAutoSeedGate`, `localExperienceClosureGate`, `seededImplementationTask`, `focused test`, and
   `localFullLoopGate`.
2. Rerun `Test-ModuleRunV2ImplementationAutoSeedReadiness.ps1` and record RED/PASS evidence.
3. Add failing service tests for:
   - takedown persists `taken_down`, timestamp, reason, and keeps historical version fields intact;
   - takedown rejects invalid input and does not call the store;
   - copy-to-new-draft creates a fresh `organization_training_draft` from a published version snapshot without mutating
     the source version or formal content targets.
4. Run focused unit tests and confirm RED for missing service methods/store methods.
5. Implement minimal service-layer types, store methods, and orchestration for takedown and copy-to-new-draft.
6. Rerun focused unit tests for GREEN, then lint/typecheck/diff and Module Run v2 closeout gates.
7. Record evidence/audit, commit, fast-forward merge to `master`, push `origin/master`, and clean the short branch if
   all gates pass.

## Allowed Changes

- `src/server/models/**`
- `src/server/contracts/**`
- `src/server/validators/**`
- `src/server/services/**`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/**`
- `docs/05-execution-logs/evidence/**`
- `docs/05-execution-logs/audits-reviews/**`

## Blocked Gates

- No `.env*` read/write/output.
- No real DB execution and no direct row/private data read.
- No provider/model call or provider configuration.
- No provider payload, raw prompt, or raw answer inspection.
- No quota/cost measurement and no Cost Calibration Gate work.
- No dev server, Browser, Playwright, or e2e.
- No staging/prod/cloud/deploy/payment/external-service access.
- No schema, drizzle, scripts, package, lockfile, or dependency changes.
- No repository/schema/route/UI expansion unless a later task explicitly permits it.
- No formal `question`, `paper`, `practice`, `mock_exam`, `answer_record`, `exam_report`, or `mistake_book` write path.
- No public identifier value list exposure in evidence.
- No PR and no force push.

## Validation Plan

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ImplementationAutoSeedReadiness.ps1 -TaskId phase-72-advanced-organization-training-implementation-planning -CandidateTaskId batch-181-organization-training-organization-admin-training-draft-publish-ta
npm.cmd run test:unit -- src/server/services/organization-training-service.test.ts src/server/validators/organization-training.test.ts
git diff --check
npm.cmd run lint
npm.cmd run typecheck
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId batch-181-organization-training-organization-admin-training-draft-publish-ta
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId batch-181-organization-training-organization-admin-training-draft-publish-ta
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId batch-181-organization-training-organization-admin-training-draft-publish-ta
```
