# AI generation shared structured contract goal plan evidence

## Boundary

- Task id: `ai-generation-shared-structured-contract-goal-plan-2026-07-02`
- Branch: `codex/ai-generation-shared-structured-contract-goal-plan`
- Work type: docs/state planning and queue materialization.
- Source/runtime/test code changed: false.
- Provider call executed: false.
- Browser runtime executed: false.
- DB connection or mutation executed: false.
- Dependency/package/lockfile changed: false.
- Schema/migration/seed changed: false.
- Staging/prod/deploy/PR/force-push/Cost Calibration/release readiness/final Pass: false.

## Inputs Read

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- ADRs under `docs/02-architecture/adr/`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/evidence/2026-07-02-marketing-monopoly-logistics-provider-rerun.md`
- `docs/05-execution-logs/evidence/2026-07-02-monopoly-scanned-pdf-ocr-runtime-rag-coverage.md`
- Existing AI generation route, Provider, parser, admin UI, and student UI files were inspected read-only.

## Goal Materialized

- Goal name: `ai-generation-shared-structured-contract-hardening`
- Parent planning task: `ai-generation-shared-structured-contract-goal-plan-2026-07-02`
- Parent plan path: `docs/05-execution-logs/task-plans/2026-07-02-ai-generation-shared-structured-contract-goal-plan.md`

## Child Task Templates

| Order | Task id                                                                     | Gate type             | Provider allowed   |
| ----- | --------------------------------------------------------------------------- | --------------------- | ------------------ |
| 1     | `ai-generation-shared-task-spec-contract-2026-07-02`                        | source/test           | false              |
| 2     | `ai-generation-structured-preview-parser-hardening-2026-07-02`              | source/test           | false              |
| 3     | `ai-generation-provider-instruction-unification-2026-07-02`                 | source/test           | false              |
| 4     | `ai-generation-route-contract-alignment-2026-07-02`                         | source/test           | false              |
| 5     | `ai-generation-cross-surface-ui-regression-matrix-2026-07-02`               | source/test           | false              |
| 6     | `ai-generation-deterministic-acceptance-matrix-rollup-2026-07-02`           | docs/evidence rollup  | false              |
| 7     | `ai-generation-bounded-provider-rerun-after-structured-contract-2026-07-02` | bounded runtime rerun | true, after Task 6 |

## Acceptance Standard Summary

- AI出题 must accept the requested `questionCount`, not a hard-coded count.
- AI组卷 must expose a non-null total `questionCount` for supported structured JSON forms.
- Admin and personal Provider instruction construction must share output contract definitions.
- Content admin, organization admin, and student routes must pass deterministic mocked-provider success and safe-failure tests for both AI出题 and AI组卷.
- UI tests must prove ordinary user-facing states without raw payload, prompt, Provider response, token/session, internal id, or technical contract leak.
- Real Provider rerun is explicitly deferred until deterministic rollup passes.

## Validation

- Focused unit: pass, 3 files, 50 tests.
  - `src/server/services/route-integrated-provider-execution-service.test.ts`
  - `tests/unit/admin-ai-generation-entry-surface.test.ts`
  - `tests/unit/student-personal-ai-generation-ui.test.ts`
- `npm.cmd run lint`: pass.
- `npm.cmd run typecheck`: pass.
- Scoped Prettier write/check for state and task docs: pass.
- `git diff --check`: pass.
- Module Run v2 pre-commit hardening: pass, 5 files scanned, scope/sensitive evidence/terminology checks passed.
- Module Run v2 pre-push readiness: pass, evidence and audit paths present.

## Closeout Summary

- Parent planning task status: closed.
- Child task templates materialized: 7.
- Next recommended task: `ai-generation-shared-task-spec-contract-2026-07-02`.
- Source/runtime/test code changed: false.
- Provider/browser/DB/dependency/schema/deploy executed: false.
- Release readiness/final Pass/Cost Calibration claimed: false.
