# AP-08 Organization Data Export Boundary Detailing Task Plan

## Task

- Task id: `ap-08-org-data-export-boundary-detailing`
- Branch: `codex/ap-08-org-data-export-boundary-detailing`
- Approval package: AP-08
- Use case: `UC-FUTURE-ORG-DATA-EXPORT`
- Objective: detail the organization data export approval boundary without executing export, file generation, privacy
  data access, external-service, deployment, database, source, or test work.
- Scope: L0 docs/state/governance only.

## Required Reading

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/*.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/04-agent-system/state/local-experience-coverage-matrix.yaml`
- `docs/05-execution-logs/evidence/2026-06-19-blocked-use-case-acceleration-governance-packet.md`
- `docs/05-execution-logs/evidence/2026-06-19-ap-07-ocr-auto-import-provider-boundary-detailing.md`

## Exact Allowed Files

- `docs/04-agent-system/state/local-experience-coverage-matrix.yaml`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/2026-06-19-ap-08-org-data-export-boundary-detailing.md`
- `docs/05-execution-logs/evidence/2026-06-19-ap-08-org-data-export-boundary-detailing.md`
- `docs/05-execution-logs/audits-reviews/2026-06-19-ap-08-org-data-export-boundary-detailing.md`

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
- Define future export approval requirements: export format, field allowlist, permission model, file generation/download,
  privacy review, audit trail, retention, rollback, and redaction rules.
- Run docs/state validation gates, local commit, fast-forward merge to `master`, push `origin/master`, and delete the
  merged short branch if gates pass.

Blocked:

- Export/file generation execution, download URL creation, object storage writes, external-service calls, privacy data
  extraction, DB reads/writes.
- `.env*` read/write, secrets, full database URL output.
- Product source, tests, e2e specs, scripts, schema/migrations, package/lockfiles, dependencies.
- Staging/prod/cloud/deploy, Cost Calibration Gate, PR, force push, raw sensitive evidence.

## Execution Steps

1. Confirm clean `master` aligned with `origin/master`.
2. Create the AP-08 short branch.
3. Materialize AP-08 L0 plan, evidence, audit, queue entry, project-state anchor, and matrix anchor.
4. Keep `UC-FUTURE-ORG-DATA-EXPORT` at `release_blocked`.
5. Record export/file generation/privacy/deploy execution as L3 fresh approval only.
6. Run scoped formatting and Module Run v2 gates.
7. Commit, fast-forward merge to `master`, run master gates, push `origin/master`, and clean the merged branch.

## Validation Commands

- `git status --short --branch`
- `git rev-list --left-right --count master...origin/master`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Get-TikuProjectStatus.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Get-TikuNextAction.ps1 -VerboseHistory`
- `npx.cmd prettier --write --ignore-unknown docs/04-agent-system/state/local-experience-coverage-matrix.yaml docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-06-19-ap-08-org-data-export-boundary-detailing.md docs/05-execution-logs/evidence/2026-06-19-ap-08-org-data-export-boundary-detailing.md docs/05-execution-logs/audits-reviews/2026-06-19-ap-08-org-data-export-boundary-detailing.md`
- `npx.cmd prettier --check --ignore-unknown docs/04-agent-system/state/local-experience-coverage-matrix.yaml docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-06-19-ap-08-org-data-export-boundary-detailing.md docs/05-execution-logs/evidence/2026-06-19-ap-08-org-data-export-boundary-detailing.md docs/05-execution-logs/audits-reviews/2026-06-19-ap-08-org-data-export-boundary-detailing.md`
- `git diff --check`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId ap-08-org-data-export-boundary-detailing`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId ap-08-org-data-export-boundary-detailing`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId ap-08-org-data-export-boundary-detailing`

## Stop Conditions

- Any need to read `.env*`, secrets, database URLs, raw DB rows, export payloads, generated files, download URLs, private
  identifiers, student answers, employee answers, or organization-private content.
- Any request to execute export/file generation, create downloadable files, write storage, call external services, read
  or write DB data, change source/tests/e2e/scripts/schema/migrations/package files/lockfiles, deploy, open Cost
  Calibration Gate, create PR, force push, or perform destructive DB work.
- Any validation failure that cannot be fixed within the exact L0 allowed files.
