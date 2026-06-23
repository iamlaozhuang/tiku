# Acceptance Runtime Blocker Evidence Batch Seed Plan

## Task

- taskId: `acceptance-runtime-blocker-evidence-batch-seed-2026-06-23`
- branch: `codex/runtime-blocker-evidence-batch-20260623`
- taskKind: `docs_state_governance_seed`
- phase: `standard-advanced-mvp-runtime-blocker-evidence-batch-2026-06-23`
- user request: open a runtime and blocked-gate evidence batch, prioritize L5 role flow, browser runtime acceptance,
  L6 owner preview, then decide whether to approve Provider, Cost Calibration, and staging.

## References Read

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/*.md`
- `docs/04-agent-system/sop/task-lifecycle-governance.md`
- `docs/04-agent-system/sop/local-first-validation-governance.md`
- `docs/04-agent-system/sop/local-human-verification.md`
- `docs/04-agent-system/sop/advanced-edition-evidence-redaction-template.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/acceptance/2026-06-22-standard-advanced-mvp-acceptance-execution-plan.md`
- `docs/05-execution-logs/evidence/2026-06-22-acceptance-final-decision-review.md`

## Scope

Create a docs/state-only seed for the next acceptance batch. This task may register the batch, define serial task order,
record approval boundaries, and set the next executable planning task.

## Planned Files

- Create:
  - `docs/05-execution-logs/task-plans/2026-06-23-acceptance-runtime-blocker-evidence-batch-seed.md`
  - `docs/05-execution-logs/acceptance/2026-06-23-runtime-blocker-evidence-batch-plan.md`
  - `docs/05-execution-logs/evidence/2026-06-23-acceptance-runtime-blocker-evidence-batch-seed.md`
  - `docs/05-execution-logs/audits-reviews/2026-06-23-acceptance-runtime-blocker-evidence-batch-seed.md`
- Modify:
  - `docs/04-agent-system/state/project-state.yaml`
  - `docs/04-agent-system/state/task-queue.yaml`

## Boundaries

Allowed:

- Docs/state batch registration.
- Redacted task plan, evidence, and audit review.
- Local formatting and governance validation.
- Local commit after validation.

Blocked unless separately approved in a later task:

- Starting a dev server.
- Browser, Playwright, or e2e runtime execution.
- L5 role walkthrough execution.
- L6 owner preview execution.
- Provider/model calls or Provider configuration.
- `.env*`, secret, token, database URL, Auth header, or credential access.
- Schema, migration, seed, database mutation, or production/staging data access.
- Dependency, package, or lockfile changes.
- Staging/prod/cloud deploy, payment, external-service work, PR, force push, and Cost Calibration Gate execution.

## Approach

1. Create a new acceptance batch plan that explains the serial order and stop conditions.
2. Register one closed seed task plus pending or blocked successor tasks in `task-queue.yaml`.
3. Update `project-state.yaml` to point the project at the new batch and the first executable planning task.
4. Record evidence and audit review for the seed.
5. Validate changed docs/state files with scoped Prettier, `git diff --check`, and Module Run v2 hardening.

## Validation Commands

```powershell
npx.cmd prettier --write --ignore-unknown docs/05-execution-logs/task-plans/2026-06-23-acceptance-runtime-blocker-evidence-batch-seed.md docs/05-execution-logs/acceptance/2026-06-23-runtime-blocker-evidence-batch-plan.md docs/05-execution-logs/evidence/2026-06-23-acceptance-runtime-blocker-evidence-batch-seed.md docs/05-execution-logs/audits-reviews/2026-06-23-acceptance-runtime-blocker-evidence-batch-seed.md docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml
npx.cmd prettier --check --ignore-unknown docs/05-execution-logs/task-plans/2026-06-23-acceptance-runtime-blocker-evidence-batch-seed.md docs/05-execution-logs/acceptance/2026-06-23-runtime-blocker-evidence-batch-plan.md docs/05-execution-logs/evidence/2026-06-23-acceptance-runtime-blocker-evidence-batch-seed.md docs/05-execution-logs/audits-reviews/2026-06-23-acceptance-runtime-blocker-evidence-batch-seed.md docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml
git diff --check
powershell -ExecutionPolicy Bypass -File scripts/agent-system/Test-ModuleRunV2PreCommitHardening.ps1 -TaskId acceptance-runtime-blocker-evidence-batch-seed-2026-06-23
```

## Stop Conditions

- Any requested runtime/browser/dev-server action lacks a separate approval packet.
- Evidence would need secrets, credentials, provider payloads, raw prompts, raw answers, raw generated content, full
  paper content, or production/staging data.
- Queue/state validation identifies this batch as conflicting with an existing executable task.
- Cost Calibration Gate would be treated as passed without fresh approval and evidence.
