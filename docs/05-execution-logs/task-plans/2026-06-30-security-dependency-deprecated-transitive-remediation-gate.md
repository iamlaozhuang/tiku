# Security Dependency Deprecated Transitive Remediation Gate Task Plan

## Task

- Task id: `security-dependency-deprecated-transitive-remediation-gate-2026-06-30`
- Branch: `codex/security-dep-transitive-gate-20260630`
- Goal: recheck current deprecated transitive dependency status and perform only necessary minimal dependency metadata or package/lockfile remediation.
- Non-goals: no source or test edits, no DB connection or mutation, no schema/migration/seed, no Provider/AI call or configuration, no env/secret/credential access, no browser/e2e/dev server, no staging/prod/cloud/deploy, no release readiness, no final Pass, no Cost Calibration, no PR, and no force-push.

## Required Read List

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/03-standards/open-source-introduction.md`
- `docs/02-architecture/adr/**`
- `docs/04-agent-system/sop/dependency-introduction-gate.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/2026-06-30-security-remaining-inventory-triage.md`
- `docs/05-execution-logs/evidence/2026-06-30-security-remaining-inventory-triage.md`
- `docs/05-execution-logs/audits-reviews/2026-06-30-security-remaining-inventory-triage.md`
- `docs/05-execution-logs/acceptance/2026-06-30-security-remaining-inventory-triage.md`
- `docs/05-execution-logs/task-plans/2026-06-29-security-dependency-deprecated-transitive-review.md`
- `docs/05-execution-logs/evidence/2026-06-29-security-dependency-deprecated-transitive-review.md`
- `docs/05-execution-logs/audits-reviews/2026-06-29-security-dependency-deprecated-transitive-review.md`
- `docs/05-execution-logs/acceptance/2026-06-29-security-dependency-deprecated-transitive-review.md`
- `docs/01-requirements/traceability/2026-06-29-security-dependency-deprecated-transitive-review.md`

## Writable Scope

- `package.json`
- `pnpm-lock.yaml`
- `pnpm-workspace.yaml`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/01-requirements/traceability/2026-06-30-security-dependency-deprecated-transitive-remediation-gate.md`
- `docs/05-execution-logs/task-plans/2026-06-30-security-dependency-deprecated-transitive-remediation-gate.md`
- `docs/05-execution-logs/evidence/2026-06-30-security-dependency-deprecated-transitive-remediation-gate.md`
- `docs/05-execution-logs/audits-reviews/2026-06-30-security-dependency-deprecated-transitive-remediation-gate.md`
- `docs/05-execution-logs/acceptance/2026-06-30-security-dependency-deprecated-transitive-remediation-gate.md`

## Boundaries

- Dependency: `package.json`, `pnpm-lock.yaml`, and `pnpm-workspace.yaml` may change only after the recheck confirms a current deprecated transitive issue and only for minimal direct dependency or lockfile remediation. No new dependency is allowed without a new gate.
- Package manager: no install, update, remove, audit fix, or lockfile refresh before recheck. If a fix is required, use lockfile-only resolution with `--ignore-scripts`; lifecycle script execution remains blocked.
- Network: public registry and public advisory metadata lookup only for scoped packages; no private registry, registry token, credentials, or package download except lockfile resolution if a fix is required.
- DB: no database connection, no raw rows, no mutation, no schema/migration/seed, no `drizzle-kit push`.
- AI/Provider: no Provider call, no Provider configuration, no model config read/write, no prompt payload, no raw AI I/O.
- Browser: no browser runtime, no dev server, no e2e, no raw DOM, no screenshots, no traces.
- Credentials: no env, secrets, connection strings, account credentials, cookies, tokens, sessions, localStorage, Authorization headers, registry tokens, or private registry URLs.
- Evidence: record package names, versions, dependency chains, deprecation status, public metadata status, advisory IDs if any, counts, validation commands, and redacted summaries only.

## Execution Plan

1. Confirm the current task is materialized in state and queue before registry lookup or package/lockfile write.
2. Recheck current lockfile `deprecated:` entries and direct dependency chains.
3. Query public registry metadata for scoped packages and record redacted status summaries only.
4. Decide whether minimal remediation is necessary.
5. If remediation is necessary, use the smallest package/lockfile change and `--ignore-scripts`; otherwise close with no dependency change.
6. Run declared validation, write evidence/audit/acceptance/traceability, then commit, fast-forward merge, push, and cleanup under `securityFollowupCentralApproval20260630`.

## Validation Commands

```powershell
rg -n "deprecated:" pnpm-lock.yaml
rg -n "@esbuild-kit/esm-loader|@esbuild-kit/core-utils|node-domexception|drizzle-kit|shadcn|node-fetch|fetch-blob" package.json pnpm-lock.yaml pnpm-workspace.yaml
npm.cmd view drizzle-kit@latest version dependencies --json
npm.cmd view shadcn@latest version dependencies --json
npm.cmd view @esbuild-kit/esm-loader@2.6.5 version deprecated --json
npm.cmd view @esbuild-kit/core-utils@3.3.2 version deprecated --json
npm.cmd view node-domexception@1.0.0 version deprecated --json
conditional only if remediation is required: corepack pnpm install --lockfile-only --ignore-scripts
npm.cmd run lint
npm.cmd run typecheck
conditional only if package_or_lockfile_changed: npm.cmd run test:unit
npx.cmd prettier --write --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/01-requirements/traceability/2026-06-30-security-dependency-deprecated-transitive-remediation-gate.md docs/05-execution-logs/task-plans/2026-06-30-security-dependency-deprecated-transitive-remediation-gate.md docs/05-execution-logs/evidence/2026-06-30-security-dependency-deprecated-transitive-remediation-gate.md docs/05-execution-logs/audits-reviews/2026-06-30-security-dependency-deprecated-transitive-remediation-gate.md docs/05-execution-logs/acceptance/2026-06-30-security-dependency-deprecated-transitive-remediation-gate.md
npx.cmd prettier --check --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/01-requirements/traceability/2026-06-30-security-dependency-deprecated-transitive-remediation-gate.md docs/05-execution-logs/task-plans/2026-06-30-security-dependency-deprecated-transitive-remediation-gate.md docs/05-execution-logs/evidence/2026-06-30-security-dependency-deprecated-transitive-remediation-gate.md docs/05-execution-logs/audits-reviews/2026-06-30-security-dependency-deprecated-transitive-remediation-gate.md docs/05-execution-logs/acceptance/2026-06-30-security-dependency-deprecated-transitive-remediation-gate.md
git diff --check
git diff --name-only -- src tests scripts src/db drizzle migrations seed e2e playwright-report test-results .next .env package-lock.yaml package-lock.json
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId security-dependency-deprecated-transitive-remediation-gate-2026-06-30
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId security-dependency-deprecated-transitive-remediation-gate-2026-06-30
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId security-dependency-deprecated-transitive-remediation-gate-2026-06-30 -SkipRemoteAheadCheck
```

## Closeout Policy

If validation passes, local commit, fast-forward merge to `master`, push to `origin/master`, and cleanup of the merged short branch are approved by `securityFollowupCentralApproval20260630`.

This is not release readiness, not a final Pass, and not Cost Calibration.
