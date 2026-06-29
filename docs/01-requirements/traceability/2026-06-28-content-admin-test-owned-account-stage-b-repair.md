# Content Admin Test-Owned Account Stage B Repair

## Status

- Date: 2026-06-28
- Task id: `content-admin-test-owned-account-stage-b-repair-2026-06-28`
- Scope: repair or create the test-owned local `content_admin` account path through approved localhost UI/API flows, then
  rerun the two content AI generation detail-control rows.
- Runtime claim: blocked; no approved existing localhost UI/API account repair path found.
- Implementation claim: none.

## Mandatory Checklist Gate

This task is governed by:

- `docs/01-requirements/traceability/2026-06-28-owner-facing-role-gap-capture-scope.md`

Relevant rows:

- `content_admin.content_ai_question_generation`
- `content_admin.content_ai_paper_generation`

The durable goal remains incomplete after this task unless every applicable owner-facing checklist row has redacted pass
evidence and no required unresolved failure remains.

## Runtime Target

| Workflow                                        | Required result                                                                              |
| ----------------------------------------------- | -------------------------------------------------------------------------------------------- |
| test-owned `content_admin` account repair       | Existing localhost UI/API creates or repairs only test-owned local acceptance account state. |
| `/content/ai-question-generation` read-only row | Required detail categories render after valid `content_admin` session.                       |
| `/content/ai-paper-generation` read-only row    | Required detail categories render after valid `content_admin` session.                       |

## Boundaries

Allowed:

- localhost or `127.0.0.1` UI/API actions for test-owned local account repair only.
- Reading approved `ops_admin` and `content_admin` private account inputs only as login/account input.
- Local DB read-only aggregate/status proof before and after the repair.
- Read-only source discovery of existing local UI/API account flows.
- Evidence limited to role, route, workflow, status, failure class, and count summaries.

Blocked:

- Credentials, cookies, tokens, sessions, localStorage, Authorization headers, raw DOM, screenshots, traces, raw DB rows,
  internal ids, PII, phone/email, plaintext `redeem_code`, Provider payloads, prompts, raw AI input/output, and complete
  generated/content material in evidence.
- Direct DB write, password reset outside normal localhost UI/API flow, schema/migration/seed, AI generation submit,
  Provider execution, source/test/package/lockfile changes, staging/prod/deploy, PR, force push, release readiness,
  final Pass, and Cost Calibration.

## Acceptance Criteria

- Local test-owned `content_admin` account path can be established without sensitive evidence capture.
- Both scoped content AI routes are reachable in the `content_admin` role context.
- Each scoped row renders the expected detail-control categories.
- No Provider payload, prompt, raw AI IO, or formal `question`/`paper` write is executed.
- If existing localhost UI/API cannot create or repair the account, the task records the smallest redacted blocker and
  next action without claiming pass.

## Closure Finding

Existing localhost UI/API does not expose an `admin` account creation or role-assignment path for the missing
test-owned `content_admin` account. The scoped rows remain blocked by
`no_existing_localhost_ui_api_admin_account_creation_or_role_assignment`.

This closure does not modify source, tests, package files, schema, migrations, seed data, or local DB rows, and does not
execute Provider or AI generation submit actions.
