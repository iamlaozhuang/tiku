# Local Experience Bridge Proposal Diagnostic Evidence

## Summary

- Task id: `local-experience-bridge-proposal-diagnostic`
- Branch: `codex/local-experience-bridge-proposal-diagnostic`
- Execution profile: `docs_state_lite`
- Evidence mode: `lite`
- Validation policy: `docs_state`
- result: pass
- Redaction status: pass. This evidence records command names, pass/fail status, task ids, mechanism decisions, and
  candidate metadata only.

Cost Calibration Gate remains blocked.

## Approval Boundary

The current 2026-06-17 user prompt approved executing the recommended mechanism task under project mechanism rules.

This task only adds and wires a read-only local experience bridge proposal diagnostic after implementation seed
exhaustion. It does not apply seed transactions, create product tasks, run Browser or Playwright, call providers or
models, read or modify `.env*`, change schema/drizzle/migrations, change dependencies/packages/lockfiles, access
staging/prod/cloud/deploy/payment/external-service targets, create PRs, force-push, or execute Cost Calibration Gate.

## RED Evidence

RED:

- `Get-ModuleRunV2ImplementationSeedProposal.ps1` correctly returned `no_seed_candidate` on clean master before this
  task because all six execution modules had terminal target-closure coverage.
- Before this task, `Get-TikuNextAction.ps1` and `Get-TikuProjectStatus.ps1` did not surface the remaining
  `localExperienceClosureGate.acceptanceBridgePlan` candidate when implementation seed was exhausted.
- The new local bridge smoke failed first because `Get-ModuleRunV2LocalExperienceBridgeProposal.ps1` did not exist.
- The updated next-action smoke failed first because `nextActionDecision` remained `no_pending_task` in the no-seed plus
  bridge-candidate fixture.
- The updated project-status smoke failed first because unified status still reported `idle_no_pending_task` for the new
  next-action bridge decision.

## GREEN Evidence

GREEN:

- Added `Get-ModuleRunV2LocalExperienceBridgeProposal.ps1` as a read-only diagnostic.
- Added smoke coverage for the no-seed plus local-experience-bridge fixture.
- Wired `Get-TikuNextAction.ps1` to invoke the bridge diagnostic only after implementation seed returns
  `no_seed_candidate`.
- Wired `Get-TikuProjectStatus.ps1` to surface the bridge proposal as a unified human-approval action.
- Registered the new script in `mechanism-source-of-truth-index.yaml`.

Current real bridge proposal:

- `bridgeProposalDecision: proposal_available`
- `bridgeExperienceChain: personal-learning-ai-experience`
- `bridgeCandidateTask: module-run-v2-cross-role-local-flow-planning`
- `bridgeRequiredApproval: localExperienceAcceptanceBridgeApproved`
- `bridgeTargetLocalFullLoopGate: L6`

After task-state closeout, `Get-TikuNextAction.ps1` and `Get-TikuProjectStatus.ps1` report the bridge approval
recommendation instead of idle/no pending task.

## Changed Files

