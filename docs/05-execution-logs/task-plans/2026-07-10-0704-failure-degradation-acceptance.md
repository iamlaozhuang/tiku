# 2026-07-10 0704 Failure Degradation Acceptance Plan

## Task

- taskId: `0704-failure-degradation-acceptance-2026-07-10`
- branch: `codex/0704-failure-degradation-acceptance`
- mode: validation-only source/test acceptance
- target: no-source, no-knowledge, no-resource, weak/none evidence, quota exhaustion, Provider-disabled/unavailable/timeout/network failure, duplicate submit, stale history, resume failure, safe status categories, no formal-record pollution, and redacted admin-side failure visibility without source, test, package, lockfile, schema, migration, seed, DB, Provider, browser, staging, prod, deploy, env, secret, screenshot, or raw DOM execution

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
- `docs/01-requirements/traceability/2026-07-02-ai-generation-requirements-ssot-alignment.md`
- `docs/01-requirements/traceability/2026-07-02-phase4-requirements-agent-baseline-alignment.md`
- `docs/01-requirements/advanced-edition/modules/01-authorization-context.md`
- `docs/01-requirements/advanced-edition/modules/02-ai-task-domain.md`
- `docs/01-requirements/advanced-edition/modules/03-personal-ai-generation.md`
- `docs/01-requirements/advanced-edition/modules/04-organization-training.md`
- `docs/01-requirements/advanced-edition/modules/07-retention-log-governance.md`
- `docs/01-requirements/advanced-edition/modules/08-organization-ai-generation.md`
- `docs/01-requirements/modules/03-student-experience.md`
- `docs/01-requirements/modules/06-admin-ops.md`
- `docs/05-execution-logs/acceptance/2026-07-10-0704-post-peripheral-acceptance-ledger.md`
- recent model/prompt/log, resource/RAG, audit/privacy, API route boundary, learner non-AI, and organization training edge evidence/audit records

Private credential handling:

- metadata-only readiness preflight against `D:/tiku-local-private/acceptance/0704-role-credential-index.private.md`
- evidence records role labels, route labels, failure/status categories, command names, and aggregate test counts only
- credential values remain in memory only and are not written to chat, evidence, audit, logs, or repository files

## Acceptance Standard

Validate these task-15 requirements from the 0704 peripheral ledger and current AI/RAG/log governance SSOT:

- no source, no knowledge coverage, no resource, weak/none evidence, quota exhaustion, Provider disabled, Provider unavailable, timeout, network failure, duplicate submit, stale history, and resume failure produce safe status categories
- failures do not write formal `question`, `paper`, `practice`, `mock_exam`, `exam_report`, or `mistake_book` records outside approved flows
- admin-side failure visibility remains redacted and aggregate

## Validation Method

Use source and focused tests only:

- inspect AI request/result routes, Provider execution adapters, RAG/resource handling, organization training publish/adoption guards, learner practice/mock resume/duplicate guards, route error responses, and admin log redaction tests
- run focused failure/degradation tests
- run lint, typecheck, `git diff --check`, and Module Run v2 gates
- no Provider call, no environment/secret read, no localhost route probing, no direct DB, no credential/session capture, no staging/prod/deploy action

## Stop Conditions

Stop and open a separate repair task if validation finds a real source defect such as:

- failure paths expose raw prompt, raw AI output, Provider payload, full content, credentials, env, DB URL, internal ids, stack, SQL, or raw employee answers
- Provider-disabled, quota, empty result, no source/resource/knowledge, weak/none evidence, timeout, network, duplicate submit, stale history, or resume failure lacks a safe status category
- failed AI/RAG paths write formal `question`, `paper`, `practice`, `mock_exam`, `exam_report`, or `mistake_book` records outside approved flows
- admin-side failure views expose raw learner/employee AI content instead of redacted aggregate categories
- source/test failure not attributable to environment or unrelated pre-existing state

## Evidence Boundary

Evidence may record only role labels, route labels, failure/status categories, source marker categories, command names, and test counts.

Evidence must not record credentials, passwords, session/cookie/token/localStorage/Authorization values, env values, DB URLs, raw DB rows, internal numeric ids, Provider payloads, raw prompts, raw AI input/output, full question/paper/material/resource/chunk content, raw employee answers, screenshots, raw DOM, report snapshots, or plaintext `redeem_code`.
