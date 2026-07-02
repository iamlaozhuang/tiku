# Recent Thread Governance And Doc Slimming Task Plan

## Task

- Task ID: `recent-thread-governance-and-doc-slimming-2026-07-02`
- Branch: `codex/recent-thread-governance-and-doc-slimming`
- Scope: review the latest five closeout threads and tune governance/read-surface rules without weakening project quality, safety, or traceability.

## Read Requirements

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/04-agent-system/sop/active-queue-slimming-plan.md`
- `docs/04-agent-system/sop/task-queue-archival-and-index-governance.md`
- `docs/04-agent-system/sop/execution-log-archival-and-index-governance.md`
- `docs/04-agent-system/sop/mechanism-tuning-authorization-and-slimming-plan.md`
- `docs/04-agent-system/state/mechanism-source-of-truth-index.yaml`

## Reviewed Recent Thread Baseline

- `phase4-requirements-agent-baseline-alignment-2026-07-02`
- `session-cookie-contract-login-and-e2e-alignment-2026-07-02`
- `role-workflow-experience-walkthrough-from-code-baseline-2026-07-02`
- `requirements-code-implementation-alignment-audit-2026-07-02`
- `requirements-ssot-cross-doc-alignment-audit-2026-07-02`

## Implementation Plan

1. Record measured read-surface friction from current state and queue files.
2. Add a compact recent-thread governance baseline that future sessions can read before deep historical logs.
3. Update existing mechanism slimming SOPs to prefer non-destructive read-surface compression before archival movement.
4. Add an AGENTS guardrail preventing mechanism slimming from weakening gates or orphaning evidence.
5. Update project state and task queue with a docs-only Module Run v2 task.
6. Write redacted evidence and adversarial review.

## Non-Goals

- No product source or test repair.
- No actual task queue archival, execution-log archival, file movement, or deletion in this task.
- No script behavior change.
- No Provider, browser, DB, env/secret, dependency, schema, migration, deploy, release readiness, final Pass, production usability, or Cost Calibration work.

## Validation

- `npm.cmd exec -- prettier --write --ignore-unknown ...`
- `npm.cmd exec -- prettier --check --ignore-unknown ...`
- `git diff --check`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId recent-thread-governance-and-doc-slimming-2026-07-02`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId recent-thread-governance-and-doc-slimming-2026-07-02`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId recent-thread-governance-and-doc-slimming-2026-07-02 -SkipRemoteAheadCheck`
