# F-0115 Module pre-commit 治理热修授权

Status: approved

Human approval source: current user message permits an independent governance hotfix strictly limited to pre-push orchestration, P1/Module guards and corresponding smoke tests.

Task ID: `p1-f0115-module-precommit-hotfix-2026-07-17`

Parent task: `p1-remediation-rc-02-employee-creation-atomicity-2026-07-16`

Base: `1fd9906992c567368044a8ede98eaee840a0b1fa`

Branch: `codex/p1-f0115-module-precommit-hotfix`

## Capability Authorization

scope: exact_one_time_module_precommit_false_positive_repair
ancestorCheckpoint: only_after_transition_only_guard_pass
otherInProgressShaDrift: hard_block
hookBypass: prohibited
qualityGateReduction: prohibited

## Exact Files

- `docs/05-execution-logs/acceptance/2026-07-17-p1-f0115-module-precommit-hotfix-authorization.md`
- `docs/05-execution-logs/task-plans/2026-07-17-p1-f0115-module-precommit-hotfix.md`
- `docs/05-execution-logs/evidence/2026-07-17-p1-f0115-module-precommit-hotfix.md`
- `docs/05-execution-logs/audits-reviews/2026-07-17-p1-f0115-module-precommit-hotfix.md`
- `scripts/agent-system/Test-P1RemediationSerialProgram.ps1`
- `scripts/agent-system/Test-P1RemediationSerialProgram.Smoke.ps1`
- `scripts/agent-system/Test-ModuleRunV2PreCommitHardening.ps1`
- `scripts/agent-system/Test-ModuleRunV2PreCommitHardening.Smoke.ps1`
- `scripts/agent-system/Test-ModuleRunV2PrePushReadiness.ps1`
- `scripts/agent-system/Test-ModuleRunV2PrePushReadiness.Smoke.ps1`

No product implementation, task queue/state mutation, dependency, migration/database execution, Provider, browser/runtime, P2, PR, force push or deployment is authorized. Every other `in_progress` SHA drift remains hard-blocked.
