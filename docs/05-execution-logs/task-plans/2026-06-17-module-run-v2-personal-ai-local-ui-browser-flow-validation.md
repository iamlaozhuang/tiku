# Module Run v2 Personal AI Local UI Browser Flow Validation Plan

- Task id: `module-run-v2-personal-ai-local-ui-browser-flow-validation`
- Branch: `codex/personal-ai-local-ui-browser-flow-validation`
- Execution profile: `local_full_flow`
- Evidence mode: `full`
- Validation policy: `local_full_flow`
- Local full-flow gate: `approved_localhost_only`
- Approval: current 2026-06-17 user prompt approves executing the previously recommended task under mechanism rules.

## Read Before Work

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/*.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/04-agent-system/state/execution-profiles.yaml`
- `docs/04-agent-system/state/mechanism-source-of-truth-index.yaml`
- `C:\Users\jzzhu\.codex\skills\playwright\SKILL.md`
- `package.json` read-only script inventory
- `playwright.config.ts` read-only localhost target check
- `e2e/personal-ai-generation-local-request.spec.ts` read-only local fixture/redaction check

## Scope

This task consumes the fresh approval requested by the previous closeout:

- `localExperienceAcceptanceBridgeApproved`
- `localFullFlowGate: approved_localhost_only`

The task validates the existing personal-learning-ai local UI/browser flow through localhost-only local dev server and targeted existing Playwright spec execution. It does not change product source, route/UI files, tests, e2e specs, package files, schema, migrations, provider configuration, env files, cloud resources, deployment, payment, or external services.

Allowed writes:

- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/2026-06-17-module-run-v2-personal-ai-local-ui-browser-flow-validation.md`
- `docs/05-execution-logs/evidence/2026-06-17-module-run-v2-personal-ai-local-ui-browser-flow-validation.md`
- `docs/05-execution-logs/audits-reviews/2026-06-17-module-run-v2-personal-ai-local-ui-browser-flow-validation.md`

Read-only local validation inputs:

- `package.json`
- `playwright.config.ts`
- `e2e/personal-ai-generation-local-request.spec.ts`
- `tests/unit/student-personal-ai-generation-ui.test.ts`
- `src/features/student/ai-generation/StudentPersonalAiGenerationPage.test.tsx`
- `src/server/services/personal-ai-generation-local-browser-experience-service.test.ts`
- relevant source files referenced by those tests

## Validation Plan

1. Run local governance diagnostics:
   - `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Get-TikuProjectStatus.ps1`
   - `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Get-TikuNextAction.ps1 -VerboseHistory`
   - `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Get-ModuleRunV2ImplementationSeedProposal.ps1`
   - Pre-task default-entry diagnostic already run on clean `master`: `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Invoke-ModuleRunV2QueueDrainSupervisor.ps1 -PlanOnly -AllowProtectedBranch -CompletedTaskCount 0`
2. Run local capability gate:
   - `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2LocalCapabilityGate.ps1 -TaskId module-run-v2-personal-ai-local-ui-browser-flow-validation -Capability localFullFlowGate -Intent use_capability`
3. Run focused local unit guard:
   - `npm.cmd run test:unit -- tests/unit/student-personal-ai-generation-ui.test.ts src/features/student/ai-generation/StudentPersonalAiGenerationPage.test.tsx src/server/services/personal-ai-generation-local-browser-experience-service.test.ts`
4. Run targeted Playwright localhost-only validation:
   - `npm.cmd run test:e2e -- --list`
   - `npm.cmd run test:e2e -- e2e/personal-ai-generation-local-request.spec.ts`
5. Run quality and closeout gates:
   - `npx.cmd prettier --check --ignore-unknown <changed docs/state/evidence/audit files>`
   - `npm.cmd run lint`
   - `npm.cmd run typecheck`
   - `git diff --check`
   - `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId module-run-v2-personal-ai-local-ui-browser-flow-validation`
   - `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId module-run-v2-personal-ai-local-ui-browser-flow-validation`
   - `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId module-run-v2-personal-ai-local-ui-browser-flow-validation`

## Evidence Rules

Evidence records only command names, exit status, test/spec names, test counts, localhost target, and pass/fail summaries. It must not include screenshots, traces, HTML reports, raw DOM dumps, page text dumps, provider payloads, raw prompts, raw answers, tokens, cookies, Authorization headers, database URLs, row data, private data, or public identifier inventories.

## Hard Stops

Stop immediately if validation requires any of these:

- `.env*` read, output, or write
- provider/model calls or provider configuration
- dependency, package, or lockfile changes
- schema/drizzle/migration work
- staging/prod/cloud/deploy/payment/external-service access
- full e2e suite, headed/debug/UI mode, or a non-existing e2e spec
- raw private data, row data, public identifier inventories, or unredacted evidence
- PR, force push, or Cost Calibration Gate work
