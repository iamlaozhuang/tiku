# Security Dependency Install Script Policy Decision Traceability

- Task id: `security-dependency-install-script-policy-decision-2026-06-30`
- Branch: `codex/security-install-script-policy-20260630`
- Scope: docs/state-only local install-script and binary policy decision
- Status: closed_pass
- Result: pass_install_script_policy_decision_no_package_or_script_execution

## Requirement Alignment

| Requirement                               | Status | Evidence                                                                                                                                            |
| ----------------------------------------- | ------ | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| Materialize task before execution         | pass   | `project-state.yaml`, `task-queue.yaml`, and task plan contain task-scoped boundaries before policy closeout                                        |
| Recheck current issue before decision     | pass   | Current manifest/lock/workspace evidence was rechecked read-only                                                                                    |
| Keep lifecycle scripts blocked by default | pass   | Policy decision keeps install, build, postinstall, CLI binary, and package script execution blocked unless a future task explicitly materializes it |
| Keep package and lockfile unchanged       | pass   | `package.json`, `pnpm-lock.yaml`, and `pnpm-workspace.yaml` had no task diff                                                                        |
| Keep evidence redacted                    | pass   | Evidence records counts, package names for existing ignored built dependencies, command names, and status only                                      |
| Preserve release boundaries               | pass   | No release readiness, final Pass, Cost Calibration, staging/prod/cloud, deploy, PR, or force-push action is authorized or claimed                   |

## Current Local Evidence Index

| Surface                              | Current Result           |
| ------------------------------------ | ------------------------ |
| lockfile `hasBin` entries            | 46                       |
| lockfile `requiresBuild` entries     | 0                        |
| workspace ignored built dependencies | `sharp`, `unrs-resolver` |
| root package scripts                 | 14                       |
| package/lockfile/workspace changed   | false                    |
| package manager mutation executed    | false                    |
| lifecycle script or binary execution | false                    |
| network advisory or registry lookup  | false                    |

## Policy Decision

- Default install behavior: keep lifecycle scripts blocked unless a future task explicitly materializes script execution.
- Lockfile-only dependency resolution behavior: require a task-specific dependency gate and `--ignore-scripts` unless script execution receives fresh explicit approval.
- Workspace built dependency policy: keep the existing `sharp` and `unrs-resolver` ignored built dependency entries unchanged in this task.
- Root package scripts: only task-declared validation commands may execute.
- Package manager mutation: blocked in this task.

## Follow-Up Boundary

Any future install-script execution, package-manager mutation, lockfile refresh, workspace policy change, package/lockfile edit, or dependency remediation must have its own task-scoped `allowedFiles`, `blockedFiles`, DB boundary, AI/Provider boundary, browser boundary, credential boundary, evidence redaction, validation commands, and `closeoutPolicy`.
