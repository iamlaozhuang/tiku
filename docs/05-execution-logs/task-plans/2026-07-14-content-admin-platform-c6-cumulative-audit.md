# Content Admin Platform C6 Cumulative Audit Plan

Date: 2026-07-14

Task: `content-admin-platform-c6-cumulative-audit-2026-07-13`

Branch: `codex/content-admin-platform-c6-cumulative-audit`

Profile: R2 / fixed full-regression node / `independent_audit`

Batch baseline: `8086c264b0483bbfc74ebd615364efbab27c3560`

Current baseline: `master == origin/master == 71d276e05ea39e6d5f73a20f068174c09d23ab44`

## Goal

Audit the exact C0-C5 route/editor/navigation delta against the approved C0 wireflow and PIC contract, prove that the
question and material route families compose without authorization, lifecycle, lock/copy or data-integrity drift, and
execute the fixed Batch C full-regression node. Product changes are permitted only for a blocking finding inside the
materialized Batch C allowlist.

## Required Reading

- `AGENTS.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/04-agent-system/state/active-state-history-index.yaml`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/01-requirements/00-index.md`
- `docs/01-requirements/advanced-edition/00-index.md`
- `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`
- `docs/02-architecture/adr/adr-007-edition-aware-authorization-source-of-truth.md`
- `docs/01-requirements/modules/02-question-paper.md`
- `docs/01-requirements/stories/epic-02-question-paper.md`
- `docs/01-requirements/modules/06-admin-ops.md`
- `docs/01-requirements/stories/epic-06-admin-ops.md`
- `docs/01-requirements/traceability/2026-07-07-full-role-uiux-source-implementation-entry.md`
- `docs/01-requirements/traceability/2026-07-07-full-role-uiux-batch-5-content-admin-cross-role-closure.md`
- `docs/01-requirements/traceability/2026-07-13-content-admin-p0-platform-interaction-contract.md`
- `docs/01-requirements/traceability/2026-07-02-ai-generation-requirements-ssot-alignment.md`
- `docs/01-requirements/traceability/2026-07-02-phase4-requirements-agent-baseline-alignment.md`
- `docs/05-execution-logs/evidence/2026-07-02-ai-generation-acceptance-baseline-normalization.md`
- `docs/05-execution-logs/evidence/2026-07-02-ai-generation-goal-completion-audit.md`
- `docs/05-execution-logs/task-plans/2026-07-13-content-admin-platform-b-to-f-serial-program.md`
- `docs/05-execution-logs/acceptance/2026-07-13-content-admin-platform-b-to-f-standing-authorization.md`
- `docs/05-execution-logs/acceptance/2026-07-13-content-admin-platform-pic-coverage-and-exception-ledger.md`
- C0-C5 plans/evidence/audits and the exact `8086c264..71d276e0` diff.
- Lean Module Run v3, cumulative audit, archive, Module Run closeout, and repository/Git hygiene SOPs.
- Both editor route pages/forms, the shared list consumer, navigation codec/hook, API/service lock-contract tests, and
  focused editor/list/navigation tests.

## Audit And Validation

1. Reconcile each C0-C5 commit, claimed behavior, changed path and PIC status with the canonical four-route decision.
2. Attack public-id boundaries, same-family `returnTo`, snapshot sensitivity/expiry/one-shot semantics, dirty leave,
   create/edit refresh, duplicate mutation, lock races, explicit copy, missing/forbidden paths, focus/scroll fallback,
   alternate inline paths, and read-only Drawer continuity.
3. Search Batch C tests for skipped/expected-failure residue and verify no API, service, schema, dependency, build/test
   infrastructure, authorization, AI-generation, database or deployment file entered the Batch C delta.
4. Run heavy gates serially: full unit with one worker, lint, typecheck, full-repository format, production build, diff,
   recovery/Program Guards, and Module Run closeout gates. If the worktree dependency junction triggers the known
   Turbopack boundary, run the authoritative build in the clean root checkout at the exact staged tree.
5. Record two adversarial rounds and an independent audit. Fix only blocking Batch C findings, then rerun affected and
   cumulative gates.

## Boundaries And Closeout

No dependency, API/service/repository/schema/database, authorization/edition, AI/Provider, credential, browser,
staging/production, PR, force-push, Cost Calibration or deployment action is authorized. Close with one audit/state
commit, ff-only merge to `master`, ordinary push to `origin/master`, exact remote equality verification and safe
branch/worktree cleanup; E0 starts automatically.
