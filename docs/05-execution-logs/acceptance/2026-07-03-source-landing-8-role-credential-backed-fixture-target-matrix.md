# 2026-07-03 Source Landing 8 Role Credential-Backed Fixture Target Matrix

## Scope

- Task ID: `source-landing-8-role-credential-backed-fixture-hardening-plan-2026-07-03`
- Source checkpoint: `source-landing-8-role-local-acceptance-rerun-2026-07-03`
- Review input: `source-landing-8-role-acceptance-coverage-review-2026-07-03`

This matrix defines the next local credential-backed target. It does not execute acceptance and does not read the private
account fixture.

## Credential-Backed Standard

`credential_backed_runtime` means the next rerun uses a test-owned local account/session for the named role, reaches the
role's visible entry through the product route surface, proves at least one positive allowed workflow, and proves at
least one negative denied workflow. Route-fulfilled synthetic context and fixture-only contracts may supplement edge
cases, but they must not replace the role login/session proof.

Private account material is expected to remain outside the repository. The known path from earlier tasks is
`D:\tiku-local-private\acceptance\role-separated-local-accounts-2026-06-23.md`. The next task may read it only if its
own task boundary explicitly approves read-only login input use and still forbids evidence disclosure.

## Role Target Matrix

| Role                        | Required account and auth target                                              | Positive credential-backed proof                                                                   | Negative credential-backed proof                                                                | Fixture supplement allowed after hardening                                         | Next acceptance status target              |
| --------------------------- | ----------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- | ------------------------------------------ |
| `personal_standard_student` | Dedicated standard personal learner with active standard `personal_auth`.     | Practice restart two-step confirmation, answer submit, mock report, and `mistake_book` route.      | Advanced learner AI entry and organization workspace denied or upgrade-guided.                  | Card redemption edge cases may remain later unless explicitly in scope.            | `credential_backed_runtime`                |
| `personal_advanced_student` | Dedicated advanced personal learner with active advanced `personal_auth`.     | Learner `AI训练` entry discoverable and advanced-only route usable without Provider submission.    | Organization backend and admin/content/ops routes denied.                                       | Provider result payload, quota cost, and AI raw output remain blocked.             | `credential_backed_runtime`                |
| `org_standard_employee`     | Dedicated employee bound to standard `org_auth` organization context.         | Standard organization-authorized learning entry and assigned non-advanced employee surface.        | Learner AI, advanced organization training, analytics, and admin routes denied.                 | Deterministic route denial contract may supplement exact hidden-menu assertions.   | `credential_backed_runtime`                |
| `org_advanced_employee`     | Dedicated employee bound to advanced `org_auth` organization context.         | Organization employee `企业训练` assignment and learner `AI训练` entry usable without Provider.    | Organization admin/content/ops routes denied; invalid or expired authorization blocks recorded. | Deadline/takedown/invalid-auth branches may use fixtures if no seeded data exists. | `credential_backed_runtime`                |
| `org_standard_admin`        | Dedicated organization admin for standard organization authorization context. | Organization workspace, roster boundary, employee envelope, and standard authorization summary.    | Advanced organization AI/training/analytics creation denied.                                    | Roster status permutations may use fixtures if not seeded.                         | `credential_backed_runtime`                |
| `org_advanced_admin`        | Dedicated organization admin for advanced organization authorization context. | Organization training publish, analytics summary, and organization AI generation UI entry.         | Ops/content/system admin routes denied; employee-private answer text remains redacted.          | Provider payload and generated content remain fixture or disabled.                 | `credential_backed_runtime`                |
| `content_admin`             | Dedicated content admin account.                                              | Content resource management and content AI draft/review/adoption boundary visible and scoped.      | Ops `redeem_code`, `org_auth`, user management, and organization workspace denied.              | Formal adoption persistence and Provider output remain separately gated.           | `credential_backed_boundary_plus_workflow` |
| `ops_admin`                 | Dedicated ops admin account.                                                  | `redeem_code`, `org_auth`, employee import/password, overlap closure, and user-management surface. | Content AI draft/adoption and organization employee learner routes denied.                      | Plaintext `redeem_code` UI may be product-visible only for eligible ops surfaces.  | `credential_backed_boundary_plus_workflow` |

## Super Admin Coverage Rule

`super_admin` is not a primary axis role for the 8-role rerun. It may appear only as a privilege-covering supplement for
ops/content/system-admin rows, and evidence must still distinguish it from the eight primary roles.

## Required Local Data Matrix

| Data area                   | Minimum next-task material target                                                                                       | If missing                                                                       |
| --------------------------- | ----------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| Account fixture             | One test-owned account or safe role-switching path for each primary role.                                               | Record a block before runtime acceptance; do not downgrade to fixture-only pass. |
| Personal authorization      | Standard and advanced personal `authorization` contexts with explicit `edition` or effective standard fallback.         | Split personal auth fixture hardening task.                                      |
| Organization authorization  | Standard and advanced `org_auth` contexts with organization ownership and employee bindings.                            | Split organization auth fixture hardening task.                                  |
| Organization training       | At least one advanced training assignment and a standard-denial contrast.                                               | Keep employee/admin training rows blocked, not pass.                             |
| Organization analytics      | Redacted aggregate summary data for advanced admin, without raw employee answer text or raw DB rows.                    | Mark analytics workflow as blocked or fixture supplement only.                   |
| Content resources           | Test-owned resource/material/question/paper metadata sufficient for content admin route and review boundary.            | Split content workflow fixture hardening task.                                   |
| Content AI drafts           | Draft/review/adoption boundary data without Provider execution, Prompt text, raw AI input/output, or full content.      | Keep content AI workflow as blocked or supplement only.                          |
| Ops authorization workbench | Test-owned `redeem_code`, `org_auth`, upgrade/overlap/user-management summaries without committed plaintext secrets.    | Split ops fixture hardening task.                                                |
| Audit/log summaries         | Redacted status/count summaries for governed auth, content, org, and AI surfaces; no raw logs or sensitive identifiers. | Do not claim audit/log coverage beyond fixture-contract supplement.              |

## Stop Criteria For Step 2

The next account/data hardening task should stop and create a narrower repair task if any of these occur:

- the private account fixture path is missing or unreadable under the approved boundary;
- any of the eight primary roles lacks a test-owned credential-backed path;
- local fixture or seeded data would require DB mutation, schema/migration, env-secret access, or Provider execution
  beyond the next task's approved scope;
- a runtime route can only be proven by route-fulfilled synthetic context for a role whose target is
  `credential_backed_runtime`;
- evidence would need to expose credentials, sessions, cookies, headers, env values, raw DB rows, internal ids, PII,
  plaintext `redeem_code`, Provider payloads, Prompt text, AI I/O, full content, screenshots, traces, or DOM dumps.
