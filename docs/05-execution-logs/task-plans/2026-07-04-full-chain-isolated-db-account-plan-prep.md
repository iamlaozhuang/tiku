# Full Chain Isolated DB Account Plan Prep

Task id: `full-chain-isolated-db-account-plan-prep-2026-07-04`

Branch: `codex/full-chain-isolated-db-account-plan-prep-2026-07-04`

Status: private account plan preparation only.

## Scope

Prepare the account selector plan for the later isolated local DB full-chain acceptance run. This task may create one
redacted private account-plan file outside the repository and may update repository governance docs.

This task does not create accounts in DB, seed data, connect to a database, start the app, run browser/e2e, call a
Provider, or change product source.

Allowed work:

- Record account selectors for the target DB label `tiku_full_chain_acceptance_20260704_001`.
- Record run selector `full_chain_acceptance_20260704` and fixture namespace `full-chain-acceptance-2026-07-04`.
- Record which accounts are bootstrap inputs, scenario-created outputs, registration outputs, or employee import
  outputs.
- Create `D:/tiku-local-private/acceptance/full-chain-isolated-db-account-plan-2026-07-04.md` as a private redacted
  selector plan.
- Update state, queue, evidence, and audit for this task.

Blocked work:

- No DB connection, DB read, DB write, DB create/drop, cleanup, reset, migration, seed, provisioning, or raw row
  inspection.
- No product source, test, script, dependency, package, lockfile, schema, migration, seed, `.env*`, or credential file
  value change.
- No browser, Playwright, dev server, Provider call, staging, production, cloud, deployment, Cost Calibration, release
  readiness, final Pass, or production usability claim.
- No credential, password, phone, email, token, cookie, session, Authorization header, plaintext `redeem_code`, raw DB
  row, internal id, raw Prompt, Provider payload, raw AI output, full question, full paper, full material, screenshot,
  DOM, or trace in committed evidence.

## SSOT Read List

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/01-requirements/00-index.md`
- `docs/01-requirements/advanced-edition/00-index.md`
- `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`
- `docs/05-execution-logs/acceptance/2026-07-04-full-chain-isolated-db-bootstrap-seed-approval-package.md`
- `docs/05-execution-logs/acceptance/2026-07-04-full-chain-acceptance-account-provisioning-order.md`
- `docs/05-execution-logs/acceptance/2026-07-04-full-chain-acceptance-dependency-dag.md`
- `D:/tiku-local-private/acceptance/role-separated-local-accounts-2026-06-23.md` headings only
- `D:/tiku-local-private/owner-facing-fixtures/2026-06-28-rawfiles-curated/` file inventory only

## Requirement Mapping Result

| Requirement area                | Source anchor                                              | Preparation result                                                                         |
| ------------------------------- | ---------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| Bootstrap start point           | Isolated DB bootstrap approval package                     | Only `fc_bootstrap_super_admin` is a bootstrap seed candidate.                             |
| Scenario-created admin accounts | Full-chain dependency DAG and account provisioning order   | `ops_admin` and `content_admin` remain scenario-created by `super_admin`.                  |
| Admin vs learner account domain | MVP requirement index and account provisioning order       | Admin selectors are separated from learner/employee selectors.                             |
| Employee import ownership       | Edition-aware authorization requirements and account order | Employees are import-created in learner/employee domain; import rows carry no auth fields. |
| Standard-to-advanced upgrade    | ADR-007 and edition-aware authorization requirements       | Personal advanced flow uses standard auth first, then `edition_upgrade`.                   |
| Old 8-role fixture reuse        | Private old account file headings                          | Treated as reuse reference only; not automatically equal to this run's accounts.           |
| Evidence redaction              | AGENTS, ADR-007, bootstrap approval package                | Committed evidence records paths, selectors, counts, and statuses only.                    |

## Private Account Plan Output

| Output type            | Path                                                                                 | Current task action           |
| ---------------------- | ------------------------------------------------------------------------------------ | ----------------------------- |
| Private plan file      | `D:/tiku-local-private/acceptance/full-chain-isolated-db-account-plan-2026-07-04.md` | Create redacted selector plan |
| Existing 8-role source | `D:/tiku-local-private/acceptance/role-separated-local-accounts-2026-06-23.md`       | Read headings/count only      |
| Existing material pack | `D:/tiku-local-private/owner-facing-fixtures/2026-06-28-rawfiles-curated/`           | Inventory only                |

## Implementation Plan

1. Create the private run-specific account selector plan without secrets.
2. Record each account as one of: bootstrap seed candidate, scenario-created output, registration-created output,
   employee-import-created output, or future private value needed.
3. Keep old 8-role fixture data as a reference source only, not as an automatic DB seed source.
4. Record the employee import and personal card dependencies that must be satisfied before experiential acceptance.
5. Update repository task plan, acceptance doc, evidence, audit, project-state, and task-queue.
6. Validate with scoped Prettier, `git diff --check`, blocked repo path diff, private path existence check, private file
   redaction sentinel, and Module Run v2 pre-commit hardening.

## Validation Commands

```powershell
npm.cmd exec -- prettier --write --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-07-04-full-chain-isolated-db-account-plan-prep.md docs/05-execution-logs/acceptance/2026-07-04-full-chain-isolated-db-account-plan.md docs/05-execution-logs/evidence/2026-07-04-full-chain-isolated-db-account-plan-prep.md docs/05-execution-logs/audits-reviews/2026-07-04-full-chain-isolated-db-account-plan-prep.md
npm.cmd exec -- prettier --check --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-07-04-full-chain-isolated-db-account-plan-prep.md docs/05-execution-logs/acceptance/2026-07-04-full-chain-isolated-db-account-plan.md docs/05-execution-logs/evidence/2026-07-04-full-chain-isolated-db-account-plan-prep.md docs/05-execution-logs/audits-reviews/2026-07-04-full-chain-isolated-db-account-plan-prep.md
git diff --check
git diff --name-only -- .env* package.json package-lock.yaml package-lock.json pnpm-lock.yaml pnpm-workspace.yaml src tests e2e src/db/schema drizzle migrations seed scripts playwright-report test-results .next .runtime
powershell.exe -NoProfile -Command "if (-not (Test-Path 'D:/tiku-local-private/acceptance/full-chain-isolated-db-account-plan-2026-07-04.md')) { throw 'private account plan missing' }"
powershell.exe -NoProfile -Command "$content = Get-Content 'D:/tiku-local-private/acceptance/full-chain-isolated-db-account-plan-2026-07-04.md' -Raw; if ($content -match '(?i)(password\s*[:=]\s*\S+|token\s*[:=]\s*\S+|redeem_code\s*[:=]\s*\S+)') { throw 'private account plan redaction sentinel failed' }"
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId full-chain-isolated-db-account-plan-prep-2026-07-04
```

## Non-Claims

- No DB target was created, selected, read, migrated, seeded, cleaned, reset, or inspected.
- No account was actually created.
- No old account credential was copied into committed evidence.
- No runtime acceptance, browser/e2e, dev server, Provider, staging, production, Cost Calibration, release readiness,
  final Pass, or production usability is claimed.
