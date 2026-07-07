# 2026-07-07 Full Role UIUX Acceptance Confirmation Package Plan

Task id: `full-role-uiux-acceptance-confirmation-package-2026-07-07`

Branch: `codex/full-role-uiux-acceptance-confirmation-package-2026-07-07`

## Goal

Create a redacted acceptance confirmation package for the completed full-role UIUX source remediation series.

This task confirms source-level closure, matrix coverage, evidence/audit availability, validation gates, and a manual
browser acceptance checklist. It does not modify product source, tests, DB, Provider, env, dependency, package/lockfile,
schema/migration/seed, fixtures, screenshots, raw DOM, staging/prod/deploy, Cost Calibration, or production release
configuration.

## SSOT Read List

- `AGENTS.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/03-standards/ui-code.md`
- `docs/02-architecture/adr/adr-001-tech-stack-selection.md`
- `docs/02-architecture/adr/adr-002-runtime-architecture-and-multi-client-contract.md`
- `docs/02-architecture/adr/adr-003-workplace-desktop-web-compatibility.md`
- `docs/02-architecture/adr/adr-004-environment-isolation-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-005-staging-architecture-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-006-runtime-dependency-alignment.md`
- `docs/02-architecture/adr/adr-007-edition-aware-authorization-source-of-truth.md`
- `docs/01-requirements/00-index.md`
- `docs/01-requirements/advanced-edition/00-index.md`
- `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`
- `docs/01-requirements/traceability/2026-07-07-full-role-uiux-source-implementation-entry.md`
- `docs/05-execution-logs/task-plans/2026-07-07-full-role-uiux-source-remediation-control-matrix.md`
- Branch 2-8 task plans, evidence, and adversarial audits.

## Scope

Allowed files:

- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/2026-07-07-full-role-uiux-acceptance-confirmation-package.md`
- `docs/05-execution-logs/evidence/2026-07-07-full-role-uiux-acceptance-confirmation-package.md`
- `docs/05-execution-logs/audits-reviews/2026-07-07-full-role-uiux-acceptance-confirmation-package-adversarial-audit.md`

Forbidden:

- Product source, tests, DB, account/fixture material, Provider, env, dependency, package/lockfile, schema/migration/seed,
  screenshots, raw DOM, browser storage, staging/prod/deploy, PR, force push, Cost Calibration, final Pass, production
  usability, or release readiness claims.

## Validation Plan

1. Confirm `master` and `origin/master` were aligned before branch creation.
2. Confirm branch 2-8 evidence/audit files exist and are closed/pass.
3. Confirm project state and task queue show branches 2-8 closed.
4. Run focused role matrix unit set from branch 8.
5. Run `npm.cmd run lint`.
6. Run `npm.cmd run typecheck`.
7. Run `npm.cmd run test:unit`.
8. Run scoped Prettier check, `git diff --check`, Module Run v2 precommit and prepush readiness.

## Acceptance Package Contents

- Source closure summary for branches 2-8.
- Role/page acceptance checklist for 8 business roles plus `super_admin`.
- Standard/advanced, permission, empty/error/disabled/missing-context, AI closed-loop, and redaction boundary checklist.
- Explicit non-claims for browser runtime, screenshots, raw DOM, staging/prod, Provider, Cost Calibration, release
  readiness, and production usability.

Cost Calibration Gate remains blocked.
