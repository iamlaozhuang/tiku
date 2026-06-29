# Full Acceptance Content Admin Formal Content Workflow Traceability

- Task id: `full-acceptance-content-admin-formal-content-workflow-2026-06-29`
- Branch: `codex/full-acceptance-content-admin-workflow-20260629`
- Status: blocked evidence captured
- Date: `2026-06-29`

## Objective

Execute localhost-only owner-facing acceptance for the remaining scoped `content_admin` rows:

- `content_admin.formal_content_lifecycle_mutation_review`
- `content_admin.ai_draft_review_adoption_boundary`

This task may use app-normal local UI/API mutations only for test-owned acceptance data where the visible application
normally performs them. It does not approve Provider execution, direct DB access, schema/migration/seed, source/test
changes, dependency changes, staging/prod/deploy, PR, force-push, release readiness, final Pass, or Cost Calibration.

## Prior Coverage

- `content_admin.content_ai_question_generation`: pass for detail controls, no Provider execution.
- `content_admin.content_ai_paper_generation`: pass for detail controls, no Provider execution.
- `content_admin.formal_content`: pass for read-only route/control coverage.

## Required Checks

- Content workspace discoverability and direct route behavior for formal `question`, `material`, `paper`, and
  `knowledge_node` surfaces: captured as redacted route/status/control counts.
- Test-owned draft/create/update/submit/reject/delete/cleanup affordance where app-normal UI provides it: blocked because
  create/edit affordances are visible, but this task found no safe test-owned cleanup/delete path and did not mutate
  existing formal content.
- AI draft review/adoption boundary: blocked because adopt/reject controls are visible but disabled with follow-up-task
  markers; no Provider execution, no raw AI output, and no direct formal publish bypass were executed.
- Denial/blocked summary for Provider, Cost Calibration, deploy, PR, force-push, release readiness, and final Pass:
  captured in evidence.
- Evidence limited to route/workflow/status/control-count summaries.

## Follow-Up Requirement

Seed a Stage C source/test repair task to provide or expose a safe, test-owned local formal content lifecycle path and an
AI draft review/adoption boundary that can be verified without Provider execution, raw generated content, direct DB
access, or unsafe mutation of existing content.

## Evidence Boundaries

Forbidden evidence includes credentials, cookies, tokens, sessions, localStorage, Authorization headers, env contents,
raw DOM, screenshots, traces, raw DB rows, internal ids, PII, email, phone, plaintext `redeem_code`, Provider payloads,
prompts, raw AI input/output, and complete question/paper/material/resource/chunk content.
