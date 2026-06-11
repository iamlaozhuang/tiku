# Task Plan: phase-83-module-run-v2-validation-command-normalization

## Task

- id: `phase-83-module-run-v2-validation-command-normalization`
- branch: `codex/phase-83-validation-command-normalization`
- task kind: `mechanism_hardening`
- scope: Module Run v2 validation command normalization

## Context Read

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/04-agent-system/state/autodrive-control-schema.yaml`
- `scripts/agent-system/Test-ModuleRunV2AutodriveSchemaReadiness.ps1`
- `scripts/agent-system/Test-ModuleRunV2AutodriveSchemaReadiness.Smoke.ps1`
- `scripts/agent-system/New-ModuleRunV2ImplementationSeed.ps1`
- `scripts/agent-system/New-ModuleRunV2ImplementationSeed.Smoke.ps1`
- `scripts/agent-system/Test-ModuleRunV2ImplementationSeedSelfReview.ps1`
- `scripts/agent-system/Test-ModuleRunV2ImplementationSeedSelfReview.Smoke.ps1`
- `scripts/agent-system/Test-ModuleRunV2ValidationSurfaceReadiness.ps1`
- `scripts/agent-system/Test-ModuleRunV2ValidationSurfaceReadiness.Smoke.ps1`

## Goal

Allow a narrow docs-only normalization path for low-risk Module Run v2 tasks whose only blocker is the legacy placeholder
validation command:

```powershell
npm.cmd run test -- --run focused # focused test anchor
```

The normalization may replace that placeholder with an explicit scoped unit test command. It must not loosen e2e,
provider, schema, env, dependency, deployment, payment, external-service, force-push, PR, or Cost Calibration Gate
boundaries.

## Implementation Plan

1. Verify the current RED state with `batch-111-personal-learning-ai-request-context-local-contract`, expecting
   `HARD_BLOCK_LOCAL_E2E_COMMAND` before normalization.
2. Update `Test-ModuleRunV2AutodriveSchemaReadiness.ps1` so local e2e command scanning uses only runnable completion
   commands:
   - `validationCommandLifecycle` phases `post_edit` and `closeout`;
   - legacy `validationCommands` after removing approved placeholder commands that have an explicit replacement.
3. Add a narrow normalization detector:
   - task block must include `validationCommandNormalization: approved_docs_only_placeholder_to_scoped_unit`;
   - task block must include exactly one replacement command matching `npm.cmd run test:unit -- <path>.test.ts`;
   - placeholder command without replacement remains a hard block.
4. Update seeding so future seeded tasks keep broad baseline only under `validationCommandLifecycle.phase:
advisory_baseline`, not in hard `validationCommands`.
5. Update smoke tests to cover:
   - placeholder without replacement still blocks;
   - placeholder with approved replacement no longer blocks readiness;
   - advisory baseline placeholder does not trigger local e2e hard block;
   - seed output no longer writes placeholder in hard validationCommands;
   - seed self-review still requires focused/advisory evidence anchors.
6. Normalize current queue entries:
   - `batch-111` replacement command:
     `npm.cmd run test:unit -- src/server/services/personal-ai-generation-request-context-service.test.ts`
   - `batch-112` replacement command:
     `npm.cmd run test:unit -- src/server/services/personal-ai-generation-result-reference-service.test.ts`
7. Verify `batch-111` readiness returns `can_autodrive`.

## Risk Defense

- Do not run e2e.
- Do not run future batch111/batch112 scoped tests in this task; they target files that do not exist yet.
- Do not edit `src/**`, `e2e/**`, package files, lockfiles, schema, migration, env/secret files, provider
  configuration, deployment configuration, payment, or external-service surfaces.
- Evidence must remain redacted and command-summary-only.
- Cost Calibration Gate remains blocked.

## Validation Commands

1. `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2AutodriveSchemaReadiness.Smoke.ps1`
2. `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\New-ModuleRunV2ImplementationSeed.Smoke.ps1`
3. `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ImplementationSeedSelfReview.Smoke.ps1`
4. `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ValidationSurfaceReadiness.Smoke.ps1`
5. `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2AutodriveSchemaReadiness.ps1 -TaskId batch-111-personal-learning-ai-request-context-local-contract`
6. `npm.cmd run lint`
7. `npm.cmd run typecheck`
8. `git diff --check`
9. `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId phase-83-module-run-v2-validation-command-normalization`
10. `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId phase-83-module-run-v2-validation-command-normalization`
11. `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId phase-83-module-run-v2-validation-command-normalization`

## Stop Conditions

- Any dependency/package/lockfile, schema/migration, env/secret, provider, e2e, staging/prod/deploy, payment,
  external-service, destructive DB, PR, force-push, or Cost Calibration Gate surface is required.
- A replacement command cannot be explicit and scoped to `npm.cmd run test:unit -- <path>.test.ts`.
- Readiness only passes by weakening local e2e gates.
- Automation would need to be resumed.
