# Phase 20 Fix RA-06-13 Admin Account Security Policy Alignment Evidence

## Summary

- Result: pass.
- Scope: implementation/local_verification.
- Changed surfaces: local admin login lock policy, local admin session runtime failure state, admin ops security policy UI, unit tests, task plan/state/evidence.
- Gates: lint/typecheck/test:unit/test:e2e/build/format:check/readiness/naming/git inventory pass; Browser IAB blocked by local tool runtime and covered by Playwright e2e fallback.
- Forbidden scope (`forbiddenScope`): env/dependency/schema/migration/staging/prod/cloud/deploy/real provider/destructive data operation not touched.
- Residual gaps (`residualGaps`): no schema-backed persistent admin lock counter because schema/drizzle changes are blocked for this task; local runtime uses in-process state for the current dev server process.

## Recovery

- Task id: `phase-20-fix-ra-06-13-admin-account-security-policy-alignment`
- Branch: `codex/phase-20-fix-ra-06-13-admin-account-security-policy-alignment`
- Base: `master` at `cecd7136261ae5b0845fa79099796ba2b84668a3`
- Finding: `F-RA-06-13-001`
- Human approval: user approved the recommended task and `auth_permission_model` permission in this session.

## Phase 21/22 Queue Count

- Phase 21: total 1, completed 1, remaining 0.
- Phase 22: total 0, completed 0, remaining 0.

## Startup Checks

- `git fetch origin`: pass.
- `git status --short --branch`: pass, `master...origin/master`.
- `git rev-list --left-right --count master...origin/master`: pass, `0 0`.
- `git branch --list "codex/*"`: pass, no branch before claiming.
- `git worktree list`: pass, only `D:/tiku`.
- `git merge-base --is-ancestor 4c3a98b HEAD`: pass.
- `Test-AgentSystemReadiness.ps1`: pass.
- `Test-TaskClaimReadiness.ps1` on `master`: failed as expected because protected branches cannot claim tasks.
- `Test-TaskClaimReadiness.ps1 -TaskId phase-20-fix-ra-06-13-admin-account-security-policy-alignment` on task branch: pass. Note: script did not expand YAML anchors and printed allowed/blocked/validation as `none`; execution follows the queue anchor definitions read directly from `task-queue.yaml`.

## Queue Scope

- Allowed files: `docs/04-agent-system/state/project-state.yaml`, `docs/04-agent-system/state/task-queue.yaml`, `docs/05-execution-logs/task-plans/**`, `docs/05-execution-logs/evidence/**`, `docs/05-execution-logs/audits-reviews/**`, `src/**`, `tests/**`, `e2e/**`.
- Blocked files: `.env.local`, `.env.example`, `package.json`, `pnpm-lock.yaml`, `package-lock.yaml`, `package-lock.json`, `src/db/schema/**`, `drizzle/**`, `scripts/**`.
- Validation commands: `npm.cmd run test:unit`, `npm.cmd run test:e2e`, `Test-AgentSystemReadiness.ps1`, `Test-GitCompletionReadiness.ps1 -BaseBranch master`, `git diff --check`.

## Command Results

- `npm.cmd run test:unit -- src/server/services/session-service.test.ts`: fail as RED, expected. Existing code locked admin on the 4th failure and used a 5-minute lock duration.
- `npm.cmd run test:unit -- src/server/services/session-service.test.ts`: pass after service implementation, 8 tests passed.
- `npm.cmd run test:unit -- src/server/services/session-service.test.ts src/server/auth/local-session-runtime.test.ts`: pass, 11 tests passed.
- `npm.cmd run test:unit -- src/server/services/session-service.test.ts src/server/auth/local-session-runtime.test.ts tests/unit/phase-20-ra-06-02-user-role-detail-alignment.test.ts`: pass, 14 tests passed.
- `npm.cmd run typecheck`: first run failed with Windows EPERM reading `node_modules`; rerun with approval passed.
- `npm.cmd run lint`: first run failed with Windows EPERM reading `node_modules`; rerun with approval passed.
- `npm.cmd run test:unit`: pass, 139 files and 590 tests passed.
- `npm.cmd run format:check`: failed before scoped Prettier on three touched files; passed after formatting.
- `node .\node_modules\prettier\bin\prettier.cjs --write <3 touched files>`: pass.
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-NamingConventions.ps1`: pass.
- `npm.cmd run build`: pass. Build output reported `.env.local` exists/loaded; no env file was opened or modified by this task.
- `npm.cmd run test:e2e`: pass, 25 browser tests passed.
- Browser plugin IAB verification: blocked. `node_repl js` discovery succeeded, but two bootstrap attempts failed with `windows sandbox failed: spawn setup refresh`. Fallback browser evidence is `npm.cmd run test:e2e`.
- `git diff --check`: pass.
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-AgentSystemReadiness.ps1`: pass.
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`: pass inventory; working tree intentionally dirty before commit.
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Invoke-QualityGate.ps1`: pass, includes lint/typecheck/test:unit/format:check.

