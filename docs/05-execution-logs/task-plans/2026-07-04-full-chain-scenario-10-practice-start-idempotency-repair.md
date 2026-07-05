# 2026-07-04 Full-Chain Scenario 10 Practice Start Idempotency Repair Plan

Status: active

## Task

- Task id: `full-chain-scenario-10-practice-start-idempotency-repair-2026-07-04`
- Branch: `codex/full-chain-scenario-10-practice-start-idempotency-repair-2026-07-04`
- Target DB label: `tiku_full_chain_acceptance_20260704_001`
- Affected scenario: `full-chain-scenario-10-standard-employee-learning-rerun-after-marketing-3-content-provisioning-2026-07-04`
- Scope label: `marketing:3`
- Role label: `org_standard_employee`

## Read Gate

Read before implementation:

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/*.md`
- `docs/01-requirements/00-index.md`
- `docs/01-requirements/advanced-edition/00-index.md`
- `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`
- `docs/01-requirements/modules/03-student-experience.md`
- `docs/01-requirements/modules/02-question-paper.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/evidence/2026-07-04-full-chain-scenario-10-standard-employee-learning-rerun-after-marketing-3-content-provisioning.md`
- `docs/05-execution-logs/audits-reviews/2026-07-04-full-chain-scenario-10-standard-employee-learning-rerun-after-marketing-3-content-provisioning.md`
- `src/app/(student)/practice/page.tsx`
- `src/features/student/practice/StudentPracticePage.tsx`
- `src/server/services/practice-service.ts`
- `src/server/services/student-flow-runtime.ts`
- `src/server/repositories/practice-repository.ts`
- `src/server/repositories/student-flow-runtime-repository.ts`
- `src/db/schema/student-experience.ts`
- `tests/unit/student-practice-ui.test.ts`
- `src/server/services/practice-service.test.ts`
- `src/server/services/practice-route.test.ts`
- `tests/unit/phase-7-student-flow-runtime-smoke.test.ts`
- `C:/Users/jzzhu/.codex/plugins/cache/openai-curated-remote/superpowers/5.1.4/skills/systematic-debugging/SKILL.md`
- `C:/Users/jzzhu/.codex/plugins/cache/openai-curated-remote/superpowers/5.1.4/skills/test-driven-development/SKILL.md`

## Root Cause Hypothesis

Scenario 10 shows one browser learning flow producing two active `practice` rows for the same selected employee and selected paper. The likely root cause is concurrent practice start requests: the runtime page starts practice by POSTing `/api/v1/practices`, while the service currently uses a read-before-create flow. Two near-simultaneous requests can both observe no active practice and then both create a row.

## Execution Plan

1. Write a failing unit test for concurrent `startPractice` calls with the same `userPublicId` and `paperPublicId`.
2. Implement the smallest service-layer in-flight idempotency guard for the same user/paper start key.
3. Keep resume, expired-practice replacement, authorization invalidation, restart, answer submission, and route response contracts unchanged.
4. Run focused unit tests for practice UI/service/route.
5. Update evidence/audit/state/queue, run closeout gates, commit, fast-forward merge, push, delete short branch, then rerun Scenario 10 from browser login and standard learning node.

## Stop Rules

Stop and split a new task if the fix requires schema/migration/seed, dependency changes, destructive DB mutation, employee import repeat, Provider/staging/prod/Cost, broader authorization/product decision, redaction relaxation, or release readiness/final Pass/production usability claim.

## Evidence Rules

Allowed: task id, branch, selector/scope/role labels, aggregate counts, command names, pass/fail/block, and redacted summary.

Forbidden: credentials, phone, email, password, connection string, token, session, cookie, localStorage, Authorization header, raw DB rows, internal ids, screenshots, raw DOM, traces, Provider payload, raw Prompt, raw AI I/O, complete material/question/paper/resource/chunk content, private fixture contents, employee answers, and plaintext card values.
