# Content Admin AI Generation Detail Rerun After Session Bridge Repair

## Status

- Task: `full-acceptance-content-admin-ai-generation-detail-rerun-after-session-bridge-repair-2026-06-28`
- Status: in_progress
- Runtime claim: pending.
- Implementation claim: none.
- Durable goal impact: prerequisite browser rerun for two `content_admin` rows only; no final Pass.

## Mandatory Checklist Mapping

Source checklist:
`docs/01-requirements/traceability/2026-06-28-owner-facing-role-gap-capture-scope.md`.

Scoped rows:

- `content_admin.content_ai_question_generation`
- `content_admin.content_ai_paper_generation`

Completion rule:

- This task may close only these two scoped rows if localhost browser evidence shows the required content AI route and
  detail-control coverage after the session bridge repair.
- The durable full-acceptance goal remains incomplete until every applicable owner-facing role checklist row is covered
  and passed in later tasks.

## Authorized Runtime Boundary

Allowed:

- localhost or `127.0.0.1` browser/runtime only.
- Local safe bootstrap via `/api/v1/local-acceptance-sessions` for `content_admin`.
- `/api/v1/sessions` status/count proof without recording session material.
- Read-only route/control/status checks for `/content/ai-question-generation` and `/content/ai-paper-generation`.
- Focused unit checks for the local bootstrap bridge and shared AI generation entry surface.

Blocked:

- AI generation submit, Provider execution, Provider configuration, prompts, raw AI input/output, and Cost Calibration.
- DB connection, raw rows, schema, migration, seed, and direct data changes.
- Private account fixture read, credentials, cookies, tokens, sessions, localStorage, Authorization headers, screenshots,
  traces, raw DOM, internal ids, PII, email, phone, plaintext `redeem_code`, and complete generated/question/paper
  content in evidence.
- Source, test, dependency, package, lockfile, staging/prod/deploy, PR, force push, release readiness, and final Pass.

## Expected Coverage

Content `AI出题` redacted coverage:

- content workspace entry/route is reachable for `content_admin`;
- form/control categories include `profession`, `level`, `subject`, `knowledge_node`, question type, count, difficulty,
  and source/context constraints;
- draft/review/adoption boundary is visible enough to confirm output remains in the content AI draft/review domain;
- direct formal `question` write, direct publish, Provider-cost decision, prompt/raw output leakage, and complete
  generated content exposure are not observed.

Content `AI组卷` redacted coverage:

- content workspace entry/route is reachable for `content_admin`;
- form/control categories include `profession`, `level`, `subject`, question count, question-type distribution,
  difficulty, `knowledge_node` coverage, `paper_section` structure, and source pool constraints;
- draft/review/adoption boundary is visible enough to confirm output remains in the content AI draft/review domain;
- direct formal `paper` publish/export, Provider-cost decision, prompt/raw output leakage, and complete generated content
  exposure are not observed.

## Reuse Policy

This task inspects the existing shared AI generation entry surface after the session bridge repair. Multi-role `AI出题`
and `AI组卷` implementation must continue to reuse shared AI generation contracts, services, UI primitives, and
validation patterns. No role-specific duplicate AI generation implementation is allowed in this task.
