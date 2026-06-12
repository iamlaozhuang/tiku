# fix-unit-gate-student-authorization-context-contract Task Plan

## Task

- Task id: `fix-unit-gate-student-authorization-context-contract`
- Branch: `codex/fix-unit-gate-student-authorization-context-contract`
- Task kind: `test_contract_fix`
- Date: 2026-06-12
- Priority: P1
- Source: health audit follow-up final review

## Documents Read

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- ADR-001 through ADR-006
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/evidence/2026-06-12-docs-project-quality-gate-refresh.md`

## RED Evidence

Before editing, this task reran:

```powershell
npm.cmd run test:unit -- tests/unit/phase-8-student-authorization-redeem-runtime.test.ts
```

Result:

- FAIL
- Test files: 1 failed
- Tests: 1 failed, 3 passed
- Failure reason: `authorizations.GET` response includes `authorizationContexts`, while the existing test uses exact equality without that current contract field.

## Scope

Allowed files:

- `tests/unit/phase-8-student-authorization-redeem-runtime.test.ts`
- `playwright.config.ts`
- `tests/unit/playwright-config-baseline.test.ts`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- This task plan, evidence, and audit review

Blocked work:

- No source runtime code, dependency/package/lockfile, schema/migration, env/secret, provider, deploy, payment, external-service, e2e execution, PR, force-push, or Cost Calibration Gate work.

## Approach

- Update the stale unit expectation to include the current `authorizationContexts` response contract.
- Preserve assertions that external responses do not expose numeric ids.
- If full unit reproduces the Playwright config test timeout, stabilize that test by avoiding repeated dynamic import/reset of the full Playwright config module while preserving the fresh-server default assertion.
- Rerun the focused unit test, then full `npm.cmd run test:unit`.
- If the unit gate is green, proceed in a separate task to L5 local e2e validation using the fresh Playwright server.

## Validation Commands

- `npm.cmd run test:unit -- tests/unit/phase-8-student-authorization-redeem-runtime.test.ts`
- `npm.cmd run test:unit -- tests/unit/playwright-config-baseline.test.ts`
- `npm.cmd run test:unit`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `npm.cmd run build`
- `git diff --check`

## Stop Conditions

- Stop if the fix requires source runtime changes, API shape changes, dependency changes, e2e execution, env/provider/schema/deploy work, or Cost Calibration Gate work.
