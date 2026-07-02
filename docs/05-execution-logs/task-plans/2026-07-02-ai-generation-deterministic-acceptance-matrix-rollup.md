# AI Generation Deterministic Acceptance Matrix Rollup Plan

## Task Boundary

- Task id: `ai-generation-deterministic-acceptance-matrix-rollup-2026-07-02`
- Branch: `codex/ai-generation-deterministic-acceptance-matrix-rollup`
- Parent goal: `ai-generation-shared-structured-contract-goal-plan-2026-07-02`
- Scope: docs/state rollup only for deterministic AI出题 and AI组卷 repairs before bounded Provider rerun.
- Allowed files:
  - `docs/04-agent-system/state/project-state.yaml`
  - `docs/04-agent-system/state/task-queue.yaml`
  - `docs/05-execution-logs/task-plans/2026-07-02-ai-generation-deterministic-acceptance-matrix-rollup.md`
  - `docs/05-execution-logs/evidence/2026-07-02-ai-generation-deterministic-acceptance-matrix-rollup.md`
  - `docs/05-execution-logs/audits-reviews/2026-07-02-ai-generation-deterministic-acceptance-matrix-rollup.md`
- Blocked: source/test changes, real Provider calls, browser/runtime walkthrough, DB connection or mutation, `.env*`, package/lockfile changes, schema/migration/seed, e2e, deploy, PR, force push, release readiness, final Pass, and Cost Calibration.

## SSOT Read List

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/adr-001-tech-stack-selection.md`
- `docs/02-architecture/adr/adr-002-runtime-architecture-and-multi-client-contract.md`
- `docs/02-architecture/adr/adr-003-workplace-desktop-web-compatibility.md`
- `docs/02-architecture/adr/adr-004-environment-isolation-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-005-staging-architecture-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-006-runtime-dependency-alignment.md`
- `docs/02-architecture/adr/adr-007-edition-aware-authorization-source-of-truth.md`
- `docs/01-requirements/00-index.md`
- `docs/01-requirements/use-cases/use-case-catalog.md`
- `docs/01-requirements/modules/06-admin-ops.md`
- `docs/01-requirements/advanced-edition/00-index.md`
- `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`
- `docs/01-requirements/advanced-edition/modules/03-personal-ai-generation.md`
- `docs/01-requirements/advanced-edition/modules/08-organization-ai-generation.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- Deterministic child task plans/evidence/audits for:
  - `ai-generation-shared-structured-contract-goal-plan-2026-07-02`
  - `ai-generation-shared-task-spec-contract-2026-07-02`
  - `ai-generation-structured-preview-parser-hardening-2026-07-02`
  - `ai-generation-provider-instruction-unification-2026-07-02`
  - `ai-generation-route-contract-alignment-2026-07-02`
  - `ai-generation-cross-surface-ui-regression-matrix-2026-07-02`

## First-Principles Diagnosis

The next real Provider rerun should not start from scattered confidence. It needs one deterministic gate that names what was fixed, which contracts are covered, which role/task rows are covered, and which blocked capabilities remained blocked. This rollup is the handoff between local deterministic correctness and bounded runtime validation.

## Implementation Steps

1. List each deterministic child task with commit, result, validation status, and blocked runtime capabilities.
2. Build the content admin, organization admin, and student AI出题/AI组卷 matrix from the child evidence.
3. Confirm parser coverage for requested question count and paper total question count.
4. Confirm zero real Provider calls across deterministic tasks.
5. Run existing focused deterministic tests only; do not change source or test files.
6. Run lint, typecheck, Prettier, `git diff --check`, and Module Run v2 gates.

## Acceptance Standards

- Rollup lists each deterministic task, commit, result, and validation status.
- Matrix records content admin, organization admin, and student rows for AI出题 and AI组卷.
- Rollup confirms zero real Provider calls in deterministic tasks.
- Rollup confirms parser coverage for requested question count and paper total question count.
- No source/test/runtime/provider/browser/DB/dependency/schema/deploy action is executed.

## Risk Controls

- Evidence records only task ids, commit prefixes, status categories, counts, and validation command results.
- No prompt text, Provider payload, raw AI output, full generated `question`/`paper`, material, chunk, credential, token, cookie, session, Authorization header, localStorage, env value, raw DB row, or internal id is recorded.
- This task does not authorize bounded Provider execution; it only gates the later task.
