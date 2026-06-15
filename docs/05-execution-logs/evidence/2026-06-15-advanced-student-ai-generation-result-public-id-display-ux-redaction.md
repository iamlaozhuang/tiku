# advanced-student-ai-generation-result-public-id-display-ux-redaction evidence

## Scope

- Task: hide student-facing public identifier text lists by default in the advanced personal AI generation result
  history/detail UI.
- Batch range: single task `advanced-student-ai-generation-result-public-id-display-ux-redaction`.
- Branch: `codex/advanced-student-ai-generation-result-public-id-display-ux-redaction`
- Commit: `2b49a6b106f3de44d1ecd40cc18ac801b0ec063f` pre-task base commit; final task commit is recorded in the
  closeout handoff after local commit.
- Approval: fresh user approval on 2026-06-15.
- localFullLoopGate: focused unit, diff check, lint, typecheck, GitCompletionReadiness, PreCommitHardening,
  ModuleCloseoutReadiness, and PrePushReadiness.
- threadRolloverGate: no rollover required; task is scoped to this thread and branch.
- nextModuleRunCandidate: readonly public-id redaction flow recheck, or fresh advanced queue seeding before the next
  implementation selection.
- Allowed source changes:
  - `src/features/student/ai-generation/StudentPersonalAiGenerationPage.tsx`
  - `src/features/student/ai-generation/StudentPersonalAiGenerationPage.test.tsx`

## Readiness

- Started from `master` after `git fetch --prune origin`.
- Confirmed clean worktree before task claim.
- Confirmed `HEAD == master == origin/master` at `2b49a6b106f3de44d1ecd40cc18ac801b0ec063f`.
- Confirmed no local or remote `codex/*` residual branches before creating this task branch.

## TDD

### RED

RED: failed as expected before implementation.

Command:

```powershell
npm.cmd run test:unit -- src/features/student/ai-generation/StudentPersonalAiGenerationPage.test.tsx
```

Expected failure after adding assertions that the result history/detail/error UI must not render public identifier text
values:

- `personal_ai_result_public_ui_501`
- `ai_generation_task_public_ui_501`
- `personal_ai_request_public_ui_501`
- `ai_call_log_public_ui_501`

Observed result: failed as expected with 1 failed test file, 3 failed tests, and 3 passing tests. Failure reason was that
the existing UI still rendered `personal_ai_result_public_ui_501`.

### GREEN

GREEN: passed after the UI stopped rendering public identifier text lists.

Implemented:

- Removed visible `ContractField` rows for `contextPublicId`, `requestPublicId`, `taskPublicId`, `resultPublicId`, and
  `aiCallLogPublicId` from the student-facing contract summary, request history, result history, and result detail
  render surfaces.
- Preserved internal `resultPublicId` use for result history keys, selected row state, detail button selection, and
  readonly detail route fetch.
- Kept redacted metadata, local contract state, not-found/error handling, and formal adoption blocked text.

Focused test result:

```powershell
npm.cmd run test:unit -- src/features/student/ai-generation/StudentPersonalAiGenerationPage.test.tsx
```

Result: pass, 1 test file, 6 tests.

## Validation

```powershell
git diff --check
```

Result: pass.

```powershell
npm.cmd run lint
```

Result: pass.

```powershell
npm.cmd run typecheck
```

Result: pass.

```powershell
rg -n 'label="(contextPublicId|requestPublicId|taskPublicId|resultPublicId|aiCallLogPublicId)"' src\features\student\ai-generation\StudentPersonalAiGenerationPage.tsx
```

Result: no visible public identifier `ContractField` labels remain.

```powershell
rg -n "resultPublicId|requestPublicId|taskPublicId|aiCallLogPublicId|contextPublicId" src\features\student\ai-generation\StudentPersonalAiGenerationPage.tsx
```

Result: remaining references are DTO/local mock defaults, stable React keys, selected-detail state, route fetch
parameters, or internal event plumbing. They are not student-facing public identifier text lists.

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master
```

Result: pass.

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId advanced-student-ai-generation-result-public-id-display-ux-redaction
```

Result: pass.

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId advanced-student-ai-generation-result-public-id-display-ux-redaction
```

Result: pass after evidence anchor update.

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId advanced-student-ai-generation-result-public-id-display-ux-redaction
```

Result: pass.

## Blocked Gates Preserved

- Cost Calibration Gate remains blocked.
- No `.env*` read/write/output.
- No DB access and no row/private data inspection.
- No provider/model calls, provider payload inspection, raw prompt inspection, or raw answer inspection.
- No quota/cost measurement or Cost Calibration Gate.
- No dev server.
- No Browser, Playwright, or e2e.
- No staging/prod/cloud/deploy/payment/external-service access.
- No schema, drizzle, scripts, package, lockfile, or dependency changes.
- No formal adoption write.
- No service/route/API contract changes.
- No PR and no force push.
- Blocked remainder: DB/provider/schema/dependency/e2e/browser/dev-server/staging/prod/cloud/deploy/payment/external
  service/formal adoption write work remains blocked.

## Result

result: pass

The UI now hides public identifier text lists by default while keeping the selected-result detail route flow intact.
