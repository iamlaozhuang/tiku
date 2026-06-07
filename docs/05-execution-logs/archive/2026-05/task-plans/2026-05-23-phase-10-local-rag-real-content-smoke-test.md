# Task Plan: phase-10-local-rag-real-content-smoke-test

## Metadata

- Task id: `phase-10-local-rag-real-content-smoke-test`
- Branch: `codex/phase-10-local-rag-real-content-smoke-test`
- Base branch: `master`
- Created at: `2026-05-23T00:00:00+08:00`
- Task plan policy: `required`

## Required Reading

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/adr-001-tech-stack-selection.md`
- `docs/02-architecture/adr/adr-002-runtime-architecture-and-multi-client-contract.md`
- `docs/02-architecture/adr/adr-003-workplace-desktop-web-compatibility.md`
- `docs/02-architecture/adr/adr-004-environment-isolation-and-release-boundaries.md`
- `docs/02-architecture/interfaces/phase-10-local-release-candidate-contract.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/evidence/2026-05-23-phase-10-local-real-content-import-dry-run.md`
- `docs/05-execution-logs/evidence/2026-05-23-phase-10-local-deepseek-provider-smoke-runtime.md`

## Scope

Allowed files for this task:

- `docs/05-execution-logs/task-plans/2026-05-23-phase-10-local-rag-real-content-smoke-test.md`
- `docs/05-execution-logs/evidence/2026-05-23-phase-10-local-rag-real-content-smoke-test.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`

Blocked files:

- `package.json`
- `pnpm-lock.yaml`
- `package-lock.json`
- `.env.example`
- `.env.local`
- `src/**`
- `drizzle/**`

## Implementation Approach

1. Confirm task claim readiness on the short-lived branch.
2. Verify local real-content input presence without reading or printing source text:
   - `rawfiles/` exists and is ignored by `.gitignore`.
   - Record only file count, extension distribution, total size, and references to the previous redacted dry-run evidence.
3. Inspect existing RAG architecture read-only:
   - `knowledge_base`, `resource`, and `knowledge_node_resource` exist in schema.
   - Existing chunking and retrieval runtime uses `resource.markdown_content` and returns redaction-safe evidence summaries.
   - `chunk` and `citation` are currently runtime objects and evidence summaries, not persisted database tables.
4. Decide whether a real-content RAG smoke can be honestly executed within allowed files:
   - If existing local data already contains real imported `resource.markdown_content`, record the redacted smoke path and sanitized result.
   - If no permitted runtime exists to convert local real files into `resource.markdown_content`, do not synthesize or fabricate a pass.
5. If blocked, write evidence that states the exact blocker:
   - Real input exists under ignored `rawfiles/`.
   - Existing Phase 9 RAG unit/runtime tests cover synthetic `markdownContent`.
   - This task cannot add parser/import/runtime code because `src/**`, `scripts/**`, `drizzle/**`, dependency files, and env files are blocked.
   - Evidence will not include raw source text, answer keys, OCR output, raw prompts, raw provider payloads, raw model responses, secrets, or production data.
6. Update `project-state.yaml` and `task-queue.yaml` to mark the task as `blocked` if a true real-content RAG smoke cannot be executed.
7. Run and record the task validation commands, including quality gate and build, because the queue requires them even for blocked documentation/state closeout.
8. Commit the blocked evidence/state update. Merge and push only if all gates pass and the commit contains only allowed files.

## Risk Controls

- No `.env.local` value is read into evidence or printed.
- No provider call is required for the blocked path; if any later task calls a provider, it must remain bounded and redacted under Phase 10 rules.
- No real textbook, paper, answer, OCR output, or long source excerpt is written to Git.
- No dependency, lockfile, runtime source, database schema, migration, environment example, deployment, staging resource, production resource, or public object storage operation is allowed.
- Blocked status is preferred over a misleading smoke result when the allowed file boundary prevents honest runtime implementation.

## Validation Commands

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-TaskClaimReadiness.ps1 -TaskId phase-10-local-rag-real-content-smoke-test
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-AgentSystemReadiness.ps1
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Invoke-QualityGate.ps1
npm.cmd run build
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-NamingConventions.ps1
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master
```
