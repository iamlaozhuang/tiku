# Unified Standard Advanced Use Case Audit Planning Task Plan

**Task id:** `unified-standard-advanced-use-case-audit-planning`

**Branch:** `codex/unified-standard-advanced-use-case-audit-planning`

## Goal

Create a docs-only planning contract for merging standard edition MVP and advanced edition requirements into a user-case-driven audit system with a technical landing matrix.

## Required Reads

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/*.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/01-requirements/00-index.md`
- `docs/01-requirements/modules/*.md`
- `docs/01-requirements/stories/*.md`
- `docs/01-requirements/advanced-edition/00-index.md`
- `docs/01-requirements/advanced-edition/modules/*.md`
- `docs/01-requirements/advanced-edition/stories/*.md`
- `docs/superpowers/specs/2026-06-05-advanced-edition-ai-generation-design.md`
- `docs/superpowers/specs/2026-06-06-advanced-edition-mvp-requirements.md`
- `docs/superpowers/specs/2026-06-06-advanced-edition-ops-config-contract.md`
- `docs/superpowers/plans/2026-06-06-advanced-edition-requirements-to-implementation-handoff.md`
- `docs/superpowers/plans/2026-06-06-advanced-edition-doc-source-of-truth-index.md`
- Phase 12, Phase 18, Phase 19, Phase 56, and current-state checkpoint evidence/audit records.

## Allowed Files

- `docs/01-requirements/traceability/unified-standard-advanced-use-case-audit-plan.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/2026-06-14-unified-standard-advanced-use-case-audit-planning.md`
- `docs/05-execution-logs/evidence/2026-06-14-unified-standard-advanced-use-case-audit-planning.md`
- `docs/05-execution-logs/audits-reviews/2026-06-14-unified-standard-advanced-use-case-audit-planning.md`

## Blocked Files And Actions

- No `src/**`, `tests/**`, `e2e/**`, `scripts/**`, `src/db/schema/**`, `drizzle/**`, package, lockfile, `.env*`, schema, migration, provider, staging/prod/cloud/deploy, payment, external-service, PR, force-push, or implementation changes.
- No real provider call, model request, quota use, secret/env read, secret/env write, raw provider payload, raw prompt, raw response, database URL, row data, cleartext `redeem_code`, employee subjective answer text, or customer/customer-like private data.

## Implementation Steps

1. Read the required governance, architecture, standard edition, advanced edition, and historical audit records.
2. Confirm the task is not already registered in `task-queue.yaml`.
3. Create a short branch from clean `master`.
4. Create `docs/01-requirements/traceability/unified-standard-advanced-use-case-audit-plan.md`.
5. Update `project-state.yaml` with the current planning task and handoff.
6. Append the planning task to `task-queue.yaml` with docs-only allowedFiles, blockedFiles, and validation commands.
7. Create evidence and audit review files.
8. Run the declared validation commands.
9. Commit the task-scoped files locally.
10. Stop after the first planning task; do not claim the next source-freeze task without a fresh user instruction.

## Validation Plan

- `git diff --check`
- `npx.cmd prettier --check --ignore-unknown docs/01-requirements/traceability/unified-standard-advanced-use-case-audit-plan.md docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-06-14-unified-standard-advanced-use-case-audit-planning.md docs/05-execution-logs/evidence/2026-06-14-unified-standard-advanced-use-case-audit-planning.md docs/05-execution-logs/audits-reviews/2026-06-14-unified-standard-advanced-use-case-audit-planning.md`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `npm.cmd run test:unit`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId unified-standard-advanced-use-case-audit-planning`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId unified-standard-advanced-use-case-audit-planning`

## Risk Defense

- Keep this task docs-only and planning-only.
- Use capability/use case/technical matrix IDs to prevent duplicate or conflicting standard/advanced definitions.
- Mark provider/env/secret/schema/deploy/payment/external-service/e2e/Cost Calibration work as blocked by governance.
- Do not seed implementation work in this task.
- Do not read `.env.local`, `.env.*`, provider configuration, or secret files.
