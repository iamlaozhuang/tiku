# P1 F-0143 spec approval transition hotfix authorization

Status: approved
Human approval source: current user message approving one-time F-0143 spec-approval transition governance hotfix limited to P1/Module guards, corresponding smoke, exact state and evidence/audit; ancestor checkpoint only after transition-only guard passes; other in_progress SHA drift remains hard-blocked on 2026-07-18
Standing hotfix authorization source: `docs/05-execution-logs/acceptance/2026-07-16-p1-remediation-program-authorization.md`
Task ID: `p1-f0143-spec-approval-transition-hotfix-2026-07-18`
Parent task: `p1-remediation-rc-02-employee-personal-ai-context-2026-07-18`
Base: `0fe8edae7a7efc00154f5c54227623be55796983`
Branch: `codex/p1-f0143-spec-approval-transition-hotfix`
gateProjection: waiting_for_spec_review_to_satisfied
ancestorCheckpoint: only_after_transition_only_guard_pass
otherInProgressShaDrift: hard_block
standardMode: hard_block
noDatabaseExecution: required

## Authorized transition

This one-time authorization records only the approved F-0143 written-specification transition. It preserves the parent task as `in_progress`, preserves WIP, task status, execution stage, product allowlist, capabilities and closeout policy, and permits the repository checkpoint to advance from the recorded ancestor to the exact hotfix base only after the exact transition-only guard succeeds. It does not authorize product/source implementation, database or migration execution, dependency changes, push, PR, deployment or cleanup.

Missing or altered authorization, duplicate authorization scalar, duplicate or reordered Exact Files, any extra file, any product/source file, a different parent/base/branch/task/gate projection, standard pre-push mode, replay, multiple commits or any unrelated `in_progress` SHA drift remains hard-blocked.

## Exact Files

1. `docs/04-agent-system/state/project-state.yaml`
2. `docs/04-agent-system/state/task-queue.yaml`
3. `docs/05-execution-logs/acceptance/2026-07-18-p1-f0143-spec-approval-transition-hotfix-authorization.md`
4. `docs/05-execution-logs/task-plans/2026-07-18-p1-f0143-spec-approval-transition-hotfix.md`
5. `docs/05-execution-logs/evidence/2026-07-18-p1-f0143-spec-approval-transition-hotfix.md`
6. `docs/05-execution-logs/audits-reviews/2026-07-18-p1-f0143-spec-approval-transition-hotfix.md`
7. `scripts/agent-system/Test-P1RemediationSerialProgram.ps1`
8. `scripts/agent-system/Test-P1RemediationSerialProgram.Smoke.ps1`
9. `scripts/agent-system/Test-ModuleRunV2PreCommitHardening.ps1`
10. `scripts/agent-system/Test-ModuleRunV2PreCommitHardening.Smoke.ps1`
11. `scripts/agent-system/Test-ModuleRunV2PrePushReadiness.ps1`
12. `scripts/agent-system/Test-ModuleRunV2PrePushReadiness.Smoke.ps1`
