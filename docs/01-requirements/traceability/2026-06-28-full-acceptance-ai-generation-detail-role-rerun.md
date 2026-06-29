# Full Acceptance AI Generation Detail Role Rerun

## Status

- Date: 2026-06-28
- Task id: `full-acceptance-ai-generation-detail-role-rerun-2026-06-28`
- Scope: role-session browser rerun for AI question and AI paper generation detail controls after source repair.
- Runtime claim: partial local browser evidence; `org_advanced_admin` rows passed, `content_admin` rows blocked by current
  test-owned session material authentication failure.
- Implementation claim: none.

## Mandatory Checklist Gate

This task is governed by:

- `docs/01-requirements/traceability/2026-06-28-owner-facing-role-gap-capture-scope.md`

Relevant rows:

- `content_admin.content_ai_question_generation`
- `content_admin.content_ai_paper_generation`
- `org_advanced_admin.organization_ai_question_generation`
- `org_advanced_admin.organization_ai_paper_generation`

The durable goal remains incomplete after this task unless every applicable owner-facing checklist row has redacted pass
evidence and no required unresolved failure remains.

## Runtime Target

Validate that the source repair is visible through local role sessions:

| Role                 | Route                                  | Required visible categories                                                                                             |
| -------------------- | -------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| `content_admin`      | `/content/ai-question-generation`      | profession, level, subject, knowledge node, question type, count, difficulty, learning objective, draft review boundary |
| `content_admin`      | `/content/ai-paper-generation`         | profession, level, subject, question count, type distribution, difficulty, knowledge coverage, paper section, objective |
| `org_advanced_admin` | `/organization/ai-question-generation` | profession, level, subject, knowledge node, question type, count, difficulty, learning objective, organization draft    |
| `org_advanced_admin` | `/organization/ai-paper-generation`    | profession, level, subject, question count, type distribution, difficulty, knowledge coverage, paper section, org draft |

## Boundaries

Allowed:

- localhost or `127.0.0.1` browser read-only route checks.
- Test-owned local account/session switching for `content_admin` and `org_advanced_admin`.
- Reading `D:\tiku-local-private\acceptance\role-separated-local-accounts-2026-06-23.md` only as login input if needed.
- Evidence limited to role, route, status, visible control category, and count summaries.

Blocked:

- Credentials, cookies, tokens, sessions, localStorage, Authorization headers, raw DOM, screenshots, traces, raw DB rows,
  internal ids, PII, phone/email, plaintext `redeem_code`, Provider payloads, prompts, raw AI input/output, and complete
  generated/content material in evidence.
- Submitting AI generation requests, calling Provider, direct DB access, local UI/API mutation, schema/migration/seed,
  package/lockfile change, staging/prod/deploy, PR, force push, release readiness, final Pass, and Cost Calibration.

## Acceptance Criteria

- All four scoped role/route rows are reachable in the correct role context.
- Each scoped row renders the expected detail-control categories.
- No Provider payload, prompt, raw AI IO, or formal `question`/`paper` write is executed.
- Any unresolved browser/runtime failure is recorded as a redacted gap and routed to a separate repair task.

## Runtime Result

| Role                 | Route                                  | Status  | Redacted result                                                                                          |
| -------------------- | -------------------------------------- | ------- | -------------------------------------------------------------------------------------------------------- |
| `content_admin`      | `/content/ai-question-generation`      | blocked | Current test-owned session material returned an auth-validation failure; no credential value recorded.   |
| `content_admin`      | `/content/ai-paper-generation`         | blocked | Not executed after the same `content_admin` session proof failed; follow-up session proof task required. |
| `org_advanced_admin` | `/organization/ai-question-generation` | pass    | 8/8 expected detail categories present; organization context present; no login/denied/provider cue.      |
| `org_advanced_admin` | `/organization/ai-paper-generation`    | pass    | 9/9 expected detail categories present; organization context present; no login/denied/provider cue.      |

This partial result does not complete the owner-facing checklist gate. The `content_admin` rows remain required until a
future task refreshes/proves the test-owned session material and reruns the two content AI routes with redacted evidence.
