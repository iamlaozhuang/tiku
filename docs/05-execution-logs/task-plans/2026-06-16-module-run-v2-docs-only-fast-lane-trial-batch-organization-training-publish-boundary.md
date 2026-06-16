# Task Plan: module-run-v2-docs-only-fast-lane-trial-batch-organization-training-publish-boundary

## Scope

- Task id: `module-run-v2-docs-only-fast-lane-trial-batch-organization-training-publish-boundary`
- Batch id: `module-run-v2-docs-only-fast-lane-trial-batch-organization-training-publish-boundary`
- Branch: `codex/module-run-v2-docs-only-fast-lane-trial-batch`
- Batch children:
  - `advanced-organization-training-publish-version-route-org-admin-actor-contract-decision`
  - `advanced-organization-training-publish-version-route-org-admin-actor-contract-followup-seeding`

## Read Before Edit

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/*.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/04-agent-system/sop/docs-only-fast-lane-governance.md`
- `docs/05-execution-logs/evidence/2026-06-15-module-run-v2-docs-only-fast-lane-mechanism.md`
- `docs/05-execution-logs/audits-reviews/2026-06-15-module-run-v2-docs-only-fast-lane-mechanism.md`
- Prior organization-training publish route lineage and org-admin actor evidence/audits.

## Allowed Files

- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/2026-06-16-module-run-v2-docs-only-fast-lane-trial-batch-organization-training-publish-boundary.md`
- `docs/05-execution-logs/evidence/2026-06-16-module-run-v2-docs-only-fast-lane-trial-batch-organization-training-publish-boundary.md`
- `docs/05-execution-logs/audits-reviews/2026-06-16-module-run-v2-docs-only-fast-lane-trial-batch-organization-training-publish-boundary.md`
- Child task-plan/evidence/audit files for the two batch children.

## Implementation Steps

1. Record the parent batch queue task with `fastLaneEligible: true`, `fastLaneLane: docs_only`, parent role, and exactly two child ids.
2. Record both child queue tasks with child batch metadata and independent plan/evidence/audit paths.
3. Seed one non-batch pending readonly recheck if the child decision cannot safely authorize TDD implementation.
4. Write parent rollup evidence and audit after child evidence is complete.
5. Run hard-block batch readiness and closeout readiness with explicit `-DocsOnlyBatchId` and `-DocsOnlyBatchMode hard_block`.

## Risk Defense

- No product source, test, script, schema, migration, package, or lockfile changes.
- No `.env*` read/write/output.
- No DB access, provider/model call, quota/cost work, dev server, Browser, Playwright, e2e, deploy, payment, external-service, PR, or force push.
- The batch stays at two children; the follow-up task is seeded as a future pending task, not as a third batch child.

## Validation Commands

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2DocsOnlyBatchReadiness.ps1 -BatchId module-run-v2-docs-only-fast-lane-trial-batch-organization-training-publish-boundary -Mode hard_block
git diff --check
npm.cmd run lint
npm.cmd run typecheck
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId module-run-v2-docs-only-fast-lane-trial-batch-organization-training-publish-boundary -DocsOnlyBatchId module-run-v2-docs-only-fast-lane-trial-batch-organization-training-publish-boundary -DocsOnlyBatchMode hard_block
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId module-run-v2-docs-only-fast-lane-trial-batch-organization-training-publish-boundary -DocsOnlyBatchId module-run-v2-docs-only-fast-lane-trial-batch-organization-training-publish-boundary -DocsOnlyBatchMode hard_block
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId module-run-v2-docs-only-fast-lane-trial-batch-organization-training-publish-boundary -DocsOnlyBatchId module-run-v2-docs-only-fast-lane-trial-batch-organization-training-publish-boundary -DocsOnlyBatchMode hard_block -SkipRemoteAheadCheck
```
