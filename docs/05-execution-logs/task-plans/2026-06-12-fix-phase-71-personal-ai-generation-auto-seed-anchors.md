# Fix Phase 71 Personal AI Generation Auto-Seed Anchors Plan

**Task id:** `fix-phase-71-personal-ai-generation-auto-seed-anchors`

**Branch:** `codex/fix-phase-71-personal-ai-generation-auto-seed-anchors`

**Task kind:** `docs_state_repair`

## Sources Read

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/*.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/evidence/2026-06-07-phase-71-advanced-personal-ai-generation-implementation-planning.md`
- `docs/05-execution-logs/audits-reviews/2026-06-07-phase-71-advanced-personal-ai-generation-implementation-planning.md`
- `docs/05-execution-logs/evidence/2026-06-12-module-run-v2-auto-seed-personal-learning-ai.md`

## Goal

Repair the historical Phase 71 planning evidence so the current Module Run v2 implementation auto-seed readiness gate can validate the already seeded `personal-learning-ai` implementation tasks.

## Scope

Allowed:

- Append-only compatibility addendum for Phase 71 evidence.
- Phase 71 audit review addendum.
- Task plan, evidence, audit review, project state, and task queue tracking.
- Readiness validation for `batch-119` through `batch-122`.

Blocked:

- Product code changes.
- `scripts/**`, `src/**`, `tests/**`, `e2e/**`.
- Dependency, package, lockfile, schema, migration, env/secret, provider, deploy, payment, external-service, PR, force-push, and Cost Calibration Gate work.

## Implementation Steps

1. Create the short branch from clean `master`.
2. Add this task to `task-queue.yaml` as a closed docs/state repair task once validation is complete.
3. Append a Phase 71 evidence addendum containing the exact readiness anchors required by `Test-ModuleRunV2ImplementationAutoSeedReadiness.ps1`:
   - `implementationAutoSeedGate`
   - `localExperienceClosureGate`
   - `seededImplementationTask`
   - `focused test plan`
   - `localFullLoopGate`
   - `Cost Calibration Gate remains blocked`
4. Append a Phase 71 audit review note clarifying the addendum is a compatibility repair, not a retroactive runtime validation claim.
5. Make `batch-119` through `batch-122` depend on this repair task so future execution cannot bypass the repaired evidence baseline.
6. Run targeted readiness checks for `batch-119` through `batch-122`.
7. Run local gates and write task evidence/audit.

## Validation Plan

- `Select-String` anchor check for the Phase 71 evidence.
- `Test-ModuleRunV2ImplementationAutoSeedReadiness.ps1` for `batch-119`.
- `Test-ModuleRunV2ImplementationAutoSeedReadiness.ps1` for `batch-120`.
- `Test-ModuleRunV2ImplementationAutoSeedReadiness.ps1` for `batch-121`.
- `Test-ModuleRunV2ImplementationAutoSeedReadiness.ps1` for `batch-122`.
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `npm.cmd run test:unit`
- `npm.cmd run build`
- `git diff --check`

## Risk Defenses

- Append-only evidence change preserves the historical Phase 71 record.
- Readiness checks prove the repair satisfies the current mechanism instead of relying on text inspection only.
- No script changes are allowed, so the gate is not relaxed.
- No product code, provider, dependency, schema, migration, env/secret, deploy, payment, external-service, or Cost Calibration Gate work is included.
