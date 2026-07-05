# 2026-07-04 Full-Chain Scenario 9 Advanced Personal Rerun After Redeem Repair Plan

## Task

- Task id: `full-chain-scenario-9-advanced-personal-rerun-after-redeem-repair-2026-07-04`
- Branch: `codex/full-chain-scenario-9-advanced-personal-rerun-after-redeem-repair-2026-07-04`
- Target DB label: `tiku_full_chain_acceptance_20260704_001`
- Learner selector label: `fc_personal_contact_user_registered`
- Upgrade card selector label: `fc_redeem_code_edition_upgrade`
- Scenario selector label: `fc_scenario_9_advanced_personal_rerun_after_redeem_repair`
- Role label: `personal_advanced_student`

## Read Gate

Read gate status: pass.

Read before runtime:

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/adr-007-edition-aware-authorization-source-of-truth.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/01-requirements/00-index.md`
- `docs/01-requirements/advanced-edition/00-index.md`
- `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`
- `docs/01-requirements/advanced-edition/modules/01-authorization-context.md`
- `docs/01-requirements/advanced-edition/modules/03-personal-ai-generation.md`
- `docs/01-requirements/advanced-edition/modules/06-ops-authorization-quota.md`
- `docs/01-requirements/traceability/2026-07-02-ai-generation-requirements-ssot-alignment.md`
- `docs/01-requirements/traceability/2026-07-02-phase4-requirements-agent-baseline-alignment.md`
- `docs/01-requirements/traceability/2026-07-02-redeem-code-edition-and-plaintext-ops-decision.md`
- `docs/01-requirements/traceability/2026-07-02-role-auth-training-ops-decision-package.md`
- `docs/05-execution-logs/acceptance/2026-07-04-full-chain-acceptance-7-track-matrix.md`
- `docs/05-execution-logs/acceptance/2026-07-04-full-chain-acceptance-dependency-dag.md`
- `docs/05-execution-logs/acceptance/2026-07-04-full-chain-acceptance-account-provisioning-order.md`
- `docs/05-execution-logs/acceptance/2026-07-04-full-chain-acceptance-db-selector-and-provisioning-approval.md`
- `docs/05-execution-logs/acceptance/2026-07-04-full-chain-acceptance-provider-cost-approval.md`
- `docs/05-execution-logs/acceptance/2026-07-04-full-chain-acceptance-runbook-and-stop-rules.md`
- Scenario 8 standard personal learning evidence and audit.
- Scenario 9 pre-provider block evidence and audit.
- Scenario 9 edition-upgrade redeem runtime repair evidence and audit.
- `src/server/repositories/redeem-code-authorization-repository.ts`
- `src/server/services/redeem-code-authorization-service.ts`
- `src/server/repositories/student-authorization-redeem-runtime-repository.ts`
- `tests/unit/phase-8-student-authorization-redeem-runtime.test.ts`

## Boundaries

- Allowed repo writes: this plan, matching evidence/audit, `project-state.yaml`, and `task-queue.yaml`.
- Private values: learner credential and upgrade card values may be read only in memory from approved private sources; none may be copied to repo evidence or chat output.
- Restart point: continue from Scenario 9 browser login and advanced personal upgrade node; do not repeat Scenario 8 standard card redemption or learning data creation.
- Product writes allowed: redeem exactly the upgrade card through product UI, create one `auth_upgrade`, and consume the upgrade card once.
- Direct DB use: selector-scoped aggregate verification only; no raw rows and no DB writes outside product runtime.
- Browser rule: wait for hydrated/interactable login inputs before filling private credentials; keep API session, browser form-state, and permission/surface boundary evidence separate.
- Provider boundary: no real Provider execution, no AI generation submit, no Provider credential/configuration, no staging/prod, and no Cost Calibration.
- Source boundary: no product source, test, dependency, schema, migration, seed, script, or fixture expansion changes in this task.

## Execution Steps

1. Run redacted private preflight for the registered learner selector, upgrade card selector, target DB, and Scenario 8 standard-auth baseline aggregates.
2. Start the local app with process-only redacted runtime configuration against `tiku_full_chain_acceptance_20260704_001`.
3. Run minimal browser login smoke before product DB mutation: hydrated/interactable login form, React-observed input state, enabled submit, and authenticated learner landing.
4. Redeem the upgrade card through `/redeem-code`; verify the UI closes successfully without exposing plaintext card values.
5. Run selector-scoped aggregate DB verification: one standard `personal_auth` remains, one active `auth_upgrade` exists, and the upgrade card is consumed once.
6. Verify advanced personal authorization context and learner `AI训练` surface are discoverable, without submitting AI generation or invoking Provider.
7. Stop task-owned runtime and verify cleanup.
8. Run focused unit tests and closeout gates.

## Stop Rules

Stop current runtime and split a repair/provisioning task if any of these occur:

- Private learner selector or upgrade card selector is absent, ambiguous, already consumed, or cannot be parsed without exposing private values.
- DB target is not `tiku_full_chain_acceptance_20260704_001`.
- Browser login fails after hydrated/interactable readiness, or the login smoke cannot prove form-state binding before product DB writes.
- Upgrade redemption creates a second `personal_auth`, fails to create `auth_upgrade`, consumes a wrong card, or cannot prove the card is consumed exactly once.
- Advanced personal learner cannot discover the expected advanced learner surface after successful upgrade.
- The flow requires Provider execution, AI submit, staging/prod, Cost Calibration, destructive DB, dependency, schema, migration, seed, source, test, or fixture expansion work.
- Evidence redaction risk appears.
- Any release readiness, final Pass, or production usability claim would be required.

## Validation Commands

- `powershell.exe -NoProfile -Command "<redacted Scenario 9 private selector, upgrade card, DB target, and baseline aggregate preflight>"`
- `powershell.exe -NoProfile -Command "<local app startup with redacted process-only runtime env>"`
- `node - <redacted browser login, upgrade redemption, advanced surface, and aggregate verification>`
- `docker compose exec -T tiku-postgres psql <redacted selector-scoped aggregate verification>`
- `npm.cmd run test:unit -- --run tests/unit/phase-8-student-authorization-redeem-runtime.test.ts src/server/services/redeem-code-authorization-service.test.ts`
- `npm.cmd exec -- prettier --write --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-07-04-full-chain-scenario-9-advanced-personal-rerun-after-redeem-repair.md docs/05-execution-logs/evidence/2026-07-04-full-chain-scenario-9-advanced-personal-rerun-after-redeem-repair.md docs/05-execution-logs/audits-reviews/2026-07-04-full-chain-scenario-9-advanced-personal-rerun-after-redeem-repair.md`
- `npm.cmd exec -- prettier --check --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-07-04-full-chain-scenario-9-advanced-personal-rerun-after-redeem-repair.md docs/05-execution-logs/evidence/2026-07-04-full-chain-scenario-9-advanced-personal-rerun-after-redeem-repair.md docs/05-execution-logs/audits-reviews/2026-07-04-full-chain-scenario-9-advanced-personal-rerun-after-redeem-repair.md`
- `git diff --check`
- `git diff --name-only -- package.json package-lock.yaml package-lock.json pnpm-lock.yaml pnpm-workspace.yaml src tests e2e src/db/schema drizzle migrations seed scripts compose.yaml playwright-report test-results .next .runtime .env*`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId full-chain-scenario-9-advanced-personal-rerun-after-redeem-repair-2026-07-04`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId full-chain-scenario-9-advanced-personal-rerun-after-redeem-repair-2026-07-04`
