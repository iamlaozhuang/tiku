# Task Plan: module-run-v2-cross-role-local-flow-planning

## Scope

Execute the approved Module Run v2 L6 local experience bridge for
`module-run-v2-cross-role-local-flow-planning`.

This packet validates the `personal-learning-ai-experience` bridge step
`local_role_flow_and_e2e_readiness` with existing localhost-only local specs and focused unit tests. It may update
durable state, task plan, evidence, and audit review files only. Product source, unit tests, e2e specs, schema,
migrations, dependencies, env files, Provider configuration, deployment, PR, force-push, and Cost Calibration Gate work
are out of scope.

## Required Reads

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/04-agent-system/state/execution-profiles.yaml`
- `docs/04-agent-system/sop/local-first-validation-governance.md`
- `scripts/agent-system/Test-ModuleRunV2LocalCapabilityGate.ps1`
- `scripts/agent-system/Test-ModuleRunV2PreCommitHardening.ps1`
- `scripts/agent-system/Test-ModuleRunV2ModuleCloseoutReadiness.ps1`
- `scripts/agent-system/Test-ModuleRunV2PrePushReadiness.ps1`
- `playwright.config.ts`
- `e2e/local-auth-route-guard.spec.ts`
- `e2e/admin-role-denial-browser.spec.ts`
- `e2e/edition-aware-authorization-local-flow.spec.ts`
- `e2e/personal-ai-generation-local-request.spec.ts`
- `e2e/organization-training-local-full-flow.spec.ts`
- Historical evidence for the 2026-06-17, 2026-06-18, 2026-06-20, and 2026-06-22 local experience bridge packets.

## Implementation Plan

1. Materialize the current user approval as task-level `localExperienceAcceptanceBridgeApproved` for the L6 bridge.
2. Register `local_full_flow` capability boundaries in `task-queue.yaml` and durable progress in `project-state.yaml`.
3. Run `Test-ModuleRunV2LocalCapabilityGate.ps1` before localhost e2e execution.
4. Run focused existing unit tests for auth/session boundaries, redaction layering, personal AI UI contracts, and admin
   AI audit log baseline.
5. Inventory existing Playwright tests with `npm.cmd run test:e2e -- --list`.
6. Run the targeted existing localhost e2e command for route guard, role denial, edition-aware authorization, personal
   AI generation request, and organization training local full-flow specs.
7. Run lint, typecheck, build, scoped formatting, `git diff --check`, and Module Run v2 closeout/prepush gates.
8. Record redacted command-result evidence only. If any boundary requires source/e2e repair, env, database, schema,
   dependency, Provider, deploy, or external-service work, record blocked status instead of changing those surfaces.

## Risk Controls

- Evidence must not contain raw prompts, raw generated AI content, provider payloads, secrets, tokens, database URLs,
  Authorization headers, raw DB rows, plaintext `redeem_code`, internal autoincrement IDs, full `paper`, full
  `material`, raw employee answer text, or sensitive browser/session values.
- `e2e/edition-aware-authorization-db-backed-local-flow.spec.ts` is intentionally excluded because it performs explicit
  env and database-backed setup.
- `e2e/local-business-flow.spec.ts` is intentionally excluded from the target command because it is broader than this
  role-flow bridge and captures screenshots.
- Existing Playwright/dev-server runtime is allowed only through the named localhost-only `npm.cmd run test:e2e`
  commands.
- No manual `.env` reads or writes are allowed. If runtime configuration is missing, the task becomes blocked with
  redacted evidence.

## Validation Plan

- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Get-TikuProjectStatus.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Get-TikuNextAction.ps1 -VerboseHistory`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Get-ModuleRunV2ImplementationSeedProposal.ps1 -MaxBatchCount 4`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Get-ModuleRunV2LocalExperienceBridgeProposal.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2LocalCapabilityGate.ps1 -TaskId module-run-v2-cross-role-local-flow-planning -Capability localFullFlowGate -Intent use_capability`
- `npm.cmd run test:unit -- tests/unit/auth/session-personal-auth-boundary.test.ts tests/unit/admin-logs/admin-log-retention-redaction-layering.test.ts tests/unit/student-personal-ai-generation-ui.test.ts tests/unit/admin-ai-audit-log-ops-baseline.test.ts`
- `npm.cmd run test:e2e -- --list`
- `npm.cmd run test:e2e -- e2e/local-auth-route-guard.spec.ts e2e/admin-role-denial-browser.spec.ts e2e/edition-aware-authorization-local-flow.spec.ts e2e/personal-ai-generation-local-request.spec.ts e2e/organization-training-local-full-flow.spec.ts`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `npm.cmd run build`
- `npx.cmd prettier --check --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-06-22-module-run-v2-cross-role-local-flow-planning.md docs/05-execution-logs/evidence/2026-06-22-module-run-v2-cross-role-local-flow-planning.md docs/05-execution-logs/audits-reviews/2026-06-22-module-run-v2-cross-role-local-flow-planning.md`
- `git diff --check`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId module-run-v2-cross-role-local-flow-planning`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId module-run-v2-cross-role-local-flow-planning`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId module-run-v2-cross-role-local-flow-planning -SkipRemoteAheadCheck`
