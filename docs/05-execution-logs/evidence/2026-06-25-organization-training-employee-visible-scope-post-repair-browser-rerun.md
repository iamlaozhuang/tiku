# Organization Training Employee Visible Scope Post-Repair Browser Rerun Evidence

Task id: `organization-training-employee-visible-scope-post-repair-browser-rerun-2026-06-25`

Branch: `codex/org-training-visible-scope-rerun-20260625`

Evidence timestamp: `2026-06-25T10:40:00.6090828-07:00`

## Scope

Focused two-row local real-browser rerun after
`organization-training-advanced-employee-empty-state-source-diagnosis-repair-2026-06-25`.

Rows:

- `org_standard_employee`
- `org_advanced_employee`

## Redaction Policy

Evidence records no account identifiers, phone numbers, passwords, credential values, tokens, cookies, local/session
storage, Authorization headers, raw page dumps, screenshots, traces, DB rows, Provider payloads, prompts, generated
content, raw answer text, raw credential file content, or private answer content.

Credential read and entry are approved by `current_user_goal_create_full_8_row_acceptance_2026_06_25`; credential values
remain redacted.

## Requirement Mapping Result

- Standard organization employees must not enter organization-training answer workflow by direct `/organization-training`.
- Advanced organization employees should discover `企业训练` and reach assigned organization-training answer workflow when
  valid advanced `org_auth` context and published visible training exist.
- Full 8-row browser rerun remains blocked unless this focused organization-training employee gate passes.

## Runtime Result

Status: blocked evidence closeout.

| Row                     | Landing | Home entry result             | Direct `/organization-training` result          | Logout | Result | Notes                                                              |
| ----------------------- | ------- | ----------------------------- | ----------------------------------------------- | ------ | ------ | ------------------------------------------------------------------ |
| `org_standard_employee` | `/home` | No `AI训练`; no `企业训练`    | No answer workflow                              | pass   | pass   | Standard employee did not enter organization-training answer flow. |
| `org_advanced_employee` | `/home` | `AI训练` and `企业训练` shown | No training row, no number input, no row action | pass   | fail   | Advanced employee organization-training workflow remains unproven. |

Runtime counters:

| Metric                                            | Value |
| ------------------------------------------------- | ----- |
| Rows executed                                     | 2     |
| Pass rows                                         | 1     |
| Fail/blocker rows                                 | 1     |
| `org_standard_employee` training workflow entered | no    |
| `org_advanced_employee` training row count        | 0     |
| `org_advanced_employee` training input count      | 0     |
| `org_advanced_employee` row action count          | 0     |
| Browser warn/error count                          | 0     |
| Full eight-row rerun executed                     | no    |
| Final Pass claimed                                | no    |

## Acceptance Mapping Result

- Standard employee organization-training direct-route exposure remains blocked or unavailable from an answer-workflow
  perspective.
- Advanced employee home entry remains discoverable, but the direct organization-training route still provides no
  answer-workflow structure.
- Full 8-row runtime acceptance remains blocked and was not executed.

## Validation

- Local browser runtime two-row rerun: blocked evidence recorded.
- Browser credential read and entry were executed only for the two local organization employee rows; evidence is
  redacted.
- `npx.cmd prettier --write --ignore-unknown ...`: passed.
- `npx.cmd prettier --check --ignore-unknown ...`: passed.
- `git diff --check`: passed.
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId organization-training-employee-visible-scope-post-repair-browser-rerun-2026-06-25`:
  passed.
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId organization-training-employee-visible-scope-post-repair-browser-rerun-2026-06-25 -SkipRemoteAheadCheck`:
  passed.

## Conclusion

Primary result:
`blocked_org_advanced_employee_training_workflow_not_proven_after_visible_scope_repair_no_full_eight_row_no_final_pass`.

Next minimal work recommendation:
the next investigation likely needs DB/seed/account data inspection to determine whether the advanced employee has any
published organization-training assignment after source routing/query repairs. Stop for separate approval before any
DB/seed/schema/migration/account mutation or data inspection.

No Standard/Advanced MVP final Pass is claimed.
