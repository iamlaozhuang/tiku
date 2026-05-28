# Phase 20 Fix RA-04-08 Prompt Template Source Of Truth Alignment Evidence

**Task id:** `phase-20-fix-ra-04-08-prompt-template-source-of-truth-alignment`

**Branch:** `codex/phase-20-fix-ra-04-08-prompt-template-source-of-truth-alignment`

## Summary

- Result: pass.
- Scope: implementation.
- Changed surfaces: local/mock model config runtime, prompt-template admin runtime, dev seed prompt metadata, focused tests, task plan/evidence/state.
- Gates: claim readiness, focused unit, full unit, build, full e2e, readiness, git completion inventory, diff check, naming, `dev_*` prompt key scan, and quality gate passed.
- Forbidden scope (`forbiddenScope`): real provider, env, dependency, schema, migration, staging, prod, cloud, deploy, auth permission model, raw prompt evidence, and destructive data work remain untouched and blocked.
- Residual gaps (`residualGaps`): none for `F-RA-04-08-001`.

## Startup and Claim

- Started after `phase-20-fix-ra-04-05-subjective-practice-ai-hint-scoring` was merged, pushed, cleaned up, and reconciled.
- `master` was clean/aligned with `origin/master` at `47bacc6c7226871f82fc57294a4a1e48623fe80e`.
- No local `codex/*` branch remained before this branch was created.
- Only root worktree `D:/tiku` was registered.
- Created branch `codex/phase-20-fix-ra-04-08-prompt-template-source-of-truth-alignment`.

## Command Results

