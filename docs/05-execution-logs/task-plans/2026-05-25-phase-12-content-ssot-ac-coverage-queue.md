# Phase 12 Content SSOT AC Coverage Queue Plan

## Task

Register a requirements-first repair queue for content admin AC coverage and define the local Definition of Done before continuing implementation.

## Restored Gates

- Read `AGENTS.md` from current session context and confirmed Chinese communication, naming, branch, evidence, queue, and high-risk approval rules.
- Read `docs/03-standards/code-taste-ten-commandments.md`.
- Read ADRs:
  - `docs/02-architecture/adr/adr-001-tech-stack-selection.md`
  - `docs/02-architecture/adr/adr-002-runtime-architecture-and-multi-client-contract.md`
  - `docs/02-architecture/adr/adr-003-workplace-desktop-web-compatibility.md`
  - `docs/02-architecture/adr/adr-004-environment-isolation-and-release-boundaries.md`
  - `docs/02-architecture/adr/adr-005-staging-architecture-and-release-boundaries.md`
- Read queue and project state from:
  - `docs/04-agent-system/state/project-state.yaml`
  - `docs/04-agent-system/state/task-queue.yaml`

## SSOT Sources

- `docs/01-requirements/modules/02-question-paper.md`
- `docs/01-requirements/stories/epic-02-question-paper.md`
- `docs/01-requirements/modules/06-admin-ops.md`
- `docs/01-requirements/stories/epic-06-admin-ops.md`
- `docs/01-requirements/modules/05-rag-knowledge.md`

## Scope

Allowed:

- Update task queue and project state.
- Create task plan and evidence for this queue registration.
- Register P1/P2 repair tasks with AC-to-runtime Definition of Done.

Blocked unless later explicitly approved:

- `package.json` / lockfile changes.
- Schema, migration, or script changes.
- Secret/env reads or changes.
- Cloud, staging, prod, deployment, provider, or object storage changes.
- Destructive data operations.

## Definition of Done For Future Repairs

Each content-admin repair task must close with an AC-to-runtime matrix that marks each included AC as `pass`, `partial`, `blocked`, or `not_implemented`.

For each `pass`, evidence must identify:

- SSOT story and AC.
- UI entry point.
- API route or explicit reason why the AC is UI-only.
- service/repository/runtime boundary.
- unit/E2E/browser/manual verification command or step.
- evidence notes with no secrets and no raw private content.

Representative happy paths are not sufficient to claim AC coverage.

## Queue Strategy

Register small tasks in this order:

1. Question bank existing-schema AC coverage.
2. Paper composition AC coverage.
3. Material management AC coverage.
4. Knowledge node tree AC coverage.
5. Admin common interaction AC coverage.
6. Question type schema expansion gate for missing `case_analysis` and `calculation`.

The schema expansion remains a Gate and must not be implemented in this task.
