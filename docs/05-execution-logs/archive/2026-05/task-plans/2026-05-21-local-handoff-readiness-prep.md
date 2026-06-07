# Local Handoff Readiness Preparation

## Status

Planned and preflight-reviewed on 2026-05-21.

## Purpose

Prepare this Windows 11 + Codex desktop machine to continue Tiku development without damaging the repository, local development tools, or Codex configuration.

This plan is a preparation task. It does not authorize feature development, dependency upgrades, database migrations, remote pushes, deployment, or production configuration.

## Current Findings

- Repository checkout is at `D:\tiku` and tracks `origin/master`.
- Current local branch for preparation work is `codex-local-handoff-readiness-prep`.
- The project has `pnpm-lock.yaml`, but this machine does not expose a working `pnpm` command yet.
- `node_modules` is missing, so `tsc`, `eslint`, `vitest`, and `next` are not currently runnable through npm scripts.
- `npm.cmd` works, but direct `npm` in PowerShell is blocked by execution policy.
- `.env.local` is missing.
- No local database startup scaffold was found: no `docker-compose.yml`, `compose.yaml`, `Dockerfile`, `drizzle.config.*`, or `drizzle/**`.
- `.git/hooks` does not contain an installed Husky `pre-commit` hook yet.
- `scripts/agent-system/Test-AgentSystemReadiness.ps1` currently checks `C:\Users\laozhuang\.codex\...`, while this machine uses `C:\Users\jzzhu\.codex\...`.
- Current Codex config enables Browser, Chrome, Documents, Spreadsheets, and Presentations plugins, but not the Superpowers plugin recorded in the project skill matrix.
- Current local Codex skills only include system skills under `C:\Users\jzzhu\.codex\skills\.system`.
- Playwright browser cache was not found under `C:\Users\jzzhu\AppData\Local\ms-playwright`.
- Docker and Docker Compose are present, but Docker reports an access warning for `C:\Users\jzzhu\.docker\config.json`.
- GitHub remote access is blocked without network approval in the current sandbox.

## Preparation Principles

- Keep `master` clean; do preparation changes on a short-lived branch.
- Prefer read-only checks before changing local or repository configuration.
- Back up Codex configuration before any edit to `C:\Users\jzzhu\.codex\config.toml`.
- Do not write real secrets into repository files, evidence, shell history, or chat.
- Do not change `package.json` or `pnpm-lock.yaml` during dependency installation; use frozen lockfile installation only.
- Do not run `drizzle-kit push`, database migrations, destructive database commands, deploys, pushes, or PR operations in this preparation task.
- Treat network downloads, browser downloads, plugin installs, and remote Git operations as separately approved actions.

## Implementation Steps

### Step 0: Baseline Snapshot

Record the current repository, tool, and Codex state:

- `git status --short --branch`
- `git branch --show-current`
- Node, npm.cmd, Git, Docker, and Docker Compose versions
- existing Codex config plugin list
- existing local Codex skills list
- presence of `node_modules`, `.env.local`, Playwright browser cache, and Git hooks

Expected outcome: a clear baseline before local changes.

### Step 1: Repository Preparation Plan Artifact

Create this task plan under `docs/05-execution-logs/task-plans/`.

Expected outcome: future sessions can resume from a durable plan instead of chat memory.

### Step 2: Low-Risk Project Tooling Repair

Parameterize or otherwise repair `scripts/agent-system/Test-AgentSystemReadiness.ps1` so it can inspect the active user's Codex home instead of only `C:\Users\laozhuang`.

Safe implementation constraints:

- Use `$env:CODEX_HOME` when present.
- Fall back to `Join-Path $env:USERPROFILE ".codex"` when `CODEX_HOME` is not set.
- Keep the old readiness checks semantically intact.
- Do not install skills or plugins inside this script.

Expected outcome: readiness output reflects this machine instead of a previous developer profile.

### Step 3: Dependency Installation Readiness

Attempt frozen dependency installation only after explicit network approval if required:

```powershell
corepack pnpm@10 install --frozen-lockfile
```

Safe implementation constraints:

- Do not run `pnpm add`.
- Do not change package versions.
- Stop if `package.json` or `pnpm-lock.yaml` changes unexpectedly.

Expected outcome: `node_modules` exists and project npm scripts can locate local binaries.

### Step 4: Local Gate Recovery

After dependencies are present, run:

```powershell
npm.cmd run typecheck
npm.cmd run lint
npm.cmd run test:unit
npm.cmd run format:check
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-AgentSystemReadiness.ps1
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Invoke-QualityGate.ps1
```

Expected outcome: local quality gates either pass or produce precise blockers.

### Step 5: Husky Hook Verification

Check whether dependency installation runs the `prepare` script and installs Husky hooks into `.git/hooks`.

Safe implementation constraints:

- Do not hand-edit `.git/hooks` unless a later task explicitly approves hook repair.
- Treat hook absence as a visible readiness gap, not as a silent bypass.

Expected outcome: commit gate status is known.

### Step 6: Codex Skills And Plugin Readiness

Compare `docs/04-agent-system/sop/skill-dispatch-matrix.md` with the active Codex session.

Safe implementation constraints:

- Do not assume a skill is active just because its directory exists.
- Do not copy unknown plugin files manually into Codex caches.
- If Superpowers or local skills are unavailable through installed plugin/skill mechanisms, record them as blockers for human decision.
- Restart Codex before treating newly installed skills as active.

Expected outcome: the project has a clear list of active, missing, and blocked agent skills.

### Step 7: Environment And Database Strategy

Prepare `.env.local` and PostgreSQL only after human confirmation of the local database strategy.

Safe implementation constraints:

- Do not invent passwords or commit secrets.
- Do not run migrations before `drizzle.config.*` and migration strategy are explicitly approved.
- Do not use `drizzle-kit push`.

Expected outcome: secret and database readiness are planned without data-loss risk.

### Step 8: Browser And E2E Strategy

Install Playwright browsers only if e2e validation is required and approved.

Safe implementation constraints:

- Prefer the Codex Browser/IAB workflow for local app verification.
- Do not launch or repair Chrome unless the user explicitly asks for Chrome-specific state.

Expected outcome: browser validation readiness is known without destabilizing the user's browser profile.

## Validation Plan

The preparation work is considered safe to continue only when these checks are true:

- `git status --short --branch` shows expected task-scope changes only.
- `Test-AgentSystemReadiness.ps1` no longer hard-fails because of the previous user's Codex path.
- Dependency installation, if run, does not modify `package.json` or `pnpm-lock.yaml`.
- Quality gates either pass or produce documented blockers.
- Missing skills, database, env, Docker, Playwright, and remote network gaps are documented instead of hidden.

## Rollback Plan

- Repository file changes remain on `codex-local-handoff-readiness-prep` until reviewed.
- If the readiness script repair is wrong, revert only that task-scoped file change on the branch.
- If Codex config is edited later, restore from the timestamped backup made before editing.
- If dependency installation produces unexpected package or lockfile changes, stop and inspect before reverting or deleting any files.
- Do not delete generated directories unless their absolute path has been verified to be inside `D:\tiku` or an approved temporary location.

## Self-Check

- Scope is preparation-only and does not implement business logic.
- No secrets are stored in the repository.
- No dependency versions are changed.
- No database schema or data operation is authorized.
- No remote push, PR, merge, or deployment is authorized.
- Codex configuration changes require backup and restart verification.
- Network-dependent work is separated into explicitly approved commands.
- The plan preserves project workflow requirements: short-lived branch, task plan, local gates, evidence, and explicit blockers.
