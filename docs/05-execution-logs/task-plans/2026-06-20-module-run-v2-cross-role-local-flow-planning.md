# Task Plan: module-run-v2-cross-role-local-flow-planning

## Scope

Process the local experience bridge proposal for `module-run-v2-cross-role-local-flow-planning`.

This is an L6 `local_role_flow_and_e2e_readiness` planning reconciliation packet for
`personal-learning-ai-experience`. It may update durable state, task plan, evidence, and audit review files only.
Existing role-flow and e2e files are read-only inventory and validation inputs.

## Required Reads

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/04-agent-system/state/advanced-edition-domain-module-run-matrix.yaml`
- `docs/05-execution-logs/evidence/batch-114-personal-learning-ai-local-e2e-smoke-planning.md`
- `docs/05-execution-logs/evidence/2026-06-17-module-run-v2-personal-ai-local-ui-browser-flow-validation.md`
- `docs/05-execution-logs/evidence/2026-06-20-module-run-v2-personal-ai-local-ui-browser-planning.md`
- `e2e/role-based-acceptance/role-based-full-flow.spec.ts`
- `e2e/admin-role-denial-browser.spec.ts`
- `e2e/personal-ai-generation-local-request.spec.ts`
- `e2e/student-practice-mock-entry.spec.ts`
- `tests/unit/auth/session-personal-auth-boundary.test.ts`
- `tests/unit/admin-logs/admin-log-retention-redaction-layering.test.ts`
- `tests/unit/student-personal-ai-generation-ui.test.ts`
- `tests/unit/admin-ai-audit-log-ops-baseline.test.ts`

## Implementation Plan

1. Materialize the current user approval as task-level `localExperienceAcceptanceBridgeApproved` for the L6 planning
   reconciliation packet.
2. Keep the packet docs-state only: no `src`, `tests`, `e2e`, schema, migration, dependency, env, provider, deploy, PR,
   force-push, or Cost Calibration Gate changes.
3. Verify existing auth/session, log redaction, admin role-boundary, and student personal AI redaction contracts through
   focused unit validation.
4. Inventory existing Playwright specs with `--list` and file listing only. Do not run browser flows.
5. Record redacted evidence and audit review, then complete validation and closeout commits if all gates pass.

## Risk Controls

- Evidence must not contain raw prompts, raw generated AI content, provider payloads, secrets, tokens, database URLs,
  Authorization headers, raw DB rows, plaintext `redeem_code`, full `paper`, full `material`, raw answer text, or
  browser session values.
- Existing `module-run-v2-personal-ai-local-ui-browser-flow-validation` remains a separate blocked validation failure.
- If L6 closure requires actual Playwright execution, e2e spec edits, source edits, destructive DB writes,
  schema/migration/dependency/env/provider/deploy/payment work, or Cost Calibration Gate execution, stop and split a
  separate task.

## Validation Plan

- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Get-TikuProjectStatus.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Get-TikuNextAction.ps1 -VerboseHistory`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Get-ModuleRunV2ImplementationSeedProposal.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Get-ModuleRunV2LocalExperienceBridgeProposal.ps1`
- `npm.cmd run test:unit -- tests/unit/auth/session-personal-auth-boundary.test.ts tests/unit/admin-logs/admin-log-retention-redaction-layering.test.ts tests/unit/student-personal-ai-generation-ui.test.ts tests/unit/admin-ai-audit-log-ops-baseline.test.ts`
- `npm.cmd run test:e2e -- --list`
- `rg --files e2e`
- scoped Prettier check for changed state, plan, evidence, and audit files
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `git diff --check`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId module-run-v2-cross-role-local-flow-planning`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId module-run-v2-cross-role-local-flow-planning`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId module-run-v2-cross-role-local-flow-planning`
