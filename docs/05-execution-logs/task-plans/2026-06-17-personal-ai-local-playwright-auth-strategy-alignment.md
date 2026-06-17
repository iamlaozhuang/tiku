# Personal AI Local Playwright Auth Strategy Alignment Plan

- Task id: `personal-ai-local-playwright-auth-strategy-alignment`
- Branch: `codex/personal-ai-playwright-auth-strategy-alignment`
- Execution profile: `local_full_flow`
- Evidence mode: `full`
- Validation policy: `local_full_flow`
- Local full-flow gate: `approved_localhost_only`

## Approval And Scope

The current 2026-06-17 user prompt approves the previously recommended narrow task to align the existing personal AI
Playwright authentication strategy with the current server-session-only login policy.

Allowed write surface:

- `e2e/personal-ai-generation-local-request.spec.ts`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- this task plan
- `docs/05-execution-logs/evidence/2026-06-17-personal-ai-local-playwright-auth-strategy-alignment.md`
- `docs/05-execution-logs/audits-reviews/2026-06-17-personal-ai-local-playwright-auth-strategy-alignment.md`

Non-goals and hard stops:

- no login page bearer-token persistence;
- no auth/session product boundary change;
- no provider/model call;
- no `.env*` read, output, or modification;
- no schema/drizzle/migration, package/lockfile, dependency, cloud/deploy/payment/external-service, PR, force-push, or
  Cost Calibration Gate work.

## Inputs Read

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/*.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/04-agent-system/state/execution-profiles.yaml`
- `docs/04-agent-system/state/mechanism-source-of-truth-index.yaml`
- `docs/05-execution-logs/evidence/2026-06-17-module-run-v2-personal-ai-local-ui-browser-flow-validation.md`
- `docs/05-execution-logs/evidence/2026-06-15-fix-student-login-session-policy-decision.md`
- `e2e/personal-ai-generation-local-request.spec.ts`
- `e2e/local-auth-route-guard.spec.ts`
- `e2e/admin-role-denial-browser.spec.ts`
- `e2e/local-business-flow.spec.ts`
- `e2e/validation-data-prep.spec.ts`
- `src/app/(auth)/login/page.tsx`
- `src/features/student/ai-generation/StudentPersonalAiGenerationPage.tsx`
- `src/features/student/studentRuntimeApi.ts`
- `src/components/ProtectedRouteGuard/ProtectedRouteGuard.tsx`
- `src/server/auth/session-route.ts`
- `src/server/services/personal-ai-generation-request-route.ts`
- `tests/unit/student-login-ui.test.ts`
- `package.json`
- `playwright.config.ts`

## Root Cause And Hypothesis

Root cause: the targeted spec still treats successful UI login as the source of a browser-stored
`tiku.localSessionToken`, but current policy intentionally keeps the login response bearer token out of browser storage.
The personal AI page still reads `tiku.localSessionToken` for its local browser runtime API calls, so the e2e test needs a
test-owned local fixture that obtains a valid local session through `/api/v1/sessions` and seeds the page context without
changing login behavior.

Hypothesis: replacing the UI-login helper with a local Playwright fixture that logs in through the local sessions API,
keeps the session token in test memory, and seeds `localStorage` via `page.addInitScript` before visiting
`/ai-generation` will validate the personal AI browser flow while preserving the server-session-only login boundary.

## RED / GREEN Plan

1. RED: run the existing targeted spec before editing and confirm the known failure is the missing browser token after
   login.
2. GREEN: update only `e2e/personal-ai-generation-local-request.spec.ts` to use a test-owned local session fixture.
3. Verify the target spec, focused unit coverage, e2e list, formatting, lint, typecheck, diff check, and Module Run v2
   closeout gates.

## Validation Commands

- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Get-TikuProjectStatus.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Get-TikuNextAction.ps1 -VerboseHistory`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2LocalCapabilityGate.ps1 -TaskId personal-ai-local-playwright-auth-strategy-alignment -Capability localFullFlowGate -Intent use_capability`
- `npm.cmd run test:e2e -- e2e/personal-ai-generation-local-request.spec.ts`
- `npm.cmd run test:unit -- tests/unit/student-login-ui.test.ts tests/unit/student-personal-ai-generation-ui.test.ts src/features/student/ai-generation/StudentPersonalAiGenerationPage.test.tsx src/server/services/personal-ai-generation-local-browser-experience-service.test.ts`
- `npm.cmd run test:e2e -- --list`
- `npx.cmd prettier --check --ignore-unknown e2e/personal-ai-generation-local-request.spec.ts docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-06-17-personal-ai-local-playwright-auth-strategy-alignment.md docs/05-execution-logs/evidence/2026-06-17-personal-ai-local-playwright-auth-strategy-alignment.md docs/05-execution-logs/audits-reviews/2026-06-17-personal-ai-local-playwright-auth-strategy-alignment.md`
- `git diff --check`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId personal-ai-local-playwright-auth-strategy-alignment`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId personal-ai-local-playwright-auth-strategy-alignment`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId personal-ai-local-playwright-auth-strategy-alignment`

## Diagnostic Note

`Test-TaskClaimReadiness.ps1` was attempted after task materialization, but its parser rejected blank lines in the current
large queue file before producing a task-level result. The task therefore uses the durable `currentTask` pointer,
`Get-TikuProjectStatus.ps1`, `Get-TikuNextAction.ps1`, and `Test-ModuleRunV2LocalCapabilityGate.ps1` as the executable
pre-edit mechanism gates for this run.

## Evidence Boundary

Evidence may record task ids, command names, pass/fail status, file paths, and counts only. It must not include raw DOM
dumps, screenshots, traces, HTML report content, provider payloads, raw prompts, raw answers, database rows, credentials,
tokens, cookies, Authorization headers, database URLs, private data, or public identifier inventories.
