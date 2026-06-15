# Evidence: Fix Student Login Session Policy Decision

result: pass

## Task

- Task id: `fix-student-login-session-policy-decision`
- Branch: `codex/fix-student-login-session-policy-decision`
- Date: 2026-06-15
- Baseline: `0232106827b984e86f6537902ac2d46cddd32e3d`
- Task kind: docs-only session policy decision package.

## Fresh Approval

The user authorized this task as the second item in the strict serial set after
`unified-post-repair-master-health-gap-audit` closed and was pushed to `origin/master`.

This approval permits docs/state updates, task plan/evidence/audit creation, local validation, local commit,
fast-forward merge to `master`, master-side validation, push to `origin/master`, and merged short-branch cleanup after
gates pass.

This approval does not permit auth/session behavior changes, source/test/runtime implementation, session contract
changes, e2e/browser verification, env/secret/provider configuration, provider/model requests, quota/cost measurement,
schema/migration, dependency/package/lockfile changes, staging/prod/cloud/deploy, payment/external-service, PR,
force-push, or Cost Calibration Gate work.

## Start Checkpoint

| Checkpoint                          | Result                                            |
| ----------------------------------- | ------------------------------------------------- |
| Branch before task                  | `master`                                          |
| Task branch                         | `codex/fix-student-login-session-policy-decision` |
| `HEAD` / `master` / `origin/master` | `0232106827b984e86f6537902ac2d46cddd32e3d`        |
| `master...origin/master`            | `0 0`                                             |
| Worktree before branch creation     | clean                                             |
| Local `codex/*` residue             | none observed before branch creation              |
| Remote `origin/codex/*` residue     | none observed                                     |

