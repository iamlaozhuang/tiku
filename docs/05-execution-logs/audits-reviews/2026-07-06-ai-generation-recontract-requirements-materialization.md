# 2026-07-06 AI Generation Recontract Requirements Materialization Audit Review

## Scope

- Task id: `ai-generation-recontract-requirements-materialization-2026-07-06`
- Review mode: adversarial docs-only review
- Source code review or fix: not performed
- Provider/runtime/browser/DB validation: not performed

## Primary Finding

The current implementation baseline and recent local acceptance evidence prove the older AI组卷 behavior only:

- Provider can produce a structured `paper_draft` preview with nested generated question drafts in bounded samples;
- local loops can move those generated drafts through learner, organization training, and content review paths.

That evidence does not prove the new requirement contract, because the new contract says AI组卷 must produce an assembly
plan and then select existing formal questions locally.

## Adversarial Checks

| Check                                                                                   | Result                                                                                       |
| --------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| Did the new document distinguish AI出题 from AI组卷?                                    | Pass. AI出题 generates complete question drafts; AI组卷 generates plan only.                 |
| Did the document define platform formal source?                                         | Pass. Platform formal source is current `question.status = available`.                       |
| Did the document define enterprise question bank v1?                                    | Pass. Same-organization published and not taken-down enterprise training question snapshots. |
| Did the document exclude AI-generated drafts from AI组卷 sources by default?            | Pass.                                                                                        |
| Did the document cover all four eligible roles?                                         | Pass.                                                                                        |
| Did the document preserve standard-role denial?                                         | Pass.                                                                                        |
| Did the document record default and maximum quantities?                                 | Pass.                                                                                        |
| Did the document require explainable degradation instead of generic failure?            | Pass.                                                                                        |
| Did the document require a paper container?                                             | Pass.                                                                                        |
| Did the document include organization advanced admin UI?                                | Pass.                                                                                        |
| Did the document require all-Chinese user-facing UI and forbid technical visible terms? | Pass.                                                                                        |
| Did the document avoid claiming implementation completion?                              | Pass.                                                                                        |
| Did the document avoid staging/prod/Cost Calibration claims?                            | Pass.                                                                                        |

## Current Implementation Gaps Now Explicit

These are not fixed by this task and must be split into later source tasks:

1. AI组卷 Provider instruction currently asks for generated questions instead of an assembly plan.
2. AI组卷 parsing currently accepts nested generated question drafts.
3. Content formal adoption currently maps generated question drafts into companion formal drafts instead of selecting
   existing formal platform questions.
4. Learner UI currently risks treating AI出题 / AI组卷 buttons as mode switches while they submit.
5. Quantity defaults are inconsistent with the new 3/30 contract.
6. Learner AI组卷 lacks a visible target question-count control.
7. Enterprise question-bank v1 selection from organization training snapshots needs a service contract.
8. Paper container DTO and UI states need implementation.

## Risk Register

| Risk                                                                       | Mitigation                                                                                          |
| -------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| Future tasks may keep old Provider-generated paper draft semantics.        | New traceability overlay and indexes explicitly redefine AI组卷.                                    |
| Old local runtime acceptance may be overclaimed.                           | Evidence and overlay state old evidence is historical and not proof of new contract implementation. |
| Implementation may bundle too much.                                        | Overlay splits follow-up packets.                                                                   |
| UI may expose technical terms or English.                                  | Overlay requires all-Chinese user-facing wording and lists forbidden technical terms.               |
| Enterprise question source may be misunderstood as a new standalone table. | Overlay defines enterprise question bank v1 as published organization training snapshots.           |

## Three-Round Self-Check Result

Pass.

- Round 1 requirement completeness: all confirmed product decisions, four eligible roles, quantity limits, source
  definitions, degradation behavior, knowledge coverage, paper containers, and UI/UX requirements are represented.
- Round 2 contradiction and supersession: old local runtime evidence is preserved as historical baseline only and is not
  claimed as implementation proof for the new AI组卷 contract; standard-role denial and release/staging/prod/Cost
  Calibration non-claims remain explicit.
- Round 3 implementation readiness and redaction: implementation is split into follow-up packets; this task changed only
  docs/state files; evidence remains aggregate and redacted.

## Review Conclusion

The docs-only materialization is complete for this task and safe to use as the next AI generation requirement baseline.
Formatting, diff, lint, typecheck, and Module Run v2 checks passed. It must not be treated as implementation completion.
