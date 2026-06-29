# Full Acceptance Content Admin AI Generation Detail Session Proof

## Status

- Date: 2026-06-28
- Task id: `full-acceptance-content-admin-ai-generation-detail-session-proof-2026-06-28`
- Scope: prove or refresh the `content_admin` local session path, then rerun the two content AI generation
  detail-control rows.
- Runtime claim: blocked by current local `content_admin` account material mismatch.
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

| Role            | Route                             | Required visible categories                                                                                             |
| --------------- | --------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| `content_admin` | `/content/ai-question-generation` | profession, level, subject, knowledge node, question type, count, difficulty, learning objective, draft review boundary |
| `content_admin` | `/content/ai-paper-generation`    | profession, level, subject, question count, type distribution, difficulty, knowledge coverage, paper section, objective |

## Boundaries

Allowed:

- localhost or `127.0.0.1` browser read-only route checks.
- Test-owned local account/session switching for `content_admin`.
- Reading `D:\tiku-local-private\acceptance\role-separated-local-accounts-2026-06-23.md` only as login input.
- Local DB read-only aggregate/status proof only if session proof still fails and only to classify current
  `content_admin` account/session state.
- Evidence limited to role, route, status, visible control category, and count summaries.

Blocked:

- Credentials, cookies, tokens, sessions, localStorage, Authorization headers, raw DOM, screenshots, traces, raw DB rows,
  internal ids, PII, phone/email, plaintext `redeem_code`, Provider payloads, prompts, raw AI input/output, and complete
  generated/content material in evidence.
- Password reset, direct DB write, schema/migration/seed, AI generation submit, Provider execution, local UI/API
  write-flow mutation outside login/session switching, source/test change, package/lockfile change, staging/prod/deploy,
  PR, force push, release readiness, final Pass, and Cost Calibration.

## Acceptance Criteria

- `content_admin` session proof succeeds using test-owned local material or a redacted allowed session method.
- Both scoped content AI routes are reachable in the `content_admin` role context.
- Each scoped row renders the expected detail-control categories.
- No Provider payload, prompt, raw AI IO, or formal `question`/`paper` write is executed.
- If session proof still fails, the task records the smallest redacted blocker and next action without claiming pass.

## Execution Result

The task recorded a redacted blocker: the approved private `content_admin` account section and login field shape were
present, but localhost session proof did not authenticate and Stage D local DB read-only aggregate proof found no matching
local `admin` or `user` record for that login material.

The two scoped rows remain incomplete until a follow-up task repairs or creates a test-owned local `content_admin`
account through approved localhost UI/API flows or uses another approved safe role-switching method, then reruns the
route detail-control checks.
