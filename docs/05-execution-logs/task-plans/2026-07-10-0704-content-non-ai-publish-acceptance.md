# 2026-07-10 0704 Content Non-AI Publish Acceptance Plan

## Task

- taskId: `0704-content-non-ai-publish-acceptance-2026-07-10`
- branch: `codex/0704-content-non-ai-publish-acceptance`
- mode: validation-only source/test acceptance
- target: formal content non-AI publish, takedown, edit-copy, reference immutability, and downstream consumption closure without source, test, package, lockfile, schema, migration, seed, DB, Provider, browser, staging, prod, deploy, env, secret, screenshot, or raw DOM execution

## Read Gate

Read before validation:

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/01-requirements/00-index.md`
- `docs/01-requirements/advanced-edition/00-index.md`
- `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`
- `docs/01-requirements/modules/02-question-paper.md`
- `docs/01-requirements/stories/epic-02-question-paper.md`
- `docs/01-requirements/advanced-edition/stories/epic-05-formal-content-separation.md`
- `docs/01-requirements/traceability/2026-06-28-full-acceptance-content-admin-formal-content-readonly.md`
- `docs/01-requirements/traceability/2026-06-29-full-acceptance-content-admin-formal-content-workflow.md`
- `docs/01-requirements/traceability/2026-06-29-repair-content-admin-formal-content-workflow-actions.md`
- `docs/01-requirements/traceability/2026-07-02-content-resource-management-ui-ux-contract.md`
- `docs/01-requirements/traceability/2026-07-02-role-auth-training-ops-decision-package.md`
- `docs/01-requirements/traceability/2026-07-02-current-thread-requirement-reconciliation-ledger.md`
- `docs/01-requirements/traceability/2026-07-07-full-role-uiux-source-implementation-entry.md`
- `docs/05-execution-logs/acceptance/2026-07-10-0704-post-peripheral-acceptance-ledger.md`
- recent content-admin formal content, non-AI publish, learner study, enterprise training, and AI paper source evidence/audit records

Private credential handling:

- metadata-only readiness preflight against `D:/tiku-local-private/acceptance/0704-role-credential-index.private.md`
- evidence records role labels and status categories only
- credential values remain in memory only and are not written to chat, evidence, audit, logs, or repository files

## Acceptance Standard

Validate these task-11 requirements from the 0704 peripheral ledger and current formal content SSOT:

- formal `question`, `paper`, `material`, `paper_section`, `question_group`, and `scoring_point` relationships remain stable
- publish, takedown, edit-copy, referenced-content immutability, and incomplete-content blocking behave as specified
- published content can be referenced by allowed `practice`, `mock_exam`, enterprise training, and AI assembly flows
- takedown blocks new entry while preserving permitted historical status categories
- AI draft adoption into formal content remains governed and is not rerun by default

## Validation Method

Use source and focused tests only:

- inspect content-admin formal content UI/runtime tests and route/service contract tests
- inspect downstream learner, enterprise training, and AI paper source tests that consume published formal content
- run focused content lifecycle, learner consumption, enterprise training source, and AI paper source tests
- run lint, typecheck, `git diff --check`, and Module Run v2 gates
- no localhost browser login unless a later task-specific approval changes the boundary

## Stop Conditions

Stop and open a separate repair task if validation finds a real source defect such as:

- incomplete formal paper can be published
- published or referenced `question` / `material` / `paper` can be dangerously edited instead of copied
- archived/taken-down content remains available for new `practice`, `mock_exam`, enterprise training, or AI assembly entry
- `paper_section`, `question_group`, or `scoring_point` relationships are lost across publish/copy/snapshot paths
- AI draft adoption bypasses content review or reruns Provider
- source/test failure not attributable to environment or unrelated pre-existing state

## Evidence Boundary

Evidence may record only role labels, route labels, status categories, source marker categories, command names, and test counts.

Evidence must not record credentials, passwords, session/cookie/token/localStorage/Authorization values, env values, DB URLs, raw DB rows, internal numeric ids, Provider payloads, raw prompts, raw AI input/output, full question/paper/material/resource/chunk content, raw employee answers, screenshots, raw DOM, or plaintext `redeem_code`.
