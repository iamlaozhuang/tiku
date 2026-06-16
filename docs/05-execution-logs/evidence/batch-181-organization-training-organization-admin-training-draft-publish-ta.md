# Evidence: batch-181-organization-training-organization-admin-training-draft-publish-ta

## Module Run V2 Anchors

- Task: `batch-181-organization-training-organization-admin-training-draft-publish-ta`
- Batch range: single implementation task from the organization-training auto-seeded wave.
- Branch: `codex/organization-training-batch-181-draft-publish-flow`
- Baseline: `master == origin/master == 4462a5dc4ee322bf2fb3cde340ab8d30dad95222` before branch creation.
- Commit: `4462a5dc4ee322bf2fb3cde340ab8d30dad95222` accepted pre-task checkpoint; local closeout commit follows
  readiness gates.
- Approval: current 2026-06-16 Codex thread, explicit `批准执行` after next-step recommendation.
- localFullLoopGate: L6 scoped unit tests, diff check, lint, typecheck, GitCompletionReadiness, PreCommitHardening,
  ModuleCloseoutReadiness, and PrePushReadiness.
- threadRolloverGate: no rollover required; task stayed in the current thread and durable state.
- automationHandoffPolicy: no handoff required before closeout; next queued task remains batch-182 after this task closes.
- nextModuleRunCandidate: `batch-182-organization-training-employee-answer-lifecycle-local-role-flow`.
- nextTaskPolicy: seeded
- result: pass
- RED: PASS. Focused service tests failed because `takeDownVersion` and `copyVersionToNewDraft` were missing from the
  organization-training service.
- GREEN: PASS. Service-layer takedown and copy-to-new-draft orchestration were added with focused unit coverage.
- Cost Calibration Gate remains blocked.

## Readiness

Executed before branch creation:

```powershell
git switch master
git fetch --prune origin
git status --short --branch
git rev-parse HEAD master origin/master
git for-each-ref --format='%(refname:short)' refs/heads/codex refs/remotes/origin/codex
```

Result:

- Worktree was clean.
- `HEAD == master == origin/master == 4462a5dc4ee322bf2fb3cde340ab8d30dad95222`.
- No local or remote `codex/*` branches were present.

## Pre-Edit Readiness

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ImplementationAutoSeedReadiness.ps1 -TaskId phase-72-advanced-organization-training-implementation-planning -CandidateTaskId batch-181-organization-training-organization-admin-training-draft-publish-ta
```

Result: FAIL, then PASS on 2026-06-16.

- First run hard-blocked because the source planning evidence lacked these auto-seed readiness anchors:
  `implementationAutoSeedGate`, `localExperienceClosureGate`, `seededImplementationTask`, `focused test`, and
  `localFullLoopGate`.
- Candidate task checks passed in the first run.
- The source planning evidence was repaired with the missing text anchors only.
- Rerun reported `implementation auto-seed readiness passed`.

## Implementation

- Added service-layer takedown command/result/write types and `takeDownVersion` orchestration.
- Added service-layer copy-to-new-draft command/result/write types and `copyVersionToNewDraft` orchestration.
- Copy-to-new-draft accepts immutable source versions in `published` or `taken_down` status and creates a fresh draft
  without modifying the source version.
- Preserved route boundary: runtime route store still supports publish only; takedown/copy route methods are explicitly
  not configured in this task.
- No repository/schema/DB route expansion was performed.

## RED

```powershell
npm.cmd run test:unit -- src/server/services/organization-training-service.test.ts src/server/validators/organization-training.test.ts
```

Result: FAIL on 2026-06-16.

- `organization-training-service.test.ts`: 15 tests, 3 failed.
- Failures:
  - `service.takeDownVersion is not a function`
  - `service.copyVersionToNewDraft is not a function`
- `organization-training.test.ts` passed.
- This was the expected RED failure for missing service methods.

## GREEN

```powershell
npm.cmd run test:unit -- src/server/services/organization-training-service.test.ts src/server/validators/organization-training.test.ts
```

Result: PASS on 2026-06-16.

- Vitest reported `Test Files 2 passed (2)`.
- Vitest reported `Tests 21 passed (21)`.
- Exit code: 0.

```powershell
git diff --check
```

Result: PASS on 2026-06-16. No whitespace errors were reported.

```powershell
npm.cmd run lint
```

Result: PASS on 2026-06-16. `eslint` completed without reported errors.

```powershell
npm.cmd run typecheck
```

Result: PASS on 2026-06-16. `tsc --noEmit` completed without reported errors.

## Supplemental Full Unit Observation

```powershell
npm.cmd run test:unit -- --reporter=dot
```

Result: NOT PASSING on 2026-06-16.

- Exit code: 1.
- Vitest summary reported `Test Files 2 failed | 269 passed (271)`.
- Vitest summary reported `Tests 7 failed | 1043 passed (1050)`.
- Failing files were outside this task scope:
  - `tests/unit/admin-model-config-management-ui.test.ts`
  - `tests/unit/student-personal-ai-generation-ui.test.ts`
- The supplemental full-unit run did not report failures in the organization-training service or validator files changed
  by this task.

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master
```

