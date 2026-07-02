# ops_admin local login residual task plan

## Task

- Task id: `ops-admin-local-login-residual-2026-07-02`
- Branch: `codex/ops-admin-local-login-residual`
- Source: user requested that `ops_admin` local login acceptance residual be handled before the next resource/provider expansion.

## Read List

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/evidence/2026-07-02-ai-generation-20-fix-quick-acceptance.md`

## Scope

- Reproduce the `ops_admin` localhost login residual in the in-app browser.
- Inspect only account presence, role mapping, login route/page behavior, and local login helper behavior.
- Root cause found in the local acceptance session helper; allowed source/test files are limited to:
  - `src/server/contracts/local-acceptance-session-contract.ts`
  - `src/server/services/local-acceptance-session-service.ts`
  - `tests/unit/local-acceptance-session-bootstrap.test.ts`
- Record only redacted role labels, route labels, status categories, and validation summaries.

## Out Of Scope

- AI出题 / AI组卷 main chain, Provider calls, prompts, payloads, raw AI outputs, and generated content.
- Resource import and data coverage expansion.
- Direct database mutation, reset, seed, schema, migration, dependency, package, lockfile, `.env*`, staging/prod/cloud/deploy, Cost Calibration, release readiness, final Pass, PR, and force push.
- Logistics material coverage. The next expansion should start with `marketing` and `monopoly` only because logistics material is currently missing.

## Investigation Method

- Reproduce consistently through localhost UI.
- Compare `ops_admin` against known working role login flow without recording credentials.
- Search for existing account/role/login-helper patterns before proposing any repair.
- Fix only after identifying root cause.

## Validation

- `npm.cmd run test:unit -- tests/unit/local-acceptance-session-bootstrap.test.ts`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `npm.cmd exec -- prettier --check --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-07-02-ops-admin-local-login-residual.md docs/05-execution-logs/evidence/2026-07-02-ops-admin-local-login-residual.md docs/05-execution-logs/audits-reviews/2026-07-02-ops-admin-local-login-residual.md`
- `git diff --check`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId ops-admin-local-login-residual-2026-07-02`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId ops-admin-local-login-residual-2026-07-02 -SkipRemoteAheadCheck`
