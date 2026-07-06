# 2026-07-06 AI Paper Learning Session Route Handoff Contract Audit Review

## Adversarial Review

- Blocking finding: none in the local source/unit scope validated so far.
- Prior gap: route accepted only the AI出题 `visibleGeneratedContent` path, so AI组卷 `paperAssembly` could not enter the learning-session handoff contract.
- Fixed behavior: when `paperAssemblyContainer` is present, route now uses the AI组卷 handoff path and server-side source resolver.
- Guardrail: client-supplied source question content is ignored; route uses resolver output only.

## Contract Review

- AI组卷 route input: `paperAssemblyContainer` plus existing result/task identifiers and grounding summary.
- Source content boundary: server-side resolver only.
- Owner scope: existing personal/organization scope resolver is reused.
- Failure behavior: incomplete resolver output becomes `selected_question_source_missing`; no partial session is saved.
- AI出题 preservation: existing route path remains separate and unit-covered.

## Residual Risk

- Source/unit: pass for route-level handoff and related regression after focused validation.
- DB-backed resolver wiring: not implemented; the route dependency exists but default app route wiring remains a follow-up.
- Browser/UI: not tested; frontend preview/start action remains separate.
- Provider-disabled: not tested.
- Provider-enabled small sample: not tested.
- Staging: not executed; requires fresh approval.
- Cost Calibration: not executed; requires fresh approval.
- Release readiness: not claimed.
- Production usability: not claimed.

## Follow-up Boundary

- Next backend package should wire the default app route to a DB-backed source-question resolver without opening DB runtime in source/unit validation.
- After that, learner/employee UI can safely connect preview and `开始作答` without creating a fake front-end-only closure.
