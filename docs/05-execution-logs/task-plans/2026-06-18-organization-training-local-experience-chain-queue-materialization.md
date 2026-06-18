# Organization Training Local Experience Chain Queue Materialization Plan

## Task

- taskId: `organization-training-local-experience-chain-queue-materialization`
- executionProfile: `docs_state_lite`
- branch: `codex/organization-training-local-experience-chain`
- user approval: current 2026-06-18 prompt asks to execute the recommended 1-5 sequence by mechanism.

## References Read

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/adr-001-tech-stack-selection.md`
- `docs/02-architecture/adr/adr-002-runtime-architecture-and-multi-client-contract.md`
- `docs/02-architecture/adr/adr-003-workplace-desktop-web-compatibility.md`
- `docs/02-architecture/adr/adr-004-environment-isolation-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-005-staging-architecture-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-006-runtime-dependency-alignment.md`
- `docs/01-requirements/advanced-edition/modules/04-organization-training.md`
- `docs/01-requirements/advanced-edition/stories/epic-02-organization-training.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/04-agent-system/state/local-experience-coverage-matrix.yaml`

## Scope

- Materialize the matrix-recommended organization-training local experience chain as executable queue tasks:
  1. runtime repository/route/API contract for manual draft, source-context attachment, and copy-to-new-draft;
  2. admin/employee entry-surface local UI;
  3. localhost-only local full-flow validation;
  4. experience closure readiness audit.
- Keep this materialization docs/state-only.
- Do not modify product source, schema, migrations, package/lockfile, e2e runtime specs, `.env*`, provider/model config,
  staging/prod/cloud/deploy/payment/external-service, PR, force-push, or Cost Calibration Gate in this task.

## Execution Plan

1. Add this task as a closed docs/state queue materialization entry.
2. Add `organization-training-draft-source-context-runtime-contract-tdd` as the first pending implementation task.
3. Add `organization-training-admin-employee-entry-surface-local-ui` as the next pending local UI task.
4. Add `organization-training-admin-employee-local-full-flow-validation` as the approved localhost-only flow task after UI.
5. Add `organization-training-experience-closure-readiness-audit` as the final audit task that may decide whether
   `experience_closed` can be claimed.
6. Update project-state and coverage matrix handoff to the materialized first runtime task.
7. Run docs-state validation and Module Run v2 readiness gates.

## Risk Controls

- Runtime source changes remain blocked until the first TDD task is selected.
- UI changes remain blocked until runtime contract task closes.
- Browser/Playwright runtime remains blocked until the full-flow validation task is selected.
- `experience_closed` remains blocked until the final audit task has fresh full-flow evidence.
- Cost Calibration Gate remains blocked.
