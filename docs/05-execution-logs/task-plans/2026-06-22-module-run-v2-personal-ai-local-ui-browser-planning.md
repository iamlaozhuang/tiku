# Task Plan: module-run-v2-personal-ai-local-ui-browser-planning

## Scope

Process the current recommended local experience bridge approval for
`module-run-v2-personal-ai-local-ui-browser-planning`.

This is an L5 `local_ui_browser_entry` planning reconciliation packet for
`personal-learning-ai-experience`. It is a docs/state recovery marker because the historical terminal task is already in
archive/history, but the active bridge proposal only advances when the active queue contains the closed L5 marker.

## Required Reads

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/04-agent-system/state/advanced-edition-domain-module-run-matrix.yaml`
- `docs/04-agent-system/state/archive/task-queue-archive-2026-06.yaml`
- `docs/04-agent-system/state/task-history-index.yaml`
- historical L5 plan/evidence/audit packets from 2026-06-17, 2026-06-20, and 2026-06-22
- `src/app/(student)/ai-generation/page.tsx`
- `src/features/student/ai-generation/StudentPersonalAiGenerationPage.tsx`
- `tests/unit/student-personal-ai-generation-ui.test.ts`
- `src/features/student/ai-generation/StudentPersonalAiGenerationPage.test.tsx`
- `src/server/services/personal-ai-generation-local-browser-experience-service.test.ts`
- `e2e/personal-ai-generation-local-request.spec.ts` as read-only inventory only

## Implementation Plan

1. Materialize the current user direction as task-level `localExperienceAcceptanceBridgeApproved` for the L5 planning
   reconciliation packet.
2. Keep the packet docs/state only: no `src`, `tests`, `e2e`, schema, migration, dependency, env, provider, deploy, PR,
   force-push, browser, dev-server, or Cost Calibration Gate changes.
3. Reconcile historical implementation evidence instead of changing runtime code.
4. Run focused unit validation for existing student personal AI UI/browser contracts.
5. Add an active queue closed recovery marker for L5 so bridge proposal diagnostics can advance past the archived
   terminal candidate.

## Risk Controls

- Evidence must not contain raw prompts, raw generated AI content, provider payloads, secrets, tokens, database URLs,
  Authorization headers, raw DB rows, plaintext `redeem_code`, full `paper`, full `material`, or raw answer text.
- Existing Playwright/e2e and browser/dev-server validation are out of scope for this current approval.
- The known Playwright auth/session repair boundary remains separate.
- If closure requires e2e spec edits, Browser/dev-server execution, runtime source edits, destructive DB work,
  schema/migration/dependency/env/provider/deploy/payment work, or Cost Calibration Gate execution, stop and split a
  separate task.

## Validation Plan

- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Get-TikuProjectStatus.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Get-TikuNextAction.ps1 -VerboseHistory`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Get-ModuleRunV2ImplementationSeedProposal.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Get-ModuleRunV2LocalExperienceBridgeProposal.ps1`
- `npm.cmd run test:unit -- tests/unit/student-personal-ai-generation-ui.test.ts src/features/student/ai-generation/StudentPersonalAiGenerationPage.test.tsx src/server/services/personal-ai-generation-local-browser-experience-service.test.ts`
- scoped Prettier check for changed state, plan, evidence, and audit files
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `git diff --check`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId module-run-v2-personal-ai-local-ui-browser-planning`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId module-run-v2-personal-ai-local-ui-browser-planning`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId module-run-v2-personal-ai-local-ui-browser-planning -SkipRemoteAheadCheck`
