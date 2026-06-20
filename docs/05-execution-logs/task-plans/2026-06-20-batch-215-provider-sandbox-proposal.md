# Batch 215 Provider Sandbox Proposal Plan

## Scope

- Task: `batch-215-ai-task-and-provider-local-provider-sandbox-proposal-and-evidence`
- Branch: `codex/batch-215-provider-sandbox-proposal`
- Boundary: validate local-only `local_provider_sandbox` proposal and redacted evidence rules for `ai-task-and-provider`.

## Standards Read

- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/adr-001-tech-stack-selection.md`
- `docs/02-architecture/adr/adr-002-runtime-architecture-and-multi-client-contract.md`
- `docs/02-architecture/adr/adr-003-workplace-desktop-web-compatibility.md`
- `docs/02-architecture/adr/adr-004-environment-isolation-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-005-staging-architecture-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-006-runtime-dependency-alignment.md`

## Implementation Approach

1. Run Module Run v2 auto-seed readiness for batch-215 before edits.
2. Inspect existing provider sandbox proposal model, contract, validator, service, and focused unit test.
3. Replace the advisory focused test placeholder with the scoped unit command:
   `npm.cmd run test:unit -- src/server/services/ai-generation-task-provider-sandbox-proposal-service.test.ts`.
4. If the scoped unit already proves the contract, record validation evidence without source/test changes.
5. If the scoped unit exposes a contract gap, stop broadening scope and apply TDD only within allowed files.
6. Keep provider execution blocked: no provider call, provider configuration, env/secret access, schema/migration,
   dependency, deploy, payment, PR, force-push, or Cost Calibration Gate execution.

## Validation Plan

- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ImplementationAutoSeedReadiness.ps1 -TaskId phase-70-advanced-ai-task-domain-implementation-planning -CandidateTaskId batch-215-ai-task-and-provider-local-provider-sandbox-proposal-and-evidence -EvidencePath docs\05-execution-logs\evidence\2026-06-20-module-run-v2-auto-seed-ai-task-and-provider.md`
- `npm.cmd run test:unit -- src/server/services/ai-generation-task-provider-sandbox-proposal-service.test.ts`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `git diff --check`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId batch-215-ai-task-and-provider-local-provider-sandbox-proposal-and-evidence`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId batch-215-ai-task-and-provider-local-provider-sandbox-proposal-and-evidence`

## Approval And Risk Boundary

- Current user fresh approval authorizes local commit, FF merge to `master`, push to `origin/master`, and deletion of the
  short branch for this continuing low-risk Module Run v2 flow.
- This plan does not authorize env/provider/schema/deploy/payment/PR/force-push/Cost Calibration Gate work.
