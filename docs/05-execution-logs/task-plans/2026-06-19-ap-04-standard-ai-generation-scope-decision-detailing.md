# AP-04 Standard AI Generation Scope Decision Detailing Task Plan

## Task

- Task id: `ap-04-standard-ai-generation-scope-decision-detailing`
- Branch: `codex/ap-04-standard-ai-generation-scope-decision-detailing`
- Approval package: AP-04
- Use case: `UC-FUTURE-STANDARD-AI-GENERATION-NON-GOAL`
- Objective: create a product-scope decision package for standard edition AI generation without changing product scope,
  source, provider, cost, schema, tests, or runtime behavior.
- Scope: L0 docs/state/governance decision options only.

## Required Reading

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/*.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/04-agent-system/state/local-experience-coverage-matrix.yaml`
- `docs/05-execution-logs/evidence/2026-06-19-blocked-use-case-acceleration-governance-packet.md`
- `docs/05-execution-logs/evidence/2026-06-19-ap-09-runtime-capability-list-inventory-detailing.md`

## Exact Allowed Files

- `docs/04-agent-system/state/local-experience-coverage-matrix.yaml`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/2026-06-19-ap-04-standard-ai-generation-scope-decision-detailing.md`
- `docs/05-execution-logs/evidence/2026-06-19-ap-04-standard-ai-generation-scope-decision-detailing.md`
- `docs/05-execution-logs/audits-reviews/2026-06-19-ap-04-standard-ai-generation-scope-decision-detailing.md`

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
- Document product-scope options and the exact fresh approval needed before any standard edition AI generation scope
  change.
- Run docs/state validation gates, local commit, fast-forward merge to `master`, push `origin/master`, and delete the
  merged short branch if gates pass.

Blocked:

- Product scope change adoption, source/test/e2e/script/API/UI changes, provider/model calls, cost calibration, formal
  adoption writes, schema/migration, dependency/package/lockfile changes, DB access, staging/prod/deploy, PR, force push,
  raw sensitive evidence.

## Execution Steps

1. Confirm clean `master` aligned with `origin/master`.
2. Create the AP-04 short branch.
3. Materialize AP-04 L0 plan, evidence, audit, queue entry, project-state anchor, and matrix anchor.
4. Keep `UC-FUTURE-STANDARD-AI-GENERATION-NON-GOAL` at `release_blocked` and current non-goal scope.
5. Record any product scope change as requiring user choice and fresh approval.
6. Run scoped formatting and Module Run v2 gates.
7. Commit, fast-forward merge to `master`, run master gates, push `origin/master`, and clean the merged branch.

## Validation Commands

- `git status --short --branch`
- `git rev-list --left-right --count master...origin/master`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Get-TikuProjectStatus.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Get-TikuNextAction.ps1 -VerboseHistory`
- `npx.cmd prettier --write --ignore-unknown docs/04-agent-system/state/local-experience-coverage-matrix.yaml docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-06-19-ap-04-standard-ai-generation-scope-decision-detailing.md docs/05-execution-logs/evidence/2026-06-19-ap-04-standard-ai-generation-scope-decision-detailing.md docs/05-execution-logs/audits-reviews/2026-06-19-ap-04-standard-ai-generation-scope-decision-detailing.md`
- `npx.cmd prettier --check --ignore-unknown docs/04-agent-system/state/local-experience-coverage-matrix.yaml docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-06-19-ap-04-standard-ai-generation-scope-decision-detailing.md docs/05-execution-logs/evidence/2026-06-19-ap-04-standard-ai-generation-scope-decision-detailing.md docs/05-execution-logs/audits-reviews/2026-06-19-ap-04-standard-ai-generation-scope-decision-detailing.md`
- `git diff --check`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId ap-04-standard-ai-generation-scope-decision-detailing`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId ap-04-standard-ai-generation-scope-decision-detailing`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId ap-04-standard-ai-generation-scope-decision-detailing`

## Stop Conditions

- Any request to choose a product scope option that changes standard edition behavior.
- Any need to edit source, tests, e2e, scripts, schema, migrations, package files, lockfiles, provider configuration, DB
  data, or runtime behavior.
- Any request to run provider/model calls, Cost Calibration Gate, formal adoption, staging/prod/deploy, PR, force push,
  or sensitive evidence collection.
