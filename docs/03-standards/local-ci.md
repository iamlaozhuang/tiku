# 本地 CI 与质量门禁规范 (Local CI)

## Status

Active.

## Current Gates

The current repository has these scripts:

- `npm run lint`
- `npm run typecheck`

The desired but not yet available gate is:

- `npm run test`

Until the test tooling decision is approved and implemented, agents must report the status as:

```text
lint: pass/fail
typecheck: pass/fail
test: missing
```

Do not claim full test coverage or full local CI completion while `test` is missing.

## Required Commands Before Handoff

Run:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-AgentSystemReadiness.ps1
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Invoke-QualityGate.ps1
```

For frontend or build-system changes, also run:

```powershell
npm.cmd run build
```

## Hook Behavior

The current pre-commit hook runs:

```powershell
npm run lint
npm run typecheck
```

If a new worktree does not have `node_modules`, install dependencies with the existing lockfile:

```powershell
& 'C:\Program Files\Git\bin\sh.exe' -lc 'pnpm install --frozen-lockfile'
```

This must not change `package.json` or `pnpm-lock.yaml`.

## Future Gate Requirements

Phase 1 must select and approve test tooling before adding a `test` script. The decision must specify:

- Unit test tool.
- Component or route-handler test approach.
- Browser or end-to-end test approach.
- Commands to run locally and in CI.
- Human approval evidence for added dependencies.
