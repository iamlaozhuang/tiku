# AP-08 Organization Data Export Execution Fresh Approval Required Task Plan

## Task

- Task id: `ap-08-org-data-export-execution-fresh-approval-required`
- Branch: `codex/ap-08-org-data-export-execution-fresh-approval-required`
- Approval package: AP-08-ORG-DATA-EXPORT-FRESH-APPROVAL
- Use case: `UC-FUTURE-ORG-DATA-EXPORT`
- Objective: materialize minimal AP-08 organization data export/file-generation execution fresh approval text and stop
  before any L3 execution.
- Scope: L0 docs/state/governance only.

## Required Reading

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/*.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/04-agent-system/state/local-experience-coverage-matrix.yaml`
- `docs/05-execution-logs/evidence/2026-06-19-ap-08-org-data-export-boundary-detailing.md`

## Exact Allowed Files

- `docs/04-agent-system/state/local-experience-coverage-matrix.yaml`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/2026-06-19-ap-08-org-data-export-execution-fresh-approval-required.md`
- `docs/05-execution-logs/evidence/2026-06-19-ap-08-org-data-export-execution-fresh-approval-required.md`
- `docs/05-execution-logs/audits-reviews/2026-06-19-ap-08-org-data-export-execution-fresh-approval-required.md`

## Blocked Files

- `.env*`
- `package.json`
- `package-lock.yaml`
- `package-lock.json`
- `pnpm-lock.yaml`
- `src/**`
- `tests/**`
- `e2e/**`
- `src/db/schema/**`
- `drizzle/**`
- `scripts/**`
- deploy/cloud/payment/provider config files
- any file not explicitly listed in allowed files

## Approval Boundary

Allowed:

- Create this task plan, evidence, and audit review.
- Update `project-state.yaml`, `task-queue.yaml`, and `local-experience-coverage-matrix.yaml`.
- Output the minimal fresh approval text needed before any AP-08 organization data export/file-generation execution.
- Run docs/state validation gates, local commit, fast-forward merge to `master`, push `origin/master`, and delete the
  merged short branch if gates pass.

Blocked:

- Export execution, file generation, privacy data access, DB read/write, object storage writes, external-service
  execution, `.env*`, schema/migration, dependency/package/lockfile changes, staging/prod/cloud/deploy, Cost Calibration
  Gate, source/test/e2e/script changes, PR, force push, destructive DB, generated files, export payloads, download URLs,
  raw database rows, organization-private content, and sensitive evidence.

## Minimal Fresh Approval Text

```text
Fresh approve AP-08 organization data export/file-generation execution decision only.

Decision:
- Keep organization data export/file-generation execution blocked; or
- Authorize a separate exact-scope AP-08 organization data export execution package.

No export/file generation, privacy data access, DB read/write, object storage write, external-service execution,
.env* access, schema/migration, dependency/package/lockfile change, staging/prod/cloud/deploy, Cost Calibration Gate,
source/test/e2e/script repair, PR, force push, destructive DB, or sensitive evidence collection is approved unless the
follow-up approval explicitly names:
- exact allowedFiles;
- exact blockedFiles;
- exact commands and whether each is docs-only, local-only, read-only, file-generating, storage-writing, or mutating;
- export boundary: organization tier, actor role, dataset, row ceiling, field allowlist, excluded fields;
- file boundary: format, filename/path policy, retention, download URL lifetime, storage target, deletion owner;
- privacy/audit boundary: approval owner, audit log shape, redaction rules, abort conditions;
- rollback owner, acceptance owner, rollback decision point;
- stop conditions.
```

## Validation Commands

- `npx.cmd prettier --write --ignore-unknown docs/04-agent-system/state/local-experience-coverage-matrix.yaml docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-06-19-ap-08-org-data-export-execution-fresh-approval-required.md docs/05-execution-logs/evidence/2026-06-19-ap-08-org-data-export-execution-fresh-approval-required.md docs/05-execution-logs/audits-reviews/2026-06-19-ap-08-org-data-export-execution-fresh-approval-required.md`
- `npx.cmd prettier --check --ignore-unknown docs/04-agent-system/state/local-experience-coverage-matrix.yaml docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-06-19-ap-08-org-data-export-execution-fresh-approval-required.md docs/05-execution-logs/evidence/2026-06-19-ap-08-org-data-export-execution-fresh-approval-required.md docs/05-execution-logs/audits-reviews/2026-06-19-ap-08-org-data-export-execution-fresh-approval-required.md`
- `git diff --check`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId ap-08-org-data-export-execution-fresh-approval-required`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId ap-08-org-data-export-execution-fresh-approval-required`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId ap-08-org-data-export-execution-fresh-approval-required`

## Stop Conditions

- Any request to execute export/file generation, privacy data access, DB read/write, storage write, external-service
  execution, `.env*`, schema/migration, dependency/package/lockfile, staging/prod/cloud/deploy, Cost Calibration Gate,
  source/test/e2e/script repair, PR, force push, destructive DB, or sensitive evidence.
- Any validation failure that cannot be fixed within the exact L0 allowed files.
