# Full-role UI/UX batch 0 global foundation task plan

Date: 2026-07-07

## Objective

Create the batch 0 global UI/UX remediation baseline for all roles before page-family-specific batches begin.

This batch defines shared design rules for menu naming, information architecture, layout density, UI copy, prompt wording, button state hierarchy, and role-aware state templates. It is docs/state only.

## Read gate

Read or refreshed before writing:

- `AGENTS.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/03-standards/ui-code.md`
- `docs/02-architecture/adr/*.md`
- `docs/01-requirements/00-index.md`
- `docs/01-requirements/advanced-edition/00-index.md`
- `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`
- `docs/01-requirements/traceability/2026-07-02-ui-ux-requirement-design-baseline-gap-analysis.md`
- `docs/01-requirements/traceability/2026-07-02-role-auth-training-ops-decision-package.md`
- `docs/01-requirements/traceability/2026-07-07-full-role-ui-remediation-baseline.md`
- `docs/01-requirements/traceability/2026-07-07-full-role-uiux-remediation-series-plan.md`
- Product Design audit instructions and critical overrides
- `src/components/AdminDashboardLayout/AdminDashboardLayout.tsx`
- `src/components/StudentAppLayout/StudentAppLayout.tsx`
- `src/app/globals.css`
- `docs/02-architecture/system-design/frontend/*`
- Repository-external 2026-07-07 screenshot manifest and 9 contact sheets

## Planned output

- Add batch 0 global foundation traceability baseline.
- Add redacted evidence.
- Add adversarial audit review.
- Update project state to closed batch 0.
- Update task queue batch 0 to closed and leave batch 1 pending.

## Guardrails

- No code implementation.
- No screenshot files in repository.
- No new account, new content, DB write, Provider call, dependency, package, lockfile, env, schema, migration, seed, staging/prod/deploy, release readiness, production usability, or Cost Calibration work.
- Plaintext `redeem_code` display remains an intentional eligible operations UI requirement and is not treated as a bug.
- Confirmed current-code defects, if any, are recorded as future separate fix-branch candidates only.

## Validation plan

- `git diff --check`
- Scoped Prettier check for changed docs/state files
- Strict redaction scan for new batch 0 docs
- Module Run v2 pre-commit hardening for this task id
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- Module Run v2 pre-push readiness after fast-forward merge
