# fix-playwright-stale-server-risk Task Plan

## Task

- Task id: `fix-playwright-stale-server-risk`
- Branch: `codex/fix-playwright-stale-server-risk`
- Task kind: `implementation`
- Date: 2026-06-12
- Source: health audit follow-up queue

## Documents Read

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- ADR-001 through ADR-005
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/evidence/2026-06-12-health-audit-local-baseline.md`

## Scope

Allowed files:

- `playwright.config.ts`
- `tests/unit/playwright-config-baseline.test.ts`
- This task plan, evidence, and audit review

Blocked work:

- No dependency/package/lockfile, schema/migration, env/secret, provider, deploy, payment, external-service, e2e execution, PR, force-push, or Cost Calibration Gate work.

## Approach

- Change Playwright local `webServer.reuseExistingServer` from implicit local reuse to default `false`.
- Add an explicit opt-in environment variable for temporary local reuse only: `TIKU_PLAYWRIGHT_REUSE_EXISTING_SERVER=1`.
- Add a unit test that imports the config with a clean environment and asserts default fresh-server behavior.
- Add a second unit assertion for the explicit opt-in path so local diagnostics remain possible without becoming official L5 evidence.

## Validation Commands

- `npm.cmd run test:unit -- tests/unit/playwright-config-baseline.test.ts`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `npm.cmd run build`
- `git diff --check`

## Stop Conditions

- Stop if the repair requires dependency changes, e2e execution, env file edits, or changes under `e2e/**`.
- Stop if local Playwright default still permits stale dev server reuse.
