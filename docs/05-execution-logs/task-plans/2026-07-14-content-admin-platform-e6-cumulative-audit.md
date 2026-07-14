# Content Admin Platform E6 Batch E Cumulative Audit Plan

Date: 2026-07-14

Task: `content-admin-platform-e6-cumulative-audit-2026-07-13`

Branch: `codex/content-admin-platform-e6-cumulative-audit`

Profile: R3 / `independent_audit`

Baseline: `master == origin/master == 10382923b7ae3af8d69d8e3a5d11e02a1571f1e9`

## Goal

Audit Batch E cumulatively from the C6 checkpoint through E5. Reconcile every E0 inventory route, all six E-task commits,
the exact product/test delta, E0-G01 through E0-G04 closure, PIC family accounting and all protected authorization,
edition, organization, AI, phone, `redeem_code`, audit-redaction and historical-paper boundaries. Run the fixed E6 full
node and close Batch E only if route coverage is complete, no executable expected-failure/skip residue or approved
exception remains, and no fresh current-baseline regression is found.

## Required Reading

- `AGENTS.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/01-requirements/00-index.md`
- `docs/01-requirements/advanced-edition/00-index.md`
- `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`
- `docs/02-architecture/adr/adr-007-edition-aware-authorization-source-of-truth.md`
- `docs/01-requirements/traceability/2026-07-02-ai-generation-requirements-ssot-alignment.md`
- `docs/01-requirements/traceability/2026-07-02-phase4-requirements-agent-baseline-alignment.md`
- `docs/05-execution-logs/evidence/2026-07-02-ai-generation-goal-completion-audit.md`
- `docs/05-execution-logs/task-plans/2026-07-13-content-admin-platform-b-to-f-serial-program.md`
- `docs/05-execution-logs/acceptance/2026-07-13-content-admin-platform-b-to-f-standing-authorization.md`
- `docs/05-execution-logs/acceptance/2026-07-13-content-admin-platform-pic-coverage-and-exception-ledger.md`
- E0 plan/evidence and E1-E5 plan/evidence/independent-audit artifacts, plus the exact `3572f195..10382923b` commit
  range, every changed product/test file and their focused proof roots.
- Current role/auth/training/operations decisions, role-separated alignment, permission-role inventories, Module Run v3,
  closeout/archive SOPs and recovery Guard source.

The source hierarchy and time sequence leave no unresolved business conflict. A01-A30 and the superseded AI issue
classes remain closed absent a fresh failing current-master test.

## Cumulative Audit Method

1. Reconcile the six canonical commits in order: E0 inventory, E1 content, E2 operations, E3 organization, E4 learner
   and E5 cross-role closure. Reject unrelated files, mixed ownership, dependency/schema/API/server/config changes and
   governance claims not backed by their task evidence.
2. Recount the current 45 page entries against E0. Confirm each route remains owned exactly once and that the four E0
   candidates are closed by executable tests/build artifacts rather than comments or menu visibility.
3. Inspect every Batch E product/test delta for duplicate facts, universal-framework drift, raw diagnostics/private data,
   authorization inference, lifecycle mutation and skipped/expected-failure residue. No source edit is planned; a fresh
   failure is repaired only through the separately governed X2 path.
4. Reconcile PIC family status: content, operations, organization, learner and cross-workspace families may be compliant
   as implementation families; global/role acceptance still belongs to F0-F5. Exception count must remain zero.
5. Run one cross-family protected regression pack, then the fixed full unit node, lint, typecheck, full-repository format,
   production build, diff checks and recovery/serial/security Guards serially.

## Boundary Guards

- UI state, public links, URL filters, redirects and workspace switching never become authorization sources.
- Source `edition`, `auth_upgrade`, service-computed `effectiveEdition`, organization scope and quota ownership remain
  unchanged. Standard roles fail closed; only eligible `super_admin` access crosses workspaces.
- Content AI stays draft/review-only; organization AI stays organization-private training-draft-only; learner AI stays
  selected authorization-context-owned. Provider remains closed and historical paper resume remains persisted-snapshot-
  only.
- Phone remains masked by default; plaintext `redeem_code` remains only the approved eligible operations product-UI
  exception; evidence/logs remain redacted. Audit and AI-call details expose no raw Prompt, payload, answers or content.
- No dependency, schema, migration, database, environment, external-service, deployment, PR or force-push action.

## Allowed Changes

- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/04-agent-system/state/active-state-history-index.yaml`
- `docs/05-execution-logs/task-plans/2026-07-14-content-admin-platform-e6-cumulative-audit.md`
- `docs/05-execution-logs/evidence/2026-07-14-content-admin-platform-e6-cumulative-audit.md`
- `docs/05-execution-logs/audits-reviews/2026-07-14-content-admin-platform-e6-cumulative-audit-audit.md`
- `docs/05-execution-logs/acceptance/2026-07-13-content-admin-platform-pic-coverage-and-exception-ledger.md`

## Execution

- [x] Reconcile the canonical commit range, current 45-route inventory, exact product/test delta, E0 candidates, PIC
      statuses and protected boundaries.
- [x] Run the cross-family protected regression pack; investigate only fresh current-baseline failures.
- [x] Run the fixed full unit node, lint, typecheck, full-repository Prettier, production build and diff checks serially.
- [x] Complete both adversarial review rounds, update concise evidence/audit/state/queue/history/PIC, and pass recovery,
      serial, pre-commit, closeout and pre-push Guards.

## Validation

- Cross-family regression uses explicit E1-E5 proof-root files and one worker where the runner supports it.
- Fixed node: `npm.cmd run test:unit -- --maxWorkers=1`, then lint, typecheck, full-repository Prettier and the exact E6
  production build from the repository root via `npm.cmd exec -- next build .worktrees/e6`.
- Inspect production `/design-system` metadata for 404 and verify all 45 route entries reconcile after build.
- Run `git diff --check`, recovery/serial Guards and Module Run pre-commit/closeout/pre-push gates. The verified commit is
  ff-only merged, so the fixed node is not mechanically repeated after merge.

## Adversarial Review

- Round 1: commit/diff ownership, route completeness, request/data integrity, lifecycle semantics, requirement/PIC claims,
  exact E0 candidate closure and evidence traceability.
- Round 2: direct URL and mixed-role escalation, malformed/stale/duplicate paths, cross-page/modal/URL consistency,
  private-data leakage, AI/authorization/phone/card/log regressions, expected-failure residue, over-abstraction and false
  Batch/program completion.

Closeout uses one documentation/state commit if no defect is found, ff-only merge to `master`, authorized push to
`origin/master`, remote equality proof and isolated-resource cleanup. F0 starts automatically. No deployment.
