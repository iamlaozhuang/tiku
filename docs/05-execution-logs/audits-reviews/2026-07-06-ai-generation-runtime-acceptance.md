# 2026-07-06 AI Generation Runtime Acceptance Audit Review

## Findings

1. `high` Standard organization employee backend bypass was reproduced on the personal AI generation request route before the fix.
   - Impact: UI-hidden advanced entry was insufficient; direct POST could enter the accepted generation path.
   - Resolution: fixed in `edd48ccfb` by requiring service-computed advanced effective authorization before local-browser personal AI generation persistence/Provider bridge.
   - Verification: targeted RED/GREEN unit test, typecheck, lint, and runtime direct POST rejection with API code `403057`.

2. `medium` 0704 DB was not initially aligned with current closed-loop runtime schema.
   - Impact: learner and organization runtime closed loops could not be trusted until required tables/columns existed.
   - Resolution: executed only the two reviewed non-destructive migration files already present in source.
   - Verification: post-precheck showed required tables/columns present; no destructive DB operation executed.

3. `low` `personal_standard_student` role matrix remains blocked by missing current 0704 private fixture input.
   - Impact: no positive browser denial claim is made for that role in this evidence.
   - Mitigation: standard organization employee/admin denial covered both UI and backend; personal standard should be rerun only when a current 0704 fixture is supplied or provisioned under a separate approved task.

## Residual Risk

- Runtime evidence is local-only and DB-backed; it does not prove staging/prod readiness.
- Provider samples are intentionally small; they prove parse/grounding/count behavior, not cost calibration or broad model quality.
- Organization training publish used generated structured summaries to build a training snapshot without exposing content in evidence; this proves persistence and workflow, not pedagogical quality.
- Content formal adoption proved paper draft creation and rejection boundary; direct publish remained blocked.

## Redaction Review

- No screenshots, DOM dumps, traces, cookies, sessions, tokens, env values, DB URLs, raw rows, internal numeric ids, raw prompt, raw Provider output, Provider payload, full question, full paper, or material content were added.
- Evidence uses role labels, aggregate counts, business response codes, status labels, and pass/block summaries only.

## Acceptance Mapping Result

- Role-separated AI rows were mapped against the 2026-06-24 role alignment and role-experience matrix.
- `personal_standard_student` remains a fixture gap and is not claimed as pass.
- `org_standard_employee`, `org_standard_admin`, `org_advanced_employee`, `org_advanced_admin`, `personal_advanced_student`, and `content_admin` have current runtime evidence for the requested AI boundaries.
- `ops_admin` is outside this AI generation runtime acceptance task and receives no new claim.

## Decision

- Runtime acceptance can be recorded as local DB/browser/Provider small-sample pass with the explicit exclusions in evidence.
- Do not claim release readiness, production usability, final Pass, staging/prod health, or Cost Calibration.
