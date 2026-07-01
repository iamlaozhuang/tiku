# Task Plan: ai-generation-core-walkthrough-2026-07-01

## Task

- Task id: `ai-generation-core-walkthrough-2026-07-01`
- Branch: `codex/ai-generation-core-walkthrough`
- Task kind: docs/state verification package
- Goal: create a repeatable AI 出题 / AI 组卷 core-capability walkthrough contract, execution plan, and redacted evidence baseline before any repair work.

## Required Reading

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/adr-001-tech-stack-selection.md`
- `docs/02-architecture/adr/adr-002-runtime-architecture-and-multi-client-contract.md`
- `docs/02-architecture/adr/adr-003-workplace-desktop-web-compatibility.md`
- `docs/02-architecture/adr/adr-004-environment-isolation-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-005-staging-architecture-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-006-runtime-dependency-alignment.md`
- `docs/02-architecture/adr/adr-007-edition-aware-authorization-source-of-truth.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`

## Scope

Allowed files:

- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/01-requirements/traceability/2026-07-01-ai-generation-core-walkthrough-contract.md`
- `docs/05-execution-logs/task-plans/2026-07-01-ai-generation-core-walkthrough.md`
- `docs/05-execution-logs/evidence/2026-07-01-ai-generation-core-walkthrough.md`
- `docs/05-execution-logs/audits-reviews/2026-07-01-ai-generation-core-walkthrough.md`

Read-only context:

- AI generation route, service, contract, repository, and UI files under `src/`
- existing focused tests under `tests/unit/`
- package scripts in `package.json`

Blocked:

- `.env*`
- package and lock files
- `src/**` source edits
- `tests/**` edits
- `src/db/schema/**`
- `drizzle/**`
- `migrations/**`
- `seed/**`
- `e2e/**`
- screenshots, traces, raw DOM, HTML dumps
- direct database reads/writes, schema, migration, seed, destructive reset
- Provider call/configuration/credential read
- staging/prod/cloud/deploy
- Cost Calibration, release readiness, final Pass, PR, force push

## Implementation Steps

1. Create branch `codex/ai-generation-core-walkthrough`.
2. Read required standards and ADRs.
3. Confirm current AI generation implementation shape through static source inspection.
4. Add the core walkthrough contract.
5. Add redacted evidence documenting current known OP-01 through OP-09 mapping and static preflight.
6. Add audit review with scope, risks, and blocked follow-up classification.
7. Materialize task in `project-state.yaml` and `task-queue.yaml`.
8. Run scoped formatting, focused unit/static checks, lint, typecheck, diff check, and Module Run v2 gates.
9. Commit, fast-forward merge to `master`, push `origin/master`, and delete the merged short branch only after validation passes.

## Walkthrough Execution Model

The contract defines five future execution phases:

1. Read-only preflight and source contract check.
2. Empty-baseline manual experience check.
3. Data-backed manual experience check after resource import or existing approved resources.
4. Real Provider small sample only after fresh approval.
5. Redacted issue triage and priority grouping.

This package creates the contract and baseline only; it does not run browser/e2e/Provider/DB walkthrough steps.

## Known Issue Mapping

| Issue                                          | Priority | Follow-up class                                           |
| ---------------------------------------------- | -------- | --------------------------------------------------------- |
| `OP-03` active authorization shown expired     | P0       | repair first before complete learner/employee walkthrough |
| `OP-04` advanced organization admin downgraded | P0       | repair before organization-admin AI walkthrough           |
| `OP-01` learner AI task/function mismatch      | P1       | AI request/Provider contract repair                       |
| `OP-05` legacy level enum                      | P1       | shared parameter contract repair                          |
| `OP-06` quantity/structure mismatch            | P1       | generated-result structure repair                         |
| `OP-02`, `OP-07`, `OP-08`, `OP-09`             | P2       | UX/history/context robustness repair                      |

## Validation Commands

```powershell
npm.cmd exec -- prettier --write --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/01-requirements/traceability/2026-07-01-ai-generation-core-walkthrough-contract.md docs/05-execution-logs/task-plans/2026-07-01-ai-generation-core-walkthrough.md docs/05-execution-logs/evidence/2026-07-01-ai-generation-core-walkthrough.md docs/05-execution-logs/audits-reviews/2026-07-01-ai-generation-core-walkthrough.md
npm.cmd exec -- prettier --check --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/01-requirements/traceability/2026-07-01-ai-generation-core-walkthrough-contract.md docs/05-execution-logs/task-plans/2026-07-01-ai-generation-core-walkthrough.md docs/05-execution-logs/evidence/2026-07-01-ai-generation-core-walkthrough.md docs/05-execution-logs/audits-reviews/2026-07-01-ai-generation-core-walkthrough.md
npm.cmd run test:unit -- tests/unit/admin-ai-generation-entry-surface.test.ts tests/unit/student-personal-ai-generation-ui.test.ts
npm.cmd run lint
npm.cmd run typecheck
git diff --check
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId ai-generation-core-walkthrough-2026-07-01
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId ai-generation-core-walkthrough-2026-07-01 -SkipRemoteAheadCheck
```

## Risk Defense

- Do not fix OP issues in this task.
- Do not run browser/e2e/Provider/DB steps.
- Do not record sensitive evidence.
- Treat OP-03 and OP-04 as preflight blockers, not as skipped rows.
- Do not claim release readiness, production readiness, final Pass, or complete AI quality.
