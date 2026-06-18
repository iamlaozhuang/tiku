# organization-training-admin-source-context-ui-response-key-contract-repair Evidence

## Task

- Task id: `organization-training-admin-source-context-ui-response-key-contract-repair`
- Branch: `codex/organization-training-local-experience-chain`
- Scope: admin organization-training source-context UI response-key contract repair plus related unit/e2e and coverage matrix updates.
- result: pass
- Closeout: not approved for local commit, merge, push, or branch cleanup.
- Experience closure: not claimed.
- Cost Calibration Gate remains blocked.

## Module Run v2 Evidence

- Batch range: single local UI contract repair task for organization-training source-context response-key alignment.
- RED: focused admin entry-surface unit test failed before implementation when route-style `data.context` was returned.
- GREEN: focused admin entry-surface unit test passed after the UI was updated to read `response.data.context`.
- Commit: `de549c3e` baseline before this uncommitted local repair; no task commit was created because closeout was not approved for this task.
- localFullLoopGate: scoped local full-flow passed after the UI response-key repair.
- threadRolloverGate: no thread rollover required.
- nextModuleRunCandidate: `organization-training-experience-closure-readiness-audit`.
- Blocked remainder: closure readiness audit, pre-commit hardening for the accumulated dirty branch, and Cost Calibration Gate remain blocked.

## Change Summary

- Updated the admin organization-training UI to read source-context attach success from `response.data.context`.
- Updated the admin entry-surface unit test to mock the runtime route contract key `data.context`.
- Left the route/API contract unchanged; no compatibility `attachment` alias was added.

## RED

Command:

```powershell
npm.cmd run test:unit -- tests/unit/organization-training-admin-entry-surface.test.ts
```

Result before implementation:

- Failed as expected.
- Failing assertion: UI did not show `来源 <source-public-id> 已绑定`.
- Observed UI state: `组织培训来源绑定失败`.
- Diagnosis: route contract returned successful `data.context`, while the UI read `data.attachment`.

## GREEN And Local Validation

Command:

```powershell
npm.cmd run test:unit -- tests/unit/organization-training-admin-entry-surface.test.ts
```

Result after implementation:

- Pass.
- Test files: 1 passed.
- Tests: 3 passed.

Command:

```powershell
npm.cmd run test:e2e -- e2e/organization-training-local-full-flow.spec.ts --list
```

Result:

- Pass.
- Listed tests: 1 test in 1 file.
- Target spec: `e2e/organization-training-local-full-flow.spec.ts`.

Command:

```powershell
npm.cmd run test:e2e -- e2e/organization-training-local-full-flow.spec.ts
```

Result:

- Pass.
- Test files: 1 passed.
- Tests: 1 passed.
- Covered local admin draft/source/copy and employee visible-list/draft-save/submit/readonly-summary flow.

Command:

```powershell
npm.cmd run test:unit -- tests/unit/organization-training-admin-entry-surface.test.ts tests/unit/organization-training-employee-entry-surface.test.ts
```

Result:

- Pass.
- Test files: 2 passed.
- Tests: 6 passed.

Command:

```powershell
npx.cmd prettier --check --ignore-unknown src/features/admin/organization-training/AdminOrganizationTrainingPage.tsx tests/unit/organization-training-admin-entry-surface.test.ts e2e/organization-training-local-full-flow.spec.ts docs/04-agent-system/state/local-experience-coverage-matrix.yaml docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-06-18-organization-training-admin-source-context-ui-response-key-contract-repair.md
```

Result:

- Pass.
- All matched files use Prettier code style.

Command:

```powershell
npm.cmd run lint
```

Result:

- Pass.

Command:

```powershell
npm.cmd run typecheck
```

Result:

- Pass.

Command:

```powershell
git diff --check
```

Result:

- Pass.

## Readiness Gates

Command:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId organization-training-admin-source-context-ui-response-key-contract-repair
```

Result:

- Failed.
- Primary cause: current branch contains inherited uncommitted files from earlier tasks outside this task's allowedFiles.
- Additional scanner findings: existing local seed fixture files contain `secret_assignment` markers.
- No commit was attempted.

Command:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId organization-training-admin-source-context-ui-response-key-contract-repair
```

Initial result before this evidence/audit was written:

- Failed because this task evidence and audit files were not present yet.

Rerun result after evidence/audit and Module Run v2 strict evidence fields were written:

- Pass.
- Evidence and audit paths were found.
- RED/GREEN/localFullLoopGate/thread rollover/next module run candidate fields were accepted.

Command:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId organization-training-admin-source-context-ui-response-key-contract-repair
```

Initial result before this evidence/audit was written:

- Failed because this task evidence and audit files were not present yet.
- Git completion readiness itself reported OK, with `master`, `origin/master`, and recorded state SHA aligned.

Rerun result after evidence/audit was written:

- Pass.
- Git completion readiness remained OK.

## Redaction

- No database URL, secret, session token, Authorization header, row data, provider payload, standard answer body, analysis body, or public ID list is recorded here.
- Public IDs in assertions are summarized as placeholders where not necessary for the contract evidence.

## Outcome

- Admin source-context UI response-key contract repaired.
- Scoped local full-flow passed.
- Organization-training rows in the local experience matrix are advanced to `local_experience_ready`.
- `experience_closed` is not claimed; next work is the closure readiness audit.
