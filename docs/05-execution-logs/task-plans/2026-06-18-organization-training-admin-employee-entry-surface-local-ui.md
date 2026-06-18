# Organization Training Admin Employee Entry Surface Local UI Plan

## Task

- taskId: `organization-training-admin-employee-entry-surface-local-ui`
- executionProfile: `local_unit_tdd`
- branch: `codex/organization-training-local-experience-chain`
- status: in progress
- `experience_closed`: not claimed
- Cost Calibration Gate remains blocked.

## Read Before Edit

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
- `src/server/contracts/organization-training-contract.ts`
- Existing admin/student page and unit-test patterns.

## Scope

- Add admin organization-training entry route and feature surface for:
  - metadata-only manual draft creation;
  - source-context attachment;
  - copy-to-new-draft by version public id;
  - public-id-only UI state without internal id exposure.
- Add employee organization-training entry route and feature surface for:
  - visible-list loading;
  - metadata-only draft-save;
  - submit;
  - readonly-summary.
- Add focused unit tests:
  - `tests/unit/organization-training-admin-entry-surface.test.ts`
  - `tests/unit/organization-training-employee-entry-surface.test.ts`
- Update task evidence/audit/state after validation.

## Non-Scope

- No server/schema/migration/database execution.
- No package/lockfile/dependency changes.
- No `.env*`, provider/model, dev server, Browser/Playwright runtime, full e2e, staging/prod/cloud/deploy/payment,
  external-service, PR, force-push, or Cost Calibration Gate work.

## TDD Plan

1. RED: add tests that require admin and employee entry surfaces, runtime API calls, loading/error/empty/unauthorized
   states, no token/internal-id leakage, and public-id-only route links.
2. GREEN: add minimal page wrappers and feature components matching existing admin/student layout conventions.
3. Refactor: keep local helpers small, reuse existing admin/student API client helpers, keep text and layout stable.
4. Validate with the task-declared unit, list-only e2e, prettier, lint, typecheck, `git diff --check`, and Module Run v2
   readiness gates.

## Risk Controls

- Use only DTO types from `organization-training-contract.ts`; do not import server services into client code.
- Keep employee answer payload metadata-only and avoid displaying raw answer content in evidence.
- Use Design Token classes already present in the project and avoid raw colors.
- Leave `experience_closed` blocked until local full-flow validation and readiness audit complete.
