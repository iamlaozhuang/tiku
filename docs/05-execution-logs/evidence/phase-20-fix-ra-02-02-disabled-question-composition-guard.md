# Phase 20 Fix RA-02-02 Disabled Question Composition Guard Evidence

**Task id:** `phase-20-fix-ra-02-02-disabled-question-composition-guard`

**Branch:** `codex/phase-20-fix-ra-02-02-disabled-question-composition-guard`

## Summary

- Result: pass, pending commit/merge/push/cleanup.
- Scope: implementation.
- Changed surfaces: paper draft repository source-question lookup, repository composition guard unit test, task plan/evidence/state.
- Gates: task claim readiness, focused unit, full unit, e2e, build, readiness, git inventory, diff, Prettier, naming, and local quality gate passed.
- Forbidden scope (`forbiddenScope`): no env/dependency/schema/migration/staging/prod/cloud/deploy/real provider/destructive data work.
- Residual gaps (`residualGaps`): none for `F-RA-02-02-001`; commit/merge/push/cleanup pending.

## Startup Recovery

- Started from `master` after `phase-20-fix-ra-05-04-markdown-chapter-review` was pushed and its short-lived branch was cleaned.
- `master` and `origin/master`: `1dcab599ed1e27f1391fedac8a749857499186fe`.
- No `codex/*` branch or extra worktree remained before creating the new task branch.
- Skipped `phase-20-fix-ra-02-01-question-knowledge-tag-binding` because its queue entry carries `database_migration` risk and no explicit approval is recorded.

## Claim Result

| Command                                                                                                                                                                        | Result | Notes                                                                                               |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------ | --------------------------------------------------------------------------------------------------- |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-TaskClaimReadiness.ps1 -TaskId phase-20-fix-ra-02-02-disabled-question-composition-guard` | pass   | Task was `pending`, dependency was complete, branch was not protected, and no high-risk gate fired. |

## Implementation Notes

- Tightened the draft-paper composition source-question lookup to pass `requiredStatus: "available"`.
- Added optional status filtering inside `findSourceQuestionByPublicId`, which adds `eq(question.status, input.requiredStatus)` only when a caller requests it.
- Preserved paper-copy behavior by leaving the copy path without `requiredStatus`, so copied published/archived papers can still include and mark disabled source questions.
- Added a focused regression test proving the new composition lookup requires available questions while the copy snapshot lookup remains unrestricted.
- Did not modify schema, migrations, env files, dependencies, auth/permission model, deployment, cloud resources, or destructive data behavior.

## Command Results

| Command                                                                                                                                                                        | Result | Notes                                                                                            |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------ | ------------------------------------------------------------------------------------------------ |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-TaskClaimReadiness.ps1 -TaskId phase-20-fix-ra-02-02-disabled-question-composition-guard` | pass   | Reran after implementation; task remained claimed/eligible and no high-risk gate fired.          |
| `npm.cmd run test:unit -- tests/unit/paper-draft-repository-composition-guard.test.ts`                                                                                         | fail   | TDD red before implementation: repository did not contain `requiredStatus: "available"`.         |
| `npm.cmd run test:unit -- tests/unit/paper-draft-repository-composition-guard.test.ts`                                                                                         | pass   | Focused regression passed after repository update and again after Prettier write.                |
| `npm.cmd run test:unit`                                                                                                                                                        | pass   | 133 test files, 547 tests passed.                                                                |
| `npm.cmd run test:e2e`                                                                                                                                                         | pass   | 25 Playwright tests passed.                                                                      |
| `npm.cmd run build`                                                                                                                                                            | pass   | Next.js build passed; framework log noted `.env.local` existence only, contents were not read.   |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-AgentSystemReadiness.ps1`                                                                 | pass   | Required docs/scripts/npm scripts and skill/plugin anchors reported OK.                          |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`                                            | pass   | Inventory showed only scoped task changes/untracked plan/evidence/test files.                    |
| `git diff --check`                                                                                                                                                             | pass   | No whitespace errors.                                                                            |
| changed-file Prettier check                                                                                                                                                    | pass   | Initial check found evidence/test formatting warnings; `--write` fixed them; final check passed. |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-NamingConventions.ps1`                                                                    | pass   | Banned terms, API route case, and DTO field case checks passed.                                  |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Invoke-QualityGate.ps1`                                                                        | pass   | `lint`, `typecheck`, `test:unit` (133 files, 547 tests), and `format:check` passed.              |

## Closeout Status

- commit: pending.
- merge: pending.
- push: pending.
- cleanup: pending.
