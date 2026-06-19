# AP-11 Source Governance Change-Control Detailing Task Plan

## Task

- Task id: `ap-11-source-governance-change-control-detailing`
- Branch: `codex/ap-11-source-governance-change-control-detailing`
- Approval package: AP-11
- Use case: `UC-AUDIT-SOURCE-GOVERNANCE`
- Objective: define source governance change-control boundaries without rewriting source governance artifacts, changing
  requirements, collecting sensitive evidence, or performing implementation work.
- Scope: L0 docs/state/governance change-control detailing only.

## Required Reading

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/*.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/04-agent-system/state/local-experience-coverage-matrix.yaml`
- `docs/05-execution-logs/evidence/2026-06-19-blocked-use-case-acceleration-governance-packet.md`
- `docs/05-execution-logs/evidence/2026-06-19-ap-10-current-checkpoint-audit-target-detailing.md`

## Exact Allowed Files

- `docs/04-agent-system/state/local-experience-coverage-matrix.yaml`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/2026-06-19-ap-11-source-governance-change-control-detailing.md`
- `docs/05-execution-logs/evidence/2026-06-19-ap-11-source-governance-change-control-detailing.md`
- `docs/05-execution-logs/audits-reviews/2026-06-19-ap-11-source-governance-change-control-detailing.md`

## Blocked Files

- `.env*`
- `package.json`
- `pnpm-lock.yaml`
- `package-lock.yaml`
- `package-lock.json`
- `src/**`
- `e2e/**`
- `tests/**`
- `docs/01-requirements/**`
- `docs/02-architecture/**`
- `docs/03-standards/**`
- `src/db/schema/**`
- `drizzle/**`
- `scripts/**`
- `playwright-report/**`
- `test-results/**`

## Approval Boundary

Allowed:

- Create this task plan, evidence, and audit review.
- Update project state, task queue, and coverage matrix anchors.
- Document future source governance change-control requirements for source ids, catalog rows, matrix rows, review
  owners, redaction, rollback, and stop conditions.
- Run docs/state validation gates, local commit, fast-forward merge to `master`, push `origin/master`, and delete the
  merged short branch if gates pass.

Blocked:

- Source governance rewrite, requirement source changes, ADR/standard/source-of-truth changes, product source changes,
  tests, e2e, scripts, schema, migrations, packages, lockfiles, DB, env/secret, provider, payment, export, OCR, browser,
  Playwright, staging, prod, deploy, PR, force push, formal adoption, or sensitive evidence collection.

## Change-Control Requirements

Any future source governance change must name:

- The exact source id, catalog row, matrix row, or governance artifact to change.
- The owner and reviewer for the source-of-truth change.
- The exact allowed files and blocked files.
- The exact commands allowed for validation.
- The compatibility impact on use-case ids, capability ids, API contracts, edition boundaries, and local-experience
  coverage rows.
- The rollback or revert plan.
- The redaction policy and sensitive evidence stop conditions.

## Execution Steps

1. Confirm clean `master` aligned with `origin/master`.
2. Create the AP-11 short branch.
3. Materialize AP-11 L0 plan, evidence, audit, queue entry, project-state anchor, and matrix anchor.
4. Keep `UC-AUDIT-SOURCE-GOVERNANCE` at `release_blocked` and record that this task performs no source governance
   rewrite.
5. Record any source governance rewrite, requirement change, formal adoption, or sensitive evidence as blocked pending
   fresh approval.
6. Run scoped formatting and Module Run v2 gates.
7. Commit, fast-forward merge to `master`, run master gates, push `origin/master`, and clean the merged branch.

## Validation Commands

- `git status --short --branch`
- `git rev-list --left-right --count master...origin/master`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Get-TikuProjectStatus.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Get-TikuNextAction.ps1 -VerboseHistory`
- `npx.cmd prettier --write --ignore-unknown docs/04-agent-system/state/local-experience-coverage-matrix.yaml docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-06-19-ap-11-source-governance-change-control-detailing.md docs/05-execution-logs/evidence/2026-06-19-ap-11-source-governance-change-control-detailing.md docs/05-execution-logs/audits-reviews/2026-06-19-ap-11-source-governance-change-control-detailing.md`
- `npx.cmd prettier --check --ignore-unknown docs/04-agent-system/state/local-experience-coverage-matrix.yaml docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-06-19-ap-11-source-governance-change-control-detailing.md docs/05-execution-logs/evidence/2026-06-19-ap-11-source-governance-change-control-detailing.md docs/05-execution-logs/audits-reviews/2026-06-19-ap-11-source-governance-change-control-detailing.md`
- `git diff --check`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId ap-11-source-governance-change-control-detailing`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId ap-11-source-governance-change-control-detailing`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId ap-11-source-governance-change-control-detailing`

## Stop Conditions

- Any need to edit requirements, ADRs, standards, source-of-truth catalogs, product source, tests, e2e, scripts, schema,
  migrations, package files, lockfiles, DB data, env/secret configuration, or runtime behavior.
- Any need to run Browser/Playwright, provider/model, payment, OCR/parser, export/file-generation, staging/prod/cloud,
  deploy, DB read/write, PR, force push, formal adoption, or destructive DB work.
- Any evidence that could expose secrets, `.env*` values, database URLs, raw DB rows, private identifiers, student or
  employee answers, provider payloads, raw prompts, raw responses, raw model output, source-private governance notes, or
  raw sensitive data.
