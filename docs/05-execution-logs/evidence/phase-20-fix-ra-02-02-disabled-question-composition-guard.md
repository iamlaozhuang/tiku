# Phase 20 Fix RA-02-02 Disabled Question Composition Guard Evidence

**Task id:** `phase-20-fix-ra-02-02-disabled-question-composition-guard`

**Branch:** `codex/phase-20-fix-ra-02-02-disabled-question-composition-guard`

## Summary

- Result: pass.
- Scope: implementation.
- Changed surfaces: paper draft repository source-question lookup, repository composition guard unit test, task plan/evidence/state.
- Gates: task claim readiness, focused unit, full unit, e2e, build, readiness, git inventory, diff, Prettier, naming, and local quality gate passed.
- Forbidden scope (`forbiddenScope`): no env/dependency/schema/migration/staging/prod/cloud/deploy/real provider/destructive data work.
- Residual gaps (`residualGaps`): none for `F-RA-02-02-001`.

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

- implementationCommit: `e92789a93342fbef443cdce0ad25e68177b2fe4e` (`fix(paper): guard disabled question composition`).
- merge: `458fe0851f91c812b56b4167ed594114d26a021a` (`merge: phase-20 fix ra-02-02 disabled question composition guard`) merged into `master`.
- post-merge master validation:
  - `npm.cmd run test:unit` - pass, 133 test files and 547 tests.
  - `npm.cmd run test:e2e` - pass, 25 Playwright tests.
  - `npm.cmd run build` - pass; framework log noted `.env.local` existence only, contents were not read or copied.
  - `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-AgentSystemReadiness.ps1` - pass.
  - `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master` - pass; `master` was ahead of `origin/master` by implementation and merge commits only.
  - `git diff --check` - pass.
  - changed-file Prettier check - pass; sandbox check hit node_modules EPERM, escalated read-only rerun passed.
  - `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-NamingConventions.ps1` - pass.
  - `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Invoke-QualityGate.ps1` - pass; `lint`, `typecheck`, `test:unit`, and `format:check` passed.
- closeoutEvidenceCommit: `779820f0fb5fec1f764a53708123264fad58b248` (`docs(paper): record disabled question composition closeout`).
- push: `git push origin master` passed, `1dcab59..779820f master -> master`.
- cleanup:
  - initial `git branch -d codex/phase-20-fix-ra-02-02-disabled-question-composition-guard` failed in sandbox with ref lock permission denied.
  - escalated `git branch -d codex/phase-20-fix-ra-02-02-disabled-question-composition-guard` passed; deleted already-merged branch at `e92789a`.
- final cleanup verification before this evidence update:
  - `git status --short --branch` showed `## master...origin/master`.
  - `git rev-parse HEAD` and `git rev-parse origin/master` both returned `779820f0fb5fec1f764a53708123264fad58b248`.
  - `git branch --list "codex/*"` returned no branches.
  - `git worktree list` showed only `D:/tiku  779820f [master]`.
