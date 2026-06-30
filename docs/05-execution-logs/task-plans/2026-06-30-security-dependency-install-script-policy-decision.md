# Security Dependency Install Script Policy Decision Task Plan

## Task

- Task id: `security-dependency-install-script-policy-decision-2026-06-30`
- Branch: `codex/security-install-script-policy-20260630`
- Goal: decide the local install-script and binary policy posture using current manifest/lock/workspace evidence.
- Non-goals: no package or lockfile change, no dependency install/update/remove/audit fix, no lifecycle script or CLI binary execution, no source/test changes, no DB, no Provider/AI, no browser/e2e/dev server, no staging/prod/cloud/deploy, no release readiness, no final Pass, no Cost Calibration, no PR, no force-push.

## Required Read List

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/03-standards/open-source-introduction.md`
- `docs/02-architecture/adr/**`
- `docs/04-agent-system/sop/dependency-introduction-gate.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/evidence/2026-06-30-security-dependency-deprecated-transitive-remediation-gate.md`
- `docs/05-execution-logs/task-plans/2026-06-29-security-dependency-install-script-binary-surface-review.md`
- `docs/05-execution-logs/evidence/2026-06-29-security-dependency-install-script-binary-surface-review.md`
- `docs/05-execution-logs/audits-reviews/2026-06-29-security-dependency-install-script-binary-surface-review.md`
- `docs/05-execution-logs/acceptance/2026-06-29-security-dependency-install-script-binary-surface-review.md`
- `docs/01-requirements/traceability/2026-06-29-security-dependency-install-script-binary-surface-review.md`

## Writable Scope

- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/01-requirements/traceability/2026-06-30-security-dependency-install-script-policy-decision.md`
- `docs/05-execution-logs/task-plans/2026-06-30-security-dependency-install-script-policy-decision.md`
- `docs/05-execution-logs/evidence/2026-06-30-security-dependency-install-script-policy-decision.md`
- `docs/05-execution-logs/audits-reviews/2026-06-30-security-dependency-install-script-policy-decision.md`
- `docs/05-execution-logs/acceptance/2026-06-30-security-dependency-install-script-policy-decision.md`

## Read-Only Scope

- `package.json`
- `pnpm-lock.yaml`
- `pnpm-workspace.yaml`
- Governance, standards, ADR, SOP, state/queue, and predecessor evidence listed above.

## Policy Decision Candidate

- Keep lifecycle scripts blocked unless a future task explicitly materializes script execution.
- Require `--ignore-scripts` for future lockfile-only dependency resolution unless a fresh task specifically authorizes script execution.
- Keep current `ignoredBuiltDependencies` entries for `sharp` and `unrs-resolver`; no workspace policy change in this task.
- Root package scripts may run only as task-declared validation commands.
- Package manager mutation remains blocked in this task.

## Current Authorization Refresh

- The owner reconfirmed centralized approval for follow-up packages 1-9 in this thread.
- The approval remains local repair loop only and does not itself authorize any future file edit until that future task materializes exact `allowedFiles`, `blockedFiles`, DB boundary, AI/Provider boundary, browser boundary, credential boundary, evidence redaction, validation commands, and `closeoutPolicy`.
- Forbidden items remain forbidden: DB connection or mutation, schema/migration/seed, Provider/AI call or configuration, env/secrets/credentials/cookies/tokens/session/localStorage/Authorization headers, browser/e2e/raw DOM/screenshots/traces, staging/prod/cloud/deploy, release readiness, final Pass, Cost Calibration, PR, force-push, and unauthorized dependency/package changes.

## Current Recheck Result

- `hasBin` entries in the current lockfile: 46.
- `requiresBuild` entries in the current lockfile: 0.
- Current `ignoredBuiltDependencies` entries: `sharp`, `unrs-resolver`.
- Root package scripts: 14.
- Package, lockfile, and workspace modifications: none.
- Dependency install/update/remove/audit fix, lifecycle script execution, and package-manager mutation: not executed.

## Validation Commands

```powershell
rg -n "hasBin:|requiresBuild:|ignoredBuiltDependencies" pnpm-lock.yaml pnpm-workspace.yaml
rg -n "\"scripts\"|\"postinstall\"|\"prepare\"|\"build\"|\"lint\"|\"typecheck\"|\"test" package.json
git diff --name-only -- package.json pnpm-lock.yaml pnpm-workspace.yaml
npx.cmd prettier --write --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/01-requirements/traceability/2026-06-30-security-dependency-install-script-policy-decision.md docs/05-execution-logs/task-plans/2026-06-30-security-dependency-install-script-policy-decision.md docs/05-execution-logs/evidence/2026-06-30-security-dependency-install-script-policy-decision.md docs/05-execution-logs/audits-reviews/2026-06-30-security-dependency-install-script-policy-decision.md docs/05-execution-logs/acceptance/2026-06-30-security-dependency-install-script-policy-decision.md
npx.cmd prettier --check --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/01-requirements/traceability/2026-06-30-security-dependency-install-script-policy-decision.md docs/05-execution-logs/task-plans/2026-06-30-security-dependency-install-script-policy-decision.md docs/05-execution-logs/evidence/2026-06-30-security-dependency-install-script-policy-decision.md docs/05-execution-logs/audits-reviews/2026-06-30-security-dependency-install-script-policy-decision.md docs/05-execution-logs/acceptance/2026-06-30-security-dependency-install-script-policy-decision.md
git diff --check
git diff --name-only -- package.json pnpm-lock.yaml pnpm-workspace.yaml src tests scripts src/db drizzle migrations seed e2e playwright-report test-results .next .env package-lock.yaml package-lock.json
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId security-dependency-install-script-policy-decision-2026-06-30
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId security-dependency-install-script-policy-decision-2026-06-30
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId security-dependency-install-script-policy-decision-2026-06-30 -SkipRemoteAheadCheck
```

## Closeout Policy

If validation passes, local commit, fast-forward merge to `master`, push to `origin/master`, and cleanup of the merged short branch are approved by `securityFollowupCentralApproval20260630`.

This is not release readiness, not a final Pass, and not Cost Calibration.
