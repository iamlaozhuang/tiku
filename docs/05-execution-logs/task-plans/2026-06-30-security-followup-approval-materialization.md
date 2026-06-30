# Security Follow-up Approval Materialization Task Plan

## Task

- Task id: `security-followup-approval-materialization-2026-06-30`
- Branch: `codex/security-followup-approval-materialization-20260630`
- Goal: materialize the current user's centralized authorization for follow-up packages 1-9, limited to local repair
  loop governance, without executing any repair.
- Non-goals: no source/test/script changes, no package or lockfile changes, no DB, no Provider/AI, no browser/e2e/dev
  server, no staging/prod/cloud/deploy, no release readiness, no final Pass, no Cost Calibration, no PR, no force-push.

## Required Read List

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/03-standards/open-source-introduction.md`
- `docs/02-architecture/adr/**`
- `docs/04-agent-system/sop/dependency-introduction-gate.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- Latest task plan, evidence, audit, and acceptance for `security-dev-toolchain-advisory-remediation-gate-2026-06-29`
- Latest closeout audit plan and evidence for `detail-security-local-continuation-closeout-audit-2026-06-29`

## Writable Scope

- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/01-requirements/traceability/2026-06-30-security-followup-approval-materialization.md`
- `docs/05-execution-logs/task-plans/2026-06-30-security-followup-approval-materialization.md`
- `docs/05-execution-logs/evidence/2026-06-30-security-followup-approval-materialization.md`
- `docs/05-execution-logs/audits-reviews/2026-06-30-security-followup-approval-materialization.md`
- `docs/05-execution-logs/acceptance/2026-06-30-security-followup-approval-materialization.md`

## Authorization Boundary

The user's centralized approval covers only local follow-up packages 1-9 after task-specific materialization:

1. Docs/state approval materialization.
2. Remaining inventory triage.
3. API contract and input validation minimal repairs.
4. Log redaction and error return minimal repairs.
5. Auth and role boundary follow-up minimal repairs.
6. UI/UX token, layout, state, and interaction small repairs.
7. Test and acceptance regression coverage reinforcement.
8. Dependency and supply-chain remaining gate work.
9. Governance queue cleanup or archive candidates.

Every future task must first materialize exact files, boundaries, validation, evidence redaction, and closeout policy.
Every repair task must recheck and confirm the problem before a minimal change.

## Execution Plan

1. Confirm the previous dev-toolchain advisory gate is closed and current `master`/`origin/master` checkpoint is recorded.
2. Add `securityFollowupCentralApproval20260630` as a standing approval in the queue.
3. Add the current docs/state materialization task to state and queue.
4. Record the nine approved packages as future candidates that remain pending task materialization.
5. Record forbidden surfaces and evidence redaction rules.
6. Run scoped formatting, diff, and Module Run v2 validation.
7. If validation passes, commit, fast-forward merge to `master`, push `origin/master`, and delete the merged short branch.

## Validation Commands

```powershell
rg -n "securityFollowupCentralApproval20260630|security-followup-approval-materialization-2026-06-30|releaseReadinessClaimed: false|finalPassClaimed: false|costCalibrationExecuted: false" docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/evidence/2026-06-30-security-followup-approval-materialization.md docs/05-execution-logs/acceptance/2026-06-30-security-followup-approval-materialization.md
npx.cmd prettier --write --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/01-requirements/traceability/2026-06-30-security-followup-approval-materialization.md docs/05-execution-logs/task-plans/2026-06-30-security-followup-approval-materialization.md docs/05-execution-logs/evidence/2026-06-30-security-followup-approval-materialization.md docs/05-execution-logs/audits-reviews/2026-06-30-security-followup-approval-materialization.md docs/05-execution-logs/acceptance/2026-06-30-security-followup-approval-materialization.md
npx.cmd prettier --check --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/01-requirements/traceability/2026-06-30-security-followup-approval-materialization.md docs/05-execution-logs/task-plans/2026-06-30-security-followup-approval-materialization.md docs/05-execution-logs/evidence/2026-06-30-security-followup-approval-materialization.md docs/05-execution-logs/audits-reviews/2026-06-30-security-followup-approval-materialization.md docs/05-execution-logs/acceptance/2026-06-30-security-followup-approval-materialization.md
git diff --check
git diff --name-only -- package.json pnpm-lock.yaml pnpm-workspace.yaml package-lock.yaml package-lock.json src tests scripts src/db drizzle migrations seed e2e playwright-report test-results .next .env
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId security-followup-approval-materialization-2026-06-30
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId security-followup-approval-materialization-2026-06-30
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId security-followup-approval-materialization-2026-06-30 -SkipRemoteAheadCheck
```

## Closeout Policy

If validation passes, local commit, fast-forward merge to `master`, push to `origin/master`, and cleanup of the merged
short branch are approved by `securityFollowupCentralApproval20260630`.

This is not release readiness, not a final Pass, and not Cost Calibration.
