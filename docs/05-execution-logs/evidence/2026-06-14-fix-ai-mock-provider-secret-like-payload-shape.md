# Evidence: fix-ai-mock-provider-secret-like-payload-shape

result: pass

## Task

- Task id: `fix-ai-mock-provider-secret-like-payload-shape`
- Branch: `codex/fix-ai-mock-provider-secret-like-payload-shape`
- Batch range: strict serial task 5 of 6 requested by the user.
- Commit: `f028f0ad126e6662a561119ed9b983418c9a86ec` pre-closeout base; final local task commit follows readiness gates.
- Date: 2026-06-14 local time.

## Start Checkpoint

| Checkpoint                      | Result                                                  |
| ------------------------------- | ------------------------------------------------------- |
| Current branch                  | `codex/fix-ai-mock-provider-secret-like-payload-shape`  |
| `HEAD`                          | `f028f0ad126e6662a561119ed9b983418c9a86ec`              |
| `master`                        | `f028f0ad126e6662a561119ed9b983418c9a86ec`              |
| `origin/master`                 | `f028f0ad126e6662a561119ed9b983418c9a86ec`              |
| Worktree before task 5 edits    | clean                                                   |
| Local `codex/*` residue         | none before branch creation; current branch after claim |
| Remote `origin/codex/*` residue | none observed                                           |

## Human Approval Boundary

The user approved strict serial execution of task 5 after task 4 closeout:

- use TDD or existing redaction tests to prove the mock provider does not construct secret-like provider payload fields;
- preserve redaction behavior;
- do not perform real provider calls or provider/env/secret configuration;
- do not touch schema/migration, dependencies, e2e, deploy, payment, external-service, PR, force-push, or Cost
  Calibration Gate.

## RED / GREEN Evidence

RED: `npm.cmd run test:unit -- tests/unit/ai/provider-redaction-function-contract.test.ts` failed as expected after the
redaction test was tightened to expect neutral redaction references instead of payload-shaped envelopes.

GREEN: `npm.cmd run test:unit -- tests/unit/ai/provider-redaction-function-contract.test.ts` passed after
`createMockAiProvider()` stopped constructing payload-envelope objects and returned neutral redaction references.

- RED command: `npm.cmd run test:unit -- tests/unit/ai/provider-redaction-function-contract.test.ts`
- RED result: failed as expected, 1 failed and 1 passed. The failing assertion showed `payloadKind: "provider_request"`
  and a payload-shaped summary.
- GREEN implementation: `createMockAiProvider()` now creates `request_redaction_boundary` and
  `response_redaction_boundary` references, while the public `MockLearningSuggestionResult` keeps `unknown` payload
  fields for fixture compatibility.
- GREEN command: `npm.cmd run test:unit -- tests/unit/ai/provider-redaction-function-contract.test.ts`
- GREEN result: pass, 1 test file and 2 tests.

## Validation Results

| Command                                                                                                                                                                             | Result                                                                          |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| `npm.cmd run test:unit -- tests/unit/ai/provider-redaction-function-contract.test.ts`                                                                                               | pass, 1 file and 2 tests                                                        |
| `git diff --check`                                                                                                                                                                  | pass                                                                            |
| `npm.cmd run lint`                                                                                                                                                                  | pass                                                                            |
| `npm.cmd run typecheck`                                                                                                                                                             | initial fail after an over-narrow type change in `MockLearningSuggestionResult` |
| `npm.cmd run typecheck`                                                                                                                                                             | pass after restoring public payload fields to `unknown`                         |
| `npm.cmd run test:unit -- tests/unit/ai/provider-redaction-function-contract.test.ts`                                                                                               | pass after type compatibility repair, 1 file and 2 tests                        |
| `git diff --check`                                                                                                                                                                  | pass after type compatibility repair                                            |
| `npm.cmd run lint`                                                                                                                                                                  | pass after type compatibility repair                                            |
| `npm.cmd run test:unit`                                                                                                                                                             | pass, 260 files and 956 tests                                                   |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId fix-ai-mock-provider-secret-like-payload-shape`      | pass                                                                            |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId fix-ai-mock-provider-secret-like-payload-shape` | pass                                                                            |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId fix-ai-mock-provider-secret-like-payload-shape`        | pass                                                                            |

## Scope Review

Changed source and test files stayed within the approved task scope:

- `src/ai/mock-provider.ts`
- `tests/unit/ai/provider-redaction-function-contract.test.ts`

Approved governance/log files were also updated or created under:

- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/**`
- `docs/05-execution-logs/evidence/**`
- `docs/05-execution-logs/audits-reviews/**`

No `.env.local`, `.env.*`, package/lockfile, schema/migration, drizzle, e2e, script, real provider, deploy, payment, or
external-service file was changed.

## Gates

- localFullLoopGate: pass after targeted AI/redaction test, lint, typecheck, and full unit.
- threadRolloverGate: not required for this closeout.
- automationHandoffPolicy: complete only after final Module Run v2 gates, local commit, fast-forward merge to `master`,
  master-side validation, push `origin/master`, and merged short-branch cleanup.
- nextModuleRunCandidate: `audit-student-experience-unit-suite-timeout` remains unclaimed until this branch is fully
  closed.
- Cost Calibration Gate remains blocked.

## Blocked Remainder

Continuing to task 6 before branch closeout, PR, force-push, e2e, real provider/model requests, quota use,
env/secret/provider configuration, schema/migration, dependency/package/lockfile changes, staging/prod/cloud/deploy,
payment, external-service, and Cost Calibration Gate remain blocked.

Cost Calibration Gate remains blocked.

## Evidence Redaction

This evidence records command names, pass/fail summaries, file paths, and policy boundaries only. It omits token values,
Authorization headers, passwords, secrets, database URLs, row data, provider payloads, model responses, raw prompts,
generated content, and private user data.
