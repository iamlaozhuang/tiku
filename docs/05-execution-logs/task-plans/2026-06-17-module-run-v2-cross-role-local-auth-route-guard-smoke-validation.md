# Module Run v2 cross-role local auth route guard smoke validation

- Task ID: `module-run-v2-cross-role-local-auth-route-guard-smoke-validation`
- Branch: `codex/cross-role-local-auth-route-guard-smoke-validation`
- Created: `2026-06-17T15:47:04-07:00`
- Execution profile: `local_full_flow`
- Evidence mode: `full`
- Validation policy: `local_full_flow`

## Required Standards Read

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/*.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/04-agent-system/state/execution-profiles.yaml`
- `docs/04-agent-system/state/mechanism-source-of-truth-index.yaml`
- `C:/Users/jzzhu/.codex/skills/playwright/SKILL.md`

## Scope

This task materializes the approved next local validation step after the cross-role local flow planning task. It only runs the existing
`e2e/local-auth-route-guard.spec.ts` smoke through the repository Playwright configuration, which targets `http://127.0.0.1:3000`.

Allowed write scope:

- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/2026-06-17-module-run-v2-cross-role-local-auth-route-guard-smoke-validation.md`
- `docs/05-execution-logs/evidence/2026-06-17-module-run-v2-cross-role-local-auth-route-guard-smoke-validation.md`
- `docs/05-execution-logs/audits-reviews/2026-06-17-module-run-v2-cross-role-local-auth-route-guard-smoke-validation.md`

Read-only validation surfaces:

- `playwright.config.ts`
- `e2e/local-auth-route-guard.spec.ts`
- `package.json`

## Non-Goals

- No product source changes.
- No route, UI, schema, migration, drizzle, package, lockfile, dependency, or e2e spec changes.
- No provider/model calls.
- No env/secret access.
- No staging/prod/cloud/deploy/payment/external-service access.
- No full e2e suite, headed/debug mode, PR, force-push, or Cost Calibration Gate work.

## Implementation Plan

1. Register this task in `project-state.yaml` and `task-queue.yaml` with `executionProfile: local_full_flow` and
   `localFullFlowGate: approved_localhost_only`.
2. Run the local capability gate before invoking any Playwright command that may start a local dev server.
3. Run `npm.cmd run test:e2e -- --list` to confirm test discovery without executing the full suite.
4. Run `npm.cmd run test:e2e -- e2e/local-auth-route-guard.spec.ts`.
5. Record redacted evidence with command outcomes and test counts only.
6. Run formatting, lint, typecheck, diff, and Module Run v2 closeout gates.
7. Close the task, commit, fast-forward merge to `master`, push `origin/master`, and remove the short branch if all gates pass.

## Risk Controls

- The Playwright config starts only a localhost dev server at `127.0.0.1`.
- Generated Playwright artifact folders are not allowed in the commit and will be cleaned only after verifying they are repo-local generated outputs.
- Evidence must not include token values, Authorization headers, cookies, raw DOM, raw response payloads, row data, public identifier inventories, or private data.
