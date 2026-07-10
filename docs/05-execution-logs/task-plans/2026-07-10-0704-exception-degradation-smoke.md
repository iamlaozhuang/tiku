# 2026-07-10 0704 Exception Degradation Smoke Plan

## Task

- Task id: `0704-exception-degradation-smoke-2026-07-10`
- Branch: `codex/0704-exception-degradation-smoke`
- Type: validation-only targeted local contract smoke.

## Read Gate

- `AGENTS.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/01-requirements/00-index.md`
- `docs/01-requirements/modules/03-student-experience.md`
- `docs/01-requirements/modules/04-ai-scoring.md`
- `docs/01-requirements/modules/05-rag-knowledge.md`
- `docs/01-requirements/modules/06-admin-ops.md`
- `docs/01-requirements/advanced-edition/00-index.md`
- `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`
- `docs/01-requirements/advanced-edition/modules/02-ai-task-domain.md`
- `docs/01-requirements/advanced-edition/modules/03-personal-ai-generation.md`
- `docs/01-requirements/advanced-edition/modules/07-retention-log-governance.md`
- `docs/01-requirements/advanced-edition/modules/08-organization-ai-generation.md`
- AI generation SSOT traceability from 2026-07-02, 2026-07-05, and 2026-07-06.
- Role/auth/training/log decision package and current-thread reconciliation ledger.
- `docs/05-execution-logs/acceptance/2026-07-10-0704-post-ai-acceptance-roadmap.md`
- `docs/05-execution-logs/acceptance/2026-07-10-0704-acceptance-coverage-ledger.md`
- Private 0704 credential index and canonical catalog, used in memory only.
- Targeted exception/degradation service and UI test entry points.

## Scope

Validate that existing contracts cover:

- Provider-disabled and Provider-unavailable status categories without Provider, env, secret, payload, prompt, AI output,
  or stack leakage.
- AI组卷 plan-and-select degradation: source insufficiency, no invented questions, no AI draft as source, and safe
  `provider_question_content_forbidden` category for Provider-generated nested question content.
- RAG/grounding weak or none paths: weak evidence needs confirmation where applicable; none blocks adoption or publish.
- Learner AI session failure paths: missing selected formal source, insufficient grounding, missing source result,
  resume/progress status, and formal write boundary.
- Admin logs and retry states: redacted summaries only, no raw prompt, raw output, Provider payload, secret, or raw employee
  answer.
- Organization training publish and employee-answer failure envelopes: invalid or unauthorized paths do not persist raw
  lineage, raw answers, formal `mock_exam`, `exam_report`, or `mistake_book` data.

## Non-Goals

- No fresh Provider output, Provider-enabled run, browser runtime, screenshot, raw DOM, dev server, direct DB connection,
  DB mutation, formal product data write, schema, migration, seed, package, lockfile, dependency, staging/prod/deploy, PR,
  force push, or Cost Calibration.
- No source or test change.
- No credential value, session, token, cookie, localStorage, Authorization header, env value, DB URL, DB row, internal
  numeric id, Provider payload, raw prompt, raw AI output, full question, full paper, material, resource, chunk, raw
  employee answer, stack trace, or plaintext `redeem_code` in evidence.

## Validation Commands

- Redacted private catalog readiness preflight for 9 core roles.
- `corepack pnpm@10.26.1 exec vitest run src/server/services/route-integrated-provider-execution-service.test.ts src/server/services/ai-paper-plan-and-select-service.test.ts src/server/services/ai-paper-route-assembly-service.test.ts src/server/services/ai-paper-route-plan-select-wiring-service.test.ts src/server/services/personal-ai-generation-learning-session-service.test.ts src/server/services/personal-ai-generation-request-flow-service.test.ts src/server/services/personal-ai-generation-result-history-service.test.ts src/server/services/personal-ai-generation-result-persistence-service.test.ts src/server/services/admin-ai-generation-failed-retry-state-service.test.ts tests/unit/admin-ai-audit-log-ops-baseline.test.ts tests/unit/admin-logs/admin-log-retention-redaction-layering.test.ts tests/unit/ai/provider-redaction-function-contract.test.ts src/server/services/organization-training-service.test.ts src/server/services/organization-training-route.test.ts tests/unit/organization-training-admin-entry-surface.test.ts tests/unit/organization-training-employee-entry-surface.test.ts`
- `corepack pnpm@10.26.1 exec prettier --check --ignore-unknown <scoped docs>`
- `git diff --check`
- blocked-path diff guard.
- `corepack pnpm@10.26.1 run lint`
- `corepack pnpm@10.26.1 run typecheck`
- Module Run v2 pre-commit hardening.
- Module Run v2 pre-push readiness with remote-ahead skip.

## Stop Conditions

- Readiness preflight fails for any core role.
- Any targeted smoke exposes raw Provider, prompt, AI output, stack, raw answer, full content, secret, env, DB row, internal
  id, or plaintext `redeem_code`.
- Any targeted smoke proves failure paths can write formal `question`, `paper`, `practice`, `mock_exam`, `exam_report`, or
  `mistake_book` outside approved flows.
- Any verified product defect stops this validation branch and requires a separate `codex/*` repair branch.
- Any source/test/package/lockfile/schema/migration/seed diff stops this validation task.

## Adversarial Review Focus

- Failure status categories must be useful to users but not disclose internals.
- Provider-disabled paths must not read secrets or execute Provider code.
- AI组卷 insufficiency must not be closed by invented generated questions.
- Weak/none evidence gates must block or require confirmation exactly where required.
- Learner AI failures must preserve private/employee ownership and avoid formal learning writes.
- Admin/log views must expose only redacted summaries and status categories.
