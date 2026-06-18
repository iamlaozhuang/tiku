# standard-core-student-local-full-flow-validation

## Scope

- Execute the pending queue task `standard-core-student-local-full-flow-validation`.
- Target experience chain: `standard-core-student`.
- Validate these standard student core use cases with fresh local full-flow evidence:
  - `UC-STD-ACCOUNT-SESSION`
  - `UC-STD-PERSONAL-AUTH-REDEEM`
  - `UC-STD-PRACTICE`
  - `UC-STD-MOCK-EXAM`
  - `UC-STD-REPORT-MISTAKE-BOOK`
- Use only the existing local Playwright specs named by the task:
  - `e2e/local-auth-route-guard.spec.ts`
  - `e2e/student-practice-mock-entry.spec.ts`
  - `e2e/local-business-flow.spec.ts`
- Record redacted command-result evidence only. Do not include screenshots, traces, DOM dumps, raw rows, public id
  inventories, tokens, credentials, Authorization headers, database URLs, raw prompts, raw answers, or provider payloads.

## Read Context

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/adr-001-tech-stack-selection.md`
- `docs/02-architecture/adr/adr-002-runtime-architecture-and-multi-client-contract.md`
- `docs/02-architecture/adr/adr-003-workplace-desktop-web-compatibility.md`
- `docs/02-architecture/adr/adr-004-environment-isolation-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-005-staging-architecture-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-006-runtime-dependency-alignment.md`
- `docs/04-agent-system/sop/local-experience-closure-governance.md`
- `docs/04-agent-system/state/execution-profiles.yaml`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/04-agent-system/state/local-experience-coverage-matrix.yaml`
- `docs/01-requirements/use-cases/use-case-catalog.md`
- `docs/01-requirements/traceability/unified-use-case-technical-matrix.md`
- `docs/01-requirements/traceability/unified-edition-delta-matrix.md`
- `docs/05-execution-logs/evidence/2026-06-18-standard-core-student-local-experience-batch.md`
- `docs/05-execution-logs/audits-reviews/2026-06-18-standard-core-student-local-experience-batch.md`
- `e2e/local-auth-route-guard.spec.ts`
- `e2e/student-practice-mock-entry.spec.ts`
- `e2e/local-business-flow.spec.ts`

## Approval Boundary

- Current user prompt gives fresh approval for this task's localhost Browser/Playwright runtime validation, limited to the
  three existing local e2e specs listed above.
- Current user prompt approves creating the short-lived branch, local closeout commit, fast-forward merge to `master`,
  push to `origin/master`, and short-branch cleanup for this task.
- The approval does not cover `.env*`, package or lockfile changes, dependency changes, schema/drizzle/migration,
  product source fixes, e2e spec edits, provider/model work, staging/prod/cloud/deploy/payment/external-service work, PR,
  force-push, destructive database operations, or Cost Calibration Gate.

## Allowed Work

- Update only:
  - `docs/04-agent-system/state/local-experience-coverage-matrix.yaml`
  - `docs/04-agent-system/state/project-state.yaml`
  - `docs/04-agent-system/state/task-queue.yaml`
  - this task plan
  - `docs/05-execution-logs/evidence/2026-06-18-standard-core-student-local-full-flow-validation.md`
  - `docs/05-execution-logs/audits-reviews/2026-06-18-standard-core-student-local-full-flow-validation.md`
- Read requirements, state, coverage matrix, related evidence/audit, source, tests, and the named existing e2e specs.
- Run the task-declared focused unit command, e2e list command, and targeted existing local e2e command.
- Run scoped Prettier, `git diff --check`, `npm.cmd run lint`, `npm.cmd run typecheck`, and Module Run v2 readiness
  gates.

## Blocked Work

- No product source, test source, or e2e spec edits.
- No `.env*`, package/lockfile/dependency, schema/drizzle/migration, provider/model, staging/prod/cloud/deploy/payment,
  external-service, PR, force-push, destructive database, or Cost Calibration Gate work.
- No product source repair if validation fails. A failure produces blocked evidence and the smallest recommended follow-up
  repair task only.

## Validation Plan

1. `npm.cmd run test:unit -- src/server/auth/session-route.test.ts src/server/auth/local-session-runtime.test.ts tests/unit/phase-8-student-authorization-redeem-runtime.test.ts src/server/services/practice-service.test.ts src/server/services/mock-exam-service.test.ts src/server/services/exam-report-service.test.ts src/server/services/mistake-book-service.test.ts`
2. `npm.cmd run test:e2e -- --list`
3. `npm.cmd run test:e2e -- e2e/local-auth-route-guard.spec.ts e2e/student-practice-mock-entry.spec.ts e2e/local-business-flow.spec.ts`
4. Scoped Prettier check for changed docs/state/evidence/audit/task-plan files.
5. `git diff --check`
6. `npm.cmd run lint`
7. `npm.cmd run typecheck`
8. Module Run v2 readiness gates:
   - `Test-ModuleRunV2PreCommitHardening.ps1`
   - `Test-ModuleRunV2ModuleCloseoutReadiness.ps1`
   - `Test-ModuleRunV2PrePushReadiness.ps1`

## Decision Policy

- If the focused unit command, e2e list, and targeted local full-flow e2e pass, keep the five coverage rows at
  `local_experience_ready`, update their fresh evidence to this task, and seed/recommend a separate
  `standard-core-student-experience-closure-readiness-audit`.
- Do not mark any row `experience_closed` in this validation task.
- If validation fails, keep the five rows at `local_experience_ready` or mark only the specific blocked gate, record
  blocked evidence, and recommend the smallest follow-up repair task. Do not fix product source.

## Risk Notes

- Existing Playwright config may start a local dev server for localhost-only validation. Evidence must record command
  result summaries, not browser artifacts.
- The named specs contain local development credentials and may exercise local writable flows; evidence must not echo
  credentials, tokens, public id inventories, screenshots, traces, or row data.
- Passing local full-flow evidence is not release readiness and does not approve staging/prod/provider/payment/deploy work.
