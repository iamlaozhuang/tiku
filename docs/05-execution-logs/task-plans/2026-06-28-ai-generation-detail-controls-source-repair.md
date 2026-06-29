# AI Generation Detail Controls Source Repair Plan

## Task

- Task id: `ai-generation-detail-controls-source-repair-2026-06-28`
- Branch: `codex/ai-generation-detail-controls-repair-20260628`
- Goal alignment: repair a blocking AI generation detail-control gap in the full acceptance matrix.

## SSOT Read List

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/01-requirements/traceability/2026-06-28-owner-facing-role-gap-capture-scope.md`
- `docs/01-requirements/traceability/2026-06-28-full-acceptance-ai-generation-detail-gap-capture.md`
- `docs/05-execution-logs/evidence/2026-06-28-full-acceptance-ai-generation-detail-gap-capture.md`
- `docs/05-execution-logs/evidence/2026-06-28-full-acceptance-ops-admin-session-material-completion.md`

## Materialized Boundary

Allowed files:

- `src/features/admin/ai-generation/AdminAiGenerationEntryPage.tsx`
- `tests/unit/admin-ai-generation-entry-surface.test.ts`
- task-scoped state, queue, requirement, plan, evidence, audit, and acceptance files.

Blocked actions:

- Provider execution/config/credentials, prompts, raw AI IO.
- DB read/write, schema, migration, seed.
- local UI/API write-flow mutation.
- dependency/package/lockfile changes.
- staging/prod/deploy, PR, force push, release readiness, final Pass, Cost Calibration.
- sensitive evidence capture.

## Execution Steps

1. Inspect the current admin AI generation entry component and focused unit tests.
2. Add RED tests for required question and paper control categories.
3. Implement visible detail controls and draft/review boundary copy without submit/provider behavior.
4. Run focused tests, full unit baseline, lint, typecheck, formatting, and Module Run v2 gates.
5. Optionally perform read-only localhost browser control-presence verification if the local server is already usable or
   can be started within scope.
6. Write redacted evidence and closeout.

## Completion Rule

This task can close only source/test repair for the shared admin AI detail-control surface. Full durable goal completion
still requires role-specific browser reruns and all remaining checklist rows.

## Execution Result

- RED reproduced with focused unit tests: missing detail-control section on content AI question and organization AI
  paper surfaces.
- GREEN implementation added shared local detail controls and focused unit coverage.
- Final full unit baseline passed: 317 files, 1432 tests.
- Browser read-only check was attempted but not accepted as pass evidence because current localhost browser/dev-server
  state did not render the target entry surface; role-specific browser rerun remains the next acceptance step.
