# 2026-07-08 Knowledge Node AI Final Regression Evidence

## Requirement Mapping Result

- Requirement source: `docs/01-requirements/traceability/2026-07-02-ai-generation-requirements-ssot-alignment.md`.
- Closure source: `docs/05-execution-logs/task-plans/2026-07-08-knowledge-node-ai-repair-verification-and-implementation-plan.md`.
- Scope: final regression across learner standard/advanced, organization employee/admin standard/advanced, content admin, ops admin, and super admin boundaries for knowledge_node/resource/question/AI parameter chain.
- Boundary: tests/evidence only plus one test fixture repair; no product runtime code, Provider, DB, schema, seed, fixture data, dependency, env, browser, staging/prod, or Cost Calibration work.

## New Regression Coverage

- Added `tests/unit/knowledge-node-ai-final-regression.test.ts`.
- Coverage:
  - structured selected `knowledgeNodePublicIds` normalization for `personal_advanced_student`, `org_advanced_employee`, `org_advanced_admin`, and `content_admin`;
  - backend AI route boundaries for `content_admin`, `ops_admin`, `org_standard_admin`, `org_advanced_admin`, and `super_admin`;
  - selected AI组卷 source resolution excludes unrelated platform questions.

## Full Regression Finding And Fix

- Initial command: `npm.cmd exec -- vitest run`.
- Initial result: failed, 347 files passed / 1 file failed / 1 test failed.
- Root cause: `src/features/admin/ai-generation/AdminAiGenerationEntryPage.test.tsx` test fixture did not mock the newer read-only AI knowledge node options route, so the existing selected-mode disabled-reason assertion could not reach the empty-options state reliably.
- Fix: updated the test fixture to return a redacted empty knowledge-node options response and await the disabled reason.
- Product runtime code changed: no.

## Validation

- `npm.cmd exec -- vitest run tests/unit/knowledge-node-ai-final-regression.test.ts`: pass, 1 file / 3 tests.
- `npm.cmd exec -- vitest run src/features/admin/ai-generation/AdminAiGenerationEntryPage.test.tsx tests/unit/knowledge-node-ai-final-regression.test.ts`: pass, 2 files / 12 tests.
- `npm.cmd exec -- vitest run tests/unit/knowledge-node-ai-final-regression.test.ts src/features/admin/ai-generation/AdminAiGenerationEntryPage.test.tsx tests/unit/student-personal-ai-generation-ui.test.ts tests/unit/admin-ai-generation-entry-surface.test.ts tests/unit/admin-dashboard-layout-navigation.test.ts tests/unit/admin-workspace-role-guard-contract.test.ts tests/unit/admin-content-knowledge-ops-baseline.test.ts tests/unit/ai-generation-knowledge-node-options-route.test.ts tests/unit/knowledge-node-ai-cross-role-regression.test.ts src/server/services/ai-paper-route-source-resolution-service.test.ts src/server/services/ai-paper-route-plan-select-wiring-service.test.ts src/server/services/effective-authorization-service.test.ts src/server/services/personal-ai-generation-request-route.test.ts src/server/services/admin-ai-generation-local-contract-route.test.ts`: pass, 14 files / 215 tests.
- `npm.cmd exec -- vitest run`: pass, 348 files / 1761 tests.
- `npm.cmd run lint`: pass.
- `npm.cmd run typecheck`: pass.
- `git diff --check`: pass.
- `npm.cmd exec -- vitest run tests/unit/knowledge-node-ai-final-regression.test.ts src/features/admin/ai-generation/AdminAiGenerationEntryPage.test.tsx`: final rerun pass, 2 files / 12 tests.
- Module Run v2 pre-commit hardening: pass.
- Module Run v2 pre-push readiness: pass with remote-ahead check skipped before local merge.

## Redaction And Safety

- No credentials, session, cookie, token, env value, DB URL, raw DB rows, internal numeric ids, Provider payload, raw prompt, raw AI output, full question, full paper, or full material content recorded.
- No Provider call, browser runtime, DB connection, schema/migration/seed/fixture mutation, dependency change, staging/prod/deploy, or Cost Calibration executed.
