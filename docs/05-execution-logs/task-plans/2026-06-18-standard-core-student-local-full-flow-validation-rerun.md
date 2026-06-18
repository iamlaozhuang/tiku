# Task Plan: standard-core-student-local-full-flow-validation-rerun

## Required Reading

- AGENTS.md
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/evidence/2026-06-18-standard-core-student-local-full-flow-validation.md`
- `docs/05-execution-logs/evidence/2026-06-18-standard-core-student-local-full-flow-contract-repair.md`
- Existing approved local e2e specs:
  - `e2e/local-auth-route-guard.spec.ts`
  - `e2e/student-practice-mock-entry.spec.ts`
  - `e2e/local-business-flow.spec.ts`

## Scope

- Task id: `standard-core-student-local-full-flow-validation-rerun`
- Reruns the standard student core local full-flow validation after repair commit `c166b77e`.
- Target chain: `standard-core-student`
- Use cases: `UC-STD-ACCOUNT-SESSION`, `UC-STD-PERSONAL-AUTH-REDEEM`, `UC-STD-PRACTICE`, `UC-STD-MOCK-EXAM`,
  `UC-STD-REPORT-MISTAKE-BOOK`

## Boundaries

- May update only docs/state/evidence/audit files for this validation task.
- Product source, tests, e2e specs, `.env*`, dependencies, lockfiles, schema/drizzle/migration, provider/model,
  staging/prod/cloud/deploy/payment/external-service, destructive DB, PR, force-push, and Cost Calibration Gate remain
  blocked.
- Localhost Browser/Playwright runtime is approved only for the three existing specs listed above.

## Plan

1. Run focused unit gates that cover the repair contracts.
2. Run `npm.cmd run test:e2e -- --list`.
3. Run the approved targeted local full-flow e2e specs.
4. Run diff check, lint, typecheck, and Module Run v2 closeout gates.
5. If the targeted e2e specs pass, record fresh pass evidence and seed/enter closure readiness audit. If they fail, record
   blocked evidence and recommend the smallest next repair.

## Validation Commands

```powershell
npm.cmd run test:unit -- src/db/dev-seed.test.ts tests/unit/auth/session-personal-auth-boundary.test.ts tests/unit/student-login-ui.test.ts tests/unit/student-practice-ui.test.ts tests/unit/student-mock-exam-report-ui.test.ts tests/unit/student-mistake-book-ui.test.ts
npm.cmd run test:e2e -- --list
npm.cmd run test:e2e -- e2e/local-auth-route-guard.spec.ts e2e/student-practice-mock-entry.spec.ts e2e/local-business-flow.spec.ts
git diff --check
npm.cmd run lint
npm.cmd run typecheck
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId standard-core-student-local-full-flow-validation-rerun
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId standard-core-student-local-full-flow-validation-rerun
```

## Risks

- The e2e run uses the current local runtime and may expose stale local data issues; blocked evidence is acceptable if the
  runtime still fails.
- This validation must not mark `experience_closed`; closure remains a separate audit task.
