# Phase 11 Objective Feedback Correctness Fix Task Plan

## Scope

Fix the recorded P2 gap where objective questions created through content operations could be answered in practice, but the student practice feedback did not provide a closed correctness assertion.

This task runs only in local `dev`. It must not connect to staging/prod, deploy, read secrets, change dependencies, change schema/migrations, change scripts, or perform destructive data operations.

## Readiness Inputs

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/02-architecture/interfaces/phase-11-staging-release-planning-contract.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/evidence/2026-05-24-phase-11-role-based-full-flow-acceptance-rerun.md`

## Human Approval

The user approved fixing the P2 issue, plus one reviewable commit, merge to `master`, push to `origin/master`, and short-lived branch cleanup.

This approval does not cover dependency/package/lockfile changes, schema/migration changes, script changes, `.env.local` or secret access, staging/prod connection, deployment, cloud resource changes, real provider calls, destructive data operations, or sensitive/raw/full-content evidence.

## Debugging And TDD Plan

1. Reproduce the correctness gap with a focused failing test before production code changes.
2. Trace the practice answer data flow through route handler, service, repository, mapper, and stored answer snapshot.
3. Compare newly authored objective questions with working seed objective questions.
4. Implement the smallest fix at the root cause.
5. Make the failing test pass, then rerun targeted E2E, full E2E, build, and agent-system gates.

## Expected Runtime Behavior

For a published objective question created through content operations:

- submitting the correct option returns `feedback.answerRecordPublicId`;
- `feedback.isCorrect` is `true`;
- optional answer detail fields stay in API JSON camelCase;
- no internal auto-increment `id` leaks to API output.

## AC-To-Runtime Matrix

| Acceptance criterion              | Runtime surface                         | Current state    | Implementation evidence                                      | Remaining gap | Decision             |
| --------------------------------- | --------------------------------------- | ---------------- | ------------------------------------------------------------ | ------------- | -------------------- |
| Correct objective feedback closes | Practice answer API and role acceptance | `runtime_closed` | RED/GREEN unit tests and role acceptance E2E assertion       | none          | implemented          |
| Mock objective scoring aligns     | Mock exam submission                    | `runtime_closed` | RED/GREEN unit test for content-created objective snapshots  | none          | implemented          |
| Contract stays stable             | API response envelope and camelCase DTO | `runtime_closed` | Full unit, E2E, build, naming, and quality gates passed      | none          | implemented          |
| Evidence stays redacted           | Evidence and E2E attachments            | `runtime_closed` | Summaries only; no secret or raw payloads                    | none          | implemented          |
| Staging remains untouched         | Environment boundary                    | `not_executed`   | No staging/prod command, credential, deployment, or provider | none          | not_applicable_local |

## Validation Commands

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-TaskClaimReadiness.ps1 -TaskId phase-11-objective-feedback-correctness-fix
npm.cmd run test:unit
npm.cmd run test:e2e -- e2e/role-based-acceptance/role-based-full-flow.spec.ts
npm.cmd run test:e2e
npm.cmd run build
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-AgentSystemReadiness.ps1
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Invoke-QualityGate.ps1
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-NamingConventions.ps1
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master
```

## Closeout

- Root cause documented.
- Failing test observed before implementation.
- Fix implemented without dependency/schema/migration/script/env changes.
- Evidence, AC matrix, problem grading, validation records, and repository hygiene checklist updated.
- One reviewable commit merged and pushed after approval.
