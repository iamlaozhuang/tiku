# 2026-07-09 Content AI 0704 Fixture Readiness Evidence

## Scope

- Task id: `content-ai-0704-fixture-readiness-2026-07-09`
- Branch: `codex/content-ai-0704-fixture-readiness`
- Mode: read-only readiness and approval-boundary planning.
- Runtime/DB: no new DB mutation; no Provider; no private values recorded.

## Current Goal Gap

The previous 0704 localhost run closed the git branch but did not prove the full business goal. The remaining gap is not a confirmed source defect. It is a local acceptance-readiness gap:

| Area                         | Current evidence                                                                                                      | Remaining work                                                                                                                                                        |
| ---------------------------- | --------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Role login matrix            | `content_admin`, `personal_standard_student`, and `org_advanced_employee` were re-confirmed.                          | Re-confirm or provision safe local-only material for `personal_advanced_student`, `org_standard_employee`, `org_standard_admin`, and `org_advanced_admin`.            |
| Content AI出题               | History/detail surfaces are readable, but no existing no-Provider result is eligible for adoption and publish replay. | Need an approved current 0704 fixture/history path that creates or identifies an adoptable reviewed question draft without Provider execution.                        |
| Content AI组卷               | Existing draft detail is readable; publish validation blocks stale draft because paper total score is missing.        | Need a fresh, current-code-generated eligible paper draft, or an approved non-destructive local data repair that makes stale fixture publishable for acceptance only. |
| Organization training        | Advanced employee sees published training; submit hit already-submitted/conflict category.                            | Need a fresh visible version/employee answer path that has not already been submitted.                                                                                |
| Standard/advanced boundaries | Unit/source gates cover role boundaries; runtime 0704 materials did not re-confirm all roles.                         | Need runtime proof across standard denied states and advanced allowed states using exact role sessions.                                                               |

## What Must Happen Before Goal Completion

1. Close the 0704 acceptance fixture readiness gap with a separate approved local fixture/history task.
2. Re-run localhost acceptance after readiness:
   - content AI出题: generated/reviewed draft -> formal draft -> publish -> user-visible/use path;
   - content AI组卷: plan-and-select -> formal paper draft -> detail -> publish -> user-visible/use path;
   - organization training: admin publish -> employee visible -> fresh answer;
   - role boundaries: personal standard/advanced, organization standard/advanced employee, organization standard/advanced admin, content admin, and super_admin context.
3. Open source repair branches only if a fresh current-code failure is reproduced after fixture readiness is sufficient.

## Approval Boundary For Next Work

The next task should not silently mutate the 0704 DB. It needs a fresh approval if it will:

- write or refresh local acceptance fixture/history data;
- create local-only accounts, authorizations, drafts, training versions, or employee-answer candidates;
- repair stale paper draft metadata in the local DB;
- submit product write actions beyond bounded non-destructive acceptance flows.

The approval still must not permit Provider execution, schema/migration/seed changes, destructive DB operations, private value output, screenshots/raw DOM without separate approval, staging/prod/deploy, dependency changes, or Cost Calibration.

## Recommended Next Branches

| Order | Branch goal                                   | Scope                                                                                                                                                                          |
| ----- | --------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1     | `codex/content-ai-0704-fixture-preflight`     | Read-only or explicitly approved local fixture readiness: role material, current-code-compatible AI question/paper draft candidates, fresh employee training answer candidate. |
| 2     | `codex/content-ai-0704-content-question-loop` | Only after readiness: content AI出题 adoption/publish/user-use localhost replay; code repair only if current-code defect is reproduced.                                        |
| 3     | `codex/content-ai-0704-content-paper-loop`    | Only after readiness: content AI组卷 plan-and-select draft/detail/publish/user-use localhost replay; code repair only if current-code defect is reproduced.                    |
| 4     | `codex/content-ai-0704-org-training-loop`     | Enterprise admin/employee training publish and fresh answer replay with standard/advanced denial checks.                                                                       |
| 5     | `codex/content-ai-0704-final-role-matrix`     | Full role matrix and goal-completion audit, no new fixes unless separate root-cause branch is required.                                                                        |

## Current Decision

Goal is not complete yet. Continue with fixture/readiness before touching shared AI generation code.

## Validation

| Command                                                                                                                                                                                          | Result                                                   |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------- |
| `corepack pnpm@10.26.1 exec prettier --write --ignore-unknown <scoped-doc-files>`                                                                                                                | pass                                                     |
| `git diff --check`                                                                                                                                                                               | pass                                                     |
| `corepack pnpm@10.26.1 lint`                                                                                                                                                                     | pass                                                     |
| `corepack pnpm@10.26.1 typecheck`                                                                                                                                                                | pass                                                     |
| targeted test                                                                                                                                                                                    | n/a: docs/readiness only; no source or test file changed |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId content-ai-0704-fixture-readiness-2026-07-09`                     | pass                                                     |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId content-ai-0704-fixture-readiness-2026-07-09 -SkipRemoteAheadCheck` | pass                                                     |
| master fast-forward merge                                                                                                                                                                        | pass                                                     |
| master `git diff --check HEAD~1..HEAD`                                                                                                                                                           | pass                                                     |
| master pre-push readiness                                                                                                                                                                        | pass                                                     |

## Closeout State

- `codex/content-ai-0704-fixture-readiness` was fast-forward merged to `master`.
- The current master closeout is ready for approved push and short-branch cleanup.
- No source, test, package, lockfile, schema, migration, seed, env, private, Provider, screenshot, raw DOM, or DB mutation was introduced.
