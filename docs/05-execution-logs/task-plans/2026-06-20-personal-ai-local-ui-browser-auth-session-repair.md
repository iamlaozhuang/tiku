# Task Plan: personal-ai-local-ui-browser-auth-session-repair

## Scope

Repair or validate the personal AI localhost-only browser flow auth/session mismatch recorded by
`module-run-v2-personal-ai-local-ui-browser-flow-validation`.

The repair must preserve the server-session-only login boundary for normal browsers. Local browser token persistence is
allowed only for localhost automated validation if the current implementation requires it.

## Required Reads

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/05-execution-logs/evidence/2026-06-17-module-run-v2-personal-ai-local-ui-browser-flow-validation.md`
- `playwright.config.ts`
- `e2e/personal-ai-generation-local-request.spec.ts`
- `src/app/(auth)/login/page.tsx`
- `src/features/student/studentRuntimeApi.ts`
- focused unit tests listed in the task queue.

## Debugging Plan

1. Reproduce with the existing focused unit tests and targeted existing Playwright spec.
2. If current implementation already passes, close as validated repair without source/e2e edits.
3. If it fails, identify whether the mismatch is in e2e setup, local automation token persistence, or student runtime API
   session handling.
4. Apply the smallest allowed change. Do not weaken normal browser server-session-only login behavior.
5. Re-run focused unit tests, `npm run test:e2e -- --list`, and the targeted existing Playwright spec.

## Risk Controls

- No new e2e spec, headed/debug browser, env/secret access, provider/model calls, schema/migration, dependency changes,
  destructive DB, deploy, payment, PR, force-push, or Cost Calibration Gate execution.
- Evidence records only command results, counts, roles/use-case summary, and redacted metadata. It must not contain raw
  tokens, Authorization headers, provider payloads, raw prompts, raw generated AI content, raw answer text, full paper
  content, DB rows, database URLs, or secrets.

## Validation Plan

- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Get-TikuProjectStatus.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Get-TikuNextAction.ps1 -VerboseHistory`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Get-ModuleRunV2ImplementationSeedProposal.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2LocalCapabilityGate.ps1 -TaskId personal-ai-local-ui-browser-auth-session-repair -Capability localFullFlowGate -Intent use_capability`
- `npm.cmd run test:unit -- tests/unit/student-login-ui.test.ts tests/unit/auth/session-personal-auth-boundary.test.ts tests/unit/student-personal-ai-generation-ui.test.ts src/features/student/ai-generation/StudentPersonalAiGenerationPage.test.tsx src/server/services/personal-ai-generation-local-browser-experience-service.test.ts`
- `npm.cmd run test:e2e -- --list`
- `npm.cmd run test:e2e -- e2e/personal-ai-generation-local-request.spec.ts`
- scoped Prettier check for changed files
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `git diff --check`
- ModuleRunV2 pre-commit, closeout, and pre-push readiness gates.
