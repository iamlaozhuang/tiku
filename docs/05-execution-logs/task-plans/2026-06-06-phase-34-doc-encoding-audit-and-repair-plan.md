# Phase 34 Doc Encoding Audit And Repair Plan

## Scope

- Task id: `phase-34-doc-encoding-audit-and-repair-plan`
- Task kind: docs-only governance audit
- Branch: `codex/phase-34-doc-encoding-governance-batch`
- Human approval: user approved serial batch execution for four doc encoding governance tasks in one run.

## Read Context

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/adr-001-tech-stack-selection.md`
- `docs/02-architecture/adr/adr-002-runtime-architecture-and-multi-client-contract.md`
- `docs/02-architecture/adr/adr-003-workplace-desktop-web-compatibility.md`
- `docs/02-architecture/adr/adr-004-environment-isolation-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-005-staging-architecture-and-release-boundaries.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`

## Allowed Files

- `docs/05-execution-logs/task-plans/2026-06-06-phase-34-doc-encoding-audit-and-repair-plan.md`
- `docs/05-execution-logs/audits-reviews/2026-06-06-phase-34-doc-encoding-audit-and-repair-plan-review.md`
- `docs/05-execution-logs/evidence/2026-06-06-phase-34-doc-encoding-audit-and-repair-plan.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`

## Blocked Files And Actions

- No product code, schema, migration, API, service, UI, tests, e2e, scripts, dependency, package, lockfile, env/secret, provider, staging/prod/cloud/deploy, payment, or external-service changes.
- No Cost Calibration Gate execution.
- No code-stage queue seeding.
- No rewrite of requirement meaning.

## Method

1. Scan `docs/` text documents for strict UTF-8 validity, UTF-8 BOM, mixed line endings, replacement characters, and high-confidence mojibake markers.
2. Run a second pass for broader mojibake candidates, then attempt reversible conversion only as a dry-run.
3. Expand the high-confidence scan to repository documentation-like files to identify whether candidates exist outside `docs/`.
4. Record repair classification:
   - safe repair: deterministic and semantics-preserving;
   - risky repair: content meaning or source encoding cannot be confirmed;
   - out of scope: not a project documentation source.

## Validation Commands

- `git diff --check`
- `node .\node_modules\prettier\bin\prettier.cjs --check <changed-doc-files>`
- strict UTF-8 / BOM / mixed line ending scan for `docs/`
- high-confidence mojibake scan for `docs/`
- repository documentation-like high-confidence scan excluding `.git`, `node_modules`, `.next`, and `.worktrees`
