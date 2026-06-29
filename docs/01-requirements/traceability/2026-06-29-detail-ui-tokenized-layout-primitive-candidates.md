# Detail UI Tokenized Layout Primitive Candidates Traceability

- Task id: `detail-ui-tokenized-layout-primitive-candidates-2026-06-29`
- Branch: `codex/ui-tokenized-layout-primitives-20260629`
- Scope: low-risk UI detail optimization for one selected repeated admin filter-grid layout primitive.
- Finding id: `ui-inv-001`

## Boundary

This task may modify only the materialized admin layout primitive source, two admin baseline component files, one focused
unit test, and scoped governance docs/state/evidence files. It does not modify design tokens, package manifests,
lockfiles, schema, migrations, seeds, runtime configuration, e2e specs, scripts, or release/deployment state.

No browser, dev server, e2e, DB connection, Provider/AI call, dependency mutation, staging/prod/cloud action, release
readiness, final Pass, or Cost Calibration work is in scope.

## Requirement Alignment

| Requirement                                             | Status    | Evidence                                                                                 |
| ------------------------------------------------------- | --------- | ---------------------------------------------------------------------------------------- |
| Materialize task-specific source/test scope before edit | satisfied | state, queue, and task plan record exact writable files and blocked files                |
| Repair only high-confidence layout primitive candidate  | satisfied | selected duplicated admin filter grid class in two baseline components                   |
| Avoid design-token mutation                             | satisfied | no `src/app/globals.css` or token file change                                            |
| Preserve UI behavior without runtime execution          | satisfied | component markup still renders the same class string through a shared primitive          |
| Add focused local test coverage                         | satisfied | `tests/unit/admin-layout-primitives-ui.test.ts` covers both admin baseline filter panels |
| Keep sensitive evidence redacted                        | satisfied | evidence records path/category/count/status summaries only                               |

## Source Change Matrix

| File                                                                        | Change class            | Summary                                                       |
| --------------------------------------------------------------------------- | ----------------------- | ------------------------------------------------------------- |
| `src/components/admin/admin-layout-primitives.ts`                           | new shared primitive    | defines `adminFilterGridPanelClassName`                       |
| `src/components/admin/CommonInteraction/AdminCommonInteractionBaseline.tsx` | layout primitive import | replaces duplicated inline admin filter-grid class            |
| `src/components/admin/UserOrgAuthOps/AdminUserOrgAuthOpsBaseline.tsx`       | layout primitive import | replaces duplicated inline admin filter-grid class            |
| `tests/unit/admin-layout-primitives-ui.test.ts`                             | focused unit coverage   | asserts both panels consume the shared admin layout primitive |

## Follow-Up Note

This closes the selected high-confidence duplicated admin filter-grid subcandidate from `ui-inv-001`. Other arbitrary
Tailwind layout values from the inventory remain outside this task unless a later task materializes a narrower scope.
