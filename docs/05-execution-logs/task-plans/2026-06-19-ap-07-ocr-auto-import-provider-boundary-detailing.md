# AP-07 OCR Auto Import Provider Boundary Detailing Task Plan

## Task

- Task id: `ap-07-ocr-auto-import-provider-boundary-detailing`
- Branch: `codex/ap-07-ocr-auto-import-provider-boundary-detailing`
- Approval package: AP-07
- Use case: `UC-FUTURE-OCR-AUTO-IMPORT`
- Objective: detail the OCR auto-import approval boundary without executing OCR, parser, provider, storage, schema,
  dependency, database, or source work.
- Scope: L0 docs/state/governance only.

## Required Reading

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/*.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/04-agent-system/state/local-experience-coverage-matrix.yaml`
- `docs/05-execution-logs/evidence/2026-06-19-blocked-use-case-acceleration-governance-packet.md`
- `docs/05-execution-logs/evidence/2026-06-19-ap-06-online-payment-provider-boundary-detailing.md`

## Exact Allowed Files

- `docs/04-agent-system/state/local-experience-coverage-matrix.yaml`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/2026-06-19-ap-07-ocr-auto-import-provider-boundary-detailing.md`
- `docs/05-execution-logs/evidence/2026-06-19-ap-07-ocr-auto-import-provider-boundary-detailing.md`
- `docs/05-execution-logs/audits-reviews/2026-06-19-ap-07-ocr-auto-import-provider-boundary-detailing.md`

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
- Define future OCR approval requirements: input file class, parser/provider boundary, storage path, schema/dependency
  approval, import rollback, sampling, redaction, and stop conditions.
- Run docs/state validation gates, local commit, fast-forward merge to `master`, push `origin/master`, and delete the
  merged short branch if gates pass.

Blocked:

- OCR/provider/parser execution, file upload/download, object storage writes, import generation, generated question or
  material persistence.
- `.env*` read/write, provider credentials, storage credentials, full database URL output.
- Dependency/package/lockfile changes, schema/migration, DB reads/writes.
- Product source, tests, e2e specs, scripts, staging/prod/cloud/deploy, Cost Calibration Gate, PR, force push, raw
  sensitive evidence.

## Execution Steps

1. Confirm clean `master` aligned with `origin/master`.
2. Create the AP-07 short branch.
3. Materialize AP-07 L0 plan, evidence, audit, queue entry, project-state anchor, and matrix anchor.
4. Keep `UC-FUTURE-OCR-AUTO-IMPORT` at `release_blocked`.
5. Record OCR/provider/parser/storage/schema/dependency execution as L3 fresh approval only.
6. Run scoped formatting and Module Run v2 gates.
7. Commit, fast-forward merge to `master`, run master gates, push `origin/master`, and clean the merged branch.

## Validation Commands

- `git status --short --branch`
- `git rev-list --left-right --count master...origin/master`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Get-TikuProjectStatus.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Get-TikuNextAction.ps1 -VerboseHistory`
- `npx.cmd prettier --write --ignore-unknown docs/04-agent-system/state/local-experience-coverage-matrix.yaml docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-06-19-ap-07-ocr-auto-import-provider-boundary-detailing.md docs/05-execution-logs/evidence/2026-06-19-ap-07-ocr-auto-import-provider-boundary-detailing.md docs/05-execution-logs/audits-reviews/2026-06-19-ap-07-ocr-auto-import-provider-boundary-detailing.md`
- `npx.cmd prettier --check --ignore-unknown docs/04-agent-system/state/local-experience-coverage-matrix.yaml docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-06-19-ap-07-ocr-auto-import-provider-boundary-detailing.md docs/05-execution-logs/evidence/2026-06-19-ap-07-ocr-auto-import-provider-boundary-detailing.md docs/05-execution-logs/audits-reviews/2026-06-19-ap-07-ocr-auto-import-provider-boundary-detailing.md`
- `git diff --check`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId ap-07-ocr-auto-import-provider-boundary-detailing`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId ap-07-ocr-auto-import-provider-boundary-detailing`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId ap-07-ocr-auto-import-provider-boundary-detailing`

## Stop Conditions

- Any need to read `.env*`, secrets, provider/storage credentials, database URLs, OCR input files, parser output,
  generated question/material content, raw DB rows, or private identifiers.
- Any request to execute OCR/provider/parser/import work, generate files, write object storage, install dependencies,
  edit package/lockfiles, access DB data, change schema/migrations, change source/tests/e2e/scripts, deploy, open Cost
  Calibration Gate, create PR, force push, or perform destructive DB work.
- Any validation failure that cannot be fixed within the exact L0 allowed files.
