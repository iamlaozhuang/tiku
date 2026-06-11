# Task Plan: phase-82-personal-learning-ai-module-run-proposal

## Task

- id: `phase-82-personal-learning-ai-module-run-proposal`
- branch: `codex/phase-82-personal-learning-ai-module-run-proposal`
- task kind: `docs_only`
- local validation level: `L0 docs-only queue seed proposal`

## Context Read

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/04-agent-system/state/advanced-edition-domain-module-run-matrix.yaml`
- `docs/04-agent-system/state/mechanism-source-of-truth-index.yaml`
- `docs/superpowers/specs/2026-06-06-advanced-edition-mvp-requirements.md`
- `docs/superpowers/specs/2026-06-06-advanced-edition-ops-config-contract.md`
- `docs/superpowers/plans/2026-06-06-advanced-edition-requirements-to-implementation-handoff.md`
- `docs/superpowers/plans/2026-06-06-advanced-edition-doc-source-of-truth-index.md`
- phase79 task plan, evidence, and audit review
- phase80 task plan, evidence, and audit review
- phase81 task plan, evidence, and audit review
- `docs/05-execution-logs/task-plans/2026-06-08-module-run-v2-local-experience-acceptance-planning.md`
- `docs/05-execution-logs/evidence/2026-06-08-module-run-v2-local-experience-acceptance-planning.md`
- `docs/05-execution-logs/audits-reviews/2026-06-08-module-run-v2-local-experience-acceptance-planning.md`

## Recovered State

- `master`, `origin/master`, and `HEAD` are aligned at `2d043e9acf627bc15ddb90005f8d2fb80ceca9d8`.
- `task-queue.yaml` has no `pending`, `in_progress`, or `claimed` tasks before this task.
- Local automation TOML remains `status = "PAUSED"` for `tiku-module-run-v2-autopilot`.
- The read-only seed proposal script reports `seedModule: personal-learning-ai` and four candidate closures:
  - personal generation request flow
  - `paper` and `mock_exam` context selection
  - local UI/browser experience for request and result reference where approved
  - redacted `ai_call_log` reference without storing raw generated AI content

## Goal

Append a docs-only phase82 queue seed proposal and the next narrow Module Run v2 tasks for the
`personal-learning-ai-experience` chain. The queue must prioritize L4 local transport/API/contract planning before any
L5 UI/browser or local E2E validation work.

## Allowed Scope

- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/**`
- `docs/05-execution-logs/evidence/**`
- `docs/05-execution-logs/audits-reviews/**`

## Blocked Scope

- product source changes under `src/**`
- tests or e2e changes under `tests/**` or `e2e/**`
- package or lockfile changes
- env/secret reads or writes
- schema, migration, `src/db/schema/**`, or `drizzle/**`
- provider call or provider configuration
- staging, prod, cloud, deploy, payment, or external-service work
- destructive DB operation
- Playwright execution in phase82
- PR creation, force push, or Cost Calibration Gate execution

## Queue Seed Strategy

1. Add `phase-82-personal-learning-ai-module-run-proposal` as the docs-only seed proposal closeout task.
2. Append pending low-risk Module Run v2 tasks:
   - `batch-109-personal-learning-ai-local-transport-contract-planning`
   - `batch-110-personal-learning-ai-request-flow-local-contract`
   - `batch-111-personal-learning-ai-paper-mock-context-local-contract`
   - `batch-112-personal-learning-ai-redacted-result-reference-local-contract`
   - `batch-113-personal-learning-ai-local-ui-browser-planning`
   - `batch-114-personal-learning-ai-local-e2e-smoke-planning`
3. Keep L4 work before L5 work through dependencies.
4. Require `localExperienceAcceptanceBridgeApproved` for any future task that touches `src/app/api/v1/**`, Server
   Actions, repositories, mappers, `src/app/(student)/**`, browser verification, or `e2e/**`.
5. Materialize task-scoped `closeoutPolicy` only for low-risk docs/planning and local implementation tasks where the
   current user approval and standing closeout policy allow commit, fast-forward merge, push, and cleanup.

## Validation Commands

1. `node .\node_modules\prettier\bin\prettier.cjs --write docs\04-agent-system\state\project-state.yaml docs\04-agent-system\state\task-queue.yaml docs\05-execution-logs\task-plans\2026-06-11-phase-82-personal-learning-ai-module-run-proposal.md docs\05-execution-logs\evidence\phase-82-personal-learning-ai-module-run-proposal.md docs\05-execution-logs\audits-reviews\phase-82-personal-learning-ai-module-run-proposal.md`
2. `node .\node_modules\prettier\bin\prettier.cjs --check docs\04-agent-system\state\project-state.yaml docs\04-agent-system\state\task-queue.yaml docs\05-execution-logs\task-plans\2026-06-11-phase-82-personal-learning-ai-module-run-proposal.md docs\05-execution-logs\evidence\phase-82-personal-learning-ai-module-run-proposal.md docs\05-execution-logs\audits-reviews\phase-82-personal-learning-ai-module-run-proposal.md`
3. `Select-String -Path docs\04-agent-system\state\task-queue.yaml,docs\05-execution-logs\evidence\phase-82-personal-learning-ai-module-run-proposal.md,docs\05-execution-logs\audits-reviews\phase-82-personal-learning-ai-module-run-proposal.md -Pattern 'personal-learning-ai-experience','localExperienceAcceptanceBridgeApproved','local_api_or_server_action_contract','local_ui_browser','approved_local_only_existing_specs','Cost Calibration Gate remains blocked'`
4. `git diff --check`
5. `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2AutodriveSchemaReadiness.ps1 -TaskId phase-82-personal-learning-ai-module-run-proposal`
6. `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId phase-82-personal-learning-ai-module-run-proposal`
7. `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId phase-82-personal-learning-ai-module-run-proposal`

## Stop Conditions

- Any edit requires dependency/package/lock, env/secret, schema/migration, provider, staging/prod/deploy, payment,
  external-service, destructive DB, PR, force push, Playwright execution, or Cost Calibration Gate work.
- The queue seed would create executable work without allowed files, blocked files, validation commands, evidence path, or
  audit review path.
- A candidate task would allow API/UI/browser/e2e surfaces without `localExperienceAcceptanceBridgeApproved`.
- Changed files exceed the phase82 allowed scope.
- Remote divergence appears before approved closeout.
