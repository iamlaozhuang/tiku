# Acceptance Role Separated Account Local Provisioning And Credential Handoff Execution Evidence

taskId: acceptance-role-separated-account-local-account-provisioning-and-credential-handoff-execution-2026-06-23
approvalConsumed: ROLE_SEPARATED_LOCAL_ACCOUNT_PROVISIONING_AND_CREDENTIAL_HANDOFF_SCOPE_2026_06_23
recordedAt: "2026-06-23T09:18:16-07:00"
owner: laozhuang
codexRole: execution_assistant_and_evidence_preparer_only

## Result

Status: completed with redacted evidence.

The eight approved local role-separated account rows were provisioned or updated in the local dev database. A private
credential handoff file was created outside the repository:

`D:\tiku-local-private\acceptance\role-separated-local-accounts-2026-06-23.md`

Password values, phone login values, credential hashes, session tokens, database URLs, and raw database rows are not
recorded in this committed evidence.

## Redacted Provisioning Summary

| Role row                    | Local account label                    | Authorization shape                                                     | Setup status |
| --------------------------- | -------------------------------------- | ----------------------------------------------------------------------- | ------------ |
| `personal_standard_student` | `acceptance.personal.standard.student` | `personal_auth` with `edition=standard`                                 | created      |
| `personal_advanced_student` | `acceptance.personal.advanced.student` | `personal_auth` with `edition=advanced`                                 | created      |
| `org_standard_employee`     | `acceptance.org.standard.employee`     | employee in organization with `org_auth edition=standard`               | created      |
| `org_advanced_employee`     | `acceptance.org.advanced.employee`     | employee in organization with `org_auth edition=advanced`               | created      |
| `org_standard_admin`        | `acceptance.org.standard.admin`        | organization-bound admin using existing `ops_admin` role, standard auth | created      |
| `org_advanced_admin`        | `acceptance.org.advanced.admin`        | organization-bound admin using existing `ops_admin` role, advanced auth | created      |
| `content_admin`             | `acceptance.content.admin`             | admin with `admin_role=content_admin` only                              | created      |
| `ops_admin`                 | `acceptance.ops.admin`                 | admin with `admin_role=ops_admin` only                                  | created      |

## Verification Evidence

Existing local dev seed prerequisite:

```text
auth_user_count: 2
admin_count: 1
admin_organization_count: 1
student_user_count: 1
employee_user_count: 1
organization_count: 1
employee_count: 1
org_auth_count: 1
org_auth_organization_count: 1
organization_training_version_count: 1
organization_training_answer_count: 1
personal_auth_count: 1
paper_count: 1
paper_question_count: 1
model_config_count: 1
```

Redacted provisioning verification:

```text
auth_user_count: 8
auth_account_password_hash_count: 8
personal_user_count: 2
student_count: 2
personal_standard_auth_count: 1
personal_advanced_auth_count: 1
organization_count: 2
org_standard_auth_count: 1
org_advanced_auth_count: 1
employee_count: 2
admin_count: 4
content_admin_count: 1
ops_admin_count: 1
organization_bound_admin_count: 2
```

Private file location verification:

```text
Exists: true
FullName: D:\tiku-local-private\acceptance\role-separated-local-accounts-2026-06-23.md
IsOutsideRepo: true
```

## Known Limitation

The current schema has no independent `org_admin` enum value. Admin role values are limited to `super_admin`,
`ops_admin`, and `content_admin`.

Therefore the two enterprise admin rows were provisioned as organization-bound admin accounts using the existing
`ops_admin` role plus `admin_organization` linkage. This is sufficient to hand laozhuang separate local accounts for
runtime inspection, but it is not a final proof that organization admin permission separation is complete. That proof
still requires a later runtime walkthrough and, if needed, a product authorization model decision.

## Redaction Boundary

- Generated password values were written only to the private credential file outside the repository.
- Phone login values were written only to the private credential file outside the repository.
- No password value, phone login value, credential hash, session token, database URL, or raw database row is committed.
- No browser or Playwright walkthrough was executed in this task.
- No staging/prod resource, Provider/model call, Cost Calibration, payment, deployment, PR, force push, or final
  acceptance Pass was executed.

## Next Step

The next acceptance step should prepare a fresh runtime rerun approval package. Runtime should remain blocked until
laozhuang explicitly approves using these local accounts for browser/manual walkthrough evidence.
