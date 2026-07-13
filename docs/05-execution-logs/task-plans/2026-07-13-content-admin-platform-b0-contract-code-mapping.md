# Content Admin Platform B0 Contract-to-Code Mapping Plan

Date: 2026-07-13

Task: `content-admin-platform-b0-contract-code-mapping-2026-07-13`

Branch: `codex/content-admin-platform-b0-contract-code-mapping`

Profile: R0 / read-only mapping / `evidence_two_rounds`

Baseline: `master == origin/master == f29b2c382fed36bd9d493d2c83212479c2f021d3`

## Goal

Map PIC-01 through PIC-13 to existing routes, components, hooks/services, tests, observed gaps, and the canonical owning
task. B0 changes no product runtime or product tests and does not claim compliance; it creates the evidence map that B1–F5
must close without inventing a premature shared abstraction.

## SSOT Read List

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/01-requirements/00-index.md`
- `docs/01-requirements/modules/02-question-paper.md`
- `docs/01-requirements/stories/epic-02-question-paper.md`
- `docs/01-requirements/modules/06-admin-ops.md`
- `docs/01-requirements/stories/epic-06-admin-ops.md`
- `docs/01-requirements/traceability/2026-07-07-full-role-uiux-source-implementation-entry.md`
- `docs/01-requirements/traceability/2026-07-13-content-admin-p0-platform-interaction-contract.md`
- `docs/05-execution-logs/acceptance/2026-07-13-content-admin-platform-pic-coverage-and-exception-ledger.md`
- `docs/05-execution-logs/task-plans/2026-07-13-content-admin-platform-b-to-f-serial-program.md`
- `docs/05-execution-logs/acceptance/2026-07-13-content-admin-platform-b-to-f-standing-authorization.md`
- `docs/04-agent-system/sop/lean-module-run-v3-governance.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/04-agent-system/state/active-state-history-index.yaml`
- Latest M1/M2 plan, evidence, and audit referenced by active state/history index.

## Target Source And Tests

Read-only inventory covers:

- content, operations, organization, and learner route families under `src/app/`;
- shared and workspace components under `src/components/`;
- request/state/navigation/form hooks and services under `src/`;
- route/component/service tests under `src/**/__tests__/` and `tests/`;
- analogous implementations for URL state, async state, focus restoration, form validation, authorization boundaries, and
  responsive table containment.

Every ledger row must cite repository paths that exist at the B0 baseline. A path proves only an existing consumer or
test surface; it does not prove the PIC is compliant.

## Fact Ownership

The detailed PIC-to-code map is stored once in
`docs/05-execution-logs/acceptance/2026-07-13-content-admin-platform-pic-coverage-and-exception-ledger.md`. B0 evidence
stores only reading/validation/review conclusions and links to that map.

## Allowed Changes

- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/04-agent-system/state/active-state-history-index.yaml`
- `docs/05-execution-logs/task-plans/2026-07-13-content-admin-platform-b0-contract-code-mapping.md`
- `docs/05-execution-logs/evidence/2026-07-13-content-admin-platform-b0-contract-code-mapping.md`
- `docs/05-execution-logs/acceptance/2026-07-13-content-admin-platform-pic-coverage-and-exception-ledger.md`

## Blocked Changes And Actions

- Product source/tests, dependencies, lockfiles, test infrastructure, schema/migration/fixture/seed, database, Provider,
  credentials, browser, screenshots, PR, force push, staging, production, deployment, and Cost Calibration Gate.
- A01–A30 or closed/superseded AI issues without fresh current-baseline failure evidence.
- Changing any PIC status to `compliant` or creating an exception without the later task's required proof and approval.

## Method And Review

1. Read all SSOT, source, tests, and analogous implementations.
2. Build one PIC-01~13 ledger table with existing consumers, tests, gap, and canonical owner.
3. Validate every cited path, owner order, protected boundary, current/next state, formatting, diff, Program Guard, and
   recovery Guard. R0 does not run unrelated product tests or build.
4. Round 1 attacks contract accuracy, path existence, data/authorization boundaries, and owner completeness.
5. Round 2 attacks false compliance, cross-workspace inconsistency, regression risk, missing exceptional paths,
   over-design, and scope leakage.
6. Record concise evidence, commit once, ff-only merge, ordinary push, verify remote, clean the worktree/branch, and
   continue to B1 automatically.
