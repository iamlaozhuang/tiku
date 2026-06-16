# Task Plan: Standing Autonomy Docs Fast Lane And Current TDD Closeout Upgrade

## Task

- Task id: `standing-autonomy-docs-fast-lane-and-current-tdd-closeout-upgrade`
- Branch: `codex/organization-analytics-mapper-validator-route-contract-seeding`
- Date: 2026-06-16
- Scope: docs/state/SOP/schema authorization upgrade only.

## Read Before Edit

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/adr-001-tech-stack-selection.md`
- `docs/02-architecture/adr/adr-002-runtime-architecture-and-multi-client-contract.md`
- `docs/02-architecture/adr/adr-003-workplace-desktop-web-compatibility.md`
- `docs/02-architecture/adr/adr-004-environment-isolation-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-005-staging-architecture-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-006-runtime-dependency-alignment.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/04-agent-system/sop/standing-autonomy-policy-governance.md`
- `docs/04-agent-system/sop/docs-only-fast-lane-governance.md`
- `docs/04-agent-system/state/autodrive-control-schema.yaml`

## Local State

- Starting branch: `codex/organization-analytics-mapper-validator-route-contract-seeding`.
- Starting branch status: clean.
- Starting `HEAD`: `de35e3f6279dce0dad89783176d12bb2de4cf491`.
- `master == origin/master == c465db3d69c6828484ca94489bfe8df615390597`.
- Existing seeding commit is local and not yet merged before this task.

## Implementation Plan

1. Add `standingDocsStateFastLaneCloseoutApproval` to `project-state.yaml`.
2. Add this governance task to `task-queue.yaml` as a closed docs/state/SOP/schema authorization task.
3. Materialize full closeout authorization on `advanced-organization-analytics-mapper-validator-route-contract-tdd` without expanding its mapper, validator, route-contract, and unit-test scope.
4. Update standing autonomy and docs-only fast lane SOPs so hard-block docs/state-only fast lane can authorize commit, fast-forward merge, push, and cleanup only through state plus task-level `closeoutPolicy`.
5. Update `autodrive-control-schema.yaml` with the new durable key and generated closeout policy shape.
6. Write redacted evidence and audit review.

## Validation Plan

- `git diff --check`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId standing-autonomy-docs-fast-lane-and-current-tdd-closeout-upgrade`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId standing-autonomy-docs-fast-lane-and-current-tdd-closeout-upgrade`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId standing-autonomy-docs-fast-lane-and-current-tdd-closeout-upgrade`

## Risk Controls

- No `.env*` access, output, summary, or modification.
- No product source, tests, scripts, schema, migration, package, or lockfile changes.
- No route runtime wiring, App Router route files, service/repository/model runtime changes, UI changes, direct DB access, provider/model calls, e2e/browser/dev-server, staging/prod/cloud/deploy/payment/external-service, PR, force push, or Cost Calibration Gate execution.
- Evidence must not include secrets, tokens, cookies, Authorization headers, DB URLs, provider payloads, raw prompts, raw answers, publicId lists, row data, or private data.
