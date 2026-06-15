# Task Plan: Phase 22 Account And Authorization Local Acceptance Verification

## Task

- Task id: `phase-22-local-acceptance-account-auth-verification`
- Branch: `codex/phase-22-local-acceptance-account-auth-verification`
- Date: 2026-06-15
- Task kind: `local_acceptance_verification_candidate`
- Verification journey: `account_and_authorization`
- Source story: `phase-22-mvp-local-acceptance-reaudit`

## Inputs Read

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/*.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/02-architecture/interfaces/phase-22-mvp-local-acceptance-reaudit-contract.md`
- `docs/04-agent-system/sop/local-human-verification.md`
- `docs/04-agent-system/sop/fresh-local-dev-db-validation-playbook.md`
- `docs/05-execution-logs/evidence/2026-06-15-phase-22-local-acceptance-verification-seeding.md`
- `docs/05-execution-logs/audits-reviews/2026-06-15-phase-22-local-acceptance-verification-seeding.md`

## Fresh Approval And Scoped Repairs

The user authorized serial execution of the six seeded Phase 22 local acceptance verification candidate tasks. For this
task the approval includes local dev server startup, Browser or Playwright observations against `localhost` or
`127.0.0.1`, application-mediated local dev DB use, validation commands, one local commit after success, fast-forward
merge to `master`, `push origin/master`, merged local short-branch deletion, and post-task repository cleanup checks.

Scoped approval v1 allowed:

- `src/server/auth/session-route.ts`;
- `src/server/auth/session-route.test.ts`;
- adding `npm.cmd run test:unit -- src/server/auth/session-route.test.ts`;
- replacing Phase 22 `blockedFiles` YAML anchor/alias entries in `task-queue.yaml` with explicit lists so the existing
  PreCommitHardening scope parser can evaluate blocked files.

Scoped approval v2 allowed:

- `src/components/ProtectedRouteGuard/ProtectedRouteGuard.tsx`;
- `src/features/student/studentRuntimeApi.ts`;
- `src/features/student/home/StudentHomePage.tsx`;
- `src/features/student/profile/StudentProfileRedeemPage.tsx`;
- focused unit tests for those surfaces.

Scoped approval v3 allowed continuing current task 1 only:

- `src/server/auth/session-route.ts`;
- `src/server/auth/session-cookie.ts`;
- `src/server/services/student-flow-runtime.ts`;
- `src/server/services/student-authorization-redeem-runtime.ts`;
- `tests/unit/phase-7-student-flow-runtime-smoke.test.ts`;
- `tests/unit/phase-8-student-authorization-redeem-runtime.test.ts`;
- current task state/queue/plan/evidence/audit updates.

Scoped approval v4 allowed continuing current task 1 only through the application-layer local authorization data
validation path. It did not authorize claiming task 2, reading env files, seed/bootstrap, raw SQL, migration, destructive
DB work, direct admin-data preparation, or broader source/test changes.

Scoped approval v6 allowed a one-time local admin fixture for current task 1 only. The user explicitly approved using
the existing project local runtime/env loader to read only the process-required `DATABASE_URL` and connect to the local
dev DB, without outputting, summarizing, recording, or modifying `.env*` values. The fixture must stay ORM/service-layer
based, avoid raw SQL authored by the agent, avoid destructive DB work, and keep all generated credentials, card codes,
tokens, cookies, public identifiers, and row data out of evidence.

## Scope

This task covers account and authorization local acceptance evidence for:

- `user`
- `student`
- `session`
- `redeem_code`
- `authorization`
- `personal_auth`
- `org_auth`
- `organization`
- `employee`

The allowed status vocabulary is:

- `runtime_closed`
- `local_verified`
- `mock_only`
- `metadata_only`
- `staging_blocked`
- `deferred`
- `needs_recheck`

## Boundaries

Allowed writes for this task:

- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `src/server/auth/session-route.ts`
- `src/server/auth/session-route.test.ts`
- `src/server/auth/session-cookie.ts`
- `src/server/services/student-flow-runtime.ts`
- `src/server/services/student-authorization-redeem-runtime.ts`
- `src/components/ProtectedRouteGuard/ProtectedRouteGuard.tsx`
- `src/features/student/studentRuntimeApi.ts`
- `src/features/student/home/StudentHomePage.tsx`
- `src/features/student/profile/StudentProfileRedeemPage.tsx`
- `tests/unit/phase-7-student-flow-runtime-smoke.test.ts`
- `tests/unit/phase-8-student-authorization-redeem-runtime.test.ts`
- `tests/unit/protected-route-guard-ui.test.ts`
- `tests/unit/student-home-ui.test.ts`
- `tests/unit/student-profile-redeem-ui.test.ts`
- this task plan
- this task evidence
- this task audit review

Blocked without separate approval:

- `.env.local`, `.env.*`, or secret/provider configuration reading, writing, summarizing, or output.
- Provider/model calls, quota measurement, or Cost Calibration Gate.
- Source/test/e2e/schema/migration/drizzle/script/dependency/package/lockfile changes outside the approved files above.
- Seed/bootstrap, raw SQL, destructive DB operations, migration table repair, data reset, or validation-data preparation.
- Staging, production, cloud, deploy, payment, external-service, PR, or force-push work.
- Token value, auth header value, database URL, provider payload, raw prompt, raw answer, row data, generated credential,
  or private user data capture.

If local account/auth verification requires a blocked capability or files outside the approved list, the task must stop
and record the blocked gate.

## Verification Plan

1. Record startup Git state and task queue state.
2. Reproduce the account/auth local verification gap with local-only Browser or Playwright evidence.
3. Add failing unit tests for session cookie persistence and cookie-backed current-session lookup.
4. Implement the smallest session route adapter repair.
5. Add failing focused unit tests for cookie-backed protected route and student runtime calls.
6. Implement the smallest client/server-session integration repair in the approved front-end files.
7. Add failing focused runtime tests for cookie-backed student flow and authorization runtime user resolution.
8. Extract the shared cookie-backed request auth helper and use it from session route and the approved runtime resolvers.
9. Run local Browser first when available; if Browser invocation fails and fallback is authorized, record the failure
   reason and use local Playwright against `127.0.0.1`.
10. Observe registration/login, browser cookie attributes, cookie-backed runtime API responses, protected route
    reachability, and page health without recording secrets or private data.
11. Under v4 approval, inspect and probe only existing application-layer local authorization data paths. If the path
    requires an admin session that cannot be obtained through an approved application-layer flow, stop and record the
    blocked gate.
12. Under v6 approval, create only the minimum local admin fixture needed to obtain an admin session, then use existing
    application API paths to generate a redeem code, redeem it as a synthetic learner, create an organization/org_auth
    employee access path, and verify the account/auth journey without recording sensitive values.
13. Classify each target entity using the task status vocabulary. If valid `redeem_code`, `authorization`,
    `personal_auth`, `org_auth`, `organization`, or `employee` evidence requires blocked data preparation, stop and
    write blocked evidence/audit. Do not claim full acceptance, merge, push, or continue to the next seeded candidate.

## Validation Commands

- `git diff --check`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `npm.cmd run test:unit -- src/server/auth/session-route.test.ts`
- `npm.cmd run test:unit -- tests/unit/phase-7-student-flow-runtime-smoke.test.ts`
- `npm.cmd run test:unit -- tests/unit/phase-8-student-authorization-redeem-runtime.test.ts`
- `npm.cmd run test:unit -- tests/unit/protected-route-guard-ui.test.ts tests/unit/student-home-ui.test.ts tests/unit/student-profile-redeem-ui.test.ts`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId phase-22-local-acceptance-account-auth-verification`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId phase-22-local-acceptance-account-auth-verification`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId phase-22-local-acceptance-account-auth-verification`

No e2e command is planned because the current task queue entry does not explicitly declare an existing local-only e2e
spec for this task.

## Taste Compliance Pre-Check

- Keep REST responses in the standard `{ code, message, data }` envelope.
- Keep route handlers as thin transport adapters over the service layer.
- Keep browser session persistence server-session based; do not reintroduce a local browser bearer credential.
- Reuse a shared cookie-backed request auth helper instead of duplicating cookie parsing across runtime routes.
- Do not change DB schema, migrations, dependencies, or provider configuration.
- Do not expose token values, auth header values, row data, private user data, or secret/provider configuration in
  evidence.
- Do not proceed past blocked local data prerequisites.