## Inputs Read

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/*.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/evidence/2026-06-15-unified-post-repair-master-health-gap-audit.md`
- `docs/05-execution-logs/audits-reviews/2026-06-15-unified-post-repair-master-health-gap-audit.md`
- `docs/05-execution-logs/evidence/2026-06-14-fix-student-login-local-session-token.md`
- `docs/05-execution-logs/audits-reviews/2026-06-14-fix-student-login-local-session-token.md`
- `docs/05-execution-logs/evidence/2026-06-14-fix-student-login-session-policy-consistency.md`
- `docs/05-execution-logs/audits-reviews/2026-06-14-fix-student-login-session-policy-consistency.md`
- `src/app/(auth)/login/page.tsx`
- `src/server/contracts/user-auth/session-boundary.ts`
- `tests/unit/student-login-ui.test.ts`
- `tests/unit/auth/session-personal-auth-boundary.test.ts`

## Decision

Accepted policy: Option A.

- Keep `sessionPersistenceMode: "server_session"`.
- Keep `exposeBearerTokenToClient: false`.
- Do not persist the login response bearer token in login-page browser storage.
- Keep successful login behavior focused on the post-login redirect returned by `createPostLoginSessionBoundary`.
- Keep protected runtime flows dependent on server-side session handling, not a client-visible bearer token.

Rejected alternative: client bearer-token persistence.

- Persisting the login response bearer token to `localStorage` or another browser-visible store remains blocked.
- Changing `src/server/contracts/user-auth/session-boundary.ts` to expose bearer tokens remains blocked.
- Updating tests to expect client bearer-token persistence remains blocked.
- Any future change in that direction requires fresh high-risk approval for an auth/session security boundary change and
  a separate task whose allowedFiles explicitly include the relevant source/tests/contracts.

## Evidence Summary

- Historical task `fix-student-login-local-session-token` is a failed attempt that captured a real former contradiction:
  the login UI test expected browser token persistence while the auth boundary rejected `localStorage` and declared
  `server_session`.
- Later task `fix-student-login-session-policy-consistency` recorded the approved Option A and passed targeted plus full
  unit gates after removing login-page bearer-token persistence and aligning the student login UI test with the
  server-session policy.
- Current read-only inspection confirms the accepted policy:
  - `src/server/contracts/user-auth/session-boundary.ts` declares `sessionPersistenceMode: "server_session"` and
    `exposeBearerTokenToClient: false`.
  - `src/app/(auth)/login/page.tsx` calls `createPostLoginSessionBoundary` and does not contain login-page
    `localStorage` bearer-token persistence.
  - `tests/unit/student-login-ui.test.ts` asserts `localStorage.getItem("tiku.localSessionToken")` is `null`.
  - `tests/unit/auth/session-personal-auth-boundary.test.ts` asserts the login page does not contain `localStorage` and
    the boundary remains server-session-only.

## Queue Consequence

- Do not re-claim or retry `fix-student-login-local-session-token` as an implementation task.
- Treat `fix-student-login-session-policy-consistency` as the implementation closeout that aligned current `master` with
  Option A.
- This task records the policy decision only and does not alter current source/tests/contracts.
- The next serial task is `phase-22-post-repair-local-acceptance-reaudit-planning`.

## Gates

- localFullLoopGate: pass after docs-only diff check, lint, typecheck, Git completion readiness, PreCommitHardening, and
  ModuleCloseoutReadiness.
- threadRolloverGate: no rollover requested; continue through the user-approved local commit, fast-forward merge to
  `master`, master-side validation, push `origin/master`, merged short-branch cleanup, fetch/prune, and final
  clean/aligned verification.
- threadRolloverDecision: no new thread; continue serial execution in this thread only after the repository is clean and
  `master == origin/master`.
- automationHandoffPolicy: do not claim `phase-22-post-repair-local-acceptance-reaudit-planning` until this branch is
  fully closed.
- nextModuleRunCandidate: `phase-22-post-repair-local-acceptance-reaudit-planning` is the next pending serial task after
  this task closes.
- Cost Calibration Gate remains blocked.

## RED / GREEN

- RED: the historical blocked task recorded an unsafe client-token persistence expectation that conflicted with the
  server-session auth boundary.
- GREEN: the accepted policy is Option A, current `master` already reflects that policy, and this docs-only task records
  the decision without changing auth/session behavior.

## Batch Evidence

- Batch range: docs-only student login session policy decision, task 2 of 3 in the user-authorized serial set.
- Changed surfaces:
  - `docs/04-agent-system/state/project-state.yaml`
  - `docs/04-agent-system/state/task-queue.yaml`
  - task plan, evidence, and audit review for this task.
- Batch commit evidence: `Commit: 0232106827b984e86f6537902ac2d46cddd32e3d` is the pre-task baseline; final local
  commit is produced after this evidence and audit review are validated.

## Validation Results

| Command                                                                                                                                                                        | Result           | Notes                                                             |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------- | ----------------------------------------------------------------- |
| `git diff --check`                                                                                                                                                             | pass             | No whitespace errors.                                             |
| `npm.cmd run lint`                                                                                                                                                             | pass             | ESLint completed.                                                 |
| `npm.cmd run typecheck`                                                                                                                                                        | pass             | `tsc --noEmit` passed.                                            |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`                                            | pass             | Inventory listed only allowed docs/state/log files.               |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId fix-student-login-session-policy-decision`      | pass             | Scope and sensitive evidence scans passed.                        |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId fix-student-login-session-policy-decision` | first run failed | Validation results were not recorded before this evidence repair. |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId fix-student-login-session-policy-decision` | pass             | Passed after evidence validation-result repair.                   |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId fix-student-login-session-policy-decision`        | pass             | Push readiness passed before local commit.                        |

## Blocked Remainder

- Auth/session security boundary changes remain blocked.
- Source/test/runtime implementation remains blocked.
- e2e and browser/local verification remain blocked.
- `.env.local`, `.env.*`, env/secret/provider configuration, provider/model requests, quota/cost measurement,
  schema/migration, dependency/package/lockfile changes, staging/prod/cloud/deploy, payment/external-service, PR,
  force-push, and Cost Calibration Gate remain blocked.

Cost Calibration Gate remains blocked.

## Evidence Redaction

This evidence records task ids, status labels, command names, file paths, SHAs, and redacted policy summaries only. It
contains no token value, Authorization header, password, secret, database URL, provider payload, raw prompt, raw answer,
row data, payment data, or private user data.
