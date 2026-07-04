# Full Chain Goal Control Ledger Plan

Task id: `full-chain-goal-control-ledger-2026-07-04`

Branch: `codex/full-chain-goal-control-ledger-2026-07-04`

Status: completed.

## Scope

Create the docs-only kickoff and control packet for the full-role, full-chain experiential acceptance goal. This task
does not start a dev server, run browser/e2e, read or mutate DB data, call Provider, read `.env*`, read private
credential values, or change source, tests, dependencies, schema, migration, seed, scripts, or runtime configuration.

Allowed work:

- Create `docs/05-execution-logs/acceptance/2026-07-04-full-chain-goal-control-and-coverage-ledger.md`.
- Create redacted evidence and adversarial audit for this docs-only task.
- Update `project-state.yaml` and `task-queue.yaml` with exact boundaries and closeout policy.
- Run scoped formatting and governance validation.
- Commit, fast-forward merge to `master`, push `origin/master`, and delete this short branch under the current user
  approval for Step 0 closeout.

Blocked work:

- No product source, test, script, dependency, package, lockfile, schema, migration, seed, or `.env*` change.
- No DB connection, DB read, DB write, cleanup, reset, migration, seed, raw rows, or `drizzle-kit push`.
- No browser, Playwright, dev server, Provider call, raw Prompt, raw AI I/O, staging, production, cloud, deploy, payment,
  or Cost Calibration execution.
- No private credential value, phone, email, plaintext `redeem_code`, connection string, token, cookie, session,
  Authorization header, raw DOM, screenshot, trace, full question, full paper, full material, full chunk, or employee
  subjective answer in repository evidence.
- No release readiness, final Pass, production usability, Provider readiness, DB readiness, staging readiness, or
  production readiness claim.

