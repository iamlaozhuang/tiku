# Security Dependency Deprecated Transitive Remediation Gate Evidence

- Task id: `security-dependency-deprecated-transitive-remediation-gate-2026-06-30`
- Branch: `codex/security-dep-transitive-gate-20260630`
- Evidence status: pass.
- Result: pass.
- Result detail: pass_current_deprecated_transitive_rechecked_no_safe_minimal_package_or_lockfile_change_available.
- Cost Calibration Gate remains blocked.

## Boundary Confirmation

- Source or test changed: false.
- Package, lockfile, or workspace changed: false.
- Dependency install, update, remove, audit fix, package-manager mutation, or lifecycle script executed: false.
- Public registry metadata lookup executed: true, scoped to package names and versions listed in task plan.
- Database access, raw row read, mutation, schema, migration, seed, or `drizzle-kit push` executed: false.
- Provider/AI call, Provider configuration, model config read/write, prompt payload, or raw AI I/O executed: false.
- Browser/dev-server/e2e/raw DOM/screenshot/trace executed: false.
- Credential, cookie, token, session, localStorage, Authorization header, env, secret, registry token, private registry URL, or connection string evidence recorded: false.
- Release readiness, final Pass, deployment, staging/prod/cloud, PR, force-push, or Cost Calibration claimed/executed: false.

## Recheck Results

| Check                                            | Result | Redacted summary                                                                                  |
| ------------------------------------------------ | ------ | ------------------------------------------------------------------------------------------------- |
| `rg -n "deprecated:" pnpm-lock.yaml`             | pass   | Current lockfile has 2 deprecated entries.                                                        |
| current dependency chain grep                    | pass   | Both current deprecated entries are under `drizzle-kit@0.31.10` and `@esbuild-kit/esm-loader`.    |
| `drizzle-kit@latest` public metadata             | pass   | Latest is current direct version and still declares `@esbuild-kit/esm-loader`.                    |
| `shadcn@latest` public metadata                  | pass   | Latest is current direct version; prior `node-domexception` chain is not present in current lock. |
| `@esbuild-kit/esm-loader@latest` public metadata | pass   | Latest is still deprecated and depends on `@esbuild-kit/core-utils`.                              |
| `@esbuild-kit/core-utils@latest` public metadata | pass   | Latest is still deprecated.                                                                       |
| `node-domexception@1.0.0` public metadata        | pass   | Package remains deprecated, but there is no current lockfile hit.                                 |

## Finding Decision

| Finding      | Package                   | Version | Current status          | Decision                                             |
| ------------ | ------------------------- | ------- | ----------------------- | ---------------------------------------------------- |
| dep-depr-001 | `@esbuild-kit/esm-loader` | 2.6.5   | still_present           | no safe minimal local remediation; upstream blocked  |
| dep-depr-002 | `@esbuild-kit/core-utils` | 3.3.2   | still_present           | no safe minimal local remediation; upstream blocked  |
| dep-depr-003 | `node-domexception`       | 1.0.0   | no_current_lockfile_hit | closed by current lockfile state; no action required |

## Validation Results

