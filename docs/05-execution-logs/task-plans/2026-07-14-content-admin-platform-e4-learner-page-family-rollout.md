# Content Admin Platform E4 Learner Page-Family Rollout Plan

Date: 2026-07-14

Task: `content-admin-platform-e4-learner-page-family-rollout-2026-07-13`

Branch: `codex/content-admin-platform-e4-learner-page-family-rollout`

Profile: R3 / `independent_audit`

Baseline: `master == origin/master == e1a5797f3155f45ccfa020b67c01036d781e021b`

## Goal

Close the approved learner page-family baseline without reopening already closed learner or AI findings. The latest B7 and
non-AI acceptance evidence proves the shell, home, practice, mock/report, mistake-book, profile and authentication routes;
the current AI implementation proves its standard/advanced boundary and five-zone contract. Fresh source evidence exposes
one E4 gap: the organization-training list expands every assigned training and answer workspace at once. Replace that with
a mobile-first summary/list/detail flow that opens exactly one training, preserves server-derived authorization and answer
lifecycle rules, and gives accessible, local feedback on ordinary and stale-lifecycle failures.

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
- Standard learner authentication, student experience, AI scoring and RAG modules/stories; advanced authorization,
  personal AI and organization-training modules/stories; the latest AI acceptance normalization and closure evidence.
- Full-role source implementation entry, design review, remediation baseline, Batch 3 employee workspace and Batch 4
  personal-student traceability; the redacted local design-board README, manifest, index and page matrix.
- Latest B7 learner closeout and 0704 learner non-AI acceptance plan/evidence/audit; B-F serial plan, standing
  authorization, PIC ledger, E0 inventory, E1-E3 closeouts, Module Run v3 and closeout/archive SOPs.
- Complete learner shell, home, organization-training and personal-AI implementations plus focused learner/auth/training
  tests. The remaining learner route implementations are regression consumers because current closeouts show no fresh gap.

The source hierarchy and time sequence leave no unresolved business conflict. No current-baseline failure permits reopening
A01-A30 or superseded AI issue classes.

## Baseline Application

- Batch 3 P1 requires organization training to default to a compact list with status, deadline, progress and one primary
  action; the first screen shows assigned, due-soon, in-progress, submitted and not-started counts; selecting one training
  exposes only that training's questions and answers.
- Batch 3 P2 requires server-derived employee organization context, accessible success/error feedback and mobile-first
  learner interaction. Batch 4 keeps personal AI context explicit, standard edition fail-closed and history private.
- Shell, home, practice, mock/report, mistake-book, profile, login/register and personal AI receive focused regression only.
  Organization training owns the implementation change.
- Deferred: cross-workspace aliases remain E5; cumulative route closure remains E6; role acceptance remains F. No
  credential, raw design-board data, database, Provider, external behavior or deployment is needed.

## Design

1. Keep the visible-training API and service authorization unchanged. Derive pure learner-facing status, primary action
   and due-soon summary data from the returned safe DTO; do not put question stems or answers in the default list DOM.
2. Track one selected `trainingVersionPublicId`. The list shows five summary metrics and compact cards. `开始训练`,
   `继续训练` or `查看结果` opens a single full-width mobile workspace; `返回训练列表` removes it from the DOM.
3. Treat submitted/read-only assignments as read-only: answer inputs and save/submit controls are unavailable while the
   existing result path remains accessible. Preserve exact score, analysis and correct-answer disclosure rules.
4. Separate list-load denial presentation: standard organization edition (`409076`) receives the approved upgrade-needed
   state; absent employee organization context (`403074`) receives the context-recovery state. A mutation-time stale
   lifecycle denial stays local to the selected training and asks the learner to return and refresh instead of collapsing
   the whole route.
5. Add per-training in-flight action state so repeated save/submit/result clicks cannot emit duplicate requests; announce
   completion or safe failure exactly once with `role=status` or `role=alert`.

## Boundary Guards

- Organization identity and authorization remain server-derived. No organization, authorization, edition or quota selector
  is introduced and no direct URL can elevate a standard or unbound employee.
- List markup contains no question stem, raw answer, standard answer or analysis. The selected workspace contains only the
  chosen safe DTO. No cross-training answer state is reused.
- Submitted/read-only answers cannot be mutated. Save and submit remain bound to the existing answer API and lifecycle;
  no formal `question`/`paper`, `mock_exam`, personal-AI history or organization-private training-domain write is added.
- Personal AI remains five-zone, explicit-context and fail-closed. Historical paper resume remains snapshot-gated. No
  A01-A30, AI Provider, schema, dependency, build-config, test-infrastructure or deployment mutation.

## Allowed Changes

- `src/features/student/organization-training/StudentOrganizationTrainingPage.tsx`
- `tests/unit/organization-training-employee-entry-surface.test.ts`
- narrowly necessary learner regression tests only if a fresh failure proves a shared contract defect
- E4 plan/evidence/audit, active state/queue/history and PIC ledger declared by the queue

## Execution

- [x] RED: change the focused UI test to require summary-only default markup, five counts, one selected workspace,
      back-to-list cleanup, read-only submitted behavior, distinct `409076`/`403074` states, local stale-lifecycle feedback and
      duplicate-action suppression; run only that test and record the expected failures.
- [x] GREEN: implement the smallest organization-training presentation/state change; rerun the focused test until green.
- [x] Run learner shell/home/practice/mock-report/mistake/profile/auth, organization-training, personal-AI and protected
      authorization/training/AI suites serially. Fix only fresh E4-scope regressions.
- [x] Run lint, typecheck, changed-file Prettier and diff checks. Because E4 touches R3 authorization/training presentation,
      run the full unit suite and required build serially, then recovery/serial/security Guards.
- [x] Conduct review round 1 and round 2, repair findings and rerun affected gates. Update concise evidence, independent
      audit, state/queue/history and PIC ledger; pass pre-commit, closeout and pre-push Guards.

Closeout intent: create one principal commit, ff-only merge to `master`, push `origin/master`, verify
local/tracking/remote equality, remove the E4 worktree/branch, and start E5 automatically. Do not deploy. Git-derived
closeout facts are reconciled by the next task checkpoint rather than an evidence-only follow-up commit.

## Validation

- RED/GREEN command: `D:\tiku\node_modules\.bin\vitest.cmd run tests/unit/organization-training-employee-entry-surface.test.ts`.
- Focused learner and protected-domain suites use explicit file paths; heavy gates run serially.
- Quality gates use the locked executables in `D:\tiku\node_modules\.bin` for ESLint, TypeScript, Prettier, Vitest and
  Next build because the workstation pnpm launcher is unavailable; then run `git diff --check` and the repository Guard
  commands discovered from the mechanism SSOT. No dependency install or mutation is required.
- The ff-only merge contains the verified task commit, so the full regression is not mechanically repeated after merge.

## Adversarial Review

- Round 1: summary/count correctness, due/deadline semantics, selected-training isolation, answer/result lifecycle, exact
  authorization denial mapping, accessible feedback, contract coverage and data integrity.
- Round 2: malformed/missing context, standard direct-route escalation, stale assignment, expired deadline, double click,
  submitted mutation, cross-training answer leakage, all-question default exposure, private/raw data leakage, personal-AI
  regression, keyboard/mobile usability, magic styling and over-generalization.

Closeout uses one principal commit, ff-only merge, ordinary authorized push, remote equality proof and isolated-resource
cleanup. E5 starts automatically; deployment remains outside this goal.
