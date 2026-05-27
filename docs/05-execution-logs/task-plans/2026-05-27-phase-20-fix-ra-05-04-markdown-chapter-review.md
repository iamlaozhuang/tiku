# Phase 20 Fix RA-05-04 Markdown Chapter Review Plan

**Task id:** `phase-20-fix-ra-05-04-markdown-chapter-review`

**Branch:** `codex/phase-20-fix-ra-05-04-markdown-chapter-review`

## Scope

Fix `F-RA-05-04-001`: Markdown chapter hierarchy adjustment/review evidence is incomplete.

## Standards Read

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/03-standards/local-ci.md`
- `docs/02-architecture/adr/`
- `docs/02-architecture/interfaces/`
- `docs/04-agent-system/sop/automation-loop.md`
- `docs/04-agent-system/sop/local-human-verification.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/04-agent-system/state/blocked-gates.yaml`
- `docs/05-execution-logs/audits-reviews/2026-05-27-phase-21-implementation-plan-breakdown.md`
- `docs/05-execution-logs/evidence/2026-05-27-phase-21-implementation-plan-breakdown.md`

## Constraints

- Do not touch `.env.local`, `.env.example`, package or lock files, `src/db/schema/**`, `drizzle/**`, or `scripts/**`.
- Do not add dependencies, run migrations, connect to staging/prod/cloud, or call real providers.
- Keep resource and Markdown review behavior local and deterministic.
- Preserve API envelopes, public identifiers, redaction of resource content evidence, and existing authorization boundaries.

## Implementation Approach

1. Inspect RA-05 audit finding, resource contracts, resource admin UI/runtime, Markdown chapter parser/chunking, and existing tests.
2. Add focused failing tests for the missing chapter hierarchy review/adjustment behavior.
3. Implement the smallest low-risk change within existing resource UI/runtime surfaces.
4. If the fix requires a dependency, schema/migration, cloud storage, real vector/provider, env/secret, or deploy work, stop and record the approval blocker instead.
5. Run task validation commands and local CI gates; write evidence before commit/merge.

## Risk Defense

- `resource_lifecycle` and `browser_runtime` require build/e2e verification if UI/runtime behavior changes.
- Real provider/vector/cloud and dependency work remain blocked.

## Planned Validation

- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-TaskClaimReadiness.ps1 -TaskId phase-20-fix-ra-05-04-markdown-chapter-review`
- Focused unit/UI tests for Markdown chapter review behavior.
- `npm.cmd run test:unit`
- `npm.cmd run test:e2e`
- `npm.cmd run build`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-AgentSystemReadiness.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`
- `git diff --check`
- Changed-file Prettier check.
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-NamingConventions.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Invoke-QualityGate.ps1`
