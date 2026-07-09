# 2026-07-09 content AI question formal publish loop audit

## Review Scope

- Reviewed changes for `content-ai-question-formal-publish-loop-2026-07-09`.
- Focus: whether AI-created content-admin question drafts stop being immediately user-usable, while manual question creation and non-content AI surfaces remain stable.

## Adversarial Checks

- Role boundary:
  - Content-admin AI question adoption path is the only path that sets initial question status through the new option.
  - Personal AI request/result route tests passed.
  - Organization training route and organization training admin entry tests passed.
  - Admin AI generation entry tests passed.
- Data boundary:
  - No schema, migration, seed, package, lockfile, env, Provider, or DB runtime changes.
  - No internal numeric id is added to URLs or evidence.
  - Formal draft adapter response remains public-id and redacted-status based.
- Paper boundary:
  - AI paper companion question creation still calls the question writer without the disabled initial-status option.
  - Paper publish loop remains deferred to the next serial branch.
- Status boundary:
  - Normal question creation still defaults to `available`.
  - Internal formal draft creation can explicitly request `disabled`.
  - The content question edit path publishes by PATCHing `status: "available"` through the existing route.
- Sensitive information:
  - No credentials, session/cookie/token/localStorage/Auth header values, env values, DB URLs, raw DB rows, Provider payloads, raw prompts, raw AI outputs, complete question/paper/material/chunk content, screenshots, traces, or raw DOM were captured in this audit.

## Residual Risk

- This branch uses the existing `disabled` status as a formal question draft gate because the current schema has no separate question draft status. That is intentionally minimal and avoids migrations, but the semantics should remain documented until a dedicated draft state is introduced.
- End-to-end localhost acceptance is still required after the paper branch and traceability panel branch are complete.

## Verdict

- Pass for this branch scope after targeted tests, adjacent role-boundary regressions, typecheck, lint, and diff check.
