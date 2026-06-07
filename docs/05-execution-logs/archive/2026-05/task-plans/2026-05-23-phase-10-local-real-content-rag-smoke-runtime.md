# Task Plan: phase-10-local-real-content-rag-smoke-runtime

## Metadata

- Task id: `phase-10-local-real-content-rag-smoke-runtime`
- Branch: `codex/phase-10-local-real-content-rag-smoke-runtime`
- Base: `master`
- Created at: `2026-05-23T22:14:18+08:00`
- Human approval: User approved adding a local dev follow-up runtime task to unblock the Phase 10 real-content RAG smoke.

## Read Before Work

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/02-architecture/interfaces/phase-10-local-release-candidate-contract.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/evidence/2026-05-23-phase-10-local-deepseek-provider-smoke-runtime.md`

## Scope

Create a local-only smoke runtime that proves the real-content RAG path can operate from ignored local content without committing source files or raw excerpts.

Allowed files:

- `docs/05-execution-logs/task-plans/2026-05-23-phase-10-local-real-content-rag-smoke-runtime.md`
- `docs/05-execution-logs/evidence/2026-05-23-phase-10-local-real-content-rag-smoke-runtime.md`
- `scripts/local/Invoke-RealContentRagSmoke.ps1`
- `tests/unit/phase-10-local-real-content-rag-smoke-runtime.test.ts`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`

Blocked files include dependencies, lockfiles, `.env.example`, `.env.local`, `src/**`, and `drizzle/**`.

## Implementation Plan

1. Claim the new task with `Test-TaskClaimReadiness.ps1`.
2. Add a failing focused unit test for the local PowerShell smoke script safety contract.
3. Add `scripts/local/Invoke-RealContentRagSmoke.ps1` with no new dependencies.
4. Keep processing bounded:
   - one ignored local source file selected from `rawfiles/`
   - small text and chunk limits
   - no provider call
   - no database write
5. Extract only in-memory bounded text from supported local files and emit sanitized JSON:
   - source location marker: `ignored_rawfiles`
   - file extension, size, and hash prefix only
   - synthetic local `knowledge_base` / `resource` identifiers as hash prefixes
   - `chunk` count and hash prefixes only
   - `citation` count/hash prefixes and `evidence_status`
6. Write evidence with command results and privacy review.
7. Update project state and task queue, then run required gates.

## Privacy And Safety

- Real source content remains under ignored `rawfiles/` or another Git-ignored local path.
- Evidence must not include filenames, full paths, raw textbook text, full papers, answer keys, OCR output, raw prompts, raw answers, model responses, provider payloads, API keys, secrets, tokens, passwords, database URLs, or Authorization headers.
- The runtime must not read `.env.local`, call providers, connect staging/prod, deploy, or modify production resources.
- If no supported ignored local content exists, record `blocked` instead of fabricating a pass.

## Validation Plan

- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-TaskClaimReadiness.ps1 -TaskId phase-10-local-real-content-rag-smoke-runtime`
- `npm.cmd run test:unit -- tests/unit/phase-10-local-real-content-rag-smoke-runtime.test.ts`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\local\Invoke-RealContentRagSmoke.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-AgentSystemReadiness.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Invoke-QualityGate.ps1`
- `npm.cmd run build`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-NamingConventions.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`
