# P1 F-0115 Phase-11 Scope Correction Hotfix Authorization

Date: 2026-07-17

Status: approved

Human approval source: current user message in the Codex conversation on 2026-07-17 approving the one-time F-0115 phase-11 scope-correction governance hotfix.

Task ID: `p1-f0115-phase11-scope-correction-hotfix-2026-07-17`

Parent task: `p1-remediation-rc-02-employee-creation-atomicity-2026-07-16`

Base: `582c156afb0cdde8a3daa99785fda8540b56fe27`

Branch: `codex/p1-f0115-phase11-scope-correction-hotfix`

## Approved Scope

The user approved one independent governance hotfix that adds only `tests/unit/phase-11-system-ops-user-management-loop.test.ts` to the active F-0115 `allowedFiles` list and adds an exact, one-time, smoke-tested P1/Module transition bridge. The later product edit is limited to type and fake adaptation in that test file.

No product implementation belongs in this governance commit. No dependency, schema, migration, database, Provider, browser/runtime, P2, PR, force push, deployment, or other finding repair is authorized.

## Capability Authorization

schemaMigration: blocked_without_fresh_approval
dependencyIntroduction: blocked_without_fresh_approval
databaseMutation: blocked_without_fresh_user_approval
providerCall: blocked_without_fresh_approval
runtimeAcceptance: blocked_out_of_program
browserRuntimeValidation: blocked_out_of_program
p2Implementation: blocked_out_of_program
stagingProdDeploy: blocked_requires_fresh_user_approval
forcePush: blocked
pr: blocked
costCalibrationGate: blocked

## Exact Files

- `docs/04-agent-system/state/task-queue.yaml`
- `scripts/agent-system/Test-P1RemediationSerialProgram.ps1`
- `scripts/agent-system/Test-P1RemediationSerialProgram.Smoke.ps1`
- `scripts/agent-system/Test-ModuleRunV2PrePushReadiness.ps1`
- `scripts/agent-system/Test-ModuleRunV2PrePushReadiness.Smoke.ps1`
- `scripts/agent-system/Test-ModuleRunV2PreCommitHardening.ps1`
- `scripts/agent-system/Test-ModuleRunV2PreCommitHardening.Smoke.ps1`
- `docs/05-execution-logs/acceptance/2026-07-17-p1-f0115-phase11-scope-correction-hotfix-authorization.md`
- `docs/05-execution-logs/task-plans/2026-07-17-p1-f0115-phase11-scope-correction-hotfix-design.md`
- `docs/05-execution-logs/task-plans/2026-07-17-p1-f0115-phase11-scope-correction-hotfix.md`
- `docs/05-execution-logs/evidence/2026-07-17-p1-f0115-phase11-scope-correction-hotfix.md`
- `docs/05-execution-logs/audits-reviews/2026-07-17-p1-f0115-phase11-scope-correction-hotfix.md`

## Explicitly Preserved Hard Blocks

- Every other `in_progress` SHA drift remains hard-blocked.
- The bridge requires the exact task, parent task, base, branch, active task/status, twelve-file set, one-line queue transformation, current-user approval, and parent absence of this authorization artifact.
- Missing, extra, deleted, renamed, or type-changed paths; any other queue byte change after LF normalization; invalid or replayed approval; wrong base/branch/task/status; index/worktree split; product paths; hook bypass; dependency/schema/database/Provider/browser/runtime/P2/PR/force/deploy actions; or other finding repair remain blocked.
- This approval does not authorize hook bypass.
- Ancestor checkpoint semantics apply only after this exact governance commit emits P1 `transition_only`.
