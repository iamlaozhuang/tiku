# standard-core-student-local-full-flow-content-admin-heading-contract-repair Plan

## Task

- Task id: `standard-core-student-local-full-flow-content-admin-heading-contract-repair`
- Branch: `codex/mechanism-throughput-readiness-tuning`
- Started at: `2026-06-18T10:52:12-07:00`
- Goal: repair the smallest content admin heading contract that blocks the scoped standard student local full-flow rerun.

## Local State And Carryover

- The branch is intentionally still dirty from `standard-core-student-local-full-flow-report-ai-explanation-contract-repair`.
- That carryover belongs to the same serial student local full-flow chain and will not be committed, merged, pushed, or
  cleaned in this task.
- This task may touch only the explicit docs/state/evidence/audit files and the content admin route/UI/guard/login
  handoff/focused unit files listed in `task-queue.yaml`.

## Standards Read

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/adr-001-tech-stack-selection.md`
- `docs/02-architecture/adr/adr-002-runtime-architecture-and-multi-client-contract.md`
- `docs/02-architecture/adr/adr-003-workplace-desktop-web-compatibility.md`
- `docs/02-architecture/adr/adr-004-environment-isolation-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-005-staging-architecture-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-006-runtime-dependency-alignment.md`

## Failure Context

- Previous repair moved the report payload and mistake-book AI explanation blockers forward.
- Fresh scoped e2e rerun then failed in `e2e/local-business-flow.spec.ts` while waiting for heading
  `题库与材料管理` after navigating to `/content/questions`.
- The repair must not modify any e2e spec.

## Implementation Plan

1. Inspect `/content/questions` and `/content/materials` route pages, the shared admin question/material management UI, the
   protected route guard contract, and the login session handoff from student to admin.
2. Add focused failing unit tests that reproduce the stale local automation bearer token blocking the admin content
   heading after admin login and the cookie-backed admin marker failing ops log/runtime route authorization.
3. Apply the smallest source repair so admin login replaces the stale local automation student token with the existing
   cookie-backed session marker instead of exposing the admin bearer token, and admin ops route handlers resolve that
   marker through the HttpOnly session cookie.
4. Run focused unit gates, e2e list, and the three approved scoped local e2e specs.
5. If runtime passes, proceed to closure readiness audit; if runtime fails, write blocked evidence and recommend the
   smallest next repair.

## Validation Plan

- `npm.cmd run test:unit -- tests/unit/student-login-ui.test.ts tests/unit/admin-question-material-ui.test.ts tests/unit/protected-route-guard-ui.test.ts tests/unit/student-experience/student-experience-layering-mistake-book.test.ts tests/unit/auth/session-personal-auth-boundary.test.ts tests/unit/phase-22-content-admin-cookie-session-repair.test.ts tests/unit/admin-logs/admin-log-retention-redaction-layering.test.ts tests/unit/admin-ai-audit-log-ops-baseline.test.ts tests/unit/phase-8-admin-organization-org-auth-runtime.test.ts tests/unit/phase-8-admin-redeem-code-runtime.test.ts`
- `npm.cmd run test:e2e -- --list`
- `npm.cmd run test:e2e -- e2e/local-auth-route-guard.spec.ts e2e/student-practice-mock-entry.spec.ts e2e/local-business-flow.spec.ts`
- `git diff --check`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId standard-core-student-local-full-flow-content-admin-heading-contract-repair`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId standard-core-student-local-full-flow-content-admin-heading-contract-repair`

## Blocked Work

- No `.env*`, package/lockfile/dependency, schema/drizzle/migration, provider/model, staging/prod/cloud/deploy/payment/
  external-service, destructive DB, e2e spec edit, PR, force-push, merge, push, branch cleanup, or Cost Calibration Gate.
