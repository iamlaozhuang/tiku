# AI generation route contract alignment evidence

## Boundary

- Task id: `ai-generation-route-contract-alignment-2026-07-02`
- Branch: `codex/ai-generation-route-contract-alignment`
- Scope: local route contract source/test alignment.
- Provider/browser/DB/dependency/schema/deploy executed: false at task start.
- Evidence mode: file paths, task ids, status categories, counts, and validation command results only.

## Requirement Mapping Result

| Requirement source                       | Mapping                                                                                               |
| ---------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| `UC-ADV-AI-TASK-LIFECYCLE`               | Route outcomes must normalize Provider execution states before task presentation.                     |
| `UC-ADV-PERSONAL-AI-QUESTION-GENERATION` | Personal AI出题 must expose an acceptable structured result on mocked success.                        |
| `UC-ADV-PERSONAL-AI-PAPER-GENERATION`    | Personal AI组卷 must expose an acceptable paper draft result on mocked success.                       |
| `UC-ADV-ORG-ADMIN-AI-GENERATION`         | Organization admin routes must share the same success and failure outcome categories.                 |
| `UC-ADV-CONTENT-ADMIN-AI-GENERATION`     | Content admin routes must keep AI output as reviewable drafts and return standard transport shape.    |
| `ADR-002`                                | Route handlers and adapters must remain thin and return standard `{ code, message, data }` envelopes. |

## Initial Findings

- Admin AI组卷 mocked success fixtures used the pre-contract paper draft shape and failed current `paper_draft` parsing.
- Personal route had a mocked `question_set` success path but lacked explicit `paper_draft`, malformed-output, and insufficient-evidence route acceptance checks.
- Provider/browser/DB/dependency/schema/deploy remain blocked.

## Validation

## Implementation Result

- Admin paper mocked success fixture aligned to the current structured `paper_draft` contract.
- Personal route tests added for mocked `paper_draft` success, malformed output safe failure, and insufficient-evidence pre-Provider block.
- Source route implementation changed: false.
- Provider/browser/DB/dependency/schema/deploy executed: false.

## Validation Results

| Gate                         | Result  | Summary                     |
| ---------------------------- | ------- | --------------------------- |
| Focused unit tests           | pass    | 2 files, 53 tests           |
| Lint                         | pass    | eslint completed            |
| Typecheck                    | pass    | `tsc --noEmit` completed    |
| Scoped Prettier write        | pass    | 10 files in task scope      |
| Scoped Prettier check        | pass    | all matched files formatted |
| Git diff whitespace check    | pass    | no whitespace errors        |
| Module Run v2 pre-commit     | pass    | 7 scoped files scanned      |
| Module Run v2 pre-push       | pass    | local readiness passed      |
| Real Provider call           | skipped | blocked by task boundary    |
| Browser/runtime walkthrough  | skipped | blocked by task boundary    |
| Database connection/mutation | skipped | blocked by task boundary    |

## Acceptance Result

- Mocked Provider success creates acceptable `question_set` and `paper_draft` results: pass.
- Mocked malformed JSON returns safe failure and does not persist a draft: pass.
- Mocked insufficient RAG returns insufficient-evidence without Provider execution: pass.
- Admin and personal routes return standard `{ code, message, data }`: pass.

## Residual / Next Task

- Next task remains `ai-generation-cross-surface-ui-regression-matrix-2026-07-02`.
- This task did not claim release readiness, final Pass, production usability, browser validation, or bounded Provider validation.
