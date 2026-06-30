# Security Dependency Script Binary Policy Gate Task Plan

## Task

- Task id: `security-dependency-script-binary-policy-gate-2026-06-29`
- Branch: `codex/security-dependency-script-binary-policy-gate-20260630`
- Goal: close the legacy blocked install-script and binary policy gate after centralized fresh approval, current
  policy-surface recheck, and superseding 2026-06-30 evidence review.
- Non-goals: no package, lockfile, or workspace change; no dependency install/update/remove/audit fix; no lifecycle
  script, package script, build script, postinstall, prepare, CLI binary, or generated binary execution; no source/test
  edits; no DB; no Provider/AI; no browser/e2e/dev server; no staging/prod/cloud/deploy; no release readiness; no final
  Pass; no Cost Calibration; no PR; no force-push.

## Required Read List

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/**`
- `docs/04-agent-system/sop/dependency-introduction-gate.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/evidence/2026-06-29-security-dependency-install-script-binary-surface-review.md`
- `docs/05-execution-logs/evidence/2026-06-30-security-dependency-install-script-policy-decision.md`
- `package.json`, `pnpm-lock.yaml`, and `pnpm-workspace.yaml` as read-only inputs.

## Writable Scope

- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/2026-06-30-security-dependency-script-binary-policy-gate.md`
- `docs/05-execution-logs/evidence/2026-06-30-security-dependency-script-binary-policy-gate.md`
- `docs/05-execution-logs/audits-reviews/2026-06-30-security-dependency-script-binary-policy-gate.md`
- `docs/05-execution-logs/acceptance/2026-06-30-security-dependency-script-binary-policy-gate.md`

## Boundaries

- Dependency: `package.json`, `pnpm-lock.yaml`, and `pnpm-workspace.yaml` are read-only for this closeout unless a new
  current actionable policy gap is found and separately recorded.
- Script/binary: no lifecycle script, package script, build script, postinstall, prepare, CLI binary, generated binary,
  or package-manager mutation may execute.
- Network: no advisory lookup, registry metadata lookup, package download, private registry, or registry token access.
- DB: no database connection, raw rows, mutation, schema/migration/seed, or `drizzle-kit push`.
- AI/Provider: no Provider call, Provider configuration, model config read/write, prompt payload, or raw AI I/O.
- Browser: no browser runtime, dev server, e2e, raw DOM, screenshots, or traces.
- Credentials: no env, secrets, connection strings, account credentials, cookies, tokens, sessions, localStorage,
  Authorization headers, registry tokens, or private registry URLs.
- Evidence: record counts, policy decisions, command names, file paths, branch/commit/merge/push/cleanup summaries only.

## Execution Plan

1. Materialize state, queue, and this task plan before any policy-surface recheck.
2. Recheck `hasBin`, `requiresBuild`, `ignoredBuiltDependencies`, and root package script markers read-only.
3. Compare with superseding 2026-06-30 policy decision evidence.
4. If no new current actionable gap exists, close as
   `closed_no_current_actionable_dependency_script_binary_policy_gap_confirmed`.
5. Run declared local validation and Module Run v2 gates.
6. Commit, fast-forward merge to `master`, push `origin/master`, and delete the merged short branch under
   `blockedGatesCentralFreshApproval20260630`.

## Validation Commands

```powershell
rg -n "hasBin:|requiresBuild:|ignoredBuiltDependencies" pnpm-lock.yaml pnpm-workspace.yaml
rg -n "\"scripts\"|\"postinstall\"|\"prepare\"|\"build\"|\"lint\"|\"typecheck\"|\"test" package.json
npm.cmd run lint
npm.cmd run typecheck
npx.cmd prettier --write --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-06-30-security-dependency-script-binary-policy-gate.md docs/05-execution-logs/evidence/2026-06-30-security-dependency-script-binary-policy-gate.md docs/05-execution-logs/audits-reviews/2026-06-30-security-dependency-script-binary-policy-gate.md docs/05-execution-logs/acceptance/2026-06-30-security-dependency-script-binary-policy-gate.md
npx.cmd prettier --check --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-06-30-security-dependency-script-binary-policy-gate.md docs/05-execution-logs/evidence/2026-06-30-security-dependency-script-binary-policy-gate.md docs/05-execution-logs/audits-reviews/2026-06-30-security-dependency-script-binary-policy-gate.md docs/05-execution-logs/acceptance/2026-06-30-security-dependency-script-binary-policy-gate.md
git diff --check
git diff --name-only -- package.json pnpm-lock.yaml pnpm-workspace.yaml src tests scripts src/db drizzle migrations seed e2e playwright-report test-results .next .env docs/04-agent-system/state/archive docs/04-agent-system/state/task-history-index.yaml package-lock.yaml package-lock.json
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId security-dependency-script-binary-policy-gate-2026-06-29
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId security-dependency-script-binary-policy-gate-2026-06-29
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId security-dependency-script-binary-policy-gate-2026-06-29 -SkipRemoteAheadCheck
```

## Closeout Policy

If validation passes, local commit, fast-forward merge to `master`, push to `origin/master`, and cleanup of the merged
short branch are approved by `blockedGatesCentralFreshApproval20260630`.

This is not release readiness, not a final Pass, and not Cost Calibration.
