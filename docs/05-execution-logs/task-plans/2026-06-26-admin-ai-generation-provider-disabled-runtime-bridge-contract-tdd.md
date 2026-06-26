# admin-ai-generation-provider-disabled-runtime-bridge-contract-tdd-2026-06-26

## Task

Implement the admin AI generation provider-disabled runtime bridge contract with TDD.

## Branch

`codex/admin-ai-provider-disabled-bridge-20260626`

## Task Kind

`implementation_tdd`

## SSOT Read List

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/04-agent-system/operating-manual.md`
- `docs/04-agent-system/sop/requirement-ssot-reading-governance.md`
- `docs/04-agent-system/sop/task-lifecycle-governance.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/01-requirements/00-index.md`
- `docs/01-requirements/advanced-edition/00-index.md`
- `docs/01-requirements/advanced-edition/modules/02-ai-task-domain.md`
- `docs/01-requirements/advanced-edition/modules/08-organization-ai-generation.md`
- `docs/01-requirements/advanced-edition/stories/epic-05-formal-content-separation.md`
- `docs/01-requirements/advanced-edition/stories/epic-07-organization-ai-generation.md`
- `docs/01-requirements/traceability/2026-06-23-advanced-ai-generation-scope-clarification.md`
- `docs/05-execution-logs/acceptance/2026-06-26-admin-ai-generation-runtime-bridge-and-persistence-plan.md`
- `src/server/services/personal-ai-generation-route-integrated-provider-execution-service.ts`
- `src/server/contracts/ai-generation-task-request-contract.ts`
- `src/server/contracts/admin-ai-generation-local-contract.ts`
- `src/server/services/admin-ai-generation-local-contract-route.ts`
- `src/server/services/admin-ai-generation-local-contract-route.test.ts`

## Implementation Plan

1. Add failing focused unit tests first:
   - content admin local contract exposes a redacted Provider-disabled execution summary;
   - organization advanced admin local contract exposes the same summary while preserving organization ownership;
   - injectable admin runtime bridge control can override Provider-disabled diagnostic metadata without enabling Provider,
     env, Cost Calibration, or formal content writes.
2. Verify RED with `npm.cmd run test:unit -- src/server/services/admin-ai-generation-local-contract-route.test.ts`.
3. Add the minimal contract fields and route-service bridge helper:
   - `runtimeBridge.executionSummary`;
   - admin-specific Provider-disabled control option;
   - default outcome based on the existing route-integrated Provider blocked summary shape.
4. Verify GREEN with the focused unit test, then run lint, typecheck, scoped Prettier, diff check, and Module Run v2
   gates.

## Blocked Scope

- Real Provider calls.
- Credential/env reads.
- Provider configuration reads.
- Cost Calibration.
- DB connection, DB write, schema, migration, seed, account mutation.
- Formal `question` or `paper` writes.
- Browser/dev-server/e2e runtime.
- Package/lockfile/env changes.
- Staging/prod, payment, external service, deployment, release readiness, final Pass.

## Validation Commands

1. `npm.cmd run test:unit -- src/server/services/admin-ai-generation-local-contract-route.test.ts`
2. `npm.cmd run lint`
3. `npm.cmd run typecheck`
4. `npx.cmd prettier --write --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-06-26-admin-ai-generation-provider-disabled-runtime-bridge-contract-tdd.md docs/05-execution-logs/evidence/2026-06-26-admin-ai-generation-provider-disabled-runtime-bridge-contract-tdd.md docs/05-execution-logs/audits-reviews/2026-06-26-admin-ai-generation-provider-disabled-runtime-bridge-contract-tdd.md src/server/contracts/admin-ai-generation-local-contract.ts src/server/services/admin-ai-generation-local-contract-route.ts src/server/services/admin-ai-generation-local-contract-route.test.ts`
5. `npx.cmd prettier --check --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-06-26-admin-ai-generation-provider-disabled-runtime-bridge-contract-tdd.md docs/05-execution-logs/evidence/2026-06-26-admin-ai-generation-provider-disabled-runtime-bridge-contract-tdd.md docs/05-execution-logs/audits-reviews/2026-06-26-admin-ai-generation-provider-disabled-runtime-bridge-contract-tdd.md src/server/contracts/admin-ai-generation-local-contract.ts src/server/services/admin-ai-generation-local-contract-route.ts src/server/services/admin-ai-generation-local-contract-route.test.ts`
6. `git diff --check`
7. `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId admin-ai-generation-provider-disabled-runtime-bridge-contract-tdd-2026-06-26`
8. `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId admin-ai-generation-provider-disabled-runtime-bridge-contract-tdd-2026-06-26 -SkipRemoteAheadCheck`