Result: PASS on 2026-06-16.

- Reported current branch: `codex/organization-training-batch-181-draft-publish-flow`.
- Changed files were limited to task-scoped state/evidence/plan files and `src/server/services/**`.
- Exit code: 0.

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId batch-181-organization-training-organization-admin-training-draft-publish-ta
```

Result: PASS on 2026-06-16.

- `preCommitMode: hard_block`
- `filesToScan: 9`
- Scope scan reported `OK_SCOPE` for state files, task plan/evidence/audit, the source planning evidence anchor repair,
  and the three service files.
- Sensitive evidence and terminology scans completed without hard-block findings.
- Exit code: 0.

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId batch-181-organization-training-organization-admin-training-draft-publish-ta
```

Result: failed twice, then PASS on 2026-06-16.

- First run hard-blocked because the `Commit` evidence anchor still used the generated `pending` placeholder.
- Second run hard-blocked because the `Commit` evidence anchor did not place a commit hash immediately after `Commit:`.
- Implementation scope, validation commands, RED/GREEN evidence, localFullLoopGate, blocked remainder, and audit approval
  were accepted.
- Rerun reported `moduleCloseoutMode: hard_block`.
- Evidence and audit paths were accepted.
- Required validation commands were recorded.
- Module Run v2 strict evidence anchors passed.
- Exit code: 0.

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId batch-181-organization-training-organization-admin-training-draft-publish-ta
```

Result: PASS on 2026-06-16.

- `prePushMode: hard_block`
- Git readiness passed for `codex/organization-training-batch-181-draft-publish-flow`.
- `master == origin/master == 4462a5dc4ee322bf2fb3cde340ab8d30dad95222`.
- State SHA values were accepted under `accepted_ancestor_checkpoint`.
- Evidence and audit paths were accepted.
- Exit code: 0.

## Commit Hook Repair

```powershell
git commit -m "feat(organization-training): add draft publish lifecycle flow"
```

Result: BLOCKED, then repaired on 2026-06-16.

- Husky ran Module Run v2 PreCommit hardening successfully.
- `lint-staged` then blocked the commit because Prettier detected a duplicate `planPath` key in
  `docs/04-agent-system/state/task-queue.yaml`.
- The duplicate key was an accidental insertion into the first historical queue item; the valid batch-181 `planPath`
  remained on the batch-181 task.
- The accidental duplicate key was removed.

```powershell
npx.cmd --no-install prettier --check docs/04-agent-system/state/task-queue.yaml
```

Result: PASS on 2026-06-16. Prettier reported `All matched files use Prettier code style!`.

## Blocked Gates Preserved

- No `.env*` read/write/output.
- No real DB execution and no direct row/private data read.
- No provider/model call or provider configuration.
- No provider payload, raw prompt, or raw answer inspection.
- No quota/cost measurement and no Cost Calibration Gate work.
- Cost Calibration Gate remains blocked.
- No dev server, Browser, Playwright, or e2e.
- No staging/prod/cloud/deploy/payment/external-service access.
- No schema, drizzle, package, lockfile, or dependency changes.
- No repository/schema/DB route expansion.
- No formal `question`, `paper`, `practice`, `mock_exam`, `answer_record`, `exam_report`, or `mistake_book` write path.
- No public identifier value list exposure in evidence.
- No PR and no force push.

## Evidence Redaction

This evidence records file paths, field names, command results, and redacted conclusions only. It does not record secret,
token, cookie, Authorization header, database URL, provider payload, raw prompt, raw answer, row data, private data,
employee answer text, or public identifier value lists.
