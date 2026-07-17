# P1 F-0115 Scope Correction Hotfix Authorization

Date: 2026-07-16

Status: approved

Human approval source: current user message in the Codex conversation on 2026-07-16 approving the one-time F-0115 scope-correction governance hotfix and execution option 1.

Task ID: `p1-f0115-scope-correction-hotfix-2026-07-16`

Parent task: `p1-remediation-rc-02-employee-creation-atomicity-2026-07-16`

Base: `6bde2f2aec3d71fa0ce138b26f64243861cace6f`

Branch: `codex/p1-f0115-scope-correction-hotfix`

## Approved Scope

The user approved one independent governance hotfix that materializes the already-designed persistent `employee_import_command` product scope by changing only the active F-0115 queue block and by adding an exact, one-time, smoke-tested P1/Module Run transition bridge. This authorization approves Drizzle migration source generation only; it does not approve migration or database execution.

No product implementation, migration/database execution, dependency, Provider, browser/runtime, P2, PR, force push, deployment, or other finding repair is authorized by this governance hotfix.

## Capability Authorization

schemaMigration: approved_source_generation_only_no_execution
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
- `docs/05-execution-logs/acceptance/2026-07-16-p1-f0115-scope-correction-hotfix-authorization.md`
- `docs/05-execution-logs/task-plans/2026-07-16-p1-f0115-scope-correction-hotfix-design.md`
- `docs/05-execution-logs/task-plans/2026-07-16-p1-f0115-scope-correction-hotfix.md`
- `docs/05-execution-logs/evidence/2026-07-16-p1-f0115-scope-correction-hotfix.md`
- `docs/05-execution-logs/audits-reviews/2026-07-16-p1-f0115-scope-correction-hotfix.md`

## Explicitly Preserved Hard Blocks

- Every other `in_progress` SHA drift remains hard-blocked.
- The bridge requires the exact task, parent task, base, branch, active task/status, twelve-file set, eight-part queue transformation, current-user approval, and parent absence of this authorization artifact.
- Any missing, extra, deleted, renamed, or type-changed path; any other queue byte change after LF normalization; invalid or replayed approval; wrong base/branch/task/status; index/worktree split; product implementation; dependency change; schema or migration execution; database mutation; Provider call; browser/runtime acceptance; P2 implementation; PR; force push; deployment; audit-repository mutation; or other finding repair remains blocked.
- This approval does not authorize `--no-verify`, hook bypass, history rewrite, a thirteenth path, broad allowlist expansion, migration/database execution, or any remote action.
