# Learner Org Employee AI Runtime Cookie Session Post Repair Browser Rerun Evidence

Task id: learner-org-employee-ai-runtime-cookie-session-post-repair-browser-rerun-2026-06-25

Branch: codex/ai-cookie-rerun-20260625

Status: closed

## Approval Boundary

- Browser execution approval: current user approved execution of the recommended next step on 2026-06-25.
- Credential handling approval: prior current-user message on 2026-06-25 allowed credential input or credential reads.
- Evidence records no account identifiers, passwords, credential values, tokens, cookies, local/session storage, Authorization headers, raw page dumps, screenshots, traces, DB rows, Provider payloads, prompts, or generated content.

## Scope

Rows in scope:

- `personal_standard_student`
- `personal_advanced_student`
- `org_standard_employee`
- `org_advanced_employee`

Primary post-repair check: authenticated direct personal AI generation route should not show the login prompt.

## Requirement Mapping Result

This browser rerun maps to R5/R6 in `docs/01-requirements/traceability/2026-06-24-role-separated-mvp-requirement-alignment.md` and the learner/employee role rows in `docs/01-requirements/traceability/role-experience-fulfillment-matrix.md`. It validates the post-repair browser symptom for cookie-backed session recognition on the direct personal AI route only. It does not close broader entry visibility, organization training guard, full eight-row runtime acceptance, authorization policy, Provider, Cost Calibration, or final MVP Pass scope.

## Runtime Observation Matrix

| Role row                    | Login landing path | Direct AI route status                                         | Home entry observation                        | Organization training observation                     | Logout status          | Console error/warn count | Primary result | Redacted notes                                                                                                          |
| --------------------------- | ------------------ | -------------------------------------------------------------- | --------------------------------------------- | ----------------------------------------------------- | ---------------------- | ------------------------ | -------------- | ----------------------------------------------------------------------------------------------------------------------- |
| `personal_standard_student` | `/home`            | `/ai-generation` reached; no login prompt; AI controls visible | AI entry not visible; enterprise entry absent | route did not expose a training workflow for this row | visible logout clicked | 0                        | pass           | Cookie-backed session no longer misclassifies the authenticated standard learner as unauthenticated on direct AI route. |
| `personal_advanced_student` | `/home`            | `/ai-generation` reached; no login prompt; AI controls visible | AI entry still not visible; enterprise absent | route did not expose a training workflow for this row | visible logout clicked | 0                        | pass           | Direct AI route session residual is closed; home AI entry visibility remains a separate residual.                       |
| `org_standard_employee`     | `/home`            | `/ai-generation` reached; no login prompt; AI controls visible | AI entry not visible; enterprise entry absent | `/organization-training` reached employee workflow    | visible logout clicked | 0                        | pass           | Direct AI route session residual is closed; organization training guard behavior remains a separate residual.           |
| `org_advanced_employee`     | `/home`            | `/ai-generation` reached; no login prompt; AI controls visible | AI entry still not visible; enterprise absent | `/organization-training` reached employee workflow    | visible logout clicked | 0                        | pass           | Direct AI route session residual is closed; home AI and enterprise-training entry visibility remains separate residual. |

## Runtime Summary

| Metric                             | Result |
| ---------------------------------- | ------ |
| Rows in scope                      | 4      |
| Authenticated rows observed        | 4      |
| Direct AI no-login-prompt rows     | 4      |
| Primary pass rows                  | 4      |
| Primary fail rows                  | 0      |
| Blocked rows                       | 0      |
| Full eight-row gate executed       | false  |
| Browser storage or credential leak | false  |
| DB/source/schema/env/provider work | false  |
| Standard/Advanced final Pass claim | false  |

Primary result: `pass_four_row_cookie_session_ai_route_browser_rerun_no_login_prompt_no_final_pass`.

## Remaining Residuals Observed

- Learner/employee home AI entry visibility remains missing for the rows sampled.
- Organization employee enterprise-training entry visibility remains missing from `/home`; direct `/organization-training` remains reachable for employee rows.
- Personal rows did not expose an organization training workflow; this was secondary observation only.
- Full eight-row role-separated acceptance remains blocked until separately rerun and passed.

## Validation Results

- `npx.cmd prettier --write --ignore-unknown ...`: passed.
- `npx.cmd prettier --check --ignore-unknown ...`: passed.
- `git diff --check`: passed.
- First `Test-ModuleRunV2PreCommitHardening.ps1` run failed because the plan used an `Inputs Read` heading and omitted explicit requirement SSOT mapping. The plan/evidence were repaired to include `SSOT Read List` and `Requirement Mapping Result`.
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId learner-org-employee-ai-runtime-cookie-session-post-repair-browser-rerun-2026-06-25`: passed after SSOT documentation repair.
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId learner-org-employee-ai-runtime-cookie-session-post-repair-browser-rerun-2026-06-25 -SkipRemoteAheadCheck`: passed.

## Result

Browser runtime primary check passed for the four in-scope rows. No Standard/Advanced MVP final Pass is claimed.
