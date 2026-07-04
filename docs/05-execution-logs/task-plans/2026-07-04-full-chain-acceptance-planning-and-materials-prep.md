# Full Chain Acceptance Planning And Materials Prep

Task id: `full-chain-acceptance-planning-and-materials-prep-2026-07-04`

Branch: `codex/full-chain-acceptance-planning-and-materials-prep-2026-07-04`

Status: docs-only preparation package.

## Scope

Prepare the owner-facing full-role, full-chain acceptance preparation package for later experiential validation. This task
does not execute acceptance and does not create, reset, clean, seed, or query any database target.

Allowed work:

- Materialize acceptance planning documents under `docs/05-execution-logs/`.
- Record the dependency order for DB, accounts, content, authorization, learning data, Provider, cost, and staging gates.
- Record reusable local-private fixture inventory from `D:/tiku-local-private/owner-facing-fixtures/2026-06-28-rawfiles-curated`
  at metadata level only.
- Update `project-state.yaml` and `task-queue.yaml` for this docs-only task.
- Run local governance and formatting validation only.

Blocked work:

- No product source, test, script, dependency, package, lockfile, schema, migration, seed, or `.env*` change.
- No DB connection, DB read, DB write, cleanup, reset, migration, or provisioning.
- No browser, Playwright, dev server, Provider call, raw Prompt, raw AI I/O, staging, production, cloud, deploy, or Cost
  Calibration execution.
- No private account, password, phone, email, plaintext `redeem_code`, connection string, token, cookie, session,
  Authorization header, raw DB row, raw DOM, screenshot, trace, full question, full paper, full material, full chunk, or
  employee subjective answer in evidence.
- No release readiness, final Pass, production usability, or production readiness claim.

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
- `docs/01-requirements/traceability/2026-07-02-ui-ux-requirement-design-baseline-gap-analysis.md`
- `docs/01-requirements/traceability/2026-07-02-role-auth-training-ops-decision-package.md`
- `docs/01-requirements/traceability/2026-07-02-current-thread-requirement-reconciliation-ledger.md`
- `docs/01-requirements/traceability/2026-07-02-redeem-code-edition-and-plaintext-ops-decision.md`
- `docs/01-requirements/traceability/2026-07-02-ai-generation-requirements-ssot-alignment.md`
- `docs/01-requirements/traceability/2026-07-02-phase4-requirements-agent-baseline-alignment.md`
- `docs/05-execution-logs/evidence/2026-07-02-ai-generation-acceptance-baseline-normalization.md`
- `docs/05-execution-logs/evidence/2026-07-02-ai-generation-goal-completion-audit.md`
- `src/db/schema/auth.ts`
- `src/db/schema/paper.ts`
- `src/db/schema/student-experience.ts`
- `src/db/schema/organization-training.ts`
- `D:/tiku-local-private/owner-facing-fixtures/2026-06-28-rawfiles-curated/README.md`
- `D:/tiku-local-private/owner-facing-fixtures/2026-06-28-rawfiles-curated/resource-pack-manifest.json`
- `D:/tiku-local-private/owner-facing-fixtures/2026-06-28-rawfiles-curated/redaction-policy.md`
- `D:/tiku-local-private/owner-facing-fixtures/2026-06-28-rawfiles-curated/authorization-matrix.yaml`
- `D:/tiku-local-private/owner-facing-fixtures/2026-06-28-rawfiles-curated/employee-import/template-fields.yaml`
- `D:/tiku-local-private/owner-facing-fixtures/2026-06-28-rawfiles-curated/papers/paper-fixture-plan.yaml`
- `D:/tiku-local-private/owner-facing-fixtures/2026-06-28-rawfiles-curated/questions/question-pool-index.yaml`
- `D:/tiku-local-private/owner-facing-fixtures/2026-06-28-rawfiles-curated/expected-outcomes.md`

## Requirement Mapping Result

| Requirement area                     | Current source anchor                                                   | Preparation result                                                                               |
| ------------------------------------ | ----------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| 12 owner scenarios                   | User request plus 2026-07-02 traceability                               | Mapped into 7 serial tracks with hard dependencies.                                              |
| Edition-aware personal authorization | ADR-007, edition-aware requirements, redeem-code decision               | Standard activation, advanced activation, and upgrade card prep are separate paths.              |
| Enterprise multi-scope authorization | Edition-aware requirements, role-auth decision, `src/db/schema/auth.ts` | Commercial multi-scope package must expand to multiple current-schema `org_auth` rows.           |
| Account domain separation            | Requirement index and `CT-REQ-009` / `CT-REQ-056`                       | Admin-domain and learner/employee-domain accounts are prepared separately.                       |
| Employee import                      | `CT-REQ-011`, `CT-REQ-051`, fixture template fields                     | Import is target-organization-first and contains no authorization fields.                        |
| Content and AI prerequisites         | AI SSOT alignment, UI/UX baseline, fixture manifest                     | Materials, knowledge nodes, question bank, and paper library precede AI generation and training. |
| Analytics prerequisites              | Role-auth decision and UI/UX baseline                                   | Employee learning and enterprise training data must exist before analytics validation.           |
| Evidence redaction                   | AGENTS, ADR-007, fixture redaction policy                               | Only selectors, labels, counts, status, file paths, and redacted summaries are allowed.          |

