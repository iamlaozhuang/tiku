# Content Admin Review Adoption Local PostgreSQL Test-Owned Target Setup Approval Package Plan

Task id:
`content-admin-review-adoption-local-postgres-test-owned-target-setup-approval-package-2026-06-27`

Branch: `codex/content-admin-test-target-approval-20260627`

Task kind: `docs_state_approval_package`

## Purpose

Prepare a docs/state-only approval package for the next Layer 2 local PostgreSQL target setup or selection step after the
previous route smoke reached the PostgreSQL-backed runtime path but found no single test-owned target.

This task does not connect to a database, read `.env*`, create data, select a real target, run browser/dev-server/e2e,
call Providers, run Cost Calibration, mutate runtime state, publish content, or claim release readiness/final Pass.

## SSOT Read List

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/01-requirements/00-index.md`
- `docs/01-requirements/advanced-edition/00-index.md`
- `docs/01-requirements/advanced-edition/stories/epic-05-formal-content-separation.md`
- `docs/01-requirements/traceability/2026-06-21-content-admin-ai-generation-scope-decision.md`
- `docs/01-requirements/traceability/2026-06-23-advanced-ai-generation-scope-clarification.md`
- `docs/02-architecture/adr/adr-001-tech-stack-selection.md`
- `docs/02-architecture/adr/adr-002-runtime-architecture-and-multi-client-contract.md`
- `docs/02-architecture/adr/adr-003-workplace-desktop-web-compatibility.md`
- `docs/02-architecture/adr/adr-004-environment-isolation-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-005-staging-architecture-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-006-runtime-dependency-alignment.md`
- `docs/02-architecture/adr/adr-007-edition-aware-authorization-source-of-truth.md`
- `docs/04-agent-system/sop/task-lifecycle-governance.md`
- `docs/04-agent-system/sop/module-lifecycle-governance.md`
- `docs/04-agent-system/sop/standing-autonomy-policy-governance.md`
- `docs/04-agent-system/sop/requirement-ssot-reading-governance.md`
- `docs/04-agent-system/sop/fresh-local-dev-db-validation-playbook.md`
- `docs/04-agent-system/sop/docs-only-fast-lane-governance.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`

## Requirement Decision Map

- Content-admin AI output must remain isolated until governed review/adoption.
- Formal adoption into `question` or `paper` requires human review, validation, source/reviewer attribution, and
  `audit_log`.
- A `rejected` review decision is the lower-risk first PostgreSQL-backed proof path because it should not create formal
  draft metadata.
- Live Provider, env/secret value access, schema/migration/seed, staging/prod, payment, external-service, and Cost
  Calibration gates remain blocked unless a future task receives fresh approval.
- Execution logs are evidence only. They do not expand implementation scope.

## Requirement Mapping

This task maps to the formal content separation requirement by defining how a future local target can be safely created
or selected before a single `rejected` review command is retried.

The package must preserve:

- one test-owned `content_admin` generated-result review target only;
- local `dev` target classification only;
- raw generated content and private content excluded from evidence;
- no direct formal `question`, `paper`, publish, `mock_exam`, or student-visible content write;
- no broad target search, raw row dump, seed, migration, raw SQL, or destructive database action.

## Evidence-Only Sources

- `docs/05-execution-logs/evidence/2026-06-27-content-admin-review-adoption-local-postgres-route-smoke-approval-package.md`
- `docs/05-execution-logs/acceptance/2026-06-27-content-admin-review-adoption-local-postgres-route-smoke-approval-package.md`
- `docs/05-execution-logs/evidence/2026-06-27-content-admin-review-adoption-local-postgres-route-smoke-execution.md`
- `docs/05-execution-logs/acceptance/2026-06-27-content-admin-review-adoption-local-postgres-route-smoke-execution.md`

## Conflict Check

No conflict was found between requirement SSOT and the latest smoke evidence. The SSOT requires isolated review and
governed adoption. The latest smoke evidence shows the PostgreSQL-backed route path was reached once but could not prove
mutation/readback because the single test-owned target was absent.

The next useful step therefore requires a target setup or selection approval package before any DB-backed mutation retry.

## Allowed Scope

- Update `docs/04-agent-system/state/project-state.yaml`.
- Update `docs/04-agent-system/state/task-queue.yaml`.
- Add this task plan.
- Add redacted evidence, audit review, and acceptance documents under `docs/05-execution-logs/**`.

## Blocked Scope

- `src/**`, `tests/**`, `e2e/**`, `.env*`, `package.json`, lockfiles, schema, drizzle, migration, seed, and scripts.
- Browser, dev server, e2e, DB connection/read/write, credential read, Provider call/configuration, Cost Calibration,
  real mutation, formal publish, student-visible runtime, staging/prod/deploy/payment/external service, OCR/export, PR,
  force push, release readiness, and final Pass.

## Documentation Approach

1. Record the target setup/selection boundary for exactly one local dev test-owned generated-result review target.
2. Define future execution options:
   - create/select a synthetic test-owned target through an approved app-level path;
   - select an owner-supplied known test-owned target by a targeted lookup only.
3. Define single mutation cap, rollback/recovery options, and evidence redaction rules.
4. Update state/queue so the next executable work is blocked pending fresh execution approval.
5. Keep Layer 1 complete, Layer 2 blocked pending target setup/selection execution, and Layer 3 blocked.

## Validation Commands

- `npx.cmd prettier --write --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-06-27-content-admin-review-adoption-local-postgres-test-owned-target-setup-approval-package.md docs/05-execution-logs/evidence/2026-06-27-content-admin-review-adoption-local-postgres-test-owned-target-setup-approval-package.md docs/05-execution-logs/audits-reviews/2026-06-27-content-admin-review-adoption-local-postgres-test-owned-target-setup-approval-package.md docs/05-execution-logs/acceptance/2026-06-27-content-admin-review-adoption-local-postgres-test-owned-target-setup-approval-package.md`
- `npx.cmd prettier --check --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-06-27-content-admin-review-adoption-local-postgres-test-owned-target-setup-approval-package.md docs/05-execution-logs/evidence/2026-06-27-content-admin-review-adoption-local-postgres-test-owned-target-setup-approval-package.md docs/05-execution-logs/audits-reviews/2026-06-27-content-admin-review-adoption-local-postgres-test-owned-target-setup-approval-package.md docs/05-execution-logs/acceptance/2026-06-27-content-admin-review-adoption-local-postgres-test-owned-target-setup-approval-package.md`
- `git diff --check`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Get-TikuProjectStatus.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId content-admin-review-adoption-local-postgres-test-owned-target-setup-approval-package-2026-06-27`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId content-admin-review-adoption-local-postgres-test-owned-target-setup-approval-package-2026-06-27`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId content-admin-review-adoption-local-postgres-test-owned-target-setup-approval-package-2026-06-27 -SkipRemoteAheadCheck`

## Evidence And Audit Requirements

- Evidence must include changed files, requirement mapping, target setup/selection boundary, validation transcript,
  non-claims, and next approval text.
- Audit review must verify no blocked action was executed, redaction rules are adequate, and the next task remains
  blocked pending fresh approval.

## Stop Conditions

- Any need to open or inspect `.env*`.
- Any need to connect to or query a database.
- Any need to identify real target values from runtime data.
- Any need to modify source/tests/schema/migration/package/lockfile/scripts.
- Any validation failure that cannot be repaired inside docs/state-only scope.
