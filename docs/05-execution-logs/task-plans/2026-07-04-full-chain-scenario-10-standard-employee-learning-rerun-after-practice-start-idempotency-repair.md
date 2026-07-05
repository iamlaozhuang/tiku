# 2026-07-04 Full-Chain Scenario 10 Standard Employee Learning Rerun After Practice Start Idempotency Repair Plan

Status: active

## Task

- Task id: `full-chain-scenario-10-standard-employee-learning-rerun-after-practice-start-idempotency-repair-2026-07-04`
- Branch: `codex/full-chain-scenario-10-standard-employee-learning-rerun-after-practice-start-idempotency-repair-2026-07-04`
- Target DB label: `tiku_full_chain_acceptance_20260704_001`
- Employee selector label: `fc_org_standard_employee`
- Imported employee batch selector label: `fc_org_standard_employee_batch`
- Content scope label: `marketing:3`
- Role label: `org_standard_employee`

## Read Gate

Read before runtime/preflight:

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
- `docs/05-execution-logs/evidence/2026-07-04-full-chain-scenario-10-practice-start-idempotency-repair.md`
- `docs/05-execution-logs/audits-reviews/2026-07-04-full-chain-scenario-10-practice-start-idempotency-repair.md`
- `src/app/(student)/practice/page.tsx`
- `src/features/student/practice/StudentPracticePage.tsx`
- `src/server/services/practice-service.ts`
- `src/server/repositories/practice-repository.ts`
- `src/server/repositories/student-flow-runtime-repository.ts`
- `src/db/schema/student-experience.ts`
- `tests/unit/student-practice-ui.test.ts`
- `src/server/services/practice-service.test.ts`
- `src/server/services/practice-route.test.ts`

## Execution Plan

1. Align branch, state, queue, plan, evidence, and audit before runtime.
2. Run selector/DB target/content/pre-state preflight. Stop if DB target mismatches, required selector/account/content/auth is missing, or leftover active duplicate practice state blocks a clean rerun.
3. Start local app on loopback against the isolated DB target without editing `.env*`.
4. Before any product DB write, run browser login smoke with hydrated/interactable readiness and submit-enabled proof.
5. Continue only from standard employee login and learning node; do not repeat employee import.
6. Exercise standard employee practice learning through product UI without clicking AI actions.
7. Verify standard employee cannot submit enterprise training or AI generation actions.
8. Verify selector-scoped aggregate DB counts, including active duplicate practice invariant.
9. Stop runtime, update evidence/audit/state/queue, run closeout gates, commit, fast-forward merge, push, delete short branch, then continue Scenario 11 or split repair/provisioning if blocked.

## Stop Rules

Stop and split repair/provisioning on DB target mismatch, missing standard employee selector, missing standard org auth, missing `marketing:3` content, browser login failure, permission bypass, redaction risk, duplicate active practice pollution requiring DB provisioning, product source/test repair need, schema/migration/seed need, Provider/staging/prod/Cost need, destructive DB operation, employee import repeat requirement, or release readiness/final Pass/production usability claim.

## Evidence Rules

Allowed: task id, branch, route/surface label, selector label, role label, scope label, aggregate counts, command name, pass/fail/block, and redacted summary.

Forbidden: credentials, phone, email, password, connection string, token, session, cookie, localStorage, Authorization header, raw DB rows, internal ids, screenshots, raw DOM, traces, Provider payload, raw Prompt, raw AI I/O, complete material/question/paper/resource/chunk content, private fixture contents, employee answers, and plaintext card values.
