# Task Plan: Phase 11 AI Call Log Visibility Fix

## Task

Fix the P2 local validation finding where successful `kn_recommendation` and `ai_explanation` paths can be invisible when querying filtered `ai_call_log` results.

## Standards Read

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/adr-001-tech-stack-selection.md`
- `docs/02-architecture/adr/adr-002-runtime-architecture-and-multi-client-contract.md`
- `docs/02-architecture/adr/adr-003-workplace-desktop-web-compatibility.md`
- `docs/02-architecture/adr/adr-004-environment-isolation-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-005-staging-architecture-and-release-boundaries.md`
- `docs/05-execution-logs/evidence/2026-05-25-phase-11-local-system-validation.md`

## Scope

Allowed changes:

- `src/server/**`
- focused unit tests under `tests/unit/**`
- E2E files only if needed for evidence
- this task plan and evidence
- agent state and task queue status

Forbidden changes:

- No dependency, `package.json`, or lockfile changes.
- No schema, migration, or script changes.
- No `.env.local`, `.env.example`, secret, token, provider payload, raw prompt, raw answer, or raw model response access or output.
- No staging/prod connection.
- No deployment.
- No cloud, DNS, Tencent Cloud COS, public object storage URL, or external resource change.
- No real provider call in this task.

## Root Cause

The Postgres `ai_call_log` repository applies only keyword filtering before pagination. `aiFuncType` and `callStatus` are filtered in the service after the repository returns a page. When recent `learning_suggestion` rows fill the first page, filtered `kn_recommendation` and `ai_explanation` rows can be outside the page and appear as zero results.

## TDD Plan

1. Add a repository unit test proving filtered `ai_call_log` queries include `ai_func_type` and `call_status` SQL conditions before pagination.
2. Confirm the test fails on the current repository.
3. Add SQL-level `aiFuncType` and `callStatus` conditions to `listAiCallLogs`.
4. Re-run focused tests, full unit tests, default E2E, build, and agent gates.

## Validation

- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-TaskClaimReadiness.ps1 -TaskId phase-11-ai-call-log-visibility-fix`
- `npm.cmd run test:unit -- tests/unit/phase-11-ai-call-log-visibility-fix.test.ts`
- `npm.cmd run test:unit`
- `npm.cmd run test:e2e`
- `npm.cmd run build`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-AgentSystemReadiness.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Invoke-QualityGate.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-NamingConventions.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`
- `git diff --check`

## Risk Defense

- Keep schema and migrations unchanged.
- Keep raw prompts, answers, provider payloads, and secrets out of evidence.
- Preserve service-level redaction and response envelope behavior.
