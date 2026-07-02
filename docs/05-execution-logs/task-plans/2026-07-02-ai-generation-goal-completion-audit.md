# AI Generation Goal Completion Audit Plan

- Task id: `ai-generation-goal-completion-audit-2026-07-02`
- Branch: `codex/ai-generation-goal-completion-audit`
- Mode: docs/state-only completion audit.
- Result target: prove the current AI出题 / AI组卷 repair goal is complete only if every child acceptance standard has
  evidence.

## SSOT Read List

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/01-requirements/00-index.md`
- `docs/01-requirements/use-cases/use-case-catalog.md`
- `docs/01-requirements/modules/06-admin-ops.md`
- `docs/01-requirements/advanced-edition/00-index.md`
- `docs/01-requirements/advanced-edition/modules/03-personal-ai-generation.md`
- `docs/01-requirements/advanced-edition/modules/08-organization-ai-generation.md`
- `docs/01-requirements/traceability/2026-06-23-advanced-ai-generation-scope-clarification.md`
- `docs/01-requirements/traceability/2026-06-21-content-admin-ai-generation-scope-decision.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/2026-07-02-ai-generation-shared-structured-contract-goal-plan.md`
- `docs/05-execution-logs/evidence/2026-07-02-ai-generation-deterministic-acceptance-matrix-rollup.md`
- `docs/05-execution-logs/audits-reviews/2026-07-02-ai-generation-deterministic-acceptance-matrix-rollup.md`
- `docs/05-execution-logs/evidence/2026-07-02-ai-generation-bounded-provider-rerun-after-structured-contract.md`
- `docs/05-execution-logs/evidence/2026-07-02-ai-generation-bounded-provider-rerun-after-question-structure-repair.md`
- `docs/05-execution-logs/evidence/2026-07-02-ai-generation-monopoly-question-structured-acceptance-diagnosis.md`
- `docs/05-execution-logs/evidence/2026-07-02-ai-generation-bounded-monopoly-question-provider-rerun-after-plaintext-acceptance-repair.md`
- `docs/05-execution-logs/evidence/2026-07-02-marketing-monopoly-logistics-provider-rerun.md`

## Boundaries

- No source, test, package, dependency, script, DB, schema, migration, seed, Provider, browser, e2e, staging, prod,
  cloud, deploy, release readiness, final Pass, Cost Calibration, PR, or force-push work.
- Evidence is limited to task ids, commit prefixes, validation commands, status categories, counts, duration buckets,
  and redacted summaries.
- Do not record credentials, cookies, sessions, Authorization header values, localStorage values, `.env*` values, DB
  raw rows, internal ids, PII, Provider payloads, prompts, raw AI output, full generated questions, full papers, full
  materials, or full chunks.

## Acceptance Standards

- Shared task spec: AI出题 and AI组卷 count semantics are defined once and use requested `questionCount`.
- Structured parser: AI出题 accepts supported roots only when count matches; AI组卷 reports non-null total
  `questionCount` for supported JSON forms.
- Shared instructions: admin and personal Provider paths use the same output contract definitions.
- Route contracts: content admin, organization admin, and student deterministic mocked-provider tests cover AI出题 and
  AI组卷 success and safe failure.
- UI surfaces: content admin, organization admin, and student pages cover success, failure, insufficient evidence,
  history, and no sensitive text display.
- Provider validation: bounded content-admin Provider evidence proves successful AI组卷 count recognition and successful
  AI出题 question count recognition for marketing, logistics, and monopoly.
- Regression protection: focused tests, lint, typecheck, Prettier, diff check, and Module Run v2 gates must pass.

## Audit Plan

1. Map every goal criterion from the shared structured contract plan to a closed child task and evidence file.
2. Confirm the old AI组卷 total-count residual was superseded by later parser and bounded Provider evidence.
3. Confirm the remaining monopoly AI出题 residual was closed by OCR/runtime RAG coverage plus plaintext structured
   acceptance repair and one bounded Provider rerun.
4. Run the combined focused deterministic regression suite, lint, typecheck, Prettier, diff check, and Module Run v2
   gates.
5. Record completion evidence only if every criterion has a passing evidence anchor.

## Validation Commands

```powershell
npm.cmd run test:unit -- src/server/services/route-integrated-provider-execution-service.test.ts src/server/services/route-integrated-provider-instruction-service.test.ts src/server/services/admin-ai-generation-runtime-bridge-service.test.ts src/server/services/admin-ai-generation-local-contract-route.test.ts src/server/services/personal-ai-generation-route-integrated-provider-execution-service.test.ts src/server/services/personal-ai-generation-runtime-bridge-service.test.ts src/server/services/personal-ai-generation-request-route.test.ts src/features/admin/ai-generation/AdminAiGenerationEntryPage.test.tsx src/features/student/ai-generation/StudentPersonalAiGenerationPage.test.tsx tests/unit/admin-ai-generation-entry-surface.test.ts tests/unit/student-personal-ai-generation-ui.test.ts
npm.cmd run lint
npm.cmd run typecheck
npm.cmd exec -- prettier --write --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-07-02-ai-generation-goal-completion-audit.md docs/05-execution-logs/evidence/2026-07-02-ai-generation-goal-completion-audit.md docs/05-execution-logs/audits-reviews/2026-07-02-ai-generation-goal-completion-audit.md
npm.cmd exec -- prettier --check --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-07-02-ai-generation-goal-completion-audit.md docs/05-execution-logs/evidence/2026-07-02-ai-generation-goal-completion-audit.md docs/05-execution-logs/audits-reviews/2026-07-02-ai-generation-goal-completion-audit.md
git diff --check
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId ai-generation-goal-completion-audit-2026-07-02
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId ai-generation-goal-completion-audit-2026-07-02
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId ai-generation-goal-completion-audit-2026-07-02 -SkipRemoteAheadCheck
```
