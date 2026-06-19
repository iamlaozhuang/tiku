# AP-02 Through AP-11 Fresh Approval Decision Pack Task Plan

## Task

- Task id: `ap-02-ap-11-fresh-approval-decision-pack`
- Branch: `codex/ap-02-ap-11-fresh-approval-decision-pack`
- Approval package: AP-02 through AP-11 decision pack
- Objective: create a docs-only batch decision package that lists the next available fresh approval choices after AP-02
  through AP-11 L0 detailing.
- Scope: L0 docs/state/governance only.

## Required Reading

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/*.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/04-agent-system/state/local-experience-coverage-matrix.yaml`
- AP-02 through AP-11 latest task plans, evidence, and audit reviews.

## Exact Allowed Files

- `docs/04-agent-system/state/local-experience-coverage-matrix.yaml`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/2026-06-19-ap-02-ap-11-fresh-approval-decision-pack.md`
- `docs/05-execution-logs/evidence/2026-06-19-ap-02-ap-11-fresh-approval-decision-pack.md`
- `docs/05-execution-logs/audits-reviews/2026-06-19-ap-02-ap-11-fresh-approval-decision-pack.md`

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
- `docs/01-requirements/**`
- `docs/02-architecture/**`
- `docs/03-standards/**`
- `playwright-report/**`
- `test-results/**`

## Approval Boundary

Allowed:

- Create this task plan, evidence, and audit review.
- Update project state, task queue, and coverage matrix anchors.
- List AP-02 through AP-11 fresh approval choices, recommended order, L1/L2/L3 boundary, redaction, rollback, and stop
  condition requirements.
- Run docs/state validation gates, local commit, fast-forward merge to `master`, push `origin/master`, and delete the
  merged short branch if gates pass.

Blocked:

- Product scope adoption, source/test/e2e/script changes, schema/migration, dependency/package/lockfile changes, DB
  reads/writes, `.env*`, provider/model calls, Cost Calibration Gate, staging/prod/cloud/deploy, payment, OCR/parser,
  export/file generation, source governance rewrite, formal adoption, PR, force push, destructive DB work, or sensitive
  evidence collection.

## Execution Steps

1. Confirm clean `master` aligned with `origin/master`.
2. Create the short branch.
3. Materialize the decision pack as plan, evidence, audit, queue entry, project-state anchor, and matrix anchor.
4. Keep every AP row release-blocked unless the user later grants a specific fresh approval or product choice.
5. Run scoped formatting and Module Run v2 gates.
6. Commit, fast-forward merge to `master`, run master gates, push `origin/master`, and clean the merged branch.

## Validation Commands

- `git status --short --branch`
- `git rev-list --left-right --count master...origin/master`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Get-TikuProjectStatus.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Get-TikuNextAction.ps1 -VerboseHistory`
- `npx.cmd prettier --write --ignore-unknown docs/04-agent-system/state/local-experience-coverage-matrix.yaml docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-06-19-ap-02-ap-11-fresh-approval-decision-pack.md docs/05-execution-logs/evidence/2026-06-19-ap-02-ap-11-fresh-approval-decision-pack.md docs/05-execution-logs/audits-reviews/2026-06-19-ap-02-ap-11-fresh-approval-decision-pack.md`
- `npx.cmd prettier --check --ignore-unknown docs/04-agent-system/state/local-experience-coverage-matrix.yaml docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-06-19-ap-02-ap-11-fresh-approval-decision-pack.md docs/05-execution-logs/evidence/2026-06-19-ap-02-ap-11-fresh-approval-decision-pack.md docs/05-execution-logs/audits-reviews/2026-06-19-ap-02-ap-11-fresh-approval-decision-pack.md`
- `git diff --check`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId ap-02-ap-11-fresh-approval-decision-pack`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId ap-02-ap-11-fresh-approval-decision-pack`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId ap-02-ap-11-fresh-approval-decision-pack`

## Stop Conditions

- Any request to execute L1/L2/L3 work instead of documenting choices.
- Any need to edit source, tests, e2e, scripts, schema, migrations, package files, lockfiles, DB data, env/secret
  configuration, or runtime behavior.
- Any need to run provider/model, Cost Calibration Gate, payment, OCR/parser, export/file-generation, staging/prod/cloud,
  deploy, DB read/write, PR, force push, formal adoption, Browser/Playwright, or destructive DB work.
- Any evidence that could expose secrets, `.env*` values, database URLs, raw DB rows, private identifiers, student or
  employee answers, provider payloads, raw prompts, raw responses, raw model output, payment data, or raw sensitive data.
