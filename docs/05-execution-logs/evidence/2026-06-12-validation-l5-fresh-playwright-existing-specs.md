# validation-l5-fresh-playwright-existing-specs Evidence

## Scope

- Branch: `codex/validation-l5-fresh-playwright-existing-specs`
- Task kind: `validation_only`
- Validation level: L5 local e2e
- User request: after the P1 student authorization runtime unit contract fix and a green full unit gate, open a separate L5 local e2e task and run existing Playwright specs with a fresh Playwright server.
- Fresh server control: did not set `TIKU_PLAYWRIGHT_REUSE_EXISTING_SERVER=1`; default `reuseExistingServer` remained false.
- Blocked areas respected: no product code, unit test, e2e spec, dependency, lockfile, schema, migration, env/secret, provider, deploy, payment, external-service, PR, force-push, `test:e2e:ui`, headed/debug browser mode, or Cost Calibration Gate work.

## Preconditions

- P1 unit task `fix-unit-gate-student-authorization-context-contract` was completed, merged, and pushed before this L5 task.
- `npm.cmd run test:unit` passed before this task with 239 test files and 856 tests.
- L5 task branch started from `master` at `7eb26454286bb856503c0d9896e7bde80359ec6e`.

## Command Evidence

### Playwright Spec List

Command:

```powershell
npm.cmd run test:e2e -- --list
```

Result:

- PASS
- Listed 27 tests in 10 files.
- Scope included the existing Chromium specs under `e2e/**`, including admin audit navigation, role denial, content action closures, route guards, local business flow, role-based acceptance, staging-required role discoverability, student practice/mock entry, and validation data prep.

### Full E2E, First Run

Command:

```powershell
npm.cmd run test:e2e
```

Result:

- FAIL
- Tests: 26 passed, 1 failed.
- Failed test: `e2e/local-business-flow.spec.ts` `runs the local student, admin, audit, and mock AI business flow`.
- Failure point: `studentFlow.mockAnswer.body.code` expected `0` but received `409311`.
- Error code source: `src/server/services/mock-exam-service.ts` returns `409311` for `Mock exam is not in progress.`
- Classification: documented L5 residual flake/state risk. Historical evidence contains prior first-run `409311` failures that passed on isolated or full rerun; this task did not change runtime code or e2e specs.

### Focused Failed Spec Rerun

Command:

```powershell
npm.cmd run test:e2e -- e2e/local-business-flow.spec.ts
```

Result:

- PASS
- Tests: 1 passed.
- Diagnostic value: the first-run failure was not consistently reproducible as an isolated spec failure.

### Full E2E, Second Run

Command:

```powershell
npm.cmd run test:e2e
```

Result:

- PASS
- Tests: 27 passed.
- Duration: about 1.2 minutes.

## Gate Evidence

### Lint

Command:

```powershell
npm.cmd run lint
```

Result:

- PASS

### Typecheck

Command:

```powershell
npm.cmd run typecheck
```

Result:

- PASS

### Scoped Prettier

Commands:

```powershell
npm.cmd exec -- prettier --write docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-06-12-validation-l5-fresh-playwright-existing-specs.md docs/05-execution-logs/evidence/2026-06-12-validation-l5-fresh-playwright-existing-specs.md docs/05-execution-logs/audits-reviews/2026-06-12-validation-l5-fresh-playwright-existing-specs.md
npm.cmd exec -- prettier --check docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-06-12-validation-l5-fresh-playwright-existing-specs.md docs/05-execution-logs/evidence/2026-06-12-validation-l5-fresh-playwright-existing-specs.md docs/05-execution-logs/audits-reviews/2026-06-12-validation-l5-fresh-playwright-existing-specs.md
```

Result:

- PASS
- Prettier check reported all matched files use Prettier code style.

### Whitespace Check

Command:

```powershell
git diff --check
```

Result:

- PASS

## Post-Merge Master Gate Evidence

After fast-forward merging `codex/validation-l5-fresh-playwright-existing-specs` into `master`, the following gates were rerun on `master` before push:

### Full Unit Gate

Command:

```powershell
npm.cmd run test:unit
```

Result:

- PASS
- Test files: 239 passed.
- Tests: 856 passed.

### Lint

Command:

```powershell
npm.cmd run lint
```

Result:

- PASS

### Typecheck

Command:

```powershell
npm.cmd run typecheck
```

Result:

- PASS

### Whitespace Check

Command:

```powershell
git diff --check
```

Result:

- PASS

## Residual Risk

- L5 is not first-run deterministic: `local-business-flow.spec.ts` can still hit `409311 Mock exam is not in progress` on a full-suite first run.
- The current validation supports `pass_after_retry`, not a claim that the full e2e suite is flake-free.
- Recommended next task: a separate P1 e2e hardening task for `local-business-flow` mock_exam data isolation/state reset, with RED evidence from the first-run `409311` pattern and no provider/env/schema/dependency changes unless separately approved.
