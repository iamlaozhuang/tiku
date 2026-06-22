# Preview Release Validation Plan Evidence

taskId: preview-release-validation-plan
result: pass
Batch range: preview-release-validation-plan
Commit: e80841c5 pre-task baseline; task commit is recorded in git history after closeout.
localFullLoopGate: L0 docs/state-only release validation planning
threadRolloverGate: not_required_single_task_closeout
nextModuleRunCandidate: ready-for-closeout-closeout-policy-repair
Cost Calibration Gate remains blocked.

## Scope Boundary

This task defines the preview release validation matrix only. It does not run browser/e2e/dev-server validation, does not connect to staging, does not deploy, does not read or write env/secret files, does not connect to a database, does not run Provider/model calls, creates no PR, and performs no force push.

## Preview Scope Restatement

- First preview is Web-only owner acceptance preview.
- Provider remains disabled by default.
- Data mode is synthetic or reviewed non-sensitive sample data only.
- previewReleaseReady remains false.
- AP-01 through AP-11 remain release gates.

## Release Validation Matrix

| Gate                     | Required Before Publication                                                                                                                                                       | Current Task Action                          | Fresh Approval Needed                       |
| ------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------- | ------------------------------------------- |
| Local lint               | npm.cmd run lint must pass on release candidate                                                                                                                                   | planned and current docs task runs lint      | no                                          |
| Local typecheck          | npm.cmd run typecheck must pass on release candidate                                                                                                                              | planned and current docs task runs typecheck | no                                          |
| Local unit               | scoped or full unit evidence must exist before publication                                                                                                                        | planning only                                | no, unless task expands scope               |
| Local build              | npm build evidence must exist before publication                                                                                                                                  | planning only                                | no, unless task expands scope               |
| Existing e2e inventory   | inventory may be listed later without runtime if approved                                                                                                                         | planning only                                | yes for browser/e2e runtime                 |
| Staging validation       | only after staging resources, env, deploy, and data boundaries are approved                                                                                                       | planning only                                | yes                                         |
| Redaction checks         | evidence must exclude secrets, tokens, DB URLs, raw prompts, provider payloads, raw generated content, raw employee answers, full paper content, and plaintext redeem_code values | defined as mandatory release gate            | yes if sensitive source access is requested |
| Git inventory            | release candidate must list changed files and confirm no source, schema, package, env, provider, or deploy drift outside approved tasks                                           | defined as mandatory release gate            | no                                          |
| Rollback/stop conditions | publication must stop on failed lint/typecheck/unit/build, redaction failure, env/provider drift, unapproved staging action, or AP gate breach                                    | defined as mandatory release gate            | yes for deploy/rollback execution           |

## Stop Conditions

- Any source, test, package, lockfile, schema, migration, env, provider, database, browser/e2e, dev-server, deploy, payment, PR, force-push, org_auth runtime, or cloud-resource action appears without fresh approval.
- Any evidence includes secret, token, database URL, Authorization header, raw prompt, provider payload, raw generated content, raw employee answer, full paper content, or plaintext redeem_code value.
- Any AP-01 through AP-11 gate is claimed complete without its own evidence and approval.
- Any staging publication path lacks owner acceptance accounts, data boundary, rollback owner, monitoring owner, and stop owner.

## Validation Evidence

- RED: baseline release validation scope did not yet have a dedicated validation matrix after staging resource boundary planning.
- GREEN: docs/state-only validation matrix records local lint/typecheck/unit/build, e2e inventory or future fresh-approved staging validation, redaction checks, git inventory, rollback, and stop conditions.
- GREEN: displaced terminal recovery-window task archived: module-run-v2-personal-ai-local-transport-contract-planning.
- GREEN: browser/e2e/dev-server/staging validation remains blocked without future fresh approval.

## Commands

- powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Get-ModuleRunV2QueueSlimmingSelfRepair.ps1
- powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Get-TikuProjectStatus.ps1
- powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Get-TikuNextAction.ps1 -VerboseHistory
- npx.cmd prettier --check --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/04-agent-system/state/archive/task-queue-archive-2026-06.yaml docs/04-agent-system/state/task-history-index.yaml docs/05-execution-logs/task-plans/2026-06-22-preview-release-validation-plan.md docs/05-execution-logs/evidence/2026-06-22-preview-release-validation-plan.md docs/05-execution-logs/audits-reviews/2026-06-22-preview-release-validation-plan.md
- npm.cmd run lint
- npm.cmd run typecheck
- git diff --check
- powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId preview-release-validation-plan
- powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId preview-release-validation-plan
- powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PostCommitReadiness.ps1 -TaskId preview-release-validation-plan
- powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId preview-release-validation-plan

## Blocked Remainder

Provider/model calls, env/secret access, schema/migration/seed/database operations, staging/prod cloud resources, deployment, browser/e2e runtime, dev server, dependency/package/lockfile changes, payment/external service work, org_auth runtime changes, PR, force push, production data, raw employee answer evidence, full paper content evidence, and Cost Calibration Gate execution remain blocked.
