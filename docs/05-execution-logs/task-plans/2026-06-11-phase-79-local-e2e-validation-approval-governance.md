# Task Plan: phase-79-local-e2e-validation-approval-governance

## Task

- id: `phase-79-local-e2e-validation-approval-governance`
- branch: `codex/phase-79-local-e2e-governance`
- task kind: `docs_only`
- local validation level: `L0 docs-only governance`

## Context Read

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/04-agent-system/state/advanced-edition-domain-module-run-matrix.yaml`
- `docs/04-agent-system/state/mechanism-source-of-truth-index.yaml`
- `docs/04-agent-system/state/autodrive-control-schema.yaml`
- `docs/04-agent-system/sop/local-first-validation-governance.md`
- `docs/04-agent-system/sop/task-lifecycle-governance.md`
- `docs/04-agent-system/sop/automated-advancement-governance.md`
- latest task plan, evidence, and audit review for batch 108

## Goal

Record the fresh user approval as a durable, local-only E2E validation governance path while keeping ordinary E2E work blocked by default. Seed the next two serial tasks:

- `phase-80-module-run-v2-local-e2e-capability-gates`
- `phase-81-local-e2e-approval-smoke-verification`

## Allowed Scope

- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/04-agent-system/state/autodrive-control-schema.yaml`
- `docs/04-agent-system/state/mechanism-source-of-truth-index.yaml`
- `docs/04-agent-system/sop/local-first-validation-governance.md`
- `docs/04-agent-system/sop/task-lifecycle-governance.md`
- `docs/04-agent-system/sop/automated-advancement-governance.md`
- `docs/05-execution-logs/task-plans/**`
- `docs/05-execution-logs/evidence/**`
- `docs/05-execution-logs/audits-reviews/**`

## Blocked Scope

- dependency, package, or lockfile changes
- env/secret reads or writes
- schema, migration, `drizzle/`, or `src/db/schema/**`
- provider calls or provider configuration
- staging, prod, cloud, deploy, payment, or external-service work
- destructive DB operation
- product source changes
- E2E execution in this phase
- Cost Calibration Gate

## Approach

1. Add `automation.unattendedControl.standingLocalE2EValidationApproval` to `project-state.yaml`.
2. Add the `localE2EValidation` capability and standing approval contract to `autodrive-control-schema.yaml`.
3. Add SOP language that local E2E remains blocked unless a task explicitly declares the approved capability and uses the local-only whitelist.
4. Append phase79/80/81 task entries to `task-queue.yaml`, closing phase79 after validation and leaving phase80/81 pending.
5. Update mechanism source-of-truth navigation so future recovery knows where the E2E approval lives.
6. Write phase79 evidence and audit review.

## Risk Defenses

- E2E is not removed from the standing unattended closeout blocked list.
- `localE2EValidation` can only approve existing Playwright specs under `e2e/**` and localhost/127.0.0.1 execution.
- Full-suite default `npm.cmd run test:e2e`, `test:e2e:ui`, headed/debug mode, non-existing specs, env/secret access, and generated artifacts remain blocked.
- Evidence must record command summaries only and must not include screenshots, traces, HTML reports, page text, raw prompts, provider payloads, DB rows, secrets, or credentials.

## Validation Commands

1. `node .\node_modules\prettier\bin\prettier.cjs --write <changed docs/state files>`
2. `node .\node_modules\prettier\bin\prettier.cjs --check <changed docs/state files>`
3. `Select-String` required-anchor search for `standingLocalE2EValidationApproval`, `localE2EValidation`, `approved_local_only_existing_specs`, and `Cost Calibration Gate remains blocked`
4. `git diff --check`
5. `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId phase-79-local-e2e-validation-approval-governance`
6. `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`

## Stop Conditions

- Any requested change requires package/lock, schema/migration, env/secret, provider, staging/prod/deploy, payment, external-service, destructive DB, PR, force push, or Cost Calibration Gate work.
- Validation fails and cannot be fixed inside the docs-only allowed scope.
- Changed files exceed `allowedFiles` or touch `blockedFiles`.
- Remote divergence appears before approved closeout.
