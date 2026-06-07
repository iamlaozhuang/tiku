# Phase 57 Docs Slimming Readonly Inventory Task Plan

## Task Boundary

Run a docs-only, read-only inventory for existing project documents before any document slimming, archiving, moving, deleting, or source-of-truth rewriting task.

This task may write only the phase-57 task plan, evidence, audit review, and mechanism state/queue sync. It does not move, delete, archive, rename, or rewrite existing source documents. It does not approve product code, code-stage queue seeding, schema, migration, API, service, UI, tests, e2e, scripts, dependency, package, lockfile, provider, env/secret, staging/prod/cloud/deploy, payment, external-service, or Cost Calibration Gate work.

## Required Reading

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/04-agent-system/sop/task-queue-archival-and-index-governance.md`
- `docs/04-agent-system/sop/requirement-task-coverage-and-gap-audit-governance.md`
- `docs/04-agent-system/sop/thread-rollover-and-handoff-governance.md`
- `docs/superpowers/plans/2026-06-06-advanced-edition-doc-source-of-truth-index.md`
- `docs/05-execution-logs/evidence/2026-06-07-phase-56-advanced-edition-coverage-audit.md`

## Inventory Method

1. Count current files under `docs/`.
2. Identify high-volume directories.
3. Identify oversized documents and likely recovery bottlenecks.
4. Separate source-of-truth documents from execution logs and historical artifacts.
5. Identify archive candidates, slimming candidates, index candidates, and documents that must not be modified without a separate approved task.
6. Record the next recommended docs-only execution tasks without performing them.

## Expected Outputs

- Evidence: `docs/05-execution-logs/evidence/2026-06-07-phase-57-docs-slimming-readonly-inventory.md`
- Audit review: `docs/05-execution-logs/audits-reviews/2026-06-07-phase-57-docs-slimming-readonly-inventory.md`
- State sync: `docs/04-agent-system/state/project-state.yaml`
- Queue sync: `docs/04-agent-system/state/task-queue.yaml`

## Validation Plan

- `git diff --check`
- `node .\node_modules\prettier\bin\prettier.cjs --check docs\04-agent-system\state\project-state.yaml docs\04-agent-system\state\task-queue.yaml docs\05-execution-logs\task-plans\2026-06-07-phase-57-docs-slimming-readonly-inventory.md docs\05-execution-logs\audits-reviews\2026-06-07-phase-57-docs-slimming-readonly-inventory.md docs\05-execution-logs\evidence\2026-06-07-phase-57-docs-slimming-readonly-inventory.md`
- `Select-String` for required inventory headings and project terms.
- Added-line scan for blocked non-project terms.
- Verify `automation.mode` remains `semi_auto`.
- Git inventory check against allowed files.

## Risk Controls

- Do not modify any source-of-truth requirement, architecture, standard, SOP, or implementation planning document in this task.
- Do not archive or move completed task entries in this task.
- Do not treat this inventory as approval to slim documents.
- Keep Cost Calibration Gate blocked.
- Keep provider, env/secret, staging/prod/cloud/deploy, payment, external-service, dependency, package, lockfile, schema, migration, script, and product implementation work out of scope.
