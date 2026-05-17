# 本地 CI 与质量门禁规范 (Local CI)

## Status

Active.

## Current Gates

The current repository has these scripts:

- `npm run lint`
- `npm run typecheck`
- `npm run test:unit`
- `npm run format:check`

For frontend behavior, routing, browser compatibility, or build-system changes, also run the relevant broader gate:

- `npm run build`
- `npm run test:e2e`
- `npm run test`

Do not claim full end-to-end coverage unless `test:e2e` or `test` was run successfully.

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
npm.cmd run lint-staged
npm.cmd run lint
npm.cmd run typecheck
```

If a new worktree does not have `node_modules`, install dependencies with the existing lockfile:

```powershell
corepack pnpm@10 install --frozen-lockfile
```

This must not change `package.json` or `pnpm-lock.yaml`.

## Line Ending And Format Stability

The repository enforces LF line endings through `.gitattributes`:

```text
* text=auto eol=lf
```

This rule is part of the formatting gate. It prevents Windows `core.autocrlf=true` checkouts from making `prettier --check .` fail on a fresh worktree.

Before declaring a formatting baseline healthy, verify it in a freshly created worktree based on the target branch. A pass in an old local worktree is not enough evidence.

## Evidence Requirements

Evidence must record each command that was run and whether it passed, failed, or was intentionally skipped. Use this wording when a gate is not run:

```text
lint: pass/fail
typecheck: pass/fail
test:unit: pass/fail
format:check: pass/fail
build: skipped, reason
test:e2e: skipped, reason
```