## Security Review

- Task id: `phase-20-fix-ra-06-13-admin-account-security-policy-alignment`
- Branch: `codex/phase-20-fix-ra-06-13-admin-account-security-policy-alignment`
- Base: `master` at `cecd7136261ae5b0845fa79099796ba2b84668a3`
- Reviewer: Codex
- Review date: `2026-05-31`
- Files reviewed:
  - `src/server/services/session-service.ts`
  - `src/server/repositories/session-repository.ts`
  - `src/server/auth/local-session-runtime.ts`
  - `src/features/admin/admin-ops-management/AdminOpsManagement.tsx`
  - `src/server/services/session-service.test.ts`
  - `src/server/auth/local-session-runtime.test.ts`
  - `tests/unit/phase-20-ra-06-02-user-role-detail-alignment.test.ts`
- Risk types reviewed: `auth_permission_model`, `admin_ops`, `local_human_verification`, `evidence_integrity`.
- Abuse cases considered:
  - Admin login locks too early and denies valid local admin recovery before the 5th failure.
  - Admin lock duration is too short and remains at the student 5-minute policy.
  - Student login policy is accidentally widened from 3/5 to 5/15.
  - Admin DTO/UI exposes session token, password, auth user id, or numeric id.
  - Local implementation attempts schema or migration changes without approval.
- Data exposure review: no password hash, plaintext password, session token, env value, numeric id, or internal auth user id is returned by the changed UI or tests.
- Authorization boundary review: admin lock policy is selected from authenticated account shape (`userType: null` and `adminPublicId` present); student policy remains unchanged.
- API contract review: no API envelope changed; existing `{ code, message, data, pagination? }` behavior remains.
- Test coverage and accepted gaps:
  - Unit test covers student 3 failures / 5 minutes existing policy.
  - Unit test covers admin 4th failure not locked, 5th failure locked for 15 minutes.
  - UI test covers the visible admin security policy panel.
  - Accepted gap: admin lock state is local in-process state because schema/drizzle changes were forbidden for this task.
- Verdict: `APPROVE`.

## Implementation Notes

- Changed `createSessionService` to choose lock policy by account type: student/user accounts keep 3 failures / 5 minutes; backend admin accounts use 5 failures / 15 minutes.
- Added optional login failure kind metadata to the session repository boundary so local admin runtime can keep admin failure state separate from student `user` rows.
- Added in-process local admin login failure state for default local runtime without schema changes.
- Added a backend account security policy panel to the admin ops UI showing 8-hour admin sessions, multi-device login allowance, 5/15 lock policy, independent admin accounts, and the role matrix.

## Git Closeout

- Implementation commit: `2a3daf68c8a654dd0a9210b83a1af6ef4f8cfe92` (`fix(admin): align admin account security policy`).
- Merge commit: `d23eead9607ee04e9bf85139364528247b01ddd2` (`merge: phase 20 ra 06 13 admin account security policy`).
- Merge target: `master`.
- Push: `git push origin master` pass, pushed `cecd713..d23eead`.
- Master validation after merge:
  - `npm.cmd run build`: pass.
  - `npm.cmd run test:e2e`: pass, 25 tests passed.
  - `git diff --check`: pass.
  - `Test-AgentSystemReadiness.ps1`: pass.
  - `Test-GitCompletionReadiness.ps1 -BaseBranch master`: pass inventory, master ahead by two before push and clean.
  - `Invoke-QualityGate.ps1`: first post-merge run timed out at 184 seconds; rerun with 360-second timeout passed lint/typecheck/test:unit/format:check.
- Cleanup:
  - `git branch -d codex/phase-20-fix-ra-06-13-admin-account-security-policy-alignment`: first attempt failed with Windows git ref lock permission error; escalated retry passed.
  - `git branch --list "codex/*"`: pass, no output after cleanup.
  - `git worktree list`: pass, only `D:/tiku`.
  - `git rev-list --left-right --count master...origin/master`: pass, `0 0` after implementation push.
  - `git status --short --branch`: pass, `## master...origin/master` after implementation push and branch cleanup.

## Handoff

- Closed task: `phase-20-fix-ra-06-13-admin-account-security-policy-alignment`.
- Next ordered candidate in the restricted list: `phase-20-fix-ra-06-08-question-admin-knowledge-binding-completion`.
- Next candidate risk: `database_migration`; schema/drizzle changes remain blocked. If knowledge binding cannot close by reusing existing `question_knowledge_node` / `question_tag` local models, stop and request separate approval.
