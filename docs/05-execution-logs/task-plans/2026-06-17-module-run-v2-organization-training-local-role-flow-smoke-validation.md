# Module Run v2 Organization Training Local Role-Flow Smoke Validation

## Task

- Task id: `module-run-v2-organization-training-local-role-flow-smoke-validation`
- Branch: `codex/organization-training-local-role-flow-smoke-validation`
- Date: 2026-06-17
- Execution profile: `local_full_flow`
- Evidence mode: `full`
- Validation policy: `local_full_flow`
- Target experience chain: `organization-training-experience`
- Target local full-loop gate: `L6` smoke validation only; no full L6 closure is claimed here.
- Approval: current 2026-06-17 user prompt approves executing the recommended next task under mechanism rules, including task-scoped `localFullFlowGate: approved_localhost_only`.

## Read Baseline

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/*.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/04-agent-system/state/execution-profiles.yaml`
- `docs/04-agent-system/state/mechanism-source-of-truth-index.yaml`
- Prior organization-training role-flow planning evidence and the existing local route-guard/organization-training validation surfaces.

## Scope

Allowed files:

- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/2026-06-17-module-run-v2-organization-training-local-role-flow-smoke-validation.md`
- `docs/05-execution-logs/evidence/2026-06-17-module-run-v2-organization-training-local-role-flow-smoke-validation.md`
- `docs/05-execution-logs/audits-reviews/2026-06-17-module-run-v2-organization-training-local-role-flow-smoke-validation.md`

Read-only validation surfaces:

- `e2e/local-auth-route-guard.spec.ts`
- `src/server/services/organization-training-service.test.ts`
- `src/server/services/organization-training-route.test.ts`
- `src/server/services/organization-analytics-route.test.ts`

Blocked:

- `.env*`
- secret/token/cookie/Authorization header/DB URL/provider payload/raw prompt/raw answer/publicId list/row data/private data
- product source edits, test/e2e edits, script edits, full e2e suite, headed/debug browser mode
- schema/drizzle/migration, dependency/package/lockfile
- provider/model calls, staging/prod/cloud/deploy/payment/external-service
- PR, force-push, and Cost Calibration Gate

## Implementation Plan

1. Materialize the approved smoke validation task in queue/state with a task-scoped localhost-only full-flow gate.
2. Run mechanism diagnostics and the local capability gate before local full-flow validation.
3. Run targeted Playwright smoke only against `e2e/local-auth-route-guard.spec.ts`, using localhost/127.0.0.1 through the existing Playwright web server configuration.
4. Run focused organization-training unit validation for the service/route/analytics contract surfaces.
5. Record redacted evidence with command outcomes and counts only; do not copy DOM, screenshots, traces, cookies, tokens, raw payloads, row data, public identifier inventories, or private data.
6. Close the task, run closeout gates, commit, fast-forward merge to `master`, push `origin/master`, and clean the short branch.

## Validation Commands

- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Get-TikuProjectStatus.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Get-TikuNextAction.ps1 -VerboseHistory`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2LocalCapabilityGate.ps1 -TaskId module-run-v2-organization-training-local-role-flow-smoke-validation -Capability localFullFlowGate -Intent use_capability`
- `npm.cmd run test:e2e -- --list`
- `npm.cmd run test:e2e -- e2e/local-auth-route-guard.spec.ts`
- `npm.cmd run test:unit -- src/server/services/organization-training-service.test.ts src/server/services/organization-training-route.test.ts src/server/services/organization-analytics-route.test.ts`
- `npx.cmd prettier --check --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-06-17-module-run-v2-organization-training-local-role-flow-smoke-validation.md docs/05-execution-logs/evidence/2026-06-17-module-run-v2-organization-training-local-role-flow-smoke-validation.md docs/05-execution-logs/audits-reviews/2026-06-17-module-run-v2-organization-training-local-role-flow-smoke-validation.md`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `git diff --check`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId module-run-v2-organization-training-local-role-flow-smoke-validation`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId module-run-v2-organization-training-local-role-flow-smoke-validation`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId module-run-v2-organization-training-local-role-flow-smoke-validation`

## Risk Controls

- This task uses localhost/127.0.0.1 only and the existing non-headed Playwright path.
- Evidence records command outcomes, counts, task ids, chain names, and file paths only.
- No raw fixture values, public identifier inventories, row/private data, full paper content, DOM snapshots, screenshots, traces, cookies, tokens, or raw employee answer text are copied into evidence.
- This task does not claim complete organization-training L6 closure.
- Cost Calibration Gate remains blocked.
