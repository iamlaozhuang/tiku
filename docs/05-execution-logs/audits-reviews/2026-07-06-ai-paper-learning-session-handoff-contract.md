# 2026-07-06 AI Paper Learning Session Handoff Contract Audit Review

## Adversarial Review

- Blocking finding: none in the local source/unit scope validated so far.
- Prior gap: personal/employee AI组卷 `paperAssembly` selected only formal question references, while learning sessions required generated question draft content. This made the preview-to-answer handoff incomplete.
- Fix direction: add an explicit service contract that accepts the redacted local assembly container and server-side formal source question content.
- Guardrail: Provider paper plan still cannot become answerable question content; selected formal source content is required for every selected question.

## Contract Review

- Source categories accepted: platform formal question and enterprise training snapshot.
- Source matching key: source category plus public id.
- Score source: local paper assembly selected score.
- Missing source behavior: blocked with `selected_question_source_missing`, with no session saved.
- Empty selected set behavior: blocked with `no_usable_selected_questions`.
- Grounding and source result gates: sufficient evidence and source result id are still required.
- AI出题 preservation: the existing `visibleGeneratedContent` creation path remains separate and unit-covered.

## Residual Risk

- Source/unit: pass for service-level handoff and related route regressions after focused validation.
- DB-backed runtime: not tested; repository hydration for source question content is not claimed in this task.
- Browser/UI: not tested; frontend preview/start action wiring remains separate.
- Provider-disabled: not tested.
- Provider-enabled small sample: not tested.
- Staging: not executed; requires fresh approval.
- Cost Calibration: not executed; requires fresh approval.
- Release readiness: not claimed.
- Production usability: not claimed.

## Follow-up Boundary

- Next package should wire the personal/employee frontend preview/start flow to this backend handoff contract.
- Repository-backed source hydration can be implemented separately if the route needs server-side lookup before browser acceptance.
