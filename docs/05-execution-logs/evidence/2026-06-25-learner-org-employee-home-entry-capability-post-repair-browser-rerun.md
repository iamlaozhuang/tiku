# Learner/Org Employee Home Entry Capability Post-Repair Browser Rerun Evidence

Task id: `learner-org-employee-home-entry-capability-post-repair-browser-rerun-2026-06-25`

Branch: `codex/home-entry-browser-rerun-20260625`

## Scope

Four-row local real-browser rerun after the effective authorization capability-discovery repair.

Rows:

- `personal_standard_student`
- `personal_advanced_student`
- `org_standard_employee`
- `org_advanced_employee`

## Redaction Policy

Evidence records no account identifiers, passwords, credential values, tokens, cookies, local/session storage,
Authorization headers, raw page dumps, screenshots, traces, DB rows, Provider payloads, prompts, generated content, raw
answer text, or private credential file content.

Credential read and entry were approved by `current_user_message_allow_input_or_read_credentials_2026_06_25`; credential
values remain redacted.

## Requirement Mapping Result

- R5: advanced personal learner must discover `AI训练`; standard personal learner must not receive advanced AI
  generation capability.
- R6: advanced organization employee must discover `AI训练` and `企业训练`; standard organization employee must discover
  neither and must not enter enterprise-training workflow by manual URL.
- Organization training module: standard employees cannot access training by menu or manual URL; URL-only access is not a
  valid advanced acceptance substitute.

## Runtime Result

Status: blocked evidence closeout.

| Row                         | Landing | Home entry result                    | Direct route result                                                                                | Logout | Result | Notes                                                                                       |
| --------------------------- | ------- | ------------------------------------ | -------------------------------------------------------------------------------------------------- | ------ | ------ | ------------------------------------------------------------------------------------------- |
| `personal_standard_student` | `/home` | No `AI训练`; no `企业训练`           | `/ai-generation` reached without login prompt or denial; `AI训练` and `AI出题` workflow visible    | pass   | fail   | Home entry boundary is correct; direct AI route guard remains open for a standard learner.  |
| `personal_advanced_student` | `/home` | `AI训练` visible; no `企业训练`      | `/ai-generation` reached without login prompt; AI workflow visible                                 | pass   | pass   | Source repair closed the missing home AI entry for this row.                                |
| `org_standard_employee`     | `/home` | No `AI训练`; no `企业训练`           | `/ai-generation` workflow visible; `/organization-training` reached an empty state, not a workflow | pass   | fail   | Standard employee direct AI route guard remains open. Training direct workflow not reached. |
| `org_advanced_employee`     | `/home` | `AI训练` visible; `企业训练` visible | `/ai-generation` workflow visible; `/organization-training` reached an authenticated empty state   | pass   | fail   | Home entries are correct; assigned enterprise-training workflow is still not proven.        |

Runtime counters:

| Metric                                            | Value |
| ------------------------------------------------- | ----- |
| Rows executed                                     | 4     |
| Pass rows                                         | 1     |
| Fail/blocker rows                                 | 3     |
| Standard direct AI route workflow visible         | yes   |
| `org_standard_employee` training workflow reached | no    |
| Full eight-row rerun executed                     | no    |
| Final Pass claimed                                | no    |

## Acceptance Mapping Result

- R5 remains blocked because `personal_standard_student` can still reach the direct learner AI workflow even though the
  `/home` entry is hidden.
- R6 remains blocked because `org_standard_employee` can still reach the direct learner AI workflow even though both
  `/home` advanced entries are hidden.
- The user-specified `org_standard_employee` direct `/organization-training` workflow condition was not met: the route
  showed an authenticated empty state instead of an answer workflow.
- `org_advanced_employee` now discovers both `AI训练` and `企业训练` on `/home`, but the enterprise-training answer workflow
  is not proven because `/organization-training` showed an empty state.
- Full eight-row runtime acceptance remains blocked and was not executed.

## Validation

- Local browser runtime four-row rerun: blocked evidence recorded.
- `npx.cmd prettier --write --ignore-unknown ...`: passed.
- `npx.cmd prettier --check --ignore-unknown ...`: passed.
- `git diff --check`: passed.
- First `Test-ModuleRunV2PreCommitHardening.ps1` run failed because the task plan omitted
  `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md` from the SSOT read list.
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId learner-org-employee-home-entry-capability-post-repair-browser-rerun-2026-06-25`: passed after SSOT read-list repair.
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId learner-org-employee-home-entry-capability-post-repair-browser-rerun-2026-06-25 -SkipRemoteAheadCheck`: passed.

## Conclusion

Primary result:
`blocked_standard_direct_ai_route_workflow_visible_home_entries_repaired_no_full_eight_row_no_final_pass`.

Next minimal source repair recommendation:
`learner-org-employee-ai-direct-route-authorization-guard-repair-2026-06-25`.

Scope note for the next repair: add a focused direct-route authorization guard for learner AI generation so standard
personal learners and standard organization employees receive a denied or unavailable state instead of the `AI训练`
workflow. Keep DB/seed/schema/migration, real browser rerun, `.env*`, Provider, Cost, staging/prod, payment, and external
services blocked unless separately approved.

No Standard/Advanced MVP final Pass is claimed.
