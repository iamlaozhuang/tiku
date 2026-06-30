# Security Dependency Install Script Policy Decision Evidence

- Task id: `security-dependency-install-script-policy-decision-2026-06-30`
- Branch: `codex/security-install-script-policy-20260630`
- Evidence status: pass.
- Result: pass.
- Result detail: pass_install_script_policy_decision_no_package_or_script_execution.
- Cost Calibration Gate remains blocked.

## Boundary Confirmation

- Source or test changed: false.
- Package, lockfile, or workspace changed: false.
- Dependency install, update, remove, audit fix, package-manager mutation, lockfile refresh, or lifecycle script executed: false.
- Network advisory lookup, registry metadata lookup, package download, private registry access, or registry token access executed: false.
- Database access, raw row read, mutation, schema, migration, seed, or `drizzle-kit push` executed: false.
- Provider/AI call, Provider configuration, model config read/write, prompt payload, or raw AI I/O executed: false.
- Browser/dev-server/e2e/raw DOM/screenshot/trace executed: false.
- Credential, cookie, token, session, localStorage, Authorization header, env, secret, private account, registry token, private registry URL, or connection string evidence recorded: false.
- Release readiness, final Pass, deployment, staging/prod/cloud, PR, force-push, or Cost Calibration claimed/executed: false.

## Authorization Evidence

- Standing approval consumed: `securityFollowupCentralApproval20260630`.
- Latest owner confirmation: centralized approval for packages 1-9 is local repair loop only.
- Future task rule: each future task must first materialize exact `allowedFiles`, `blockedFiles`, DB boundary, AI/Provider boundary, browser boundary, credential boundary, evidence redaction, validation commands, and `closeoutPolicy`; then recheck and confirm the issue before minimal repair.
- Forbidden items remain forbidden as listed in state and queue.

## Recheck Results

| Check                                                                                          | Result | Redacted summary                                                                     |
| ---------------------------------------------------------------------------------------------- | ------ | ------------------------------------------------------------------------------------ |
| `rg -n "hasBin:\|requiresBuild:\|ignoredBuiltDependencies" pnpm-lock.yaml pnpm-workspace.yaml` | pass   | 46 `hasBin` entries, 0 `requiresBuild` entries, and 2 ignored built dependency names |
| `rg` for root script markers in `package.json`                                                 | pass   | Root scripts were inventoried read-only                                              |
| root script count                                                                              | pass   | 14 root package scripts                                                              |
| `pnpm-workspace.yaml` ignored built dependencies                                               | pass   | Existing names are `sharp` and `unrs-resolver`                                       |
| `git diff --name-only -- package.json pnpm-lock.yaml pnpm-workspace.yaml`                      | pass   | No output; package, lockfile, and workspace unchanged                                |
| blocked path diff                                                                              | pass   | No blocked source/test/script/db/runtime/package path output                         |

## Policy Decision

| Policy Area                         | Decision                                                                                                                |
| ----------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| Default install behavior            | Keep lifecycle scripts blocked unless a future task explicitly materializes script execution                            |
| Lockfile-only dependency resolution | Require task-specific dependency gate and `--ignore-scripts` unless fresh explicit approval authorizes script execution |
| `ignoredBuiltDependencies`          | Keep existing `sharp` and `unrs-resolver` entries unchanged                                                             |
| Root package scripts                | Only task-declared validation commands may execute                                                                      |
| Package manager mutation            | Blocked in this task                                                                                                    |

## Validation Results

| Command                                                                                                      | Result | Redacted summary                                                        |
| ------------------------------------------------------------------------------------------------------------ | ------ | ----------------------------------------------------------------------- |
| `rg -n "hasBin:\|requiresBuild:\|ignoredBuiltDependencies" pnpm-lock.yaml pnpm-workspace.yaml`               | pass   | Current policy surface rechecked                                        |
| `rg -n "\"scripts\"\|\"postinstall\"\|\"prepare\"\|\"build\"\|\"lint\"\|\"typecheck\"\|\"test" package.json` | pass   | Root script markers rechecked                                           |
| `git diff --name-only -- package.json pnpm-lock.yaml pnpm-workspace.yaml`                                    | pass   | No package/lockfile/workspace changes                                   |
| `npx.cmd prettier --write --ignore-unknown ...`                                                              | pass   | Scoped docs/state formatting completed                                  |
| `npx.cmd prettier --check --ignore-unknown ...`                                                              | pass   | Scoped docs/state formatting check passed                               |
| `git diff --check`                                                                                           | pass   | No whitespace errors                                                    |
| blocked path diff                                                                                            | pass   | No blocked path output                                                  |
| `Test-ModuleRunV2PreCommitHardening.ps1`                                                                     | pass   | Module Run v2 pre-commit hardening passed                               |
| `Test-ModuleRunV2ModuleCloseoutReadiness.ps1`                                                                | pass   | Module Run v2 closeout readiness passed                                 |
| `Test-ModuleRunV2PrePushReadiness.ps1 -SkipRemoteAheadCheck`                                                 | pass   | Module Run v2 pre-push readiness passed with remote-ahead check skipped |

## RED Evidence

- RED: prior binary-surface review identified dependency execution surfaces that should remain behind task-scoped gates.
- RED: current lockfile still has 46 `hasBin` entries and the workspace still lists 2 ignored built dependency names.

## GREEN Evidence

- GREEN: the current task kept package, lockfile, and workspace files unchanged.
- GREEN: no install, dependency mutation, lifecycle script, CLI binary, DB, Provider/AI, browser/e2e, deploy, release readiness, final Pass, or Cost Calibration action was executed.
- GREEN: policy now records that future lockfile-only resolution must use `--ignore-scripts` unless a future task explicitly authorizes script execution.

## Thread Rollover Decision

- threadRolloverGate: no rollover required before this task closes.
- Recovery source if interrupted: state, queue, this evidence, traceability, audit review, acceptance, and task plan.

## Next Module Run

- nextModuleRunCandidate: `governance-queue-closed-task-archive-candidate-2026-06-30`.

## Batch Evidence

- batchEvidence: dependency install-script policy decision closed with no package manager mutation and no script execution.
- Batch range: single docs/state-only policy task `security-dependency-install-script-policy-decision-2026-06-30`.
- Batch type: local dependency policy decision, no package change.
- Commit: `ac5a9d9487758169d3771516b85b609af2ddd4ac` pre-task master base; task commit is created only after closeout validation passes.
- localFullLoopGate: pass after scoped local governance validation.

## Blocked Remainder

Release readiness, final Pass, Cost Calibration, staging smoke, staging/prod/cloud/deploy, PR, force-push, DB
connection, schema/migration/seed, raw DB rows, Provider/AI calls, Provider/model configuration, prompts, raw AI I/O,
browser/runtime/dev-server/e2e, source/test changes, credentials, env/secret/connection strings, registry tokens,
private registry URLs, account sessions, cookies, tokens, localStorage, Authorization headers, raw DOM, screenshots,
traces, unauthorized package/lockfile/workspace changes, dependency script execution, package-manager mutation, and
sensitive evidence capture remain blocked.
