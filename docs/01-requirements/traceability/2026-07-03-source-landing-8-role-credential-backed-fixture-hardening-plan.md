# 2026-07-03 Source Landing 8 Role Credential-Backed Fixture Hardening Plan

## Status

This is a planning and traceability package for the next local hardening task. It does not approve product source,
test source, seed/script/schema changes, DB access, Provider execution, env-secret access, browser/runtime validation,
staging/prod deployment, release readiness, final Pass, production usability, or Cost Calibration.

## Decision

The next acceptance standard should move from the current mixed checkpoint to credential-backed local runtime proof for
all eight primary roles. Fixture-first proof remains useful for deterministic edge cases and denial contracts, but it
must be explicitly labeled as supplement after the role's credential-backed positive and negative path is proven.

## Serial Execution Shape

| Step | Task ID candidate                                                | Execution type                                         | Stop rule                                                                                        |
| ---- | ---------------------------------------------------------------- | ------------------------------------------------------ | ------------------------------------------------------------------------------------------------ |
| 1    | `source-landing-8-role-credential-backed-fixture-hardening-plan` | Docs/state target matrix.                              | Closed by this package; no runtime.                                                              |
| 2    | `source-landing-8-role-local-account-data-fixture-hardening`     | Prepare account/data/test-owned fixture prerequisites. | Stop if private account input, local data, DB boundary, or fixture source scope is insufficient. |
| 3    | `source-landing-8-role-credential-backed-local-acceptance-rerun` | Runtime rerun with redacted evidence.                  | Stop on first fail/block and split repair.                                                       |
| 4    | `source-landing-8-role-gap-repair-loop-*`                        | Narrow repair.                                         | Repair only proven root cause, merge, then restart full 8-role rerun from the beginning.         |
| 5    | `source-landing-stage-b-acceptance-approval-pack`                | Higher-risk approval package.                          | Planning only unless separately authorized.                                                      |

## Account Material Boundary

Prior tasks recorded the private account fixture path as
`D:\tiku-local-private\acceptance\role-separated-local-accounts-2026-06-23.md`. This path is outside the repository and
must remain outside committed evidence.

The next task may use that file only if it records all of the following first:

- read-only use as login/account input;
- no copying account values into repository files;
- no credential, password, token, cookie, session, localStorage, Authorization header, env, or connection-string output;
- no screenshots, traces, DOM dumps, raw DB rows, internal ids, PII, or plaintext `redeem_code` evidence;
- immediate stop if the file does not contain a role needed for the credential-backed target.

## Acceptance Interpretation

- `credential_backed_runtime`: enough for the next local role result if both positive and negative workflow proof pass.
- `credential_backed_boundary_plus_workflow`: acceptable for admin roles whose full workflow is split across governed
  areas, provided at least one real role/session route and at least one unrelated-surface denial are proven.
- `fixture_first_contract`: supplement only after hardening; not enough to close a primary role.
- `route_fulfilled`: allowed only to keep a route or contract deterministic, not as a substitute for role login proof.

## Repair Split Policy

If step 2 or step 3 finds a missing role account, missing local data, test harness mismatch, product defect, or
authorization defect, the chain must stop and create the smallest repair task. The repair task must identify whether the
root cause is:

- private account fixture gap;
- test/e2e harness gap;
- local seed or DB fixture gap;
- product source behavior gap;
- requirement conflict or unresolved decision;
- blocked external gate such as Provider, env, staging/prod, or Cost Calibration.
