# 2026-07-04 Full-chain Scenario 3 Rerun Closeout Evidence Repair Plan

## Task

- Task id: `full-chain-scenario-3-rerun-closeout-evidence-repair-2026-07-04`
- Branch: `codex/full-chain-scenario-3-rerun-closeout-evidence-repair-2026-07-04`
- Source task: `full-chain-scenario-3-organization-tree-rerun-after-empty-state-create-flow-repair-2026-07-04`
- Kind: `local_closeout_evidence_repair`
- Approval boundary: `current_user_approved_full_chain_centralized_local_continuity_authorization_2026_07_04`

## Read Gate

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/acceptance/2026-07-04-full-chain-goal-control-and-coverage-ledger.md`
- `docs/05-execution-logs/acceptance/2026-07-04-full-chain-centralized-approval-and-continuity-addendum.md`
- `docs/05-execution-logs/acceptance/2026-07-04-full-chain-acceptance-runbook-and-stop-rules.md`
- `docs/05-execution-logs/evidence/2026-07-04-full-chain-scenario-3-organization-tree-rerun-after-empty-state-create-flow-repair.md`
- `docs/05-execution-logs/audits-reviews/2026-07-04-full-chain-scenario-3-organization-tree-rerun-after-empty-state-create-flow-repair.md`
- `scripts/agent-system/Test-ModuleRunV2ModuleCloseoutReadiness.ps1`
- `scripts/agent-system/ModuleRunV2.Common.ps1`

## Scope

Repair closeout evidence metadata only. This task may update docs/state/queue/evidence/audit files required for the
Scenario 3 rerun closeout gate. It must not run browser/e2e, write DB data, edit source/tests, change schema/migrations,
touch dependencies, call Provider, deploy, run Cost Calibration, or claim release readiness/final Pass/production
usability.

## Execution Plan

1. Record the module-closeout failure as a closeout evidence repair task.
2. Add missing closeout anchors to the Scenario 3 rerun evidence/audit without changing runtime results.
3. Update state and queue for this repair task.
4. Run scoped formatting, diff checks, pre-commit hardening, and the Scenario 3 module-closeout readiness gate.
5. Commit, fast-forward merge to `master`, run pre-push readiness, push `origin/master`, delete the short branch, and
   continue Scenario 4.

## Stop Rules

Stop if the repair would require source/test/package/schema/DB/browser/Provider/staging/prod/Cost changes, if evidence
needs sensitive values, if runtime conclusions would change, or if module-closeout still blocks after metadata repair.

## Validation Commands

- `npm.cmd exec -- prettier --write --ignore-unknown <scoped docs>`
- `npm.cmd exec -- prettier --check --ignore-unknown <scoped docs>`
- `git diff --check`
- `git diff --name-only -- <blocked paths>`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId full-chain-scenario-3-rerun-closeout-evidence-repair-2026-07-04`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId full-chain-scenario-3-organization-tree-rerun-after-empty-state-create-flow-repair-2026-07-04`
