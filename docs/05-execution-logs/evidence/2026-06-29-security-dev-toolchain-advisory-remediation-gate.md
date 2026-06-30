# Security Dev Toolchain Advisory Remediation Gate Evidence

- Task id: `security-dev-toolchain-advisory-remediation-gate-2026-06-29`
- Branch: `codex/security-dev-toolchain-advisory-remediation-20260629`
- Evidence status: pass
- Result: pass
- Detailed result: pass_current_vite_esbuild_toolchain_advisory_rechecked_no_package_change_needed
- Cost Calibration Gate remains blocked.

## Boundary Confirmation

- Source/test/script/schema/migration files changed: false.
- Package metadata changed: false.
- Lockfile/workspace files changed: false.
- Dependency install/update/remove/audit-fix executed: false.
- Lifecycle script execution: false.
- DB connection/read/write/raw row/schema/migration/seed executed: false.
- Provider/AI call or configuration executed: false.
- Browser/dev-server/e2e executed: false.
- Release readiness, final Pass, staging/prod/cloud/deploy, PR, force-push, or Cost Calibration executed or claimed: false.

## Recheck Evidence

| Check                      | Result | Redacted summary                                                                                                                        |
| -------------------------- | ------ | --------------------------------------------------------------------------------------------------------------------------------------- |
| Current package metadata   | pass   | `package.json` and `pnpm-lock.yaml` currently resolve `vite@8.1.0`, `esbuild@0.28.1`, `vitest@4.1.9`, and `@vitejs/plugin-react@6.0.3`. |
| Public advisory recheck    | pass   | OSV package/version query returned zero matched advisories for the current candidate versions.                                          |
| Prior finding reproduction | pass   | Prior evidence versions still reproduce the expected advisory ids: Vite two ids, esbuild 0.18.x one id, esbuild 0.28.0 one id.          |
| Remediation decision       | pass   | No package or lockfile mutation needed because current candidate versions are outside the matched affected ranges.                      |

## Public Source Recheck Summary

| Source                    | Result                                                                                                              |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| OSV query API             | Public package/version query was used for current and prior evidence versions.                                      |
| OSV `GHSA-fx2h-pf6j-xcff` | Vite 8.x affected range is fixed at `8.0.16`; current `8.1.0` is outside the range.                                 |
| OSV `GHSA-v6wh-96g9-6wx3` | Vite 8.x affected range is fixed at `8.0.16`; current `8.1.0` is outside the range.                                 |
| OSV `GHSA-67mh-4wv8-2f99` | esbuild affected versions are fixed at `0.25.0`; current `0.28.1` is outside the range.                             |
| OSV `GHSA-g7r4-m6w7-qqqr` | esbuild affected range is fixed at `0.28.1`; current `0.28.1` is the fixed version.                                 |
| npm metadata              | `vite@8.1.0`, `esbuild@0.28.1`, `vitest@4.1.9`, and `@vitejs/plugin-react@6.0.3` exist in public registry metadata. |

## Validation Results

