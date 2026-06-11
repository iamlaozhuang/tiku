# Task Plan: phase-81-local-e2e-approval-smoke-verification

## Task

- id: `phase-81-local-e2e-approval-smoke-verification`
- branch: `codex/phase-81-local-e2e-smoke`
- task kind: `local_verification`
- local validation level: `L5 local e2e`

## Context Read

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/04-agent-system/state/autodrive-control-schema.yaml`
- `docs/04-agent-system/sop/local-first-validation-governance.md`
- `docs/04-agent-system/sop/task-lifecycle-governance.md`
- phase79 evidence and audit review
- phase80 evidence and audit review
- Playwright skill instructions
- `playwright.config.ts`
- `e2e/home.spec.ts`

## Goal

Verify the new local E2E authorization chain by running only the approved local-only commands:

- `npm.cmd run test:e2e -- --list`
- `npm.cmd run test:e2e -- e2e/home.spec.ts`

`home.spec.ts` is the lowest-risk existing spec anchor: no account, no DB seed, no credential recording.

## Allowed Scope

- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
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
- screenshots, traces, HTML reports, page text, credentials, browser storage/session contents, or DB rows in evidence
- full-suite default e2e, headed/debug/UI e2e, and role-flow e2e
- Cost Calibration Gate

## Approach

1. Update durable state and queue to claim phase81.
2. Run the phase81 schema readiness gate to confirm the local e2e capability is recognized.
3. Run `npm.cmd run test:e2e -- --list`.
4. Run `npm.cmd run test:e2e -- e2e/home.spec.ts`.
5. Record redacted evidence with command, pass/fail, spec name, and test count only.
6. Run lint, typecheck, diff, validation surface readiness, hardening, and pre-push readiness.

## Failure Rule

If either e2e command fails, stop after writing redacted evidence and audit. Do not fix the app, do not edit e2e specs, and do not push a success conclusion.

## Validation Commands

1. `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2AutodriveSchemaReadiness.ps1 -TaskId phase-81-local-e2e-approval-smoke-verification`
2. `npm.cmd run test:e2e -- --list`
3. `npm.cmd run test:e2e -- e2e/home.spec.ts`
4. `npm.cmd run lint`
5. `npm.cmd run typecheck`
6. `git diff --check`
7. `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ValidationSurfaceReadiness.ps1 -TaskId phase-81-local-e2e-approval-smoke-verification`
8. `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId phase-81-local-e2e-approval-smoke-verification`
9. `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId phase-81-local-e2e-approval-smoke-verification`

## Stop Conditions

- Any e2e command fails.
- Evidence would need sensitive data or browser artifacts.
- Any requested action requires dependency/package/lock, env/secret, schema/migration, provider, staging/prod/deploy, payment, external-service, destructive DB, PR, force push, or Cost Calibration Gate work.
- Changed files exceed `allowedFiles` or touch `blockedFiles`.
- Remote divergence appears before approved closeout.
