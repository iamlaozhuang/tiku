# Phase 22 Local App Boot Smoke Plan

## Scope

Start the existing local dev server and verify `http://127.0.0.1:3000` is reachable.

## Steps

1. Check whether port `3000` is already listening.
2. Start `npm.cmd run dev -- --hostname 127.0.0.1` in a hidden local process if needed.
3. Poll `http://127.0.0.1:3000` until the app responds or timeout.
4. Record only sanitized server/log observations.
5. Keep the server available for later child tasks, then stop it during closeout.

## Stop Conditions

Stop dependent runtime tasks if the app cannot boot or if boot requires env edits, dependency changes, migration repair, raw SQL, destructive data, or external services.
