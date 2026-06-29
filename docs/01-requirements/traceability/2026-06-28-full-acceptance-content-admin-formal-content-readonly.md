# Content Admin Formal Content Read-Only Acceptance

## Status

- Task: `full-acceptance-content-admin-formal-content-readonly-2026-06-28`
- Status: validated.
- Runtime claim: pass_content_admin_formal_content_readonly_with_browser_cookie_injection_limitation_recorded.
- Implementation claim: none.
- Durable goal impact: covers the `content_admin.formal_content` checklist slice only; no final Pass.

## Mandatory Checklist Mapping

Source checklist:
`docs/01-requirements/traceability/2026-06-28-owner-facing-role-gap-capture-scope.md`.

Scoped row:

- `content_admin.formal_content`

Checklist requirements covered by this task:

- Content workspace is reachable for `content_admin`.
- Formal `question`, `material`, `paper`, `paper_section`, `paper_asset`, `knowledge_node`, and tag surfaces are
  discoverable.
- Question list exposes `profession`, `level`, `subject`, question type, status, tag, `knowledge_node`, and keyword
  filter categories.
- Question edit surface preserves `question_option`, `standard_answer`, `analysis`, `scoring_point`, `material`, and
  `question_group` semantics at the visible control/summary level.
- Paper management exposes draft/compose/publish-validation/unpublish-or-archive/copy/source-asset categories without
  executing mutations.
- Knowledge-node management exposes tree maintenance, move/sort/disable, bound question counts, and
  `kn_recommendation` review/correction categories without executing mutations.
- Denials for operations, global authorization, Provider, Cost Calibration, payment, deploy, OCR/export, and external
  service surfaces are checked at route/status level only where safe.

## Authorized Runtime Boundary

Allowed:

- localhost or `127.0.0.1` browser/runtime only.
- Local safe bootstrap via `/api/v1/local-acceptance-sessions` for `content_admin`.
- Read-only browser checks for content routes and route/status/count summaries.
- Focused unit checks for existing content admin formal content surfaces.

Blocked:

- create/update/submit/delete/disable/copy/publish/unpublish/archive/import/upload actions.
- direct DB connection, raw rows, schema, migration, seed, and destructive operations.
- AI submit, Provider execution/configuration, prompts, raw AI input/output, Cost Calibration.
- credentials, cookies, tokens, sessions, localStorage, Authorization headers, env contents, screenshots, traces, raw DOM,
  internal IDs, PII, email, phone, plaintext `redeem_code`, complete question/paper/material/resource/chunk content.
- source/test/dependency/package/lockfile changes, staging/prod/deploy, PR, force push, release readiness, final Pass.

## Reuse And Scope Policy

This task validates existing formal content surfaces. If a finding requires source/test repair, that repair must be
split into a later Stage C task with its own allowedFiles/blockedFiles. This task must not modify implementation code.

## Result Summary

- Local safe `content_admin` bootstrap: pass.
- Formal content route/control visibility: pass for questions, materials, papers, and knowledge nodes.
- Focused unit baselines: pass for question/material, paper, knowledge/resource, and workspace role guard.
- Content mutations, Provider execution, DB access, source/test/dependency changes, screenshots, traces, raw DOM, and
  sensitive evidence capture: not executed.
- Browser fresh-cookie injection limitation recorded; non-content route denial relies on role guard contract evidence.
