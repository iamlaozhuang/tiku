# Provider Cost boundary or real Provider paper composition smoke approval package task plan

Task id: `provider-cost-boundary-or-real-provider-paper-composition-smoke-approval-package-2026-06-26`

## SSOT Read List

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/04-agent-system/operating-manual.md`
- `docs/04-agent-system/sop/requirement-ssot-reading-governance.md`
- `docs/04-agent-system/sop/task-lifecycle-governance.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/evidence/2026-06-26-formal-paper-draft-composition-route-integration-local-smoke.md`
- `docs/05-execution-logs/acceptance/2026-06-26-admin-ai-generation-provider-route-integrated-smoke-approval-package.md`
- `docs/05-execution-logs/evidence/2026-06-26-ai-generation-provider-route-integrated-smoke-execution.md`
- `docs/05-execution-logs/evidence/2026-06-26-provider-cost-final-pass-boundary-and-cost-calibration-decision-package.md`

## Objective

Prepare a docs/state-only Provider/Cost approval package for a possible follow-up real Provider smoke that combines
content admin AI paper generation with formal draft composition. Do not execute Provider calls, read credentials, mutate
DB, publish content, touch staging/prod, or claim release/final Pass.

## Decision Plan

1. Record current-state basis: local route composition smoke passed, prior admin Provider route smoke used
   `alibaba-qwen` / `qwen3.7-max`, and formal publish remains blocked.
2. Decide whether this task itself may execute a real Provider paper composition smoke.
3. If not approved, define the exact fresh approval needed.
4. Define proposed provider/model, maximum calls, budget, credential boundary, evidence fields, and failure branches for
   a future execution task.
5. Validate docs/state with scoped Prettier, diff check, and Module Run v2 gates.

## Scope

Allowed:

- Task plan, acceptance package, evidence, audit review.
- `project-state.yaml` and `task-queue.yaml` updates.

Blocked:

- Provider/model call or enablement.
- Provider credential or env secret read.
- Cost Calibration execution.
- DB connection/write/seed/cleanup/migration.
- Source/test/package/lockfile/script/env changes.
- Formal publish/student-visible content.
- Staging/prod/deploy/payment/external service/release readiness/final Pass.

## Validation Commands

- `npx.cmd prettier --write --ignore-unknown <task-4 docs/state files>`
- `npx.cmd prettier --check --ignore-unknown <task-4 docs/state files>`
- `git diff --check`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId provider-cost-boundary-or-real-provider-paper-composition-smoke-approval-package-2026-06-26`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId provider-cost-boundary-or-real-provider-paper-composition-smoke-approval-package-2026-06-26 -SkipRemoteAheadCheck`

## Stop Conditions

- Any attempt to execute Provider, read credentials, read `.env*`, mutate DB, publish, or touch staging/prod.
- Any need for source/test/package/lockfile/schema/migration changes.
- Evidence would require raw prompt, raw output, Provider payload, API key, token, Authorization header, DB URL, raw DB
  row, generated content, or full formal paper/question content.
