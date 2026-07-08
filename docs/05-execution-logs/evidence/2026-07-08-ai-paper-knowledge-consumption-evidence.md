# 2026-07-08 AI Paper Knowledge Consumption Evidence

## Requirement Mapping Result

- Requirement source: `docs/01-requirements/traceability/2026-07-02-ai-generation-requirements-ssot-alignment.md`.
- Scope: content admin, organization advanced admin, personal advanced student, and organization advanced employee AI组卷 must preserve shared route/service contracts while consuming structured `knowledgeNodePublicIds`.
- Verified boundary: this task changes only local source-resolution behavior and targeted tests; it does not execute Provider, read/write DB, change authorization/edition semantics, alter schema/migration/seed/fixture, or touch package/lockfile.

## Red Test

- Command: `npm.cmd exec -- vitest run src/server/services/ai-paper-route-source-resolution-service.test.ts src/server/services/ai-paper-route-plan-select-wiring-service.test.ts`
- Result: failed as expected.
- Failure classes:
  - selected knowledge scope allowed unrelated platform questions into source resolution.
  - selected AI组卷 could be filled by unrelated same-scope questions through degradation.
  - non-descendant selected scope did not query selected knowledge nodes individually.

## Implementation Evidence

- Changed `src/server/services/ai-paper-route-source-resolution-service.ts`.
- Added selected-scope platform source queries for `includeDescendants=false`.
- Added selected exact/descendant filtering with parent-map traversal when available.
- Added source-row public id de-duplication across multi-node queries.
- Kept balanced/comprehensive/weak-point modes on the existing unbounded platform query path.

## Validation

- `npm.cmd exec -- vitest run src/server/services/ai-paper-route-source-resolution-service.test.ts src/server/services/ai-paper-route-plan-select-wiring-service.test.ts tests/unit/knowledge-node-ai-cross-role-regression.test.ts`: pass, 3 files / 15 tests.
- `npm.cmd exec -- vitest run src/server/services/admin-ai-generation-local-contract-route.test.ts src/server/services/admin-ai-generation-runtime-bridge-service.test.ts src/server/services/admin-ai-generation-formal-draft-adapter.test.ts`: pass, 3 files / 48 tests.
- `npm.cmd exec -- vitest run src/server/services/personal-ai-generation-request-route.test.ts src/server/services/personal-ai-generation-runtime-bridge-service.test.ts src/server/services/personal-ai-generation-learning-session-paper-source-resolver.test.ts`: pass, 3 files / 43 tests.
- `npm.cmd run lint`: pass.
- `npm.cmd run typecheck`: pass.
- `git diff --check`: pass.
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId ai-paper-knowledge-consumption-2026-07-08`: pass.
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId ai-paper-knowledge-consumption-2026-07-08 -SkipRemoteAheadCheck`: pass after repository checkpoint alignment to current `origin/master`.

## Redaction And Safety

- No credentials, session, cookie, token, env value, DB URL, raw DB rows, internal numeric ids, Provider payload, raw prompt, raw AI output, full question, full paper, or full material content recorded.
- No Provider call, browser runtime, DB connection, schema/migration/seed/fixture mutation, dependency change, staging/prod/deploy, or Cost Calibration executed.
