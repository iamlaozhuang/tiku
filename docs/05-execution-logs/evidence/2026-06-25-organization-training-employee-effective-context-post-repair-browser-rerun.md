# Organization Training Employee Effective Context Post-Repair Browser Rerun Evidence

Task id: `organization-training-employee-effective-context-post-repair-browser-rerun-2026-06-25`

Branch: `codex/org-training-employee-rerun-20260625`

Evidence timestamp: `2026-06-25T10:23:26.8475263-07:00`

## Scope

Focused two-row local real-browser rerun after
`organization-training-employee-effective-authorization-context-repair-2026-06-25`.

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
  valid advanced `org_auth` context exists.
- Full 8-row browser rerun remains blocked unless this focused organization-training employee gate passes.

## Runtime Result

Status: blocked evidence closeout.

| Row                     | Landing | Home entry result             | Direct `/organization-training` result | Logout | Result | Notes                                                                                  |
| ----------------------- | ------- | ----------------------------- | -------------------------------------- | ------ | ------ | -------------------------------------------------------------------------------------- |
| `org_standard_employee` | `/home` | No `AI训练`; no `企业训练`    | No start/submit answer workflow        | pass   | pass   | Standard employee did not enter organization-training answer flow.                     |
| `org_advanced_employee` | `/home` | `AI训练` and `企业训练` shown | Empty state; no start/submit workflow  | pass   | fail   | Advanced employee organization-training answer workflow remains unproven after repair. |

Runtime counters:

| Metric                                            | Value |
| ------------------------------------------------- | ----- |
| Rows executed                                     | 2     |
| Pass rows                                         | 1     |
| Fail/blocker rows                                 | 1     |
| `org_standard_employee` training workflow entered | no    |
| `org_advanced_employee` training workflow proven  | no    |
| Browser warn/error count                          | 0     |
| Full eight-row rerun executed                     | no    |
| Final Pass claimed                                | no    |

## Acceptance Mapping Result

- Standard employee organization-training direct-route exposure remains blocked or unavailable from an answer-workflow
  perspective.
- Advanced employee home entry is discoverable, but the direct route still renders empty state with no start/submit
  workflow.
- Full 8-row runtime acceptance remains blocked and was not executed.

## Validation

- Local browser runtime two-row rerun: blocked evidence recorded.
- Browser credential read and entry were executed only for the two local organization employee rows; evidence is
  redacted.
- `npx.cmd prettier --write --ignore-unknown ...`: passed.
- `npx.cmd prettier --check --ignore-unknown ...`: passed.
- `git diff --check`: passed.
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId organization-training-employee-effective-context-post-repair-browser-rerun-2026-06-25`:
  passed.
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId organization-training-employee-effective-context-post-repair-browser-rerun-2026-06-25 -SkipRemoteAheadCheck`:
  passed.

## Conclusion

Primary result:
`blocked_org_advanced_employee_training_workflow_not_proven_after_effective_context_repair_no_full_eight_row_no_final_pass`.

Next minimal work recommendation:
investigate why `org_advanced_employee` has a home `企业训练` entry but `/organization-training` still has no assigned
answer workflow. Do not touch DB/seed/schema/migration/account mutation, env, Provider, Cost, staging/prod, payment, or
external service work unless separately approved.

No Standard/Advanced MVP final Pass is claimed.
