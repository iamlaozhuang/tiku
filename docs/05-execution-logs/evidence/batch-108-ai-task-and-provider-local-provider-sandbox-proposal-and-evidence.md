# Module Run v2 Seeded Task Evidence: batch-108-ai-task-and-provider-local-provider-sandbox-proposal-and-evidence

result: in_progress

## Summary

- module: ai-task-and-provider
- sourcePlanningTask: phase-70-advanced-ai-task-domain-implementation-planning
- targetClosureItem: local_provider_sandbox proposal and evidence rules
- moduleRunVersion: 2

## Required Anchors

- Batch range: batch-108
- RED: `npm.cmd run test:unit -- src/server/services/ai-generation-task-provider-sandbox-proposal-service.test.ts`
  failed because `src/server/services/ai-generation-task-provider-sandbox-proposal-service.ts` did not exist.
- GREEN: focused provider sandbox proposal tests passed after adding deterministic local model, contract, validator,
  and service exports.
- Commit: pending
- localFullLoopGate: L2 unit validation passed
- threadRolloverGate: current thread can continue; no rollover required before closeout.
- nextModuleRunCandidate: no pending ai-task-and-provider implementation batch remains in the active queue after batch 108; a new module run proposal is required before cross-module implementation work.
- blocked remainder: high-risk gates remain separately blocked.
- Cost Calibration Gate remains blocked.

## Validation

### RED

Command:

```powershell
npm.cmd run test:unit -- src/server/services/ai-generation-task-provider-sandbox-proposal-service.test.ts
```

Result:

- Exit code: `1`
- Failure reason: import `./ai-generation-task-provider-sandbox-proposal-service` could not be resolved.

### GREEN

Command:

```powershell
npm.cmd run test:unit -- src/server/services/ai-generation-task-provider-sandbox-proposal-service.test.ts
```

Result:

- Exit code: `0`
- Test files: `1 passed`
- Tests: `4 passed`

### Required Commands

| Command                                                                                                                                  | Result  | Notes                                                         |
| ---------------------------------------------------------------------------------------------------------------------------------------- | ------- | ------------------------------------------------------------- |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ImplementationAutoSeedReadiness.ps1 ...` | pass    | Candidate executable with status `pending` before task claim. |
| `npm.cmd run lint`                                                                                                                       | pass    | ESLint passed after implementation.                           |
| `npm.cmd run typecheck`                                                                                                                  | pass    | TypeScript `tsc --noEmit` passed after implementation.        |
| `npm.cmd run test:unit -- src/server/services/ai-generation-task-provider-sandbox-proposal-service.test.ts`                              | pass    | Focused Vitest provider sandbox proposal coverage passed.     |
| `git diff --check`                                                                                                                       | pass    | No whitespace errors after implementation.                    |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 ...`         | pending | Run after closeout metadata is written.                       |

## Changed Files

- `src/server/models/ai-generation-task-provider-sandbox-proposal.ts`
- `src/server/contracts/ai-generation-task-provider-sandbox-proposal-contract.ts`
- `src/server/validators/ai-generation-task-provider-sandbox-proposal.ts`
- `src/server/services/ai-generation-task-provider-sandbox-proposal-service.ts`
- `src/server/services/ai-generation-task-provider-sandbox-proposal-service.test.ts`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/2026-06-11-batch-108-ai-task-provider-sandbox-proposal.md`
- `docs/05-execution-logs/evidence/batch-108-ai-task-and-provider-local-provider-sandbox-proposal-and-evidence.md`
- `docs/05-execution-logs/audits-reviews/batch-108-ai-task-and-provider-local-provider-sandbox-proposal-and-evidence.md`

## Boundary Notes

- The implementation is proposal-only local read-model logic. It records `local_provider_sandbox` proposal decisions,
  explicit local sandbox approval references when supplied, redacted evidence rules, and blocked high-risk reasons.
- The service always reports `providerCallExecuted: false`; it does not call a provider, read env/secret values, change
  provider configuration, measure provider cost, or execute Cost Calibration Gate behavior.
- Evidence rules expose only public ids, `summary_only` visibility, redaction status, evidence status, allowed metadata
  categories, and forbidden evidence categories.
- `npm.cmd run test -- --run focused` was not executed because the repository `test` script chains into e2e. The task
  focused validation used
  `npm.cmd run test:unit -- src/server/services/ai-generation-task-provider-sandbox-proposal-service.test.ts`, keeping
  within the explicit no-e2e boundary.
- No provider call, provider configuration, schema, migration, dependency, lockfile, env/secret, staging, prod, deploy,
  payment, external-service, PR, force push, or Cost Calibration Gate action was performed.
