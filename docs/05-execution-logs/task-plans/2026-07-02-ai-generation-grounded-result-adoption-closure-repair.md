# AI generation grounded result adoption closure repair

## Task

- Task id: `ai-generation-grounded-result-adoption-closure-repair-2026-07-02`
- Branch: `codex/ai-generation-grounded-result-adoption-closure`
- Scope: local source and focused test repair for AI 出题 / AI组卷 grounded result and adoption closure.

## Standards Read

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

## Root Cause Summary

- Admin AI generation runtime bridge can correctly block insufficient grounding, but the admin local contract route still creates a draft result and resolves the task as succeeded from the persistence result.
- Content admin adoption UI currently submits a locally constructed reviewed draft payload, so adoption can succeed without proving that the draft came from the generated structured result.
- Existing shared parsing already produces safe structured preview summaries. This task will reuse that path instead of creating role-specific duplicate parsing.

## Implementation Plan

1. Add red tests proving admin generation does not persist a result when grounding is insufficient or structured preview parsing fails.
2. Add red tests proving content-admin adoption cannot send a fabricated reviewed draft detached from the generated result summary.
3. Implement minimal service-layer gating: only a provider pass with sufficient grounding and parsed structured preview can create or expose a generated result.
4. Adjust content admin UI adoption so adoption is unavailable unless the generated result has a parsed structured preview.
5. Run focused tests and project gates; write redacted evidence only.

## Boundaries

- No `.env*`, credential, cookie, token, localStorage, Authorization header, DB connection string, or Provider payload evidence.
- No direct DB connection, reset, seed, schema, migration, dependency, package, lockfile, e2e, staging/prod/cloud/deploy, Cost Calibration, release readiness, or final Pass.
- Evidence may record role labels, route labels, status counts, focused test names, and validation command status only.

## Validation Commands

- `npm.cmd run test:unit -- src/server/services/admin-ai-generation-local-contract-route.test.ts src/server/services/route-integrated-provider-execution-service.test.ts src/features/admin/ai-generation/AdminAiGenerationEntryPage.test.tsx tests/unit/admin-ai-generation-entry-surface.test.ts`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `npm.cmd exec -- prettier --check --ignore-unknown <changed-files>`
- `git diff --check`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId ai-generation-grounded-result-adoption-closure-repair-2026-07-02`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId ai-generation-grounded-result-adoption-closure-repair-2026-07-02 -SkipRemoteAheadCheck`
