# Task Plan: ai-generation-p0-entry-unblock

- Task id: `ai-generation-p0-entry-unblock-2026-07-01`
- Branch: `codex/ai-generation-p0-entry-unblock`
- Date: `2026-07-01`
- Status: `closed`
- Central approval: `ai-generation-central-repair-approval-2026-07-01`

## Scope

Repair the P0 owner-preview blockers before continuing AI 出题 / AI 组卷 role walkthrough:

1. OP-03: learner and employee pages show false `授权已失效` when the active browser session is cookie-backed instead of localStorage-token-backed.
2. OP-04: `org_advanced_admin` receives only `session_fallback` organization workspace capability and is routed as standard/unavailable instead of advanced organization workspace.

This task does not repair AI generation semantics, result placement, history isolation, pagination, Provider behavior, data import, seed, schema, migration, dependency, or deployment.

## Required Reading

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/adr-001-tech-stack-selection.md`
- `docs/02-architecture/adr/adr-002-runtime-architecture-and-multi-client-contract.md`
- `docs/02-architecture/adr/adr-003-workplace-desktop-web-compatibility.md`
- `docs/02-architecture/adr/adr-004-environment-isolation-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-005-staging-architecture-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-006-runtime-dependency-alignment.md`
- `docs/02-architecture/adr/adr-007-edition-aware-authorization-source-of-truth.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/01-requirements/traceability/2026-07-01-ai-generation-root-cause-and-reuse-protocol.md`

## Root Cause Boundary

- OP-03 root cause boundary: student runtime UI pages require `getStoredStudentSessionToken()` before calling practice, mock_exam, and exam_report APIs. Current local login primarily relies on HttpOnly `tiku_session` cookie; cookie-aware API and route resolver already exist, so the UI should allow same-origin cookie requests when no stored automation token exists.
- OP-04 root cause boundary: `mapAuthenticatedUserToApi()` derives organization admin workspace capability as `session_fallback` only. The local session runtime returns organization role and organization context, but does not attach service-computed org_auth-derived edition capability, so advanced organization routes fail the route guard.

## Reuse Plan

- Reuse `fetchStudentApi()` same-origin credentials behavior and existing cookie-backed route resolver.
- Reuse `AdminWorkspaceCapabilitySummary` and `admin-workspace-role-guard` contracts.
- Reuse existing `org_auth`, `org_auth_organization`, and `auth_upgrade` source-of-truth tables through Drizzle query code in local session runtime.
- Do not introduce a role-specific bypass, duplicate route guard, new dependency, new DB schema, or new seed path.

## Allowed Files

- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/2026-07-01-ai-generation-p0-entry-unblock.md`
- `docs/05-execution-logs/evidence/2026-07-01-ai-generation-p0-entry-unblock.md`
- `docs/05-execution-logs/audits-reviews/2026-07-01-ai-generation-p0-entry-unblock.md`
- `src/features/student/practice/StudentPracticePage.tsx`
- `src/features/student/mock-exam/StudentMockExamReportPage.tsx`
- `tests/unit/student-practice-ui.test.ts`
- `tests/unit/student-mock-exam-report-ui.test.ts`
- `src/server/repositories/auth-repository.ts`
- `src/server/mappers/auth-mapper.ts`
- `src/server/auth/local-session-runtime.ts`
- `src/server/auth/local-session-runtime.test.ts`

## Blocked Files And Actions

- `.env*`
- `package.json`
- lockfiles
- `src/db/schema/**`
- `drizzle/**`
- migrations
- seed changes
- e2e specs
- raw DB inspection output
- screenshots, traces, raw DOM, HTML dumps
- Provider calls or Provider configuration
- staging/prod/cloud/deploy
- PR creation or force push
- release readiness, final Pass, Cost Calibration

## Implementation Steps

1. Add RED focused tests:
   - practice runtime starts via cookie-backed same-origin session when no stored local token exists.
   - mock_exam and exam_report runtime pages do the same for start/list/detail as scoped by OP-03.
   - `org_advanced_admin` local current session hydrates service-computed advanced organization workspace capability from active `org_auth`.
2. Run focused tests and confirm RED failures are the expected missing behavior.
3. Implement minimal UI changes to allow tokenless same-origin cookie requests while preserving stored automation token support.
4. Implement minimal session runtime/mapping changes to carry an optional computed `adminWorkspaceCapability`.
5. Run focused tests until GREEN.
6. Run full validation gates and write redacted evidence.

## Validation Commands

- `npm.cmd run test:unit -- tests/unit/student-practice-ui.test.ts tests/unit/student-mock-exam-report-ui.test.ts src/server/auth/local-session-runtime.test.ts`
- `npm.cmd exec -- prettier --check --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-07-01-ai-generation-p0-entry-unblock.md docs/05-execution-logs/evidence/2026-07-01-ai-generation-p0-entry-unblock.md docs/05-execution-logs/audits-reviews/2026-07-01-ai-generation-p0-entry-unblock.md src/features/student/practice/StudentPracticePage.tsx src/features/student/mock-exam/StudentMockExamReportPage.tsx tests/unit/student-practice-ui.test.ts tests/unit/student-mock-exam-report-ui.test.ts src/server/repositories/auth-repository.ts src/server/mappers/auth-mapper.ts src/server/auth/local-session-runtime.ts src/server/auth/local-session-runtime.test.ts`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `git diff --check`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId ai-generation-p0-entry-unblock-2026-07-01`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId ai-generation-p0-entry-unblock-2026-07-01 -SkipRemoteAheadCheck`

## Evidence Rules

Evidence may record task ids, role labels, route groups, status, counts, validation commands, and root-cause summaries.

Evidence must not record credentials, passwords, full redeem codes, cookies, tokens, sessions, localStorage values, Authorization headers, `.env` values, DB connection strings, raw DB rows, internal numeric ids, PII, Provider payloads, prompts, raw AI input/output, full question/paper/material/resource/chunk content, screenshots, raw DOM, traces, or HTML dumps.

## Exit Criteria

- OP-03 false-expired state is covered by focused UI tests for cookie-backed session requests.
- OP-04 advanced organization admin capability is service-computed from active organization authorization context in focused session tests.
- All validation commands pass.
- Evidence and audit review are written with redacted summaries only.
- One reviewable commit is fast-forward merged to `master`, pushed to `origin/master`, and the short branch is cleaned up only after gates pass.