| Command                                                                                                                                               | Status  | Redacted result                                                                                                                                                                |
| ----------------------------------------------------------------------------------------------------------------------------------------------------- | ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------- | ----------------------------------------------------------- | ---- | -------------------------------------------------------------------------------- |
| `rg -n "vite                                                                                                                                          | esbuild | vitest                                                                                                                                                                         | @vitejs/plugin-react | overrides" package.json pnpm-lock.yaml pnpm-workspace.yaml` | pass | Current metadata and lockfile show Vite/esbuild overrides and resolved versions. |
| Public OSV query for current Vite/esbuild/toolchain candidate versions                                                                                | pass    | Current candidate versions returned zero matched advisories; prior evidence versions reproduced expected ids.                                                                  |
| `npm.cmd view vite@8.1.0 version`                                                                                                                     | pass    | Public registry metadata returned `8.1.0`.                                                                                                                                     |
| `npm.cmd view esbuild@0.28.1 version`                                                                                                                 | pass    | Public registry metadata returned `0.28.1`.                                                                                                                                    |
| `npm.cmd view vitest@4.1.9 version`                                                                                                                   | pass    | Public registry metadata returned `4.1.9`.                                                                                                                                     |
| `npm.cmd view @vitejs/plugin-react@6.0.3 version`                                                                                                     | pass    | Public registry metadata returned `6.0.3`.                                                                                                                                     |
| `conditional only if remediation is required: corepack pnpm install --lockfile-only --ignore-scripts`                                                 | skipped | Remediation was not required, so no lockfile refresh was executed.                                                                                                             |
| `npm.cmd run lint`                                                                                                                                    | pass    | ESLint completed successfully.                                                                                                                                                 |
| `npm.cmd run typecheck`                                                                                                                               | pass    | TypeScript completed successfully.                                                                                                                                             |
| `npm.cmd run test:unit`                                                                                                                               | pass    | Initial run exceeded 184 seconds without failure output; residual Vitest processes from that run were identified and stopped, then retry passed with 319 files and 1458 tests. |
| `npx.cmd prettier --write --ignore-unknown ...`                                                                                                       | pass    | Scoped docs/state files formatted.                                                                                                                                             |
| `npx.cmd prettier --check --ignore-unknown ...`                                                                                                       | pass    | Scoped files and package/lock/workspace files passed formatting check.                                                                                                         |
| `git diff --check`                                                                                                                                    | pass    | No whitespace errors.                                                                                                                                                          |
| `git diff --name-only -- package.json pnpm-lock.yaml pnpm-workspace.yaml`                                                                             | pass    | No package or lockfile/workspace diffs.                                                                                                                                        |
| `git diff --name-only -- package-lock.yaml package-lock.json src tests scripts drizzle migrations seed e2e playwright-report test-results .next .env` | pass    | No blocked path diffs.                                                                                                                                                         |
| `Test-ModuleRunV2PreCommitHardening.ps1`                                                                                                              | pass    | Pre-commit hardening passed.                                                                                                                                                   |
| `Test-ModuleRunV2ModuleCloseoutReadiness.ps1`                                                                                                         | pass    | Module closeout readiness passed after recording the conditional lockfile-refresh skip exactly as declared.                                                                    |
| `Test-ModuleRunV2PrePushReadiness.ps1 -SkipRemoteAheadCheck`                                                                                          | pass    | Pre-push readiness passed with remote-ahead check skipped by task policy.                                                                                                      |

## Batch Evidence

- Batch range: single dev-toolchain advisory remediation gate task.
- RED: predecessor evidence recorded public advisory matches for Vite/esbuild package versions.
- GREEN: current-version recheck returned zero OSV matches for `vite@8.1.0`, `esbuild@0.28.1`, `vitest@4.1.9`, and `@vitejs/plugin-react@6.0.3`.
- localFullLoopGate: pass for current-version public advisory recheck plus lint/typecheck/unit/format/diff/Module Run v2 governance gates; no package metadata change, DB, Provider/AI, browser, e2e, release, final Pass, or Cost Calibration execution.

## Thread Rollover Decision

- threadRolloverGate: continue from project state, task queue, this evidence file, the task plan, audit review, and acceptance only.

## Automation Handoff Policy

- automationHandoffPolicy: no unattended source/test/script/DB/Provider/browser/e2e/release/final Pass/Cost Calibration work. Package and lockfile work is limited to this task and only after current-version advisory proof requires it.

## Next Module Run Candidate

- `security-followup-approval-materialization-2026-06-30` is a candidate only if the user approves the follow-up authorization packages.

## Batch Commit Evidence

- Base commit: `f8ef637e72a8202482b0946d579d9a59a33a2850`.
- Commit: to be created by governed local closeout after Module Run v2 readiness passes.
