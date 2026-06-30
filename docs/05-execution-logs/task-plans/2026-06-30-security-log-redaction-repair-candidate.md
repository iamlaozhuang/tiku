# Security Log Redaction Repair Candidate Plan

- Task id: `security-log-redaction-repair-candidate-2026-06-30`
- Branch: `codex/security-log-redaction-recheck-20260630`
- Mode: local static and focused unit recheck.
- Default action: no source or test repair unless a current actionable issue is confirmed and a narrower repair scope is materialized first.
- Cost Calibration Gate remains blocked.

## Read Before Execution

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- Latest security follow-up approval, remaining inventory, API candidate, data redaction inventory, route envelope repair, Provider error redaction, and session credential boundary evidence.

## Goal

Recheck the current log redaction and error-return boundary after the already closed route-envelope, Provider-error-redaction, and session-credential tasks. If no current actionable issue is confirmed, close this candidate without source or test changes and recommend the next smallest approved task.

## Allowed Files

- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/01-requirements/traceability/2026-06-30-security-log-redaction-repair-candidate.md`
- `docs/05-execution-logs/task-plans/2026-06-30-security-log-redaction-repair-candidate.md`
- `docs/05-execution-logs/evidence/2026-06-30-security-log-redaction-repair-candidate.md`
- `docs/05-execution-logs/audits-reviews/2026-06-30-security-log-redaction-repair-candidate.md`
- `docs/05-execution-logs/acceptance/2026-06-30-security-log-redaction-repair-candidate.md`

## Read-only Source/Test Scope

- Route envelope targets: `src/server/services/question-paper/route-handlers.ts`, `src/server/services/student-experience/route-handlers.ts`
- Provider redaction targets: `src/server/services/ai-scoring-service.ts`, `src/server/services/ai-explanation-hint-service.ts`, `src/server/services/knowledge-recommendation-service.ts`, `src/server/models/ai-rag.ts`
- Session credential targets: `src/server/auth/session-route.ts`, `src/server/services/session-service.ts`, `src/server/contracts/user-auth/session-boundary.ts`
- Focused tests listed in `project-state.yaml` and `task-queue.yaml`.

## Blocked Files And Actions

- No writes to `src/**`, `tests/**`, `scripts/**`, `src/db/**`, `drizzle/**`, `migrations/**`, `seed/**`, package or lockfiles, `.env*`, e2e outputs, browser traces, or local private input paths.
- No DB connection, raw rows, mutation, schema, migration, seed, or `drizzle-kit push`.
- No Provider/AI call, Provider configuration, model config read/write, prompt payload, or raw AI I/O.
- No browser/dev-server/e2e/raw DOM/screenshot/trace.
- No credential, cookie, token, session, localStorage, Authorization header, env, secret, or connection string access or evidence.
- No staging/prod/cloud/deploy, release readiness, final Pass, Cost Calibration, PR, force-push, or unauthorized dependency change.

## Validation Commands

```powershell
rg -n "security-log-redaction-repair-candidate-2026-06-30|securityFollowupCentralApproval20260630|releaseReadinessClaimed: false|finalPassClaimed: false|costCalibrationExecuted: false" docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/evidence/2026-06-30-security-log-redaction-repair-candidate.md docs/05-execution-logs/acceptance/2026-06-30-security-log-redaction-repair-candidate.md
rg -n "withRouteErrorResponse|createRouteErrorResponse|providerError|redact|safe|credential|token|stack|console\." src/server/services/question-paper/route-handlers.ts src/server/services/student-experience/route-handlers.ts src/server/services/ai-scoring-service.ts src/server/services/ai-explanation-hint-service.ts src/server/services/knowledge-recommendation-service.ts src/server/models/ai-rag.ts src/server/auth/session-route.ts src/server/services/session-service.ts src/server/contracts/user-auth/session-boundary.ts
npx.cmd vitest run tests/unit/question-paper/question-paper-rest-layering.test.ts tests/unit/student-experience/student-experience-layering-mistake-book.test.ts src/server/services/ai-scoring-service.test.ts src/server/services/ai-explanation-hint-service.test.ts src/server/services/knowledge-recommendation-service.test.ts src/server/auth/session-route.test.ts src/server/services/session-service.test.ts src/server/contracts/user-auth/session-boundary.test.ts tests/unit/auth/session-personal-auth-boundary.test.ts
npx.cmd prettier --write --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/01-requirements/traceability/2026-06-30-security-log-redaction-repair-candidate.md docs/05-execution-logs/task-plans/2026-06-30-security-log-redaction-repair-candidate.md docs/05-execution-logs/evidence/2026-06-30-security-log-redaction-repair-candidate.md docs/05-execution-logs/audits-reviews/2026-06-30-security-log-redaction-repair-candidate.md docs/05-execution-logs/acceptance/2026-06-30-security-log-redaction-repair-candidate.md
npx.cmd prettier --check --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/01-requirements/traceability/2026-06-30-security-log-redaction-repair-candidate.md docs/05-execution-logs/task-plans/2026-06-30-security-log-redaction-repair-candidate.md docs/05-execution-logs/evidence/2026-06-30-security-log-redaction-repair-candidate.md docs/05-execution-logs/audits-reviews/2026-06-30-security-log-redaction-repair-candidate.md docs/05-execution-logs/acceptance/2026-06-30-security-log-redaction-repair-candidate.md
git diff --check
git diff --name-only -- package.json pnpm-lock.yaml pnpm-workspace.yaml package-lock.yaml package-lock.json src tests scripts src/db drizzle migrations seed e2e playwright-report test-results .next .env
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId security-log-redaction-repair-candidate-2026-06-30
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId security-log-redaction-repair-candidate-2026-06-30
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId security-log-redaction-repair-candidate-2026-06-30 -SkipRemoteAheadCheck
```

## Closeout Policy

If declared validation passes, local commit, fast-forward merge to `master`, push to `origin/master`, and deletion of the merged `codex/` short branch are approved by `securityFollowupCentralApproval20260630`.

PR creation and force-push remain forbidden.
