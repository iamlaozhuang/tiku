# Acceptance Serial Batch Orchestration Task Plan

## Task

- Task id: `acceptance-serial-batch-orchestration-2026-06-22`
- Branch: `codex/acceptance-serial-batch-20260622`
- Date: `2026-06-22`
- User approval: The user approved converting the proposed 1-6 acceptance progression into a serial batch task.

## Sources Read

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/adr-001-tech-stack-selection.md`
- `docs/02-architecture/adr/adr-002-runtime-architecture-and-multi-client-contract.md`
- `docs/02-architecture/adr/adr-003-workplace-desktop-web-compatibility.md`
- `docs/02-architecture/adr/adr-004-environment-isolation-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-005-staging-architecture-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-006-runtime-dependency-alignment.md`
- `docs/02-architecture/adr/adr-007-edition-aware-authorization-source-of-truth.md`
- `docs/04-agent-system/sop/docs-only-fast-lane-governance.md`
- `docs/04-agent-system/sop/module-lifecycle-governance.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/acceptance/2026-06-22-standard-advanced-mvp-acceptance-execution-plan.md`

## Scope

Create a docs/state-only queue orchestration task that seeds the approved acceptance progression as one serial batch with six dependent child tasks:

1. `acceptance-baseline-and-owner-gate-2026-06-22`
2. `acceptance-l0-l2-static-gates-2026-06-22`
3. `acceptance-use-case-matrix-run-2026-06-22`
4. `acceptance-ap-gate-decision-2026-06-22`
5. `acceptance-ai-lifecycle-run-2026-06-22`
6. `acceptance-final-decision-review-2026-06-22`

This task seeds execution structure only. It does not run the acceptance tasks.

## Implementation Approach

- Update `project-state.yaml` to point `currentTask` to this orchestration task and record the seeded batch topology.
- Append one closed parent orchestration task and six `pending` child tasks to `task-queue.yaml`.
- Make child dependencies strictly serial.
- Give each child explicit allowed files, blocked files, validation policy, stop conditions, and approval boundaries.
- Keep e2e, browser/dev-server, Provider/model, env/secret, staging/prod/cloud/deploy, dependency, schema/migration/database, payment/external-service, PR, force-push, production/staging data, and Cost Calibration Gate work blocked unless a future child task receives fresh approval.
- Write redacted evidence and audit review for this seed task.

## Validation Plan

- `npx.cmd prettier --check --ignore-unknown` over changed docs/state files.
- `git diff --check`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId acceptance-serial-batch-orchestration-2026-06-22`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId acceptance-serial-batch-orchestration-2026-06-22`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId acceptance-serial-batch-orchestration-2026-06-22 -SkipRemoteAheadCheck`

## Risk Controls

- No product source, test, script, dependency, lockfile, schema, migration, env, secret, database, Provider, browser/e2e, dev-server, staging/prod/cloud/deploy, payment, external service, PR, or force-push changes.
- Child task execution is explicitly not included in this seed task.
- Any future child task that crosses a blocked gate must stop for fresh approval and record redacted evidence.
- No previewReleaseReady, productionReady, or acceptance pass claim is made by this orchestration task.
