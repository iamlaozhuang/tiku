# Phase 49 Codex App Readiness Audit Execution Task Plan

## Task

- Task id: `phase-49-codex-app-readiness-audit-execution`
- Branch: `codex/phase-49-codex-app-readiness-audit-execution`
- Task kind: `docs_only`
- Source: user-approved iterative automated mechanism governance loop after phase 48 closeout.

## Documents Read

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/adr-002-runtime-architecture-and-multi-client-contract.md`
- `docs/02-architecture/adr/adr-004-environment-isolation-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-005-staging-architecture-and-release-boundaries.md`
- `docs/04-agent-system/sop/codex-app-readiness-audit-governance.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/evidence/2026-06-07-phase-48-automated-governance-stack-closeout-audit.md`
- `docs/05-execution-logs/audits-reviews/2026-06-07-phase-48-automated-governance-stack-closeout-audit.md`

## Scope

Execute the actual read-only Codex App readiness audit described by the SOP.

Allowed files:

- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/2026-06-07-phase-49-codex-app-readiness-audit-execution.md`
- `docs/05-execution-logs/evidence/2026-06-07-phase-49-codex-app-readiness-audit-execution.md`
- `docs/05-execution-logs/audits-reviews/2026-06-07-phase-49-codex-app-readiness-audit-execution.md`

Blocked scope:

- product code, API, service, repository, model, UI, tests, e2e, scripts;
- dependency, package, lockfile, CLI, SDK, schema, migration, database operation;
- Codex global configuration changes, skill/plugin installation, connector installation, session history cleanup, cache deletion;
- GUI launch, browser page navigation, staging/prod/cloud/deploy, provider, env/secret, payment, external-service, Cost Calibration Gate execution;
- actual code-stage queue seeding, implementation queue items, `automation.mode` change, thread creation, worktree creation, parallel worker execution.

## Audit Commands

- `git status --short --branch`
- `git rev-parse master`
- `git rev-parse origin/master`
- `git rev-list --left-right --count master...origin/master`
- `git worktree list`
- `git status --ignored --short --untracked-files=normal`
- `git branch --merged`
- `git branch --no-merged`
- `$PSVersionTable.PSVersion.ToString()`
- `git --version`
- `node --version`
- `npm --version`
- `npm.cmd --version`
- `Get-Command git,node,npm.cmd,powershell.exe`
- `node -e "const p=require('./package.json'); console.log(Object.keys(p.scripts||{}).sort().join('\n'))"`
- `Test-Path node_modules`
- `Test-Path node_modules\.bin\eslint.cmd`
- `Test-Path node_modules\.bin\tsc.cmd`
- `Test-Path node_modules\.bin\vitest.cmd`
- `Get-ChildItem .husky -Force`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Invoke-QualityGate.ps1`
- `tool_search` for browser and `node_repl` readiness discovery

## Risk Defenses

- Do not read `.env.local` or any secret-like file.
- Do not install packages, plugins, connectors, or skills.
- Do not delete ignored residue or clean caches.
- Do not open browser windows or navigate local pages.
- Record tool warnings honestly instead of treating them as pass.
- Keep `automation.mode` as `semi_auto`.
- Preserve project terminology: `authorization`, `paper`, `mock_exam`, `redeem_code`, `audit_log`, and `ai_call_log`.

## Validation Commands

- `git diff --check`
- `node .\node_modules\prettier\bin\prettier.cjs --check docs\04-agent-system\state\project-state.yaml docs\04-agent-system\state\task-queue.yaml docs\05-execution-logs\task-plans\2026-06-07-phase-49-codex-app-readiness-audit-execution.md docs\05-execution-logs\evidence\2026-06-07-phase-49-codex-app-readiness-audit-execution.md docs\05-execution-logs\audits-reviews\2026-06-07-phase-49-codex-app-readiness-audit-execution.md`
- Required readiness section search.
- Added-line terminology check for conflicting prohibited terminology.

## Stop Conditions

Stop if:

- the audit requires env/secret access;
- the audit requires plugin/skill installation or Codex configuration change;
- the audit requires GUI launch or browser navigation;
- validation fails outside docs-only scope;
- changed files exceed `allowedFiles`;
- Git state becomes ambiguous;
- a mode transition or code-stage queue seeding decision is required.
