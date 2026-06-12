# fix-unit-gate-student-authorization-context-contract Evidence

## Scope

- Branch: `codex/fix-unit-gate-student-authorization-context-contract`
- Task kind: `test_contract_fix`
- Priority: P1
- User request: fix the student authorization runtime unit contract drift, rerun `npm.cmd run test:unit`, and only after the unit gate is green open a separate L5 local e2e validation task using fresh Playwright server behavior and existing specs.
- Blocked areas respected: no dependency, lockfile, schema, migration, env/secret, provider, deploy, payment, external-service, e2e execution, PR, force-push, or Cost Calibration Gate work.

## RED Evidence

Command:

```powershell
npm.cmd run test:unit -- tests/unit/phase-8-student-authorization-redeem-runtime.test.ts
```

Initial result:

- FAIL
- Test files: 1 failed
- Tests: 1 failed, 3 passed
- Failure reason: `authorizations.GET` returned the current `authorizationContexts` field, while the stale unit test used exact equality without that field.

## Implementation Evidence

- Updated `tests/unit/phase-8-student-authorization-redeem-runtime.test.ts` to include the current `authorizationContexts` response contract.
- Preserved the numeric id safety intent by asserting the serialized response does not contain a bare `"id"` key.
- Stabilized `tests/unit/playwright-config-baseline.test.ts` after full-suite timeout reproduced:
  - exported `shouldReuseExistingPlaywrightServer` from `playwright.config.ts`;
  - changed the unit test to use a static import and pure helper assertions instead of repeatedly resetting modules and dynamically importing the full Playwright config.

## GREEN Evidence

### Focused Student Authorization Runtime Test

Command:

```powershell
npm.cmd run test:unit -- tests/unit/phase-8-student-authorization-redeem-runtime.test.ts
```

Result:

- PASS
- Test files: 1 passed
- Tests: 4 passed

### Focused Student Authorization + Playwright Config Tests

Command:

```powershell
npm.cmd run test:unit -- tests/unit/playwright-config-baseline.test.ts tests/unit/phase-8-student-authorization-redeem-runtime.test.ts
```

Result:

- PASS
- Test files: 2 passed
- Tests: 6 passed

### Full Unit Gate

Command:

```powershell
npm.cmd run test:unit
```

Result:

- PASS
- Test files: 239 passed
- Tests: 856 passed

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

### Build

Command:

```powershell
npm.cmd run build
```

Result:

- PASS
- Next.js 16.2.6 compiled successfully and generated static pages.
- Build output noted `.env.local` presence from Next.js, but this task did not read or print secret contents.

### Whitespace Check

Command:

```powershell
git diff --check
```

Result:

- PASS

## Residual Risk

- L5 local e2e validation was intentionally not run in this P1 unit-gate task.
- Next step is a separate L5 local e2e validation task using the fresh Playwright server and existing specs only.
