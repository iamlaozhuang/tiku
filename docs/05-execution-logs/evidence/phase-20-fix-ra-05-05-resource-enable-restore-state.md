# Phase 20 Fix RA-05-05 Resource Enable Restore State Evidence

**Task id:** `phase-20-fix-ra-05-05-resource-enable-restore-state`

**Branch:** `codex/phase-20-fix-ra-05-05-resource-enable-restore-state`

## Summary

- Result: pass.
- Scope: implementation.
- Changed surfaces: local resource lifecycle service, resource enable API route, resource state matrix tests, local resource lifecycle tests, task plan/evidence/state.
- Gates: focused unit, typecheck, full unit, build, e2e, readiness, git inventory, naming, diff check, and quality gate passed.
- Forbidden scope (`forbiddenScope`): env/dependency/schema/migration/staging/prod/cloud/deploy/real provider not touched.
- Residual gaps (`residualGaps`): RA-06-06 ops_admin browser evidence remains separate unless covered by this task.

## Startup Recovery

- Started from clean `master` after RA-04-08 cleanup commit `9fdaa4c1f9f2a280a4d405a785741aeb523a76ff` was pushed.
- `master...origin/master` was `0 0`.
- No local `codex/*` branches remained before creating this task branch.
- Only root worktree `D:/tiku` was registered.
- Phase 20/21/22 selected queue count before claim: `TOTAL=52`, `closed=21`, `blocked=1`, `pending=30`.
- `phase-20-fix-ra-05-05-resource-enable-restore-state` was selected because 22-B/22-D remaining executable candidates were blocked by high-risk gates, while RA-05-05 has no dependency, environment, schema, provider, cloud, deploy, or auth permission gate.

## Command Results

| Command                                                                                                                                                                  | Result | Notes                                                                                                                                                |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------ | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| `git status --short --branch`                                                                                                                                            | pass   | `master` was clean before branch creation.                                                                                                           |
| `git rev-list --left-right --count master...origin/master`                                                                                                               | pass   | `0 0`, confirming local `master` was aligned with `origin/master`.                                                                                   |
| `git branch --list codex/*`                                                                                                                                              | pass   | No residual short-lived branches before this task branch.                                                                                            |
| `git worktree list --porcelain`                                                                                                                                          | pass   | Only root worktree `D:/tiku` existed.                                                                                                                |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-AgentSystemReadiness.ps1`                                                           | pass   | Required standards, ADR/interface anchors, automation scripts, package scripts, and skill paths were present.                                        |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-TaskClaimReadiness.ps1 -TaskId phase-20-fix-ra-05-05-resource-enable-restore-state` | pass   | Task was `pending`, dependency was complete, branch was not protected, and no dependency/security metadata gate fired.                               |
| `npm.cmd run test:unit -- src/server/models/ai-rag.test.ts tests/unit/phase-11-resource-knowledge-base-publish-index-loop.test.ts`                                       | fail   | TDD pre-implementation run failed because `handlers.resources.enable` did not exist.                                                                 |
| `npm.cmd run test:unit -- src/server/models/ai-rag.test.ts tests/unit/phase-11-resource-knowledge-base-publish-index-loop.test.ts`                                       | pass   | Focused rerun passed after adding local enable/restore behavior and adjusting retrieval-strength assertion.                                          |
| `node .\node_modules\prettier\bin\prettier.cjs --write ...`                                                                                                              | pass   | Initial sandbox run hit EPERM reading local `node_modules`; escalated run formatted touched source, tests, route, state, plan, and evidence files.   |
| `npm.cmd run typecheck`                                                                                                                                                  | fail   | Initial sandbox run hit EPERM reading local TypeScript; escalated run then caught nullable `disabledFromStatus` narrowing in `enableLocalResource`.  |
| `npm.cmd run typecheck`                                                                                                                                                  | pass   | Rerun passed after explicitly narrowing the restored status before assigning `resourceStatus`.                                                       |
| `git diff --check`                                                                                                                                                       | pass   | No whitespace errors.                                                                                                                                |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-NamingConventions.ps1`                                                              | pass   | Naming convention scan completed; new enable route keeps kebab-case and publicId route parameter style.                                              |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-AgentSystemReadiness.ps1`                                                           | pass   | Required standards, ADR/interface anchors, automation scripts, package scripts, and skill paths were present after implementation.                   |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`                                      | pass   | Inventory showed only RA-05-05 scoped files changed or untracked.                                                                                    |
| `npm.cmd run test:unit`                                                                                                                                                  | pass   | `134` test files and `558` tests passed.                                                                                                             |
| `npm.cmd run build`                                                                                                                                                      | pass   | Next.js production build passed; route inventory included `/api/v1/resources/[publicId]/enable`. Framework output only noted `.env.local` existence. |
| `npm.cmd run test:e2e`                                                                                                                                                   | pass   | `25` Playwright tests passed.                                                                                                                        |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Invoke-QualityGate.ps1`                                                                  | pass   | `lint`, `typecheck`, `test:unit`, and `format:check` passed.                                                                                         |

## Implementation Notes

- Added local-only resource enable/restore handling under `handlers.resources.enable`.
- Added `POST /api/v1/resources/[publicId]/enable` as a publicId-safe action route.
- Restore uses the existing local catalog `disabledFromStatus` value and the existing `canTransitionResourceStatus("disabled", targetStatus)` guard.
- Restoring to `published` requires Markdown content and hash to exist.
- Restoring to `rag_ready` additionally requires local backing vector evidence (`chunkCount > 0` and non-empty `textHashes`) so a disabled resource cannot be restored into RAG eligibility without local chunk/vector proof.
- Added complete resource transition matrix coverage in `src/server/models/ai-rag.test.ts`.
- Extended the local resource lifecycle test to cover disable, no retrieval while disabled, enable/restore, restored retrieval, and redaction-safe audit logging.
- Did not add database repository restore behavior because precise durable restore would need schema support for `disabledFromStatus`, which is outside this low-risk task and remains a database migration boundary.

## Closeout Status

- implementation commit: `8bf9af9c8aafb0b6ece2d5e5e708574798b8d1bc`.
- merge: fast-forwarded into `master`.
- post-merge validation:
  - `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-AgentSystemReadiness.ps1` - pass.
  - `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master` - pass; `master` was ahead of `origin/master` by the single RA-05-05 implementation commit.
  - `git diff --check` - pass.
  - `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-NamingConventions.ps1` - pass.
  - `npm.cmd run build` - pass; route inventory included `/api/v1/resources/[publicId]/enable`.
  - `npm.cmd run test:e2e` - pass; `25` tests passed.
  - `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Invoke-QualityGate.ps1` - pass; `lint`, `typecheck`, `test:unit` (`134` files, `558` tests), and `format:check` passed.
- push: `origin/master` updated from `9fdaa4c` to `8bf9af9`.
- cleanup:
  - initial `git branch -d codex/phase-20-fix-ra-05-05-resource-enable-restore-state` failed in sandbox with ref lock permission denied.
  - escalated `git branch -d codex/phase-20-fix-ra-05-05-resource-enable-restore-state` passed; deleted already-merged branch at `8bf9af9`.
- final cleanup verification before this evidence update:
  - `git status --short --branch` showed `## master...origin/master`.
  - `git rev-list --left-right --count master...origin/master` returned `0 0`.
  - `git branch --list codex/*` returned no branches.
  - `git worktree list --porcelain` showed only root worktree `D:/tiku` on `master` at `8bf9af9`.