## SSOT Read List

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/01-requirements/00-index.md`
- `docs/01-requirements/advanced-edition/00-index.md`
- `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`
- `docs/02-architecture/adr/adr-007-edition-aware-authorization-source-of-truth.md`
- `docs/01-requirements/traceability/2026-07-02-role-auth-training-ops-decision-package.md`
- `docs/01-requirements/traceability/2026-07-02-current-thread-requirement-reconciliation-ledger.md`
- `docs/01-requirements/traceability/2026-07-02-redeem-code-edition-and-plaintext-ops-decision.md`
- `docs/01-requirements/traceability/2026-07-02-ai-generation-requirements-ssot-alignment.md`
- `docs/01-requirements/traceability/2026-07-02-phase4-requirements-agent-baseline-alignment.md`
- `docs/05-execution-logs/acceptance/2026-07-04-full-chain-acceptance-7-track-matrix.md`
- `docs/05-execution-logs/acceptance/2026-07-04-full-chain-acceptance-dependency-dag.md`
- `docs/05-execution-logs/acceptance/2026-07-04-full-chain-acceptance-account-provisioning-order.md`
- `docs/05-execution-logs/acceptance/2026-07-04-full-chain-acceptance-db-selector-and-provisioning-approval.md`
- `docs/05-execution-logs/acceptance/2026-07-04-full-chain-acceptance-materials-reuse-and-gap-inventory.md`
- `docs/05-execution-logs/acceptance/2026-07-04-full-chain-acceptance-materials-pack-spec.md`
- `docs/05-execution-logs/acceptance/2026-07-04-full-chain-acceptance-provider-cost-approval.md`
- `docs/05-execution-logs/acceptance/2026-07-04-full-chain-acceptance-runbook-and-stop-rules.md`
- `docs/05-execution-logs/evidence/2026-07-04-full-chain-acceptance-planning-and-materials-prep.md`
- `docs/05-execution-logs/audits-reviews/2026-07-04-full-chain-acceptance-planning-and-materials-prep.md`
- `docs/05-execution-logs/evidence/2026-07-04-full-chain-isolated-db-bootstrap-seed-execution.md`
- `docs/05-execution-logs/audits-reviews/2026-07-04-full-chain-isolated-db-bootstrap-seed-execution.md`
- `docs/05-execution-logs/evidence/2026-07-04-stage-c-1-provider-smoke-rerun.md`
- `docs/05-execution-logs/audits-reviews/2026-07-04-stage-c-1-provider-smoke-rerun.md`
- `docs/05-execution-logs/acceptance/2026-07-04-stage-c-1-provider-smoke-rerun.md`
- `scripts/agent-system/Test-ModuleRunV2PreCommitHardening.ps1`

## Requirement Mapping Result

| Requirement area                    | Current source anchor                                     | Step 0 output                                                                                     |
| ----------------------------------- | --------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| 7 tracks and 12 owner scenarios     | 2026-07-04 7-track matrix                                 | Covered by global control and coverage ledger.                                                    |
| Serial dependency order             | 2026-07-04 dependency DAG and runbook                     | Covered by DAG restart and prerequisite rules.                                                    |
| DB bootstrap baseline               | Isolated DB bootstrap evidence/audit                      | Recorded as current baseline, without new DB action.                                              |
| Edition-aware authorization         | ADR-007 and edition-aware requirements                    | Later task read gates and stop rules require source authorization and derived `effectiveEdition`. |
| `redeem_code` behavior              | 2026-07-02 plaintext and edition decision                 | Later card tasks must keep product UI exception and evidence redaction separate.                  |
| AI generation and Provider boundary | 2026-07-02 AI baseline and 2026-07-04 Provider docs       | Local acceptance keeps AI execution blocked until fresh Provider/Cost approval.                   |
| Evidence redaction                  | AGENTS, runbook, Provider smoke audit                     | Repository evidence remains selector/count/status only.                                           |
| Git closeout                        | Current user Step 0 instruction and queue closeout policy | This task may commit, ff-merge, push, and delete branch after validation.                         |

## Implementation Plan

1. Record goal objective, 7 tracks, 12 scenarios, and support/negative/boundary coverage.
2. Record dependency DAG and serial restart points.
3. Record current isolated DB target and bootstrap seed baseline.
4. Define later small-task boundaries: inputs, outputs, evidence, read gates, and stop rules.
5. Record Git closeout and fail/block split policy.
6. Record Provider/staging/Cost fresh-approval boundary and non-claims.
7. Prepare Scenario 1 fresh approval wording.
8. Write redacted evidence and adversarial audit.
9. Run scoped validation and perform approved local closeout.

## Validation Commands

```powershell
npm.cmd exec -- prettier --write --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-07-04-full-chain-goal-control-ledger.md docs/05-execution-logs/acceptance/2026-07-04-full-chain-goal-control-and-coverage-ledger.md docs/05-execution-logs/evidence/2026-07-04-full-chain-goal-control-ledger.md docs/05-execution-logs/audits-reviews/2026-07-04-full-chain-goal-control-ledger.md
npm.cmd exec -- prettier --check --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-07-04-full-chain-goal-control-ledger.md docs/05-execution-logs/acceptance/2026-07-04-full-chain-goal-control-and-coverage-ledger.md docs/05-execution-logs/evidence/2026-07-04-full-chain-goal-control-ledger.md docs/05-execution-logs/audits-reviews/2026-07-04-full-chain-goal-control-ledger.md
git diff --check
git diff --name-only -- .env* package.json package-lock.yaml package-lock.json pnpm-lock.yaml pnpm-workspace.yaml src tests e2e src/db/schema drizzle migrations seed scripts compose.yaml playwright-report test-results .next .runtime
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId full-chain-goal-control-ledger-2026-07-04
```

## Stop Rules

- Stop if any required preparation document is missing or conflicts with the latest traceability/source-order rule.
- Stop if this task would need runtime observation, DB access, private credential values, Provider execution, or source
  repair.
- Stop if a later task boundary would pre-create scenario-owned outputs that must be proven through the experience flow.
- Stop if any evidence cannot be redacted to labels, counts, statuses, file paths, and validation summaries.
- Stop if Provider, staging, production, payment, Cost Calibration, release readiness, final Pass, or production usability
  would be implied.

Cost Calibration Gate remains blocked.
