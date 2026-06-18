# module-run-v2-low-risk-experience-batch-mechanism-tuning Plan

## Scope

Implement the user-approved low-risk experience batch mechanism tuning plan. This is a mechanism-only task that reduces repeated governance overhead for local low-risk experience ready-set work while preserving hard blocked gates.

## Approval Boundary

- User explicitly requested implementation of this plan in the current 2026-06-18 prompt.
- Allowed: execution profile catalog, SOP/operating manual, task queue template metadata, durable approval metadata, Module Run v2 readiness/closeout wrapper changes, smoke tests, project state, task queue, plan, evidence, and audit.
- Blocked: product source changes, `.env*`, schema/drizzle/migration, package/lockfile/dependency, provider/model, release, staging/prod, payment, external-service, PR, force-push, dev server, Browser/Playwright runtime, full e2e runtime, and Cost Calibration Gate.

## Standards Read

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/adr-001-tech-stack-selection.md`
- `docs/02-architecture/adr/adr-002-runtime-architecture-and-multi-client-contract.md`
- `docs/02-architecture/adr/adr-003-workplace-desktop-web-compatibility.md`
- `docs/02-architecture/adr/adr-004-environment-isolation-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-005-staging-architecture-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-006-runtime-dependency-alignment.md`
- `superpowers:executing-plans`
- `superpowers:using-git-worktrees`

## Implementation Plan

1. Add `local_low_risk_experience_batch` to the execution profile catalog and work packet limits.
2. Add durable `standingLocalLowRiskExperienceAdvancementApproval` metadata to `project-state.yaml` and `autodrive-control-schema.yaml`.
3. Document the parent/child queue template, validation de-duplication, and test-only fixture repair rules in the SOP and operating manual.
4. Add a reusable low-risk experience batch readiness helper for allowed-files union, blocked-files enforcement, evidence/audit anchors, validation de-duplication, and test-only fixture repair RED/GREEN checks.
5. Wire the helper into pre-commit, module-closeout, pre-push, approved-closeout, and queue-drain eligibility paths.
6. Add smoke coverage for accepted docs/state/test-fixture batches, blocked production/env/package/schema/e2e artifact changes, missing RED/GREEN fixture evidence, e2e-list de-duplication, and durable approval plus structured closeout.
7. Run mechanism smoke tests, local readiness diagnostics, scoped Prettier, diff check, lint, typecheck, and Module Run v2 readiness gates.

## Risk Controls

- Keep batch scope narrower than full implementation automation.
- Require explicit task-declared test files for fixture repair and reject non-test source edits in batch mode.
- Require parent evidence and child evidence/audit paths to exist.
- Require RED/GREEN anchors when fixture repair is declared.
- Keep post-merge evidence-only commits not required by default.
- Do not expand release, provider, schema, dependency, env, PR, force-push, or Cost Calibration permissions.
