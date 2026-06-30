# Security Dependency Supply-Chain Remaining Gate Candidate Task Plan

## Task

- Task id: `security-dependency-supply-chain-remaining-gate-candidate-2026-06-30`
- Branch: `codex/security-dependency-supply-chain-remaining-gate-20260630`
- Goal: recheck remaining dependency supply-chain risk after package-manager, Vite/esbuild toolchain, deprecated
  transitive, install-script policy, and regression coverage gates have closed.
- Non-goals: no source or test edits, no DB connection or mutation, no schema/migration/seed, no Provider/AI call or
  configuration, no env/secret/credential access, no browser/e2e/dev server, no staging/prod/cloud/deploy, no release
  readiness, no final Pass, no Cost Calibration, no PR, and no force-push.

## Required Read List

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/03-standards/open-source-introduction.md`
- `docs/02-architecture/adr/**`
- `docs/04-agent-system/sop/dependency-introduction-gate.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/evidence/2026-06-29-security-dependency-supply-chain-inventory.md`
- `docs/05-execution-logs/evidence/2026-06-29-security-dependency-public-advisory-lookup.md`
- `docs/05-execution-logs/evidence/2026-06-29-security-unit-a-dependency-package-advisory-remediation.md`
- `docs/05-execution-logs/evidence/2026-06-29-security-dev-toolchain-advisory-remediation-gate.md`
- `docs/05-execution-logs/evidence/2026-06-30-security-dependency-deprecated-transitive-remediation-gate.md`
- `docs/05-execution-logs/evidence/2026-06-30-security-dependency-install-script-policy-decision.md`
- `docs/05-execution-logs/evidence/2026-06-30-test-acceptance-regression-coverage-reinforcement-candidate.md`
- `package.json`, `pnpm-lock.yaml`, and `pnpm-workspace.yaml`

## Writable Scope

- `package.json`
- `pnpm-lock.yaml`
- `pnpm-workspace.yaml`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/01-requirements/traceability/2026-06-30-security-dependency-supply-chain-remaining-gate-candidate.md`
- `docs/05-execution-logs/task-plans/2026-06-30-security-dependency-supply-chain-remaining-gate-candidate.md`
- `docs/05-execution-logs/evidence/2026-06-30-security-dependency-supply-chain-remaining-gate-candidate.md`
- `docs/05-execution-logs/audits-reviews/2026-06-30-security-dependency-supply-chain-remaining-gate-candidate.md`
- `docs/05-execution-logs/acceptance/2026-06-30-security-dependency-supply-chain-remaining-gate-candidate.md`

## Boundaries

- Dependency: package/workspace/lockfile changes are allowed only after the current recheck confirms a current
  actionable public advisory or supply-chain issue and only for minimal existing dependency or lockfile remediation. No
  new dependency is allowed without a new gate.
- Package manager: no install, update, remove, audit fix, or lockfile refresh before recheck. If a fix is required,
  use lockfile-only resolution with `--ignore-scripts`; lifecycle script execution remains blocked.
- Network: public advisory and public registry metadata lookup only for scoped packages; no private registry, registry
  token, credential, or package download except conditional lockfile resolution if a fix is required.
- DB: no database connection, no raw rows, no mutation, no schema/migration/seed, no `drizzle-kit push`.
- AI/Provider: no Provider call, no Provider configuration, no model config read/write, no prompt payload, no raw AI I/O.
- Browser: no browser runtime, no dev server, no e2e, no raw DOM, no screenshots, no traces.
- Credentials: no env, secrets, connection strings, account credentials, cookies, tokens, sessions, localStorage,
  Authorization headers, registry tokens, or private registry URLs.
- Evidence: record package names, versions, advisory IDs, severity/status/counts, dependency chains, policy decisions,
  validation commands, and redacted summaries only.

## Execution Plan

1. Confirm state, queue, and this task plan are materialized before advisory lookup or package writes.
2. Recheck current package-manager/toolchain/deprecated-transitive/install-script surfaces from current manifests and
   prior evidence.
3. Run public advisory/registry metadata checks for scoped current versions.
4. Decide whether a current actionable dependency or lockfile remediation exists.
5. If remediation is required, make the smallest package/lockfile/workspace change using `--ignore-scripts`; otherwise
   close with no package change.
6. Run declared validation, record evidence/audit/acceptance/traceability, then commit, fast-forward merge, push, and
   cleanup under `securityFollowupCentralApproval20260630`.

## Validation Commands

```powershell
rg -n "security-dependency-supply-chain-remaining-gate-candidate-2026-06-30|securityFollowupCentralApproval20260630|releaseReadinessClaimed: false|finalPassClaimed: false|costCalibrationExecuted: false" docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/evidence/2026-06-30-security-dependency-supply-chain-remaining-gate-candidate.md docs/05-execution-logs/acceptance/2026-06-30-security-dependency-supply-chain-remaining-gate-candidate.md
rg -n "\"packageManager\"|\"pnpm\"|\"overrides\"|\"vite\"|\"esbuild\"|\"drizzle-kit\"|\"shadcn\"" package.json pnpm-lock.yaml pnpm-workspace.yaml
rg -n "deprecated:|hasBin:|requiresBuild:|ignoredBuiltDependencies" pnpm-lock.yaml pnpm-workspace.yaml
public advisory recheck summary for current pnpm vite esbuild and remaining deprecated transitive package set
npm.cmd view pnpm@10.34.4 version
npm.cmd view pnpm@11.9.0 version engines --json
node -v
npm.cmd view vite@8.1.0 version
npm.cmd view esbuild@0.28.1 version
conditional only if remediation is required: corepack pnpm install --lockfile-only --ignore-scripts
npm.cmd run lint
npm.cmd run typecheck
conditional only if package_or_lockfile_changed: npm.cmd run test:unit
npx.cmd prettier --write --ignore-unknown package.json pnpm-lock.yaml pnpm-workspace.yaml docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/01-requirements/traceability/2026-06-30-security-dependency-supply-chain-remaining-gate-candidate.md docs/05-execution-logs/task-plans/2026-06-30-security-dependency-supply-chain-remaining-gate-candidate.md docs/05-execution-logs/evidence/2026-06-30-security-dependency-supply-chain-remaining-gate-candidate.md docs/05-execution-logs/audits-reviews/2026-06-30-security-dependency-supply-chain-remaining-gate-candidate.md docs/05-execution-logs/acceptance/2026-06-30-security-dependency-supply-chain-remaining-gate-candidate.md
npx.cmd prettier --check --ignore-unknown package.json pnpm-lock.yaml pnpm-workspace.yaml docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/01-requirements/traceability/2026-06-30-security-dependency-supply-chain-remaining-gate-candidate.md docs/05-execution-logs/task-plans/2026-06-30-security-dependency-supply-chain-remaining-gate-candidate.md docs/05-execution-logs/evidence/2026-06-30-security-dependency-supply-chain-remaining-gate-candidate.md docs/05-execution-logs/audits-reviews/2026-06-30-security-dependency-supply-chain-remaining-gate-candidate.md docs/05-execution-logs/acceptance/2026-06-30-security-dependency-supply-chain-remaining-gate-candidate.md
git diff --check
git diff --name-only -- src tests scripts src/db drizzle migrations seed e2e playwright-report test-results .next .env package-lock.yaml package-lock.json
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId security-dependency-supply-chain-remaining-gate-candidate-2026-06-30
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId security-dependency-supply-chain-remaining-gate-candidate-2026-06-30
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId security-dependency-supply-chain-remaining-gate-candidate-2026-06-30 -SkipRemoteAheadCheck
```

## Closeout Policy

If validation passes, local commit, fast-forward merge to `master`, push to `origin/master`, and cleanup of the merged
short branch are approved by `securityFollowupCentralApproval20260630`.

This is not release readiness, not a final Pass, and not Cost Calibration.
