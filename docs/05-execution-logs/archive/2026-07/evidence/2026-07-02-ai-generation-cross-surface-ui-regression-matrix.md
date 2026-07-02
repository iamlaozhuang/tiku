# AI generation cross-surface UI regression matrix evidence

## Boundary

- Task id: `ai-generation-cross-surface-ui-regression-matrix-2026-07-02`
- Branch: `codex/ai-generation-cross-surface-ui-regression-matrix`
- Scope: local UI source/test regression matrix.
- Provider/browser/DB/dependency/schema/deploy executed: false at task start.
- Evidence mode: file paths, task ids, coverage matrix rows, status categories, counts, and validation command results only.

## Requirement Mapping Result

| Requirement source                       | Mapping                                                                                          |
| ---------------------------------------- | ------------------------------------------------------------------------------------------------ |
| `UC-ADV-CONTENT-ADMIN-AI-GENERATION`     | Content admin AI出题 and AI组卷 are reviewable drafts, not formal content writes.                |
| `UC-ADV-ORG-ADMIN-AI-GENERATION`         | Organization admin AI出题 and AI组卷 are organization-owned advanced-only draft workflows.       |
| `UC-ADV-PERSONAL-AI-QUESTION-GENERATION` | Advanced learners can use AI出题 from the learner AI training entry.                             |
| `UC-ADV-PERSONAL-AI-PAPER-GENERATION`    | Advanced learners can use AI组卷 from the learner AI training entry.                             |
| `UC-ADV-EMPLOYEE-AI-GENERATION`          | Advanced employees can use learner AI generation through organization authorization context.     |
| `UC-ADV-FORMAL-CONTENT-SEPARATION`       | Generated content remains isolated from formal `question`, `paper`, `practice`, and `mock_exam`. |
| `ADR-003`                                | Admin UI stays desktop-first; learner UI stays mobile-first.                                     |
| `ADR-007`                                | UI visibility is not an authorization boundary; effective authorization stays service-computed.  |

## Initial Findings

- Content admin and organization admin already reuse `AdminAiGenerationEntryPage`; reuse appears intentional and role-scoped by `workspace` plus `generationKind`.
- Student AI training uses a separate `StudentPersonalAiGenerationPage`; this keeps mobile-first learner layout separate from admin desktop surfaces.
- Existing tests cover many state slices, but the matrix needs an explicit rollup to prevent later changes from silently dropping a role/task/state row.
- Provider/browser/DB/dependency/schema/deploy remain blocked.

## Coverage Matrix

| Surface            | Task kind | Success/state coverage                                      | Failure/blocked coverage                          | History/detail coverage                                         | Redaction coverage |
| ------------------ | --------- | ----------------------------------------------------------- | ------------------------------------------------- | --------------------------------------------------------------- | ------------------ |
| Content admin      | AI出题    | shared admin route, controls, local summary, review actions | request/history error, insufficient evidence      | task history, review traceability                               | pass               |
| Content admin      | AI组卷    | shared admin route, controls, `paper_draft` preview counts  | request/history error                             | task history                                                    | pass               |
| Organization admin | AI出题    | shared admin route, controls, organization draft surface    | standard admin unavailable, history empty/error   | task history                                                    | pass               |
| Organization admin | AI组卷    | shared admin route, controls, organization draft summary    | standard admin unavailable, insufficient evidence | task history, organization next-step guidance                   | pass               |
| Student learner    | AI出题    | learner action, payload contract, transient preview         | unavailable, blocked, insufficient evidence       | request history, result history, result detail                  | pass               |
| Student learner    | AI组卷    | learner action, payload contract, `paper_draft` counts      | unavailable, blocked through shared learner flow  | task-type isolated request/result history, shared detail states | pass               |

## Validation Results

| Gate                         | Result  | Summary                                                        |
| ---------------------------- | ------- | -------------------------------------------------------------- |
| Baseline focused UI tests    | pass    | 4 files, 54 tests                                              |
| Focused UI tests             | pass    | 4 files, 59 tests                                              |
| Lint                         | pass    | eslint completed                                               |
| Typecheck                    | pass    | `tsc --noEmit` completed                                       |
| Scoped Prettier write        | pass    | 11 files in task scope                                         |
| Scoped Prettier check        | pass    | all matched files formatted                                    |
| Git diff whitespace check    | pass    | no whitespace errors                                           |
| Module Run v2 pre-commit     | pass    | initial missing task paths fixed; rerun scanned 7 scoped files |
| Module Run v2 pre-push       | pass    | initial missing task paths fixed; rerun local readiness passed |
| Real Provider call           | skipped | blocked by task boundary                                       |
| Browser/runtime walkthrough  | skipped | blocked by task boundary                                       |
| Database connection/mutation | skipped | blocked by task boundary                                       |

## Acceptance Result

- Content admin, organization admin, and student surfaces cover both AI出题 and AI组卷: pass.
- Success, failure, insufficient-evidence, blocked, history, and detail states are tested where applicable: pass.
- UI tests assert no raw payload, prompt, Provider response, token/session, Authorization header, localStorage value, or internal id is visible: pass.
- Admin desktop layout and student mobile-first layout remain separate: pass.
- Real Provider/browser/DB/dependency/schema/deploy remained blocked: pass.

## Residual / Next Task

- Next task remains `ai-generation-deterministic-acceptance-matrix-rollup-2026-07-02`.
- This task did not claim release readiness, final Pass, production usability, browser validation, or bounded Provider validation.
