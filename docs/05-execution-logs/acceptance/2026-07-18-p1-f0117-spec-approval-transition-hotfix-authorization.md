# P1 F-0117 spec approval transition hotfix authorization

Status: approved
Human approval source: current user message approving F-0117 Option A, written specification, schema/migration source generation only, and execution on 2026-07-18
Standing hotfix authorization source: `docs/05-execution-logs/acceptance/2026-07-16-p1-remediation-program-authorization.md`
Task ID: `p1-f0117-spec-approval-transition-hotfix-2026-07-18`
Parent task: `p1-remediation-rc-02-redeem-code-nullable-deadline-2026-07-18`
Base: `366f17446e9fc75a777ebfe5977ad72db1062eb7`
Branch: `codex/p1-f0117-spec-approval-transition-hotfix`
gateProjection: waiting_for_spec_review_to_satisfied
ancestorCheckpoint: only_after_transition_only_guard_pass
otherInProgressShaDrift: hard_block
standardMode: hard_block
noDatabaseExecution: required

## Authorized transition

This one-time authorization only records the already-approved written specification transition. It preserves the parent task as `in_progress`, preserves WIP and its product allowlist, and permits the repository checkpoint to advance from the recorded F-0116 ancestor to the exact hotfix base only after the exact transition-only guard succeeds. It does not authorize product/source implementation, database connection or execution, migration execution, dependency changes, push, PR, deployment, or cleanup.

Missing or altered authorization, any extra file, any product/source file, a different parent/base/branch, a different gate projection, standard pre-push mode, multiple commits, or any unrelated in-progress SHA drift remains hard-blocked.

## Exact Files

1. `docs/04-agent-system/state/project-state.yaml`
2. `docs/04-agent-system/state/task-queue.yaml`
3. `docs/05-execution-logs/acceptance/2026-07-18-p1-f0117-spec-approval-transition-hotfix-authorization.md`
4. `docs/05-execution-logs/task-plans/2026-07-18-p1-f0117-spec-approval-transition-hotfix.md`
5. `docs/05-execution-logs/evidence/2026-07-18-p1-f0117-spec-approval-transition-hotfix.md`
6. `docs/05-execution-logs/audits-reviews/2026-07-18-p1-f0117-spec-approval-transition-hotfix.md`
7. `scripts/agent-system/Test-P1RemediationSerialProgram.ps1`
8. `scripts/agent-system/Test-P1RemediationSerialProgram.Smoke.ps1`
9. `scripts/agent-system/Test-ModuleRunV2PreCommitHardening.ps1`
10. `scripts/agent-system/Test-ModuleRunV2PreCommitHardening.Smoke.ps1`
11. `scripts/agent-system/Test-ModuleRunV2PrePushReadiness.ps1`
12. `scripts/agent-system/Test-ModuleRunV2PrePushReadiness.Smoke.ps1`
