# 2026-07-06 AI组卷 Route Plan Select Wiring

## Task

- Task id: `ai-paper-route-plan-select-wiring-2026-07-06`
- Branch: `codex/ai-paper-route-plan-select-wiring-2026-07-06`
- Goal packet: AI组卷第 6 包，串接 route-visible 组卷方案、角色题源解析、本地正式题库选题。

## Read Gate

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

## Scope

Implement a pure service-level wiring contract that:

- accepts route-integrated AI组卷 visible plan output;
- resolves allowed formal question sources by role and context through injected repositories;
- invokes local plan-and-select assembly;
- returns redacted status, source diagnostics, and assembled/insufficient/rejected result;
- preserves AI出题 behavior and does not persist, connect to DB runtime, call Provider, start browser, or change UI.

## Out Of Scope

- No Provider execution.
- No DB runtime connection or mutation.
- No schema, migration, seed, dependency, package, or lockfile change.
- No browser/dev server/e2e/runtime acceptance.
- No content/admin or learner UI implementation.
- No staging/prod/deploy/Cost Calibration/release readiness claim.

## TDD Plan

1. Add failing unit tests for a missing `resolveAndAssembleAiPaperFromRoute` service import.
2. Cover content-admin platform-only assembly.
3. Cover organization admin assembly using same-organization enterprise snapshots when the plan prefers enterprise sources.
4. Cover missing organization/employee context rejected before repository access.
5. Cover route visible content with generated question bodies rejected as unsafe paper plan.
6. Cover serialized result redaction against sensitive fixture markers.

## Validation Plan

- `npm.cmd run test:unit -- src/server/services/ai-paper-route-plan-select-wiring-service.test.ts`
- `npm.cmd run test:unit -- src/server/services/ai-paper-route-plan-select-wiring-service.test.ts src/server/services/ai-paper-route-source-resolution-service.test.ts src/server/services/ai-paper-route-assembly-service.test.ts src/server/services/ai-paper-plan-and-select-service.test.ts src/server/services/ai-paper-source-adapter-service.test.ts`
- `git diff --check`
- `npm.cmd run typecheck`
- `npm.cmd run lint`
- `npm.cmd exec -- prettier --check --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-07-06-ai-paper-route-plan-select-wiring.md docs/05-execution-logs/evidence/2026-07-06-ai-paper-route-plan-select-wiring.md docs/05-execution-logs/audits-reviews/2026-07-06-ai-paper-route-plan-select-wiring.md src/server/services/ai-paper-route-plan-select-wiring-service.ts src/server/services/ai-paper-route-plan-select-wiring-service.test.ts`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId ai-paper-route-plan-select-wiring-2026-07-06`

## Risk Controls

- Evidence records only file paths, command statuses, test names, role labels, source categories, counts, and safe failure categories.
- No raw Provider payload, prompt, raw AI output, full question/paper/material/resource/chunk content, credentials, sessions, tokens, env values, DB rows, internal IDs, or private fixture values.
- Existing route persistence and AI出题 flow are left untouched in this package.
