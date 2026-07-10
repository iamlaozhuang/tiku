# 2026-07-10 0704 Organization Tree Employee Transfer Fix Audit

## Scope

- taskId: `0704-org-tree-employee-transfer-fix-2026-07-10`
- branch: `codex/0704-org-tree-employee-transfer-fix`
- audit type: adversarial implementation review
- result: pass

## Review Findings

- Role boundary: transfer mutation requires `super_admin` or `ops_admin`; `content_admin` denial is covered and does not touch employee records.
- Data boundary: route and service use public IDs only; response exposes status categories and old/new organization route labels, not internal numeric IDs.
- Authorization boundary: repository checks target active organization and target active org_auth capacity before moving the employee.
- Quota boundary: target org_auth scope is locked before quota calculation; previous and target organization quota counts are refreshed in the same transaction.
- Session boundary: existing employee auth sessions are revoked when present; response records only `revoked` or `not_needed`.
- Training boundary: in-progress enterprise training answers tied to the previous organization are moved to read-only status; submitted history snapshot semantics are preserved.
- Privacy boundary: audit metadata is redacted; no employee raw answers, learner AI raw results, Provider payloads, raw prompts, or raw AI output are returned or logged by the new path.
- Standard/advanced edition boundary: transfer does not grant employee-level allowlists; employee capabilities continue to derive from target organization authorization.
- UI boundary: UI only enables transfer for preview rows with quota-available status and sends employee/target organization public labels.

## Residual Risk

- Local verification is contract/unit scoped. No localhost browser login, screenshots, raw DOM, direct DB, Provider, staging, prod, deploy, env, secret, or Cost Calibration action was executed.
- The next required task remains `0704-org-tree-auth-inheritance-acceptance-rerun-2026-07-10` to rerun the affected validation-only acceptance after this repair is merged.

## Decision

Proceed to Module Run v2 closeout gates, commit, merge to `master`, push `origin/master`, clean the short branch, then resume the serial queue at the rerun task.
