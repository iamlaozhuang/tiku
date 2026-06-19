# AP-09 Runtime Capability List Inventory Detailing Task Plan

## Task

- Task id: `ap-09-runtime-capability-list-inventory-detailing`
- Branch: `codex/ap-09-runtime-capability-list-inventory-detailing`
- Approval package: AP-09
- Use case: `UC-FUTURE-RUNTIME-CAPABILITY-LIST`
- Objective: detail the runtime capability list inventory boundary without changing product source, API, UI, data model,
  schema, tests, scripts, or runtime behavior.
- Scope: L0 docs/state/governance only.

## Required Reading

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/*.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/04-agent-system/state/local-experience-coverage-matrix.yaml`
- `docs/05-execution-logs/evidence/2026-06-19-blocked-use-case-acceleration-governance-packet.md`
- `docs/05-execution-logs/evidence/2026-06-19-ap-08-org-data-export-boundary-detailing.md`

## Exact Allowed Files

- `docs/04-agent-system/state/local-experience-coverage-matrix.yaml`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/2026-06-19-ap-09-runtime-capability-list-inventory-detailing.md`
- `docs/05-execution-logs/evidence/2026-06-19-ap-09-runtime-capability-list-inventory-detailing.md`
- `docs/05-execution-logs/audits-reviews/2026-06-19-ap-09-runtime-capability-list-inventory-detailing.md`

## Blocked Files

- `.env*`
- `package.json`
- `pnpm-lock.yaml`
- `package-lock.yaml`
- `package-lock.json`
- `src/**`
- `e2e/**`
- `tests/**`
- `src/db/schema/**`
- `drizzle/**`
- `scripts/**`
- `playwright-report/**`
- `test-results/**`

## Approval Boundary

Allowed:

- Create this task plan, evidence, and audit review.
- Update project state, task queue, and coverage matrix anchors.
- Define capability inventory categories, required future exact files/commands, redaction rules, and stop conditions.
- Run docs/state validation gates, local commit, fast-forward merge to `master`, push `origin/master`, and delete the
  merged short branch if gates pass.

Blocked:

- Runtime capability model implementation, API/UI/data model/source/test/e2e/script changes, schema/migration,
  dependency/package/lockfile changes, browser/runtime validation, DB access, provider/payment/export/OCR execution,
  staging/prod/cloud/deploy, Cost Calibration Gate, PR, force push, raw sensitive evidence.

## Execution Steps

1. Confirm clean `master` aligned with `origin/master`.
2. Create the AP-09 short branch.
3. Materialize AP-09 L0 plan, evidence, audit, queue entry, project-state anchor, and matrix anchor.
4. Keep `UC-FUTURE-RUNTIME-CAPABILITY-LIST` at `release_blocked`.
5. Record all implementation or validation work as blocked until exact L1/L2 files and commands are approved.
6. Run scoped formatting and Module Run v2 gates.
7. Commit, fast-forward merge to `master`, run master gates, push `origin/master`, and clean the merged branch.

## Validation Commands

- `git status --short --branch`
- `git rev-list --left-right --count master...origin/master`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Get-TikuProjectStatus.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Get-TikuNextAction.ps1 -VerboseHistory`
- `npx.cmd prettier --write --ignore-unknown docs/04-agent-system/state/local-experience-coverage-matrix.yaml docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-06-19-ap-09-runtime-capability-list-inventory-detailing.md docs/05-execution-logs/evidence/2026-06-19-ap-09-runtime-capability-list-inventory-detailing.md docs/05-execution-logs/audits-reviews/2026-06-19-ap-09-runtime-capability-list-inventory-detailing.md`
- `npx.cmd prettier --check --ignore-unknown docs/04-agent-system/state/local-experience-coverage-matrix.yaml docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-06-19-ap-09-runtime-capability-list-inventory-detailing.md docs/05-execution-logs/evidence/2026-06-19-ap-09-runtime-capability-list-inventory-detailing.md docs/05-execution-logs/audits-reviews/2026-06-19-ap-09-runtime-capability-list-inventory-detailing.md`
- `git diff --check`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId ap-09-runtime-capability-list-inventory-detailing`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId ap-09-runtime-capability-list-inventory-detailing`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId ap-09-runtime-capability-list-inventory-detailing`

## Stop Conditions

- Any request to edit runtime source, tests, e2e, scripts, schema, migrations, package files, lockfiles, or capability
  data model files not named in this L0 task.
- Any need to run browser/runtime validation, provider/payment/OCR/export execution, DB read/write, staging/prod/deploy,
  Cost Calibration Gate, PR, force push, or sensitive evidence collection.
- Any validation failure that cannot be fixed within the exact L0 allowed files.
