# Phase 51 Browser Bridge Readiness Recheck Task Plan

## Task

- Task id: `phase-51-browser-bridge-readiness-recheck`
- Branch: `codex/phase-51-browser-bridge-readiness-recheck`
- Task kind: `docs_only`
- Source: user reported sandbox permission adjustment after phase-49 recorded Browser / `node_repl` bridge warning.

## Documents Read

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/adr-004-environment-isolation-and-release-boundaries.md`
- `docs/04-agent-system/sop/codex-app-readiness-audit-governance.md`
- `docs/04-agent-system/sop/automation-readiness-scorecard-and-mode-transition-governance.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/evidence/2026-06-07-phase-50-automation-readiness-scorecard.md`
- `C:/Users/jzzhu/.codex/plugins/cache/openai-bundled/browser/26.527.31326/skills/control-in-app-browser/SKILL.md`

## Scope

Recheck whether the Browser / `node_repl` bridge warning from phase 49 still applies after the sandbox permission change.

Allowed files:

- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/2026-06-07-phase-51-browser-bridge-readiness-recheck.md`
- `docs/05-execution-logs/evidence/2026-06-07-phase-51-browser-bridge-readiness-recheck.md`
- `docs/05-execution-logs/audits-reviews/2026-06-07-phase-51-browser-bridge-readiness-recheck.md`

Blocked scope:

- product code, API, service, repository, model, UI, tests, e2e, scripts;
- dependency, package, lockfile, CLI, SDK, schema, migration, database operation;
- `automation.mode` change, mode transition execution, automatic task claiming;
- code-stage queue seeding or implementation queue items;
- Codex global configuration changes, skill/plugin installation, connector installation, session history cleanup, cache deletion;
- browser page navigation beyond the existing blank tab, GUI launch outside in-app Browser state inspection, provider, env/secret, staging/prod/cloud/deploy, payment, external-service, Cost Calibration Gate execution.

## Recheck Commands

- `git status --short --branch`
- `git rev-parse HEAD`
- `git rev-parse origin/master`
- `git rev-list --left-right --count master...origin/master`
- `node_repl` base readiness probe through `mcp__node_repl.js`
- Browser runtime initialization using `browser-client.mjs`
- in-app Browser capability and current tab inspection

## Risk Defenses

- Do not visit external or local business URLs.
- Do not run dev server.
- Do not screenshot or expose internal browser attach token values in evidence.
- Do not read `.env.local`, secrets, provider keys, database URLs, or Authorization headers.
- Keep Cost Calibration Gate blocked.
- Keep `automation.mode` as `semi_auto`.
- Preserve required project terminology: `authorization`, `paper`, `mock_exam`, `redeem_code`, `audit_log`, and `ai_call_log`.

## Validation Commands

- `git diff --check`
- `node .\node_modules\prettier\bin\prettier.cjs --check docs\04-agent-system\state\project-state.yaml docs\04-agent-system\state\task-queue.yaml docs\05-execution-logs\task-plans\2026-06-07-phase-51-browser-bridge-readiness-recheck.md docs\05-execution-logs\evidence\2026-06-07-phase-51-browser-bridge-readiness-recheck.md docs\05-execution-logs\audits-reviews\2026-06-07-phase-51-browser-bridge-readiness-recheck.md`
- Required Browser bridge readiness section search.
- Added-line terminology check for conflicting prohibited terminology.

## Stop Conditions

Stop if:

- the bridge recheck requires browser navigation to business, provider, staging, prod, cloud, deploy, payment, or external-service URLs;
- the recheck requires Codex configuration changes or plugin/skill installation;
- evidence would need to record internal attach token values or other sensitive content;
- validation fails outside docs-only scope;
- changed files exceed `allowedFiles`;
- Git state becomes ambiguous.