| Command                                                                                                                                                                              | Result | Notes                                                                                                                                                   |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-TaskClaimReadiness.ps1 -TaskId phase-20-fix-ra-04-08-prompt-template-source-of-truth-alignment` | pass   | Task was `pending`, dependency was complete, branch was not protected, and no dependency/security metadata gate fired.                                  |
| `node .\node_modules\prettier\bin\prettier.cjs --write ...`                                                                                                                          | pass   | Formatted task plan/evidence/state plus touched source and test files.                                                                                  |
| `npm.cmd run test:unit -- src/ai/prompts/templates.test.ts ... tests/unit/student-mistake-book-ui.test.ts`                                                                           | fail   | First focused run failed only because the read-only prompt-template mutation test expected `404642`; actual shared `resourceNotFound` code is `404641`. |
| `npm.cmd run test:unit -- src/ai/prompts/templates.test.ts ... tests/unit/student-mistake-book-ui.test.ts`                                                                           | pass   | Rerun passed after updating expected code; `11` test files and `82` tests passed.                                                                       |
| `rg dev prompt keys`                                                                                                                                                                 | pass   | No output and exit code `1`, confirming no local `dev_*` prompt-template keys remained in source/tests/e2e.                                             |
| `git diff --check`                                                                                                                                                                   | pass   | No whitespace errors.                                                                                                                                   |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-AgentSystemReadiness.ps1`                                                                       | pass   | Required files, scripts, and skill/plugin capability inventory passed.                                                                                  |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-NamingConventions.ps1`                                                                          | pass   | Naming convention scan completed.                                                                                                                       |
| `npm.cmd run test:unit`                                                                                                                                                              | pass   | `134` test files and `558` tests passed.                                                                                                                |
| `npm.cmd run build`                                                                                                                                                                  | pass   | Next.js production build passed.                                                                                                                        |
| `npm.cmd run test:e2e`                                                                                                                                                               | pass   | `25` Playwright tests passed.                                                                                                                           |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`                                                  | pass   | Inventory showed only RA-04-08 scoped files changed or untracked.                                                                                       |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Invoke-QualityGate.ps1`                                                                              | pass   | `lint`, `typecheck`, `test:unit`, and `format:check` passed.                                                                                            |
| `git commit -m "fix(ai): align prompt template source of truth"`                                                                                                                     | pass   | Created `4fc3bed8a974c61f758deaff95048bd530c64073`; pre-commit `lint-staged`, `lint`, and `typecheck` passed.                                           |
| `git fetch origin`                                                                                                                                                                   | pass   | Refreshed remote state before merging to `master`.                                                                                                      |
| `git switch master`                                                                                                                                                                  | pass   | Switched to `master`; branch was up to date with `origin/master` before merge.                                                                          |
| `git merge --ff-only codex/phase-20-fix-ra-04-08-prompt-template-source-of-truth-alignment`                                                                                          | pass   | Fast-forwarded `master` from `47bacc6` to `4fc3bed`.                                                                                                    |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-AgentSystemReadiness.ps1`                                                                       | pass   | Post-merge readiness passed on `master`.                                                                                                                |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`                                                  | pass   | Post-merge inventory showed `master` ahead of `origin/master` by the single RA-04-08 implementation commit.                                             |
| `git diff --check`                                                                                                                                                                   | pass   | Post-merge whitespace check passed.                                                                                                                     |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-NamingConventions.ps1`                                                                          | pass   | Post-merge naming scan completed.                                                                                                                       |
| `npm.cmd run build`                                                                                                                                                                  | pass   | Post-merge Next.js production build passed.                                                                                                             |
| `npm.cmd run test:e2e`                                                                                                                                                               | pass   | Post-merge `25` Playwright tests passed.                                                                                                                |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Invoke-QualityGate.ps1`                                                                              | pass   | Post-merge `lint`, `typecheck`, `test:unit`, and `format:check` passed.                                                                                 |
| `git push origin master`                                                                                                                                                             | pass   | Pushed `master` from `47bacc6` to `4fc3bed`.                                                                                                            |
| `git branch -d codex/phase-20-fix-ra-04-08-prompt-template-source-of-truth-alignment`                                                                                                | pass   | Deleted the fully merged local short-lived branch.                                                                                                      |
| `git status --short --branch`                                                                                                                                                        | pass   | Cleanup inventory: `## master...origin/master`, no tracked, staged, or untracked files before this cleanup update.                                      |
| `git rev-list --left-right --count master...origin/master`                                                                                                                           | pass   | Cleanup inventory: `0 0`, confirming local `master` aligned with `origin/master`.                                                                       |
| `git branch --list "codex/*"`                                                                                                                                                        | pass   | Cleanup inventory: no local `codex/*` branches remained.                                                                                                |
| `git worktree list --porcelain`                                                                                                                                                      | pass   | Cleanup inventory: only root worktree `D:/tiku` remained, on `master` at `4fc3bed`.                                                                     |

## Implementation Notes

- Aligned local/mock runtime prompt template metadata to the static definitions in `src/ai/prompts/templates.ts`:
  - `ai_scoring_v1`
  - `ai_explanation_v1`
  - `ai_hint_v1`
  - `kn_recommendation_v1`
  - `learning_suggestion_v1`
- Updated local deterministic `model_config` snapshots, dev seed metadata, AI call log tests, mistake book tests, exam report tests, mock exam tests, and knowledge recommendation tests to use the same static prompt template keys and baseline hashes.
- Kept `GET /api/v1/prompt-templates` readable, but changed prompt-template create/update/enable/disable handlers to return the existing redaction-safe resource-not-found response without calling mutation repositories.
- The prompt-template mutation attempts still append failed audit entries when the caller is an authorized mutation actor; raw prompt body input is not normalized, persisted, returned, or recorded in evidence.
- No prompt body text was copied into this evidence.

## Closeout Status

- implementation commit: `4fc3bed8a974c61f758deaff95048bd530c64073`.
- merge: fast-forwarded into `master`.
- post-merge validation: readiness, git inventory, diff check, naming, build, e2e, and quality gate passed.
- push: `origin/master` updated to `4fc3bed8a974c61f758deaff95048bd530c64073`.
- cleanup: local short-lived branch deleted; no residual `codex/*` branch or extra worktree remained.
