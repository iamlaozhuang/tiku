# Phase 50 Automation Readiness Scorecard Task Plan

## Task

- Task id: `phase-50-automation-readiness-scorecard`
- Branch: `codex/phase-50-automation-readiness-scorecard`
- Task kind: `docs_only`
- Source: user-approved iterative automated mechanism governance loop after phase 49 Codex App readiness audit execution.

## Documents Read

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/adr-004-environment-isolation-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-005-staging-architecture-and-release-boundaries.md`
- `docs/04-agent-system/sop/automated-advancement-governance.md`
- `docs/04-agent-system/sop/module-lifecycle-governance.md`
- `docs/04-agent-system/sop/task-lifecycle-governance.md`
- `docs/04-agent-system/sop/local-first-validation-governance.md`
- `docs/04-agent-system/sop/automation-readiness-scorecard-and-mode-transition-governance.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/evidence/2026-06-07-phase-49-codex-app-readiness-audit-execution.md`
- `docs/05-execution-logs/audits-reviews/2026-06-07-phase-49-codex-app-readiness-audit-execution.md`

## Scope

Run a docs-only automation readiness scorecard using phase-49 actual Codex App readiness evidence.

Allowed files:

- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/2026-06-07-phase-50-automation-readiness-scorecard.md`
- `docs/05-execution-logs/evidence/2026-06-07-phase-50-automation-readiness-scorecard.md`
- `docs/05-execution-logs/audits-reviews/2026-06-07-phase-50-automation-readiness-scorecard.md`

Blocked scope:

- `automation.mode` change;
- mode transition implementation;
- actual automatic task claiming;
- code-stage queue seeding or implementation queue items;
- product code, API, service, repository, model, UI, tests, e2e, scripts;
- dependency, package, lockfile, CLI, SDK, schema, migration, database operation;
- Codex configuration changes, skill/plugin installation, connector installation, session history cleanup, cache deletion;
- browser page navigation, GUI launch, provider, env/secret, staging/prod/cloud/deploy, payment, external-service, Cost Calibration Gate execution.

## Scorecard Approach

Evaluate the ten dimensions from `automation-readiness-scorecard-and-mode-transition-governance.md`:

1. governance stack;
2. task queue health;
3. project state health;
4. Git closeout health;
5. validation health;
6. evidence hygiene;
7. tool readiness;
8. recovery readiness;
9. risk gate isolation;
10. approval clarity.

The scorecard may recommend a later mode transition proposal. It must not change `automation.mode`.

## Expected Classification

- `ready_for_docs_auto_proposal`: expected if docs-only automatic proposal minimum dimensions pass.
- `ready_for_local_auto_proposal`: not expected because Browser bridge readiness has an unresolved warning and code-stage queue seeding remains unapproved.

## Risk Defenses

- Keep `automation.mode` as `semi_auto`.
- Treat phase-49 Browser / `node_repl` warning as a real warning, not a pass.
- Keep Cost Calibration Gate blocked.
- Do not claim staging, prod, provider, payment, or external-service readiness from local evidence.
- Preserve required project terminology: `authorization`, `paper`, `mock_exam`, `redeem_code`, `audit_log`, and `ai_call_log`.

## Validation Commands

- `git diff --check`
- `node .\node_modules\prettier\bin\prettier.cjs --check docs\04-agent-system\state\project-state.yaml docs\04-agent-system\state\task-queue.yaml docs\05-execution-logs\task-plans\2026-06-07-phase-50-automation-readiness-scorecard.md docs\05-execution-logs\evidence\2026-06-07-phase-50-automation-readiness-scorecard.md docs\05-execution-logs\audits-reviews\2026-06-07-phase-50-automation-readiness-scorecard.md`
- Required scorecard section search.
- Added-line terminology check for conflicting prohibited terminology.

## Stop Conditions

Stop if:

- the scorecard requires a mode change;
- the scorecard requires code-stage queue seeding;
- the scorecard requires provider, env/secret, staging/prod/cloud/deploy, payment, or external-service work;
- the scorecard requires browser navigation or GUI launch;
- validation fails outside docs-only scope;
- changed files exceed `allowedFiles`;
- Git state becomes ambiguous.
