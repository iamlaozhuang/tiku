# Learner/Org Employee AI Direct Route Guard Post-Repair Browser Rerun Evidence

Task id: `learner-org-employee-ai-direct-route-guard-post-repair-browser-rerun-2026-06-25`

Branch: `codex/ai-direct-route-guard-browser-rerun-20260625`

## Scope

Four-row local real-browser rerun after the learner AI direct-route authorization guard source repair.

Rows:

- `personal_standard_student`
- `personal_advanced_student`
- `org_standard_employee`
- `org_advanced_employee`

## Redaction Policy

Evidence records no account identifiers, passwords, credential values, tokens, cookies, local/session storage,
Authorization headers, raw page dumps, screenshots, traces, DB rows, Provider payloads, prompts, generated content, raw
answer text, raw credential file content, or private answer content.

Credential read and entry are approved by `current_user_goal_create_full_8_row_acceptance_2026_06_25`; credential values
remain redacted.

## Requirement Mapping Result

- Standard personal learners and standard organization employees must not enter advanced learner AI workflow by direct
  `/ai-generation`.
- Advanced personal learners and advanced organization employees must retain learner AI workflow when authorized.
- Standard organization employees must not enter organization training workflow by direct `/organization-training`.
- Advanced organization employee organization-training route result must be recorded because it gates the full 8-row
  rerun.

## Runtime Result

Status: blocked evidence closeout.

| Row                         | Landing | Home entry result               | Direct route result                                                       | Logout | Result | Notes                                                                                              |
| --------------------------- | ------- | ------------------------------- | ------------------------------------------------------------------------- | ------ | ------ | -------------------------------------------------------------------------------------------------- |
| `personal_standard_student` | `/home` | No `AI训练`; no `企业训练`      | `/ai-generation` unavailable; request button visible but disabled         | pass   | pass   | AI direct-route guard closed the prior standard personal learner workflow exposure.                |
| `personal_advanced_student` | `/home` | `AI训练` visible; no `企业训练` | `/ai-generation` workflow available; request button enabled               | pass   | pass   | Advanced personal learner AI workflow remains available.                                           |
| `org_standard_employee`     | `/home` | No `AI训练`; no `企业训练`      | `/ai-generation` unavailable; `/organization-training` empty, no workflow | pass   | pass   | AI direct-route guard closed. Standard employee did not enter organization-training answer flow.   |
| `org_advanced_employee`     | `/home` | `AI训练` and `企业训练` visible | `/ai-generation` workflow available; `/organization-training` empty state | pass   | fail   | Advanced employee organization-training workflow remains unproven; full 8-row rerun remains gated. |

Runtime counters:

| Metric                                            | Value |
| ------------------------------------------------- | ----- |
| Rows executed                                     | 4     |
| Pass rows                                         | 3     |
| Fail/blocker rows                                 | 1     |
| Standard direct AI route workflow visible         | no    |
| `org_standard_employee` training workflow entered | no    |
| `org_advanced_employee` training workflow proven  | no    |
| Full eight-row rerun executed                     | no    |
| Final Pass claimed                                | no    |

## Acceptance Mapping Result

- R5 direct AI blocker is closed for `personal_standard_student`: the direct route shows unavailable state instead of an
  enabled AI workflow.
- R6 direct AI blocker is closed for `org_standard_employee`: the direct route shows unavailable state instead of an
  enabled AI workflow.
- Standard organization employee direct `/organization-training` did not enter a workflow; it reached empty state with no
  submit action.
- `org_advanced_employee` still does not prove organization-training answer workflow because `/organization-training`
  also reached empty state.
- Full eight-row runtime acceptance remains blocked and was not executed.

## Validation

- Local browser runtime four-row rerun: blocked evidence recorded.
- Browser credential read and entry were executed only for the four local role rows; evidence is redacted.
- `npx.cmd prettier --write --ignore-unknown ...`: passed.
- `npx.cmd prettier --check --ignore-unknown ...`: passed.
- `git diff --check`: passed.
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId learner-org-employee-ai-direct-route-guard-post-repair-browser-rerun-2026-06-25`:
  passed.
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId learner-org-employee-ai-direct-route-guard-post-repair-browser-rerun-2026-06-25 -SkipRemoteAheadCheck`:
  passed.

## Conclusion

Primary result:
`blocked_org_advanced_employee_training_workflow_not_proven_ai_direct_guard_repaired_no_full_eight_row_no_final_pass`.

Next minimal work recommendation:
determine and repair the organization-training employee workflow availability for `org_advanced_employee` without DB,
seed, schema, migration, env, Provider, Cost, staging/prod, payment, or external service work unless separately approved.

No Standard/Advanced MVP final Pass is claimed.
