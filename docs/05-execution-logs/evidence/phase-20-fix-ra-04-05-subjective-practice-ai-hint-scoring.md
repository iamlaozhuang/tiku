# Phase 20 Fix RA-04-05 Subjective Practice AI Hint Scoring Evidence

**Task id:** `phase-20-fix-ra-04-05-subjective-practice-ai-hint-scoring`

**Branch:** `codex/phase-20-fix-ra-04-05-subjective-practice-ai-hint-scoring`

## Summary

- Result: pass.
- Scope: evidence_only.
- Changed surfaces: task plan/evidence/state only; no source, test, e2e, schema, dependency, env, cloud, deploy, auth, or data changes.
- Gates: claim readiness, focused practice service/UI unit, full unit, full e2e, readiness, git completion inventory, diff check, naming, and quality gate passed.
- Forbidden scope (`forbiddenScope`): real provider, env, dependency, schema, migration, staging, prod, cloud, deploy, auth permission model, and destructive data work remain untouched and blocked.
- Residual gaps (`residualGaps`): none for `F-RA-04-05-001`; this task closes the missing-evidence gap against existing local/mock runtime behavior.

## Startup and Claim

- Started after `phase-20-fix-ra-04-04-practice-ai-explanation-triggers` was merged, pushed, and cleaned up.
- `master` was clean/aligned with `origin/master` at `136fdfdc3dfbad653b265418f1b984acde31c591`.
- No local `codex/*` branch remained before this branch was created.
- Only root worktree `D:/tiku` was registered.
- Created branch `codex/phase-20-fix-ra-04-05-subjective-practice-ai-hint-scoring`.

## Command Results

| Command                                                                                                                                                                                                                                                                                                                                                 | Result | Notes                                                                                                                  |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ | ---------------------------------------------------------------------------------------------------------------------- |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-TaskClaimReadiness.ps1 -TaskId phase-20-fix-ra-04-05-subjective-practice-ai-hint-scoring`                                                                                                                                                                          | pass   | Task was `pending`, dependency was complete, branch was not protected, and no dependency/security metadata gate fired. |
| `node .\node_modules\prettier\bin\prettier.cjs --write docs\04-agent-system\state\project-state.yaml docs\04-agent-system\state\task-queue.yaml docs\05-execution-logs\task-plans\2026-05-29-phase-20-fix-ra-04-05-subjective-practice-ai-hint-scoring.md docs\05-execution-logs\evidence\phase-20-fix-ra-04-05-subjective-practice-ai-hint-scoring.md` | pass   | Formatted the RA-04-05 plan, evidence, and state files.                                                                |
| `npm.cmd run test:unit -- src/server/services/practice-service.test.ts tests/unit/student-practice-ui.test.ts`                                                                                                                                                                                                                                          | pass   | `2` test files and `40` tests passed.                                                                                  |
| `npm.cmd run test:unit`                                                                                                                                                                                                                                                                                                                                 | pass   | `134` test files and `558` tests passed.                                                                               |
| `npm.cmd run test:e2e`                                                                                                                                                                                                                                                                                                                                  | pass   | `25` Playwright tests passed.                                                                                          |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-AgentSystemReadiness.ps1`                                                                                                                                                                                                                                          | pass   | Required files, scripts, and skill/plugin capability inventory passed.                                                 |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`                                                                                                                                                                                                                     | pass   | Inventory showed only this task's docs/state files changed or untracked.                                               |
| `git diff --check`                                                                                                                                                                                                                                                                                                                                      | pass   | No whitespace errors.                                                                                                  |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-NamingConventions.ps1`                                                                                                                                                                                                                                             | pass   | Naming convention scan completed.                                                                                      |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Invoke-QualityGate.ps1`                                                                                                                                                                                                                                                 | pass   | `lint`, `typecheck`, `test:unit`, and `format:check` passed.                                                           |

## Evidence Notes

- Existing runtime evidence in `src/server/services/practice-service.ts`:
  - First subjective answer creates a submitted answer with `score: null`, returns local/mock `ai_hint` feedback, sets `aiHintStatus: "hinted"`, and reports one retry remaining.
  - Second subjective answer or `aiScoringTrigger: "manual_request"` calculates deterministic local final AI score, stores the new answer as `scored`, clears hint status, and returns zero retries remaining.
  - Third subjective answer for the same paper question returns `409302` without accepting another raw answer.
- Existing service tests:
  - `src/server/services/practice-service.test.ts` covers subjective hint, retry limit, retry scoring, and direct manual scoring.
- Existing UI tests:
  - `tests/unit/student-practice-ui.test.ts` covers rendering subjective AI hint feedback, allowing one retry from session runtime, and requesting final scoring with `aiScoringTrigger: "manual_request"`.
- No source or test changes were needed; the Phase 18 finding was an evidence coverage gap rather than an implementation gap.
- No real provider, staging/prod/cloud, env, dependency, schema, migration, deploy, auth permission model, or destructive data operation was used.

## Closeout Status

- evidence commit: pending.
- merge/push/cleanup: pending.
