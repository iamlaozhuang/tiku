# fix-playwright-stale-server-risk Evidence

## Scope

- Branch: `codex/fix-playwright-stale-server-risk`
- Task kind: `implementation`
- User approval: implement the serial closeout and repair plan; each task may commit, fast-forward merge into `master`, push `origin/master`, and clean up the short branch.
- Blocked areas respected: no dependency, lockfile, schema, migration, env/secret, provider, deploy, payment, external-service, e2e execution, PR, force-push, or Cost Calibration Gate work.

## Implementation Evidence

- Changed `playwright.config.ts` so `webServer.reuseExistingServer` defaults to `false`.
- Added explicit temporary local opt-in through `TIKU_PLAYWRIGHT_REUSE_EXISTING_SERVER=1`.
- Added `tests/unit/playwright-config-baseline.test.ts` to assert:
  - default local config starts a fresh server;
  - existing-server reuse is only enabled by explicit environment opt-in.

## Validation

### Focused Unit Test

Command:

```powershell
npm.cmd run test:unit -- tests/unit/playwright-config-baseline.test.ts
```

Result:

- PASS
- Test files: 1 passed
- Tests: 2 passed

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

- Full Playwright e2e/L5 browser validation was intentionally not run in this task.
- `TIKU_PLAYWRIGHT_REUSE_EXISTING_SERVER=1` remains available for temporary local diagnostics only and must not be treated as formal L5 evidence.
