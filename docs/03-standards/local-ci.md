# 本地 CI 与质量门禁规范 (Local CI)

## Status

Active.

## Current Gates

The current repository has these scripts:

- `npm run lint`
- `npm run typecheck`
- `npm run test:unit`
- `npm run format:check`

The current repository also has read-only agent checks:

- `.\scripts\agent-system\Test-AgentSystemReadiness.ps1`
- `.\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`
- `.\scripts\agent-system\Test-NamingConventions.ps1`

For frontend behavior, routing, browser compatibility, or build-system changes, also run the relevant broader gate:

- `npm run build`
- `npm run test:e2e`
- `npm run test`

Do not claim full end-to-end coverage unless `test:e2e` or `test` was run successfully.

## Required Commands Before Handoff

Run:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-AgentSystemReadiness.ps1
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-NamingConventions.ps1
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

Each new evidence file should also include a compact `Summary` near the top:

```text
result: pass/fail/blocked/pending validation
scope: read_only/docs_only/implementation/local_verification/closeout/blocked_gate
changed surfaces: short list
gates: lint/typecheck/test/build/e2e/readiness/git inventory
forbiddenScope: env/dependency/schema/migration/staging/prod/cloud/deploy/real provider
residualGaps: none or gap ids
```

The summary is an index for humans and future agents. The detailed command records below it remain the source of truth.

```text
lint: pass/fail
typecheck: pass/fail
test:unit: pass/fail
format:check: pass/fail
naming: pass/fail
build: skipped, reason
test:e2e: skipped, reason
```

Git closeout evidence must also record:

```text
branch: current task branch
base: intended merge or compare base
changed files: tracked/staged/untracked inventory
commit: sha or skipped, reason
merge: target branch and result, or skipped, reason
push: remote branch and result, or skipped, reason
cleanup: worktree/branch cleanup result, or skipped, reason
```

When possible, append repeated command results with:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Add-TaskEvidenceResult.ps1 -EvidencePath <evidence.md> -Command '<command>' -Result pass -Summary '<summary>'
```

Use manual sections for interpretation, risk acceptance, and security review verdicts. The helper is a consistency tool, not a replacement for engineering judgment.
