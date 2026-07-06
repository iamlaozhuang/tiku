# 2026-07-06 AI paper admin route repository wiring evidence

## Scope

- Task: `ai-paper-admin-route-repository-wiring-2026-07-06`
- Branch: `codex/ai-paper-admin-route-repository-wiring-2026-07-06`
- Boundary: local source + focused unit only.
- Not executed: DB runtime, Provider, browser, dev server, staging/prod/deploy, Cost Calibration.
- Dependency/package/lockfile/schema/migration/seed change: none.

## Read gate

Read before source change:

- `AGENTS.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/*.md`
- `docs/01-requirements/00-index.md`
- `docs/01-requirements/advanced-edition/00-index.md`
- `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`
- `docs/01-requirements/traceability/2026-07-02-ai-generation-requirements-ssot-alignment.md`
- `docs/01-requirements/traceability/2026-07-02-phase4-requirements-agent-baseline-alignment.md`
- `docs/01-requirements/traceability/2026-07-05-ai-generation-closed-loop-target-alignment.md`
- `docs/01-requirements/traceability/2026-07-06-ai-generation-recontract-requirements-materialization.md`
- TDD skill: `superpowers:test-driven-development`

## TDD evidence

- RED command: `npm.cmd run test:unit -- src/server/services/admin-ai-generation-local-contract-route.test.ts`
- RED status: failed as expected.
- RED failure category: default admin paper route did not call injected question/training repositories when no explicit paper assembly resolver was supplied.
- GREEN command: `npm.cmd run test:unit -- src/server/services/admin-ai-generation-local-contract-route.test.ts`
- GREEN status: passed.
- Focused behavior covered:
  - organization advanced admin AI组卷 default route resolver calls the injected platform question repository.
  - organization advanced admin AI组卷 default route resolver calls the injected organization training repository.
  - route response exposes a redacted `paperAssembly` with assembled status, role label, source category counts, selected count, and insufficiency state.
  - explicit resolver override from the prior package remains available.

## Validation commands

- `npm.cmd run test:unit -- src/server/services/admin-ai-generation-local-contract-route.test.ts`
  - Result: pass, 1 file / 31 tests.
- `npm.cmd run test:unit -- src/server/services/admin-ai-generation-local-contract-route.test.ts src/server/services/ai-paper-route-plan-select-wiring-service.test.ts src/server/services/ai-paper-route-source-resolution-service.test.ts src/server/services/ai-paper-route-assembly-service.test.ts src/server/services/ai-paper-plan-and-select-service.test.ts src/server/services/ai-paper-source-adapter-service.test.ts`
  - Result: pass, 6 files / 52 tests.
- `git diff --check`
  - Result: pass.
- `npm.cmd run typecheck`
  - Result: pass.
- `npm.cmd run lint`
  - Result: pass.
- `npm.cmd exec -- prettier --check --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-07-06-ai-paper-admin-route-repository-wiring.md docs/05-execution-logs/evidence/2026-07-06-ai-paper-admin-route-repository-wiring.md docs/05-execution-logs/audits-reviews/2026-07-06-ai-paper-admin-route-repository-wiring.md src/server/services/admin-ai-generation-local-contract-route.ts src/server/services/admin-ai-generation-local-contract-route.test.ts`
  - Result: pass after scoped write.
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId ai-paper-admin-route-repository-wiring-2026-07-06`
  - Result: pass.

## Result

Source/unit status: pass.

This evidence does not claim DB-backed runtime execution, browser, Provider-enabled runtime, release readiness, production usability, staging, or Cost Calibration.
