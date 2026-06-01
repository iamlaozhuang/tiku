# Phase 22 Local App Boot Smoke Evidence

## Summary

- Result: pass with fallback.
- Scope: local_verification.
- Changed surfaces: evidence only.
- Gates: direct background start attempted; Playwright webServer boot smoke pass.
- Forbidden scope (`forbiddenScope`): no env value capture, dependency/script/source/test/e2e/schema/drizzle change, DB reset, raw SQL, destructive data, staging/prod/cloud/deploy, real provider, or external service.
- Residual gaps (`residualGaps`): direct `Start-Process` background launch failed on this host because of a local PowerShell environment dictionary conflict; existing Playwright `webServer` launch path verified the local app successfully.

## Validation Results

### Direct background dev server start

Command:

```text
Start-Process npm.cmd run dev -- --hostname 127.0.0.1
```

Result: non-blocking fallback.

Sanitized summary: the local PowerShell host raised an environment dictionary conflict before creating the process. No server was started by this command, and no env values were read or recorded.

### Playwright webServer boot smoke

Command:

```text
npm.cmd run test:e2e -- e2e/home.spec.ts
```

Result: pass.

Output summary:

```text
Running 1 test using 1 worker
ok e2e/home.spec.ts loads the root navigation page
1 passed
```

Interpretation: the repository's existing Playwright `webServer` mechanism started the local dev server at `http://127.0.0.1:3000`, loaded the root page, and verified the local app was reachable.

## Evidence Hygiene

Server logs may be summarized only after redaction. Do not record `.env.local` values, DB URLs, credentials, tokens, provider payloads, raw prompts, raw answers, or raw model responses.
