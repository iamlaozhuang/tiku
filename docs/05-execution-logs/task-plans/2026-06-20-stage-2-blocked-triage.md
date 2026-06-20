# Stage 2 Blocked Task Triage Plan

## Scope

- Create a docs/state-only blocked task triage register for the active queue.
- Classify each active non-terminal blocked queue item into one primary next-step bucket:
  `fresh_approval_required`, `exact_scope_required`, `blocked_validation_failure`, `high_risk_gated`, or
  `product_choice_required`.
- Record a concrete next action for each item: approve, repair, abandon, defer, or wait for external conditions.
- Record non-queue guarded seed proposal state separately from queue item triage.

## Normative Inputs Read

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/adr-001-tech-stack-selection.md`
- `docs/02-architecture/adr/adr-002-runtime-architecture-and-multi-client-contract.md`
- `docs/02-architecture/adr/adr-003-workplace-desktop-web-compatibility.md`
- `docs/02-architecture/adr/adr-004-environment-isolation-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-005-staging-architecture-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-006-runtime-dependency-alignment.md`

## Implementation

1. Add `stage-2-blocked-task-triage-2026-06-20` as a docs/state task in `task-queue.yaml`.
2. Update `project-state.yaml` to point at the active stage 2 triage task.
3. Add `docs/04-agent-system/state/stage-2-blocked-task-triage-register.yaml` with:
   - active queue triage counts;
   - one record per active non-terminal blocked task;
   - exact next action and decision owner;
   - secondary risks where useful;
   - non-queue seed proposal note for `personal-learning-ai`.
4. Register the triage file in `mechanism-source-of-truth-index.yaml`.
5. Add evidence and audit files.

## Guardrails

- No source, test, e2e, script, package, lockfile, dependency, env, provider, schema, migration, deploy, payment, OCR,
  export, PR, force-push, destructive database, or Cost Calibration Gate execution.
- Do not change existing blocked task statuses, results, blocked gates, validation commands, allowed files, or evidence.
- Do not approve the `personal-learning-ai` seed proposal; only record that it remains a separate human decision.

## Validation

- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Get-TikuProjectStatus.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Get-TikuNextAction.ps1 -VerboseHistory`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Get-ModuleRunV2QueueSlimmingSelfRepair.ps1`
- `npx.cmd prettier --write --ignore-unknown ...`
- `npx.cmd prettier --check --ignore-unknown ...`
- `git diff --check`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId stage-2-blocked-task-triage-2026-06-20`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId stage-2-blocked-task-triage-2026-06-20`