- `scripts/agent-system/Get-ModuleRunV2LocalExperienceBridgeProposal.ps1`
- `scripts/agent-system/Get-ModuleRunV2LocalExperienceBridgeProposal.Smoke.ps1`
- `scripts/agent-system/Get-TikuNextAction.ps1`
- `scripts/agent-system/Get-TikuNextAction.Smoke.ps1`
- `scripts/agent-system/Get-TikuProjectStatus.ps1`
- `scripts/agent-system/Get-TikuProjectStatus.Smoke.ps1`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/04-agent-system/state/mechanism-source-of-truth-index.yaml`
- `docs/05-execution-logs/task-plans/2026-06-17-local-experience-bridge-proposal-diagnostic.md`
- `docs/05-execution-logs/evidence/2026-06-17-local-experience-bridge-proposal-diagnostic.md`
- `docs/05-execution-logs/audits-reviews/2026-06-17-local-experience-bridge-proposal-diagnostic.md`

## Validation Commands

| Command                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        | Result | Summary                                                                                         |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ | ----------------------------------------------------------------------------------------------- |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Get-ModuleRunV2LocalExperienceBridgeProposal.Smoke.ps1`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        | pass   | New bridge proposal smoke passed                                                                |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Get-TikuNextAction.Smoke.ps1`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  | pass   | next-action smoke passed, including bridge proposal fixture and existing seed proposal fixture  |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Get-TikuProjectStatus.Smoke.ps1`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               | pass   | project-status smoke passed, including unified bridge proposal decision                         |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Get-ModuleRunV2ImplementationSeedProposal.Smoke.ps1`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           | pass   | existing implementation seed proposal smoke remains green                                       |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Get-ModuleRunV2LocalExperienceBridgeProposal.ps1`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              | pass   | real state reports bridge candidate `module-run-v2-cross-role-local-flow-planning`              |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Get-TikuProjectStatus.ps1`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     | pass   | reports `local_experience_bridge_proposal_available`                                            |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Get-TikuNextAction.ps1 -VerboseHistory`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        | pass   | reports `request_local_experience_bridge_approval:module-run-v2-cross-role-local-flow-planning` |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Get-ModuleRunV2ImplementationSeedProposal.ps1`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 | pass   | reports `no_seed_candidate`; all six implementation seed modules are complete                   |
| `npx.cmd prettier --check --ignore-unknown scripts/agent-system/Get-ModuleRunV2LocalExperienceBridgeProposal.ps1 scripts/agent-system/Get-ModuleRunV2LocalExperienceBridgeProposal.Smoke.ps1 scripts/agent-system/Get-TikuNextAction.ps1 scripts/agent-system/Get-TikuNextAction.Smoke.ps1 scripts/agent-system/Get-TikuProjectStatus.ps1 scripts/agent-system/Get-TikuProjectStatus.Smoke.ps1 docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/04-agent-system/state/mechanism-source-of-truth-index.yaml docs/05-execution-logs/task-plans/2026-06-17-local-experience-bridge-proposal-diagnostic.md docs/05-execution-logs/evidence/2026-06-17-local-experience-bridge-proposal-diagnostic.md docs/05-execution-logs/audits-reviews/2026-06-17-local-experience-bridge-proposal-diagnostic.md` | pass   | all declared mechanism, state, plan, evidence, and audit files use Prettier code style          |
| `git diff --check`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             | pass   | no whitespace errors                                                                            |
| `npm.cmd run lint`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             | pass   | ESLint completed successfully                                                                   |
| `npm.cmd run typecheck`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        | pass   | TypeScript no-emit completed successfully                                                       |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId local-experience-bridge-proposal-diagnostic`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    | pass   | pre-commit hardening passed                                                                     |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId local-experience-bridge-proposal-diagnostic`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               | pass   | module-closeout readiness passed                                                                |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId local-experience-bridge-proposal-diagnostic`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      | pass   | pre-push readiness passed                                                                       |

## Closeout Anchors

- Batch range: single mechanism maintenance task.
- Commit: `c48bfe279e3c9d537ab855e0c52bd92f09d3cb87` is the pre-closeout ancestor; final task commit is produced by the
  closeout commit and reported in the delivery summary.
- localFullLoopGate: not applicable for this docs/mechanism diagnostic task; no Browser, Playwright, dev server,
  provider, DB, staging, prod, cloud, deploy, payment, external-service, or Cost Calibration Gate work was run.
- threadRolloverGate: not required for this narrow mechanism task.
- nextModuleRunCandidate: after closeout, `Get-TikuNextAction.ps1` should recommend
  `request_local_experience_bridge_approval:module-run-v2-cross-role-local-flow-planning`.

## Blocked Remainder

- `.env*` and secret-bearing files remain blocked.
- Secret/token/cookie/Authorization header/DB URL/provider payload/raw prompt/raw answer/public identifier inventories,
  row data, and private data remain blocked from evidence.
- Provider/model calls remain blocked.
- Staging/prod/cloud/deploy/payment/external-service access remains blocked.
- Schema/drizzle/migration changes remain blocked.
- Package/lockfile/dependency changes remain blocked.
- Product runtime, route, UI, Browser, Playwright/e2e, and dev server work remain blocked unless a future task explicitly
  approves them.
- PR, force-push, and Cost Calibration Gate remain blocked.

Cost Calibration Gate remains blocked.