| Command                                                                                                                                                                    | Result  | Redacted summary                                                         |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------- | ------------------------------------------------------------------------ |
| `rg -n "deprecated:" pnpm-lock.yaml`                                                                                                                                       | pass    | 2 entries found.                                                         |
| `rg -n "@esbuild-kit/esm-loader\|@esbuild-kit/core-utils\|node-domexception\|drizzle-kit\|shadcn\|node-fetch\|fetch-blob" package.json pnpm-lock.yaml pnpm-workspace.yaml` | pass    | Dependency chain rechecked without raw install output.                   |
| `npm.cmd view drizzle-kit@latest version dependencies --json`                                                                                                              | pass    | Public metadata shows current latest still declares chain.               |
| `npm.cmd view shadcn@latest version dependencies --json`                                                                                                                   | pass    | Public metadata checked; prior chain no longer current.                  |
| `npm.cmd view @esbuild-kit/esm-loader@2.6.5 version deprecated --json`                                                                                                     | pass    | Public metadata confirms deprecated status.                              |
| `npm.cmd view @esbuild-kit/core-utils@3.3.2 version deprecated --json`                                                                                                     | pass    | Public metadata confirms deprecated status.                              |
| `npm.cmd view node-domexception@1.0.0 version deprecated --json`                                                                                                           | pass    | Public metadata checked; no current lockfile hit.                        |
| `conditional only if remediation is required: corepack pnpm install --lockfile-only --ignore-scripts`                                                                      | skipped | Not executed because no safe minimal remediation was found.              |
| `npm.cmd run lint`                                                                                                                                                         | pass    | ESLint passed.                                                           |
| `npm.cmd run typecheck`                                                                                                                                                    | pass    | TypeScript check passed.                                                 |
| `conditional only if package_or_lockfile_changed: npm.cmd run test:unit`                                                                                                   | skipped | Not executed because package/lockfile/workspace did not change.          |
| `npx.cmd prettier --write --ignore-unknown ...`                                                                                                                            | pass    | Scoped docs/state formatting completed.                                  |
| `npx.cmd prettier --check --ignore-unknown ...`                                                                                                                            | pass    | Scoped docs/state formatting check passed.                               |
| `git diff --check`                                                                                                                                                         | pass    | No whitespace errors.                                                    |
| `git diff --name-only -- src tests scripts src/db drizzle migrations seed e2e playwright-report test-results .next .env package-lock.yaml package-lock.json`               | pass    | No blocked path output.                                                  |
| `Test-ModuleRunV2PreCommitHardening.ps1`                                                                                                                                   | pass    | Module Run v2 pre-commit hardening passed.                               |
| `Test-ModuleRunV2ModuleCloseoutReadiness.ps1`                                                                                                                              | pass    | Passed after evidence status and validation anchors were recorded.       |
| `Test-ModuleRunV2PrePushReadiness.ps1 -SkipRemoteAheadCheck`                                                                                                               | pass    | Module Run v2 pre-push readiness passed with remote-ahead check skipped. |

## RED Evidence

- RED: current lockfile still has deprecated transitive entries under the `drizzle-kit` chain.
- RED: prior `node-domexception` entry from the 2026-06-29 review no longer has a current lockfile hit.

## GREEN Evidence

- GREEN: package/lockfile/workspace were left unchanged because the latest direct package still declares the deprecated chain and no safe minimal local remediation exists.
- GREEN: lint and typecheck passed with no package or lockfile mutation.

## Thread Rollover Decision

- threadRolloverGate: no rollover required before this task closes.
- Recovery source if interrupted: state, queue, this evidence, and the task plan.

## Next Module Run

- nextModuleRunCandidate: `security-dependency-install-script-policy-decision-2026-06-30`.

## Batch Evidence

- batchEvidence: dependency deprecated transitive remediation gate rechecked current package metadata and closed without package or lockfile mutation.
- Batch range: single dependency gate `security-dependency-deprecated-transitive-remediation-gate-2026-06-30`.
- Batch type: dependency gate recheck, no package change.
- Commit: `d3c61260b12d97eb330f43622db8f0d0679357f1` pre-task master base; task commit is created only after closeout validation passes.
- localFullLoopGate: pass after scoped local governance validation.

## Blocked Remainder

Release readiness, final Pass, Cost Calibration, staging smoke, staging/prod/cloud/deploy, PR, force-push, DB
connection, schema/migration/seed, raw DB rows, Provider/AI calls, Provider/model configuration, prompts, raw AI I/O,
browser/runtime/dev-server/e2e, source/test changes, credentials, env/secret/connection strings, registry tokens,
private registry URLs, account sessions, cookies, tokens, localStorage, Authorization headers, raw DOM, screenshots,
traces, and sensitive evidence capture remain blocked.
