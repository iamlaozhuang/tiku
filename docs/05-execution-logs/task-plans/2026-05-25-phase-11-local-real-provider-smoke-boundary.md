# Task Plan: Phase 11 Local Real Provider Smoke Boundary

## Task

Evaluate whether a bounded local/dev real provider smoke can be run under the current Phase 11 local safety boundary. If not executable without reading `.env.local` secrets or changing scripts/env/dependencies, close with explicit fallback evidence from mock/local AI validation.

## Standards Read

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/adr-004-environment-isolation-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-005-staging-architecture-and-release-boundaries.md`
- `docs/05-execution-logs/evidence/2026-05-23-phase-10-local-deepseek-provider-smoke-runtime.md`
- `tests/unit/phase-10-local-deepseek-provider-smoke-runtime.test.ts`
- `docs/05-execution-logs/evidence/2026-05-25-phase-11-local-rag-mock-embedding-pipeline.md`

## Scope

Allowed changes:

- this task plan and evidence
- agent state and task queue status
- `tests/unit/**` only if a safety regression test is needed

Forbidden changes:

- No dependency, package, or lockfile changes.
- No schema, migration, or script changes.
- No `.env.local`, `.env.example`, secret, token, provider payload, raw prompt, raw answer, raw model response, full paper, textbook, OCR, or customer/customer-like private content access or output.
- No staging/prod connection.
- No deployment.
- No cloud resource, Tencent Cloud COS, public object storage URL, or external resource change.

## Execution Decision

- The user approved at most five local/dev provider calls, but did not approve reading or outputting `.env.local` secrets.
- The available Phase 10 DeepSeek smoke script is designed for bounded redacted output, but executing it reads `.env.local` provider values.
- This task's queue boundary also blocks `scripts/**`, so no script modification is allowed.
- Therefore the safe execution decision is: `realProviderCallCount = 0`, `fallback = mock/local`.

## Validation

- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-TaskClaimReadiness.ps1 -TaskId phase-11-local-real-provider-smoke-boundary`
- `npm.cmd run test:unit`
- `npm.cmd run test:e2e`
- `npm.cmd run build`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-AgentSystemReadiness.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Invoke-QualityGate.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-NamingConventions.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`
- `git diff --check`

## Risk Defense

- Do not run a provider smoke that requires reading `.env.local` in this task.
- Do not print raw env values, Authorization headers, provider payloads, prompts, answers, or model responses.
- Treat existing mock/local AI and RAG validations as fallback coverage for local product confidence.
