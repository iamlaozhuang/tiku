# Task Plan: mechanism-throughput-readiness-tuning

## Task

- id: `mechanism-throughput-readiness-tuning`
- branch: `codex/mechanism-throughput-readiness-tuning`
- source: user request to implement the document-synchronized mechanism tuning plan
- scope: mechanism docs, mechanism scripts, mechanism smoke tests, task plan/evidence/audit only

## Required Reading

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/04-agent-system/operating-manual.md`
- `docs/04-agent-system/sop/mechanism-tuning-authorization-and-slimming-plan.md`
- `docs/04-agent-system/state/mechanism-source-of-truth-index.yaml`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/04-agent-system/state/local-experience-coverage-matrix.yaml`
- relevant `scripts/agent-system/*.ps1` and smoke tests

## Implementation Plan

1. Capture this third-round mechanism tuning direction in the existing mechanism tuning SOP and source-of-truth index.
2. Add a gradual `ModuleRunV2.Common.ps1` helper for stable queue block parsing, scalar/list reads, closeout policy normalization, validation surface resolution, and evidence result classification.
3. Update high-frequency scripts first, not every duplicated parser at once.
4. Allow module closeout readiness to recognize blocked validation evidence when the audit explicitly approves blocked evidence closeout.
5. Add a local experience next-task proposal that prefers current handoff and coverage-matrix repair candidates before ordinary pending tasks.
6. Add local experience task seed templates for repair, validation, and closure-readiness audit proposals.
7. Keep guarded serial goal behavior advisory in this pass; local full-flow remains single-task only and product-source repairs remain per-task closeout.
8. Add focused smoke coverage for the new helper, proposal, seed, and blocked closeout behavior.

## Boundaries

- No product source repair.
- No e2e spec edits.
- No `.env*`, dependency, package, lockfile, schema, migration, provider/model, staging/prod/cloud/deploy/payment/external-service, destructive DB, PR, force-push, or Cost Calibration Gate work.
- No runtime Browser/Playwright execution in this mechanism task.
- No production readiness or experience-closed claim.

## Validation

- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Get-TikuNextAction.Smoke.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Get-TikuProjectStatus.Smoke.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.Smoke.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2QueueDrainEligibility.Smoke.ps1`
- new local experience next-task proposal smoke
- new local experience task seed smoke
- `git diff --check`
- scoped prettier check for changed docs/scripts
- `npm.cmd run lint`
- `npm.cmd run typecheck`

## Risk Controls

- Keep common helper functions prefixed to avoid collisions with existing local helper names.
- Preserve legacy scalar `closeoutPolicy` compatibility while writing new tasks in nested form.
- Treat local experience proposal as diagnostic/proposal-only; seed execution remains explicit.
- Only blocked validation tasks with audit verdict `APPROVE_BLOCKED_EVIDENCE_CLOSEOUT` can use blocked evidence closeout.
- Keep hard gates blocked in every output path.
