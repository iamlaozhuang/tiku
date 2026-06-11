# Task Plan: phase-80-module-run-v2-local-e2e-capability-gates

## Task

- id: `phase-80-module-run-v2-local-e2e-capability-gates`
- branch: `codex/phase-80-local-e2e-gates`
- task kind: `implementation`
- local validation level: `L1 mechanism script smoke`

## Context Read

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/04-agent-system/state/autodrive-control-schema.yaml`
- `docs/04-agent-system/state/mechanism-source-of-truth-index.yaml`
- `docs/04-agent-system/sop/local-first-validation-governance.md`
- `docs/04-agent-system/sop/task-lifecycle-governance.md`
- `scripts/agent-system/Test-ModuleRunV2AutodriveSchemaReadiness.ps1`
- `scripts/agent-system/Test-ModuleRunV2AutodriveSchemaReadiness.Smoke.ps1`
- `scripts/agent-system/Test-ModuleRunV2ValidationSurfaceReadiness.ps1`
- `scripts/agent-system/Test-ModuleRunV2ValidationSurfaceReadiness.Smoke.ps1`
- phase79 evidence and audit review

## Goal

Make the mechanism scripts enforce the newly documented local E2E validation approval path:

- e2e commands require `localE2EValidation: approved_local_only_existing_specs`;
- only local-only `npm.cmd run test:e2e -- --list` and targeted existing `e2e/**/*.spec.ts` commands are accepted;
- `test:e2e:ui`, headed/debug mode, non-`e2e/**` specs, non-existing specs, implicit `npm.cmd run test`, and e2e without capability hard-block;
- validation surface recognizes targeted e2e pass evidence and rejects missing or failed e2e evidence for closeout.

## Allowed Scope

- `scripts/agent-system/Test-ModuleRunV2AutodriveSchemaReadiness.ps1`
- `scripts/agent-system/Test-ModuleRunV2AutodriveSchemaReadiness.Smoke.ps1`
- `scripts/agent-system/Test-ModuleRunV2ValidationSurfaceReadiness.ps1`
- `scripts/agent-system/Test-ModuleRunV2ValidationSurfaceReadiness.Smoke.ps1`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/04-agent-system/state/autodrive-control-schema.yaml`
- `docs/04-agent-system/state/mechanism-source-of-truth-index.yaml`
- `docs/05-execution-logs/task-plans/**`
- `docs/05-execution-logs/evidence/**`
- `docs/05-execution-logs/audits-reviews/**`

## Blocked Scope

- package or lockfile changes
- env/secret reads or writes
- schema, migration, `drizzle/`, or `src/db/schema/**`
- provider calls or provider configuration
- staging, prod, cloud, deploy, payment, or external-service work
- destructive DB operations
- product source changes
- e2e spec changes
- live e2e execution in this phase
- Cost Calibration Gate

## TDD Plan

1. Add smoke fixtures that fail under the current scripts:
   - e2e command without local capability hard-blocks;
   - approved targeted existing spec can autodrive;
   - `npm.cmd run test`, `test:e2e:ui`, headed/debug, and missing spec hard-block;
   - validation surface accepts e2e pass evidence and rejects failed evidence.
2. Run the smoke scripts to observe the expected RED.
3. Implement helpers and gate logic in `Test-ModuleRunV2AutodriveSchemaReadiness.ps1`.
4. Implement e2e evidence recognition in `Test-ModuleRunV2ValidationSurfaceReadiness.ps1`.
5. Run smoke scripts, lint, typecheck, diff, hardening, and pre-push readiness.

## Risk Defenses

- Do not run Playwright e2e in phase80.
- Do not broaden allowed e2e commands beyond local-only list and existing targeted specs.
- Keep `Cost Calibration Gate` blocked and preserve provider/env/schema/dependency/deploy/payment/external-service blocks.
- Evidence records command results only and no sensitive content.

## Validation Commands

1. `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2AutodriveSchemaReadiness.Smoke.ps1`
2. `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ValidationSurfaceReadiness.Smoke.ps1`
3. `npm.cmd run lint`
4. `npm.cmd run typecheck`
5. `git diff --check`
6. `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId phase-80-module-run-v2-local-e2e-capability-gates`
7. `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId phase-80-module-run-v2-local-e2e-capability-gates`

## Stop Conditions

- Any implementation requires dependency/package/lock, env/secret, schema/migration, provider, staging/prod/deploy, payment, external-service, destructive DB, PR, force push, or Cost Calibration Gate work.
- Script smoke failures cannot be resolved inside allowed mechanism files.
- Changed files exceed `allowedFiles` or touch `blockedFiles`.
- Remote divergence appears before approved closeout.
