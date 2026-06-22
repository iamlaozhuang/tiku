# Task Plan: module-run-v2-personal-ai-local-ui-browser-planning

## Scope

Process the local experience bridge proposal for `module-run-v2-personal-ai-local-ui-browser-planning`.

This is an L5 `local_ui_browser_entry` planning reconciliation packet for `personal-learning-ai-experience`. It may update
durable state, task plan, evidence, and audit review files only. Runtime source files, unit tests, and the existing e2e
spec are read-only validation inputs for this packet.

## Required Reads

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/04-agent-system/state/advanced-edition-domain-module-run-matrix.yaml`
- `docs/04-agent-system/state/archive/task-queue-archive-2026-06.yaml`
- historical L5 task plan, evidence, and audit packets from 2026-06-17 and 2026-06-20
- `src/app/(student)/ai-generation/page.tsx`
- `src/features/student/ai-generation/StudentPersonalAiGenerationPage.tsx`
- `tests/unit/student-personal-ai-generation-ui.test.ts`
- `src/features/student/ai-generation/StudentPersonalAiGenerationPage.test.tsx`
- `src/server/services/personal-ai-generation-local-browser-experience-service.test.ts`
- `e2e/personal-ai-generation-local-request.spec.ts`

## Implementation Plan

1. Materialize the current user approval as task-level `localExperienceAcceptanceBridgeApproved` for the L5 planning
   reconciliation packet.
2. Keep the packet docs-state only: no `src`, `tests`, `e2e`, schema, migration, dependency, env, provider, deploy, PR,
   force-push, or Cost Calibration Gate changes.
3. Verify existing student personal AI UI/browser contract coverage through focused unit validation.
4. Treat the existing Playwright spec as inventory only. Run `npm.cmd run test:e2e -- --list` only; do not execute or
   repair the known auth/session mismatch.
5. Record redacted evidence and audit review, then complete validation and closeout if all gates pass.

## Risk Controls

- Evidence must not contain raw prompts, raw generated AI content, provider payloads, secrets, tokens, database URLs,
  Authorization headers, raw DB rows, plaintext `redeem_code`, full `paper`, full `material`, or raw answer text.
- The known `module-run-v2-personal-ai-local-ui-browser-flow-validation` blocked validation failure remains separate.
- If L5 closure requires e2e spec edits, Playwright auth/session repair, headed/debug browser, source edits outside the
  task packet, destructive DB writes, schema/migration/dependency/env/provider/deploy/payment work, or Cost Calibration
  Gate execution, stop and split a separate task.

## Validation Plan

- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Get-TikuProjectStatus.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Get-TikuNextAction.ps1 -VerboseHistory`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Get-ModuleRunV2ImplementationSeedProposal.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Get-ModuleRunV2LocalExperienceBridgeProposal.ps1`
- `npm.cmd run test:unit -- tests/unit/student-personal-ai-generation-ui.test.ts src/features/student/ai-generation/StudentPersonalAiGenerationPage.test.tsx src/server/services/personal-ai-generation-local-browser-experience-service.test.ts`
- `npm.cmd run test:e2e -- --list`
- scoped Prettier check for changed state, plan, evidence, and audit files
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `git diff --check`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId module-run-v2-personal-ai-local-ui-browser-planning`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId module-run-v2-personal-ai-local-ui-browser-planning`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId module-run-v2-personal-ai-local-ui-browser-planning`
