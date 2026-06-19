# AP-10 Current Checkpoint Audit Target Detailing Task Plan

## Task

- Task id: `ap-10-current-checkpoint-audit-target-detailing`
- Branch: `codex/ap-10-current-checkpoint-audit-target-detailing`
- Approval package: AP-10
- Use case: `UC-GATE-CURRENT-CHECKPOINT`
- Objective: define the exact audit target package for current checkpoint repair without performing any source, test,
  e2e, script, schema, dependency, DB, provider, deployment, or runtime work.
- Scope: L0 docs/state/governance audit target detailing only.

## Required Reading

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/*.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/04-agent-system/state/local-experience-coverage-matrix.yaml`
- `docs/05-execution-logs/evidence/2026-06-19-blocked-use-case-acceleration-governance-packet.md`
- `docs/05-execution-logs/evidence/2026-06-19-ap-05-standard-org-self-service-scope-decision-detailing.md`
- `docs/05-execution-logs/audits-reviews/2026-06-14-current-state-checkpoint-and-implementation-audit.md`

## Exact Allowed Files

- `docs/04-agent-system/state/local-experience-coverage-matrix.yaml`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/2026-06-19-ap-10-current-checkpoint-audit-target-detailing.md`
- `docs/05-execution-logs/evidence/2026-06-19-ap-10-current-checkpoint-audit-target-detailing.md`
- `docs/05-execution-logs/audits-reviews/2026-06-19-ap-10-current-checkpoint-audit-target-detailing.md`

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
- Define the future L1 audit/repair package requirements: exact allowed files, blocked files, commands, redaction,
  rollback, and stop conditions.
- Run docs/state validation gates, local commit, fast-forward merge to `master`, push `origin/master`, and delete the
  merged short branch if gates pass.

Blocked:

- Source, test, e2e, script, schema, migration, package, lockfile, dependency, DB, env/secret, provider, payment,
  export, OCR, browser, Playwright, staging, prod, deploy, PR, force push, or sensitive evidence work.
- Any current checkpoint repair execution. If repair is needed, stop and request L1 fresh approval.

## Audit Target Package

The next AP-10 L1 package, if requested, must name:

- The exact finding id or checkpoint section from the checkpoint audit.
- The exact source/test/e2e files allowed to change.
- The exact commands allowed to prove the repair.
- The redaction rules for evidence.
- The rollback owner and rollback command or revert plan.
- Stop conditions for any unexpected scope expansion, sensitive evidence, DB/env access, or L3 dependency.

## Execution Steps

1. Confirm clean `master` aligned with `origin/master`.
2. Create the AP-10 short branch.
3. Materialize AP-10 L0 plan, evidence, audit, queue entry, project-state anchor, and matrix anchor.
4. Keep `UC-GATE-CURRENT-CHECKPOINT` at `release_blocked` and record that this task performs no repair.
5. Record any source/test/e2e repair as blocked pending exact L1 fresh approval.
6. Run scoped formatting and Module Run v2 gates.
7. Commit, fast-forward merge to `master`, run master gates, push `origin/master`, and clean the merged branch.

## Validation Commands

- `git status --short --branch`
- `git rev-list --left-right --count master...origin/master`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Get-TikuProjectStatus.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Get-TikuNextAction.ps1 -VerboseHistory`
- `npx.cmd prettier --write --ignore-unknown docs/04-agent-system/state/local-experience-coverage-matrix.yaml docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-06-19-ap-10-current-checkpoint-audit-target-detailing.md docs/05-execution-logs/evidence/2026-06-19-ap-10-current-checkpoint-audit-target-detailing.md docs/05-execution-logs/audits-reviews/2026-06-19-ap-10-current-checkpoint-audit-target-detailing.md`
- `npx.cmd prettier --check --ignore-unknown docs/04-agent-system/state/local-experience-coverage-matrix.yaml docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-06-19-ap-10-current-checkpoint-audit-target-detailing.md docs/05-execution-logs/evidence/2026-06-19-ap-10-current-checkpoint-audit-target-detailing.md docs/05-execution-logs/audits-reviews/2026-06-19-ap-10-current-checkpoint-audit-target-detailing.md`
- `git diff --check`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId ap-10-current-checkpoint-audit-target-detailing`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId ap-10-current-checkpoint-audit-target-detailing`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId ap-10-current-checkpoint-audit-target-detailing`

## Stop Conditions

- Any need to edit source, tests, e2e, scripts, schema, migrations, package files, lockfiles, DB data, env/secret
  configuration, or runtime behavior.
- Any need to run Browser/Playwright, provider/model, payment, OCR/parser, export/file-generation, staging/prod/cloud,
  deploy, DB read/write, PR, force push, or destructive DB work.
- Any evidence that could expose secrets, `.env*` values, database URLs, raw DB rows, private identifiers, student or
  employee answers, provider payloads, raw prompts, raw responses, raw model output, or raw checkpoint-sensitive data.
