# 2026-07-10 0704 History Recovery Smoke Plan

## Task

- Task id: `0704-history-recovery-smoke-2026-07-10`
- Branch: `codex/0704-history-recovery-smoke`
- Type: validation-only targeted local contract smoke.

## Read Gate

- `AGENTS.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/01-requirements/00-index.md`
- `docs/01-requirements/advanced-edition/00-index.md`
- `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`
- `docs/01-requirements/advanced-edition/modules/03-personal-ai-generation.md`
- `docs/01-requirements/advanced-edition/modules/08-organization-ai-generation.md`
- AI generation SSOT traceability from 2026-07-02, 2026-07-05, and 2026-07-06.
- `docs/05-execution-logs/acceptance/2026-07-10-0704-acceptance-coverage-ledger.md`
- Recent learner AI session/history/final regression evidence.
- Relevant result history, request history, learning-session, and learner UI tests.

## Scope

Validate that existing contracts cover:

- AI出题 and AI组卷 request/result history loading after initial page load and after submit refresh;
- result detail recovery for redacted learner AI组卷 paper assembly summaries;
- task-type isolated history queries for AI出题 and AI组卷;
- answer/progress review for persisted learner AI sessions;
- personal advanced and organization advanced employee ownership/actor isolation for recovery and resume paths.

## Non-Goals

- No fresh Provider output, AI generation submit against localhost, browser runtime, screenshot, raw DOM, dev server, direct
  DB connection, DB mutation, formal practice write, formal `answer_record`, formal `mistake_book`, schema, migration,
  seed, package, lockfile, dependency, staging/prod/deploy, PR, force push, or Cost Calibration.
- No source or test change.
- No credential value, session, token, cookie, env value, DB URL, DB row, internal numeric id, Provider payload, raw
  prompt, raw AI output, full question, full paper, material, resource, chunk, raw employee answer, or plaintext
  `redeem_code` in evidence.

## Validation Commands

- Redacted private catalog readiness preflight for 9 core roles.
- `corepack pnpm@10.26.1 exec vitest run tests/unit/student-personal-ai-generation-ui.test.ts src/server/validators/personal-ai-generation-request.test.ts src/server/services/personal-ai-generation-request-route.test.ts src/server/services/personal-ai-generation-request-history-service.test.ts src/server/services/personal-ai-generation-result-route.test.ts src/server/services/personal-ai-generation-result-history-service.test.ts src/server/services/personal-ai-generation-result-persistence-service.test.ts src/server/services/personal-ai-generation-route-integrated-result-materialization-service.test.ts src/server/services/personal-ai-generation-runtime-bridge-service.test.ts src/server/services/personal-ai-generation-learning-session-route.test.ts src/server/services/personal-ai-generation-learning-session-service.test.ts src/server/services/personal-ai-generation-learning-session-paper-source-resolver.test.ts`
- `corepack pnpm@10.26.1 exec prettier --check --ignore-unknown <scoped docs>`
- `git diff --check`
- blocked-path diff guard.
- `corepack pnpm@10.26.1 run lint`
- `corepack pnpm@10.26.1 run typecheck`
- Module Run v2 pre-commit hardening.
- Module Run v2 pre-push readiness with remote-ahead skip.

## Adversarial Review Focus

- History recovery must use session-owned user/employee context, not stale query ownership.
- AI组卷 history must show only redacted paper assembly summaries and not selected refs, stems, answers, analysis, raw prompt, or Provider payload.
- Resume/progress must stay actor-isolated for organization employees.
- Formal write boundary remains blocked for `practice`, `answer_record`, `exam_report`, and `mistake_book`.
