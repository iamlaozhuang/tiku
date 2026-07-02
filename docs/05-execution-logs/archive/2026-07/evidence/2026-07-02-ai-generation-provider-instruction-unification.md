# AI generation Provider instruction unification evidence

## Boundary

- Task id: `ai-generation-provider-instruction-unification-2026-07-02`
- Branch: `codex/ai-generation-provider-instruction-unification`
- Scope: local source/test instruction builder reuse.
- Provider/browser/DB/dependency/schema/deploy executed: false at task start.
- Evidence mode: file paths, task ids, status categories, counts, and validation command results only.

## Requirement Mapping Result

| Requirement source                       | Mapping                                                                                                           |
| ---------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| `UC-ADV-AI-TASK-LIFECYCLE`               | Provider instructions must use one deterministic task contract before runtime execution.                          |
| `UC-ADV-PERSONAL-AI-QUESTION-GENERATION` | Personal AI出题 must use requested count and supported structured output roots.                                   |
| `UC-ADV-PERSONAL-AI-PAPER-GENERATION`    | Personal AI组卷 must request recognizable paper sections, distribution, coverage, and total question count.       |
| `UC-ADV-ORG-ADMIN-AI-GENERATION`         | Organization AI generation should share the same output contract with role-specific scene wording only.           |
| `UC-ADV-CONTENT-ADMIN-AI-GENERATION`     | Content AI generated output remains a reviewable draft and must not directly become formal content.               |
| `US-06-15`                               | Content backend AI draft/review requires AI出题 and AI组卷 semantics without prompt or Provider payload evidence. |

## Initial Findings

- Admin Provider instruction builder is private to the admin runtime bridge and hard-codes AI出题 count wording to 10.
- Personal Provider instruction builder is private to the personal runtime bridge and also hard-codes AI出题 count wording to 10.
- Admin and personal output contract wording can drift because neither consumes the shared task spec directly.

## Validation

## Implementation Result

- Shared Provider instruction builder added: 1 service file.
- Shared instruction tests added: 1 test file.
- Admin route bridge call sites delegated to shared builder: yes.
- Personal route Provider call sites delegated to shared builder: yes.
- Admin paper preview fixture count aligned with requested paper total: yes.
- Provider/browser/DB/dependency/schema/deploy executed: false.

## Validation Results

| Gate                         | Result  | Summary                     |
| ---------------------------- | ------- | --------------------------- |
| Focused unit tests           | pass    | 3 files, 20 tests           |
| Lint                         | pass    | eslint completed            |
| Typecheck                    | pass    | `tsc --noEmit` completed    |
| Scoped Prettier write        | pass    | 10 files in task scope      |
| Scoped Prettier check        | pass    | all matched files formatted |
| Git diff whitespace check    | pass    | no whitespace errors        |
| Module Run v2 pre-commit     | pass    | 10 scoped files scanned     |
| Module Run v2 pre-push       | pass    | local readiness passed      |
| Real Provider call           | skipped | blocked by task boundary    |
| Browser/runtime walkthrough  | skipped | blocked by task boundary    |
| Database connection/mutation | skipped | blocked by task boundary    |

## Acceptance Result

- Admin and personal routes call the same shared instruction builder: pass.
- Output field requirements share one builder and cannot drift by role: pass.
- Requested count, expected root fields, grounding-only rule, and forbidden metadata terms are covered by focused tests: pass.
- No real Provider call was made: pass.

## Residual / Next Task

- Next task remains `ai-generation-route-contract-alignment-2026-07-02`.
- This task did not claim release readiness, final Pass, production usability, or bounded Provider validation.
