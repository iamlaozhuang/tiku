# Full Chain Isolated DB Bootstrap Seed Approval Prep

Task id: `full-chain-isolated-db-bootstrap-seed-approval-prep-2026-07-04`

Branch: `codex/full-chain-isolated-db-bootstrap-seed-approval-prep-2026-07-04`

Status: docs-only approval preparation.

## Scope

Prepare the isolated local DB target and bootstrap seed approval package for the later full-chain experiential
acceptance. This task does not connect to, create, query, migrate, seed, reset, clean, or write any database target.

Allowed work:

- Record the proposed isolated local DB target label and run selector.
- Record future fresh-approval text for local-only DB target creation/selection and bootstrap seed execution.
- Record the bootstrap seed boundary for `super_admin` only.
- Record the `contact_config` readiness boundary without assuming a persistent DB table.
- Update state, queue, evidence, and audit for this docs-only task.
- Run local governance and formatting validation only.

Blocked work:

- No product source, test, script, dependency, package, lockfile, schema, migration, seed, `.env*`, or private fixture
  file change.
- No DB connection, DB read, DB write, DB create/drop, cleanup, reset, migration execution, provisioning, or raw row
  inspection.
- No browser, Playwright, dev server, Provider call, staging, production, cloud, deploy, Cost Calibration, release
  readiness, final Pass, or production usability claim.
- No credential, connection string, token, cookie, session, Authorization header, phone, email, password, plaintext
  `redeem_code`, raw Prompt, Provider payload, raw AI I/O, full question, full paper, full material, raw DOM, screenshot,
  trace, or raw DB row in evidence.

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
- `docs/05-execution-logs/task-plans/2026-07-04-full-chain-acceptance-planning-and-materials-prep.md`
- `docs/05-execution-logs/acceptance/2026-07-04-full-chain-acceptance-db-selector-and-provisioning-approval.md`
- `docs/05-execution-logs/acceptance/2026-07-04-full-chain-acceptance-dependency-dag.md`
- `docs/05-execution-logs/acceptance/2026-07-04-full-chain-acceptance-account-provisioning-order.md`
- `src/db/schema/auth.ts`
- `src/db/schema/system.ts`
- `src/server/services/contact-config-service.ts`
- `src/server/contracts/contact-config-contract.ts`
- `src/lib/local-purchase-guidance-contact-config.ts`

## Requirement Mapping Result

| Requirement area                    | Source anchor                                                   | Preparation result                                                                 |
| ----------------------------------- | --------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| Isolated DB baseline                | Full-chain DB selector approval package                         | Proposed local DB label remains `tiku_full_chain_acceptance_20260704_001`.         |
| Bootstrap seed vs scenario output   | Full-chain dependency DAG and second-review correction          | Bootstrap seed is limited to `super_admin`; scenario outputs remain flow-created.  |
| Admin account domain                | `src/db/schema/auth.ts`, `CT-REQ-009`, `CT-REQ-056`             | Future seed may target auth/admin rows for `super_admin` only.                     |
| `contact_config` readiness          | `contact-config-service.ts`, contact config contract            | Current implementation is runtime/local repository, not a DB table.                |
| Destructive DB and schema boundary  | ADR-004/005, code taste commandment 6, full-chain approval docs | `drizzle-kit push`, cleanup/reset/delete/truncate/drop remain blocked.             |
| Evidence redaction                  | AGENTS, ADR-007, redeem-code plaintext decision                 | Evidence limited to labels, selectors, counts, statuses, and redacted summaries.   |
| Later scenario-created object proof | Full-chain 7-track matrix, dependency DAG, account order        | `ops_admin`, `content_admin`, org, auth, users, cards, content, learning not seed. |

## Proposed Target Labels

| Label type        | Value                                      | Current task action |
| ----------------- | ------------------------------------------ | ------------------- |
| Local DB label    | `tiku_full_chain_acceptance_20260704_001`  | Record only         |
| Run selector      | `full_chain_acceptance_20260704`           | Record only         |
| Fixture namespace | `full-chain-acceptance-2026-07-04`         | Record only         |
| Bootstrap admin   | `fc_bootstrap_super_admin`                 | Record only         |
| Contact readiness | `fc_contact_config_runtime_static_default` | Record only         |

## Implementation Plan

1. Materialize the approval package for future isolated DB target and bootstrap seed execution.
2. Explicitly separate future DB execution phases: target inventory, isolated target creation/selection, reviewed
   migration execution if approved, bootstrap seed, and read-only aggregate verification.
3. Limit default bootstrap seed to `super_admin` auth/admin rows required for scenario 1.
4. Record that `contact_config` currently uses a local/runtime repository and has no schema table in this source scan.
5. Block any seed of `ops_admin`, `content_admin`, organization tree, `org_auth`, org admins, employees, `redeem_code`,
   personal users, content, papers, learning records, enterprise training, AI logs, or analytics data.
6. Update state/queue, evidence, and audit.
7. Validate with scoped Prettier, `git diff --check`, blocked-path diff, and Module Run v2 pre-commit hardening.

## Validation Commands

```powershell
npm.cmd exec -- prettier --write --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-07-04-full-chain-isolated-db-bootstrap-seed-approval-prep.md docs/05-execution-logs/acceptance/2026-07-04-full-chain-isolated-db-bootstrap-seed-approval-package.md docs/05-execution-logs/evidence/2026-07-04-full-chain-isolated-db-bootstrap-seed-approval-prep.md docs/05-execution-logs/audits-reviews/2026-07-04-full-chain-isolated-db-bootstrap-seed-approval-prep.md
npm.cmd exec -- prettier --check --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-07-04-full-chain-isolated-db-bootstrap-seed-approval-prep.md docs/05-execution-logs/acceptance/2026-07-04-full-chain-isolated-db-bootstrap-seed-approval-package.md docs/05-execution-logs/evidence/2026-07-04-full-chain-isolated-db-bootstrap-seed-approval-prep.md docs/05-execution-logs/audits-reviews/2026-07-04-full-chain-isolated-db-bootstrap-seed-approval-prep.md
git diff --check
git diff --name-only -- .env* package.json package-lock.yaml package-lock.json pnpm-lock.yaml pnpm-workspace.yaml src tests e2e src/db/schema drizzle migrations seed scripts playwright-report test-results .next .runtime
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId full-chain-isolated-db-bootstrap-seed-approval-prep-2026-07-04
```

## Non-Claims

- No DB target was created or inspected.
- No migration, seed, provisioning, cleanup, reset, or schema operation was executed.
- No runtime acceptance, browser/e2e, dev server, Provider, staging, production, or Cost Calibration work was executed.
- No release readiness, final Pass, DB readiness, Provider readiness, or production usability is claimed.
