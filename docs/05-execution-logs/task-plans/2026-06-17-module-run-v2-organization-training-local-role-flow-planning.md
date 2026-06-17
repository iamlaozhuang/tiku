# Module Run v2 Organization Training Local Role-Flow Planning

## Task

- Task id: `module-run-v2-organization-training-local-role-flow-planning`
- Branch: `codex/organization-training-local-role-flow-planning`
- Date: 2026-06-17
- Execution profile: `docs_state_lite`
- Evidence mode: `lite`
- Validation policy: `docs_state`
- Target experience chain: `organization-training-experience`
- Target local full-loop gate: `L6` planning only; no L6 closure is claimed here.
- Approval: current 2026-06-17 user prompt approves executing the recommended task under mechanism rules.

## Read Baseline

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/*.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/04-agent-system/state/execution-profiles.yaml`
- `docs/04-agent-system/state/mechanism-source-of-truth-index.yaml`
- `docs/04-agent-system/state/advanced-edition-domain-module-run-matrix.yaml`
- Prior next-chain readiness evidence and organization-training requirement/test surfaces listed in the queue entry.

## Scope

Allowed files:

- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/2026-06-17-module-run-v2-organization-training-local-role-flow-planning.md`
- `docs/05-execution-logs/evidence/2026-06-17-module-run-v2-organization-training-local-role-flow-planning.md`
- `docs/05-execution-logs/audits-reviews/2026-06-17-module-run-v2-organization-training-local-role-flow-planning.md`

Blocked:

- `.env*`
- secret/token/cookie/Authorization header/DB URL/provider payload/raw prompt/raw answer/publicId list/row data/private data
- product source edits, test/e2e edits, script edits, Browser/dev-server/Playwright execution
- schema/drizzle/migration, dependency/package/lockfile
- provider/model calls, staging/prod/cloud/deploy/payment/external-service
- PR, force-push, and Cost Calibration Gate

## Implementation Plan

1. Record the task claim and evidence/audit scaffold before any validation.
2. Reconcile current local diagnostics: seed exhausted, personal-learning bridge exhausted, organization-training chain still requiring L6 planning.
3. Inventory existing organization-training role-flow and redaction validation surfaces by file path only.
4. Run focused local unit validation on existing organization-training service/route and organization-analytics route contract surfaces.
5. Recommend one later explicit local-full-flow validation task boundary without running Browser, dev server, Playwright, or e2e in this task.
6. Close the docs-state task, run closeout gates, commit, fast-forward merge to `master`, push `origin/master`, and clean the short branch.

## Validation Commands

- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Get-TikuProjectStatus.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Get-TikuNextAction.ps1 -VerboseHistory`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Get-ModuleRunV2ImplementationSeedProposal.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Get-ModuleRunV2LocalExperienceBridgeProposal.ps1`
- `npm.cmd run test:unit -- src/server/services/organization-training-service.test.ts src/server/services/organization-training-route.test.ts src/server/services/organization-analytics-route.test.ts`
- `npx.cmd prettier --check --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-06-17-module-run-v2-organization-training-local-role-flow-planning.md docs/05-execution-logs/evidence/2026-06-17-module-run-v2-organization-training-local-role-flow-planning.md docs/05-execution-logs/audits-reviews/2026-06-17-module-run-v2-organization-training-local-role-flow-planning.md`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `git diff --check`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId module-run-v2-organization-training-local-role-flow-planning`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId module-run-v2-organization-training-local-role-flow-planning`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId module-run-v2-organization-training-local-role-flow-planning`

## Risk Controls

- Evidence records command outcomes, counts, file paths, task ids, and chain names only.
- No raw fixture values, public identifier inventories, row/private data, full paper content, or raw employee answer text are copied into evidence.
- This task does not claim L6 local full-flow closure.
- Cost Calibration Gate remains blocked.