## Implementation Plan

1. Record the 7-track acceptance matrix and map the 12 owner scenarios into track order.
2. Record the dependency DAG so later execution cannot start AI, analytics, training, or advanced admin checks before
   content, authorization, employees, and learning data exist.
3. Record the DB selector and provisioning approval package using a new isolated local DB baseline decision.
4. Record account provisioning order and account-domain boundaries.
5. Record local-private fixture reuse inventory and the exact gaps that must be filled outside the repo.
6. Record materials pack spec, Provider/Cost approval boundaries, runbook, stop rules, evidence, and audit.
7. Update state and queue with exact allowed files, blocked files, validation commands, and closeout boundaries.

## Validation Commands

```powershell
npm.cmd exec -- prettier --write --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-07-04-full-chain-acceptance-planning-and-materials-prep.md docs/05-execution-logs/acceptance/2026-07-04-full-chain-acceptance-7-track-matrix.md docs/05-execution-logs/acceptance/2026-07-04-full-chain-acceptance-dependency-dag.md docs/05-execution-logs/acceptance/2026-07-04-full-chain-acceptance-db-selector-and-provisioning-approval.md docs/05-execution-logs/acceptance/2026-07-04-full-chain-acceptance-account-provisioning-order.md docs/05-execution-logs/acceptance/2026-07-04-full-chain-acceptance-materials-reuse-and-gap-inventory.md docs/05-execution-logs/acceptance/2026-07-04-full-chain-acceptance-materials-pack-spec.md docs/05-execution-logs/acceptance/2026-07-04-full-chain-acceptance-provider-cost-approval.md docs/05-execution-logs/acceptance/2026-07-04-full-chain-acceptance-runbook-and-stop-rules.md docs/05-execution-logs/evidence/2026-07-04-full-chain-acceptance-planning-and-materials-prep.md docs/05-execution-logs/audits-reviews/2026-07-04-full-chain-acceptance-planning-and-materials-prep.md
npm.cmd exec -- prettier --check --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-07-04-full-chain-acceptance-planning-and-materials-prep.md docs/05-execution-logs/acceptance/2026-07-04-full-chain-acceptance-7-track-matrix.md docs/05-execution-logs/acceptance/2026-07-04-full-chain-acceptance-dependency-dag.md docs/05-execution-logs/acceptance/2026-07-04-full-chain-acceptance-db-selector-and-provisioning-approval.md docs/05-execution-logs/acceptance/2026-07-04-full-chain-acceptance-account-provisioning-order.md docs/05-execution-logs/acceptance/2026-07-04-full-chain-acceptance-materials-reuse-and-gap-inventory.md docs/05-execution-logs/acceptance/2026-07-04-full-chain-acceptance-materials-pack-spec.md docs/05-execution-logs/acceptance/2026-07-04-full-chain-acceptance-provider-cost-approval.md docs/05-execution-logs/acceptance/2026-07-04-full-chain-acceptance-runbook-and-stop-rules.md docs/05-execution-logs/evidence/2026-07-04-full-chain-acceptance-planning-and-materials-prep.md docs/05-execution-logs/audits-reviews/2026-07-04-full-chain-acceptance-planning-and-materials-prep.md
git diff --check
git diff --name-only -- .env* package.json package-lock.yaml package-lock.json pnpm-lock.yaml pnpm-workspace.yaml src tests e2e src/db/schema drizzle migrations seed scripts playwright-report test-results .next .runtime
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId full-chain-acceptance-planning-and-materials-prep-2026-07-04
```

## Risk Controls

- DB baseline defaults to a new isolated local DB label for later approval; current local DB is not accepted as the full-chain baseline.
- Current `org_auth` schema contains one `profession` and one `level` per row. Multi-profession and multi-level enterprise
  packages must expand into multiple rows or a future approved atomic scope layer.
- Account setup is split into admin domain and learner/employee domain to avoid phone collision and ownership mistakes.
- Employee import is sequenced after organization tree and `org_auth`, and must never carry authorization fields.
- AI generation and AI组卷 remain blocked until Provider and cost boundaries are approved for the specific execution task.
- Organization analytics is blocked until employee learning and enterprise training data exist.
- Later execution must stop on first fail/block and split repair or provisioning work.

## Non-Claims

- This task does not prove runtime behavior.
- This task does not approve or execute DB provisioning.
- This task does not approve or execute Provider, staging, production, Cost Calibration, or browser acceptance.
- This task does not claim release readiness, final Pass, production usability, or production readiness.
