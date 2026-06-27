# Layer 3 Provider Cost Pre-Release Approval Matrix Refresh After Layer 2 Local PostgreSQL Minimum Plan

Task id:
`layer-3-provider-cost-pre-release-approval-matrix-refresh-after-layer-2-local-postgres-minimum-2026-06-27`

Branch: `codex/layer-3-provider-cost-matrix-20260627`

## Objective

Refresh the Layer 3 Provider, Cost Calibration, staging/prod, deploy, payment, OCR, export, and external-service
approval matrix after the Layer 2 local PostgreSQL test-owned `rejected` route/runtime smoke has been rolled up.

This task is docs/state-only. It prepares blocked-gate sequencing and future copyable approval text. It does not execute
any Provider, DB, browser, Cost Calibration, mutation, publish, deployment, payment, OCR, export, external-service,
release readiness, or final Pass action.

## Fresh Approval Boundary

Approved files:

- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/**`
- `docs/05-execution-logs/evidence/**`
- `docs/05-execution-logs/audits-reviews/**`
- `docs/05-execution-logs/acceptance/**`

Explicitly not approved:

- browser/dev-server/e2e
- DB connection/read/write/seed/migration/rollback/destructive operation
- `.env*`, credential, secret, token, DB URL, or Provider credential read
- Provider call, retry, payload inspection, or Provider configuration
- Cost Calibration execution
- real retry/adoption mutation
- formal publish or student-visible runtime
- staging/prod/deploy/payment/external-service action
- OCR/export execution
- archive/index movement
- PR, force push, release readiness, production readiness, or final Pass

## Required Reading

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/04-agent-system/sop/task-lifecycle-governance.md`
- `docs/04-agent-system/sop/module-lifecycle-governance.md`
- `docs/04-agent-system/sop/docs-only-fast-lane-governance.md`
- `docs/04-agent-system/sop/requirement-ssot-reading-governance.md`
- `docs/04-agent-system/sop/task-queue-archival-and-index-governance.md`
- `docs/04-agent-system/sop/advanced-edition-cost-calibration-blocked-gate.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/acceptance/2026-06-23-provider-cost-staging-decision-package.md`
- `docs/05-execution-logs/acceptance/2026-06-27-three-layer-acceptance-minimal-closure-high-risk-approval-matrix.md`
- `docs/05-execution-logs/acceptance/2026-06-27-high-risk-approval-package-consolidation-retirement.md`
- `docs/05-execution-logs/acceptance/2026-06-27-layer-2-business-closure-evidence-rollup-refresh-after-postgres-test-owned-target-smoke.md`
- `docs/05-execution-logs/evidence/2026-06-27-layer-2-business-closure-evidence-rollup-refresh-after-postgres-test-owned-target-smoke.md`

## Evidence Basis

Layer 2 now has a minimum local PostgreSQL-backed `rejected` review-command slice rolled up:

- source/test adopt/reject command contract exists;
- route-handler smoke exists through injected local repository;
- one synthetic test-owned PostgreSQL target setup plus one `rejected` route/service command and one redacted readback
  passed;
- no formal draft was created by the rejected path;
- optional `approved` formal-draft proof, credentialed browser observation, formal publish, and student-visible runtime
  remain separate owner decisions.

Layer 3 remains blocked because Provider, Provider configuration/credential handling, Cost Calibration, staging/prod,
deploy, payment, OCR, export, and external services all require their own fresh approval packages and redacted evidence
rules.

## Implementation Steps

1. Register this task in `task-queue.yaml` with exact allowed files and blocked capabilities.
2. Update `project-state.yaml` current task to this Layer 3 matrix refresh while preserving the previous Layer 2 rollup
   as history.
3. Write evidence, audit, and acceptance documents.
4. In acceptance, map each Layer 3 gate to required fresh approval fields, serial order, and blocked status.
5. Include copyable future approval text without executing high-risk work.
6. Run scoped Prettier, `git diff --check`, project status diagnostic, and Module Run v2 gates.
7. Commit locally, then use the approved ff-only merge/push/branch-cleanup closeout path only after gates pass.

## Stop Conditions

Stop before any action outside docs/state scope, including reading `.env*`, connecting to DB, opening browser or
dev-server, invoking Provider, measuring cost, changing Provider configuration, publishing content, touching
staging/prod/deploy/payment/OCR/export/external service, moving archive/index files, opening a PR, force pushing, or
claiming release readiness/final Pass.
