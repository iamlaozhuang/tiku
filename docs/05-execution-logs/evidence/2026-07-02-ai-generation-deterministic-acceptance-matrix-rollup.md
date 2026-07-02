# AI generation deterministic acceptance matrix rollup evidence

## Boundary

- Task id: `ai-generation-deterministic-acceptance-matrix-rollup-2026-07-02`
- Branch: `codex/ai-generation-deterministic-acceptance-matrix-rollup`
- Scope: docs/state deterministic rollup only.
- Source/test/runtime code changed: false at task start.
- Provider/browser/DB/dependency/schema/deploy executed: false at task start.
- Evidence mode: task ids, commit prefixes, status categories, counts, and validation command results only.

## Deterministic Task Rollup

| Order | Task id                                                         | Commit      | Result                         | Deterministic validation                                | Provider executed |
| ----- | --------------------------------------------------------------- | ----------- | ------------------------------ | ------------------------------------------------------- | ----------------- |
| 0     | `ai-generation-shared-structured-contract-goal-plan-2026-07-02` | `e9644f024` | child templates materialized   | 3 focused files, 50 tests; lint/typecheck/Module passed | false             |
| 1     | `ai-generation-shared-task-spec-contract-2026-07-02`            | `10645915e` | shared count contract aligned  | 5 focused files, 59 tests; lint/typecheck/Module passed | false             |
| 2     | `ai-generation-structured-preview-parser-hardening-2026-07-02`  | `a818f387a` | parser count handling hardened | 1 focused file, 24 tests; lint/typecheck/Module passed  | false             |
| 3     | `ai-generation-provider-instruction-unification-2026-07-02`     | `5c77d912b` | instruction builder unified    | 3 focused files, 20 tests; lint/typecheck/Module passed | false             |
| 4     | `ai-generation-route-contract-alignment-2026-07-02`             | `5fe649955` | route result contracts aligned | 2 focused files, 53 tests; lint/typecheck/Module passed | false             |
| 5     | `ai-generation-cross-surface-ui-regression-matrix-2026-07-02`   | `9673a205c` | cross-surface UI matrix locked | 4 focused files, 59 tests; lint/typecheck/Module passed | false             |

## Role And Task Matrix

| Surface            | AI出题 deterministic coverage                                    | AI组卷 deterministic coverage                                    | Runtime boundary |
| ------------------ | ---------------------------------------------------------------- | ---------------------------------------------------------------- | ---------------- |
| Content admin      | shared task count, shared instruction, route success/failure, UI | paper total count, shared instruction, route success/failure, UI | Provider blocked |
| Organization admin | shared task count, shared instruction, route contract parity, UI | paper total count, shared instruction, route contract parity, UI | Provider blocked |
| Student learner    | shared task count, shared instruction, route success/failure, UI | paper total count, shared instruction, route success/failure, UI | Provider blocked |

## Parser Coverage

- AI出题 requested question count: covered by shared task spec and parser tests.
- AI出题 supported roots: `questions`, `questionDrafts`, `question_drafts`.
- AI组卷 total question count: covered through top-level count fields, section count, nested drafts, and distribution totals.
- AI组卷 safe failure categories: missing count and count mismatch.

## Validation Results

| Gate                         | Result  | Summary                     |
| ---------------------------- | ------- | --------------------------- |
| Existing focused tests       | pass    | 11 files, 161 tests         |
| Lint                         | pass    | eslint completed            |
| Typecheck                    | pass    | `tsc --noEmit` completed    |
| Scoped Prettier write        | pass    | 5 docs/state files          |
| Scoped Prettier check        | pass    | all matched files formatted |
| Git diff whitespace check    | pass    | no whitespace errors        |
| Module Run v2 pre-commit     | pass    | 5 scoped files scanned      |
| Module Run v2 pre-push       | pass    | local readiness passed      |
| Real Provider call           | skipped | blocked by task boundary    |
| Browser/runtime walkthrough  | skipped | blocked by task boundary    |
| Database connection/mutation | skipped | blocked by task boundary    |
| Source/test file change      | skipped | blocked by task boundary    |

## Acceptance Result

- Each deterministic task is listed with commit, result, validation status, and Provider execution status: pass.
- Content admin, organization admin, and student rows are recorded for AI出题 and AI组卷: pass.
- Zero real Provider calls in deterministic tasks: pass.
- Parser coverage for requested question count and paper total question count is recorded: pass.
- Source/test/runtime/provider/browser/DB/dependency/schema/deploy actions remained blocked: pass.

## Residual / Next Task

- Next task remains `ai-generation-bounded-provider-rerun-after-structured-contract-2026-07-02`.
- This task did not claim release readiness, final Pass, production usability, browser validation, or bounded Provider validation.
