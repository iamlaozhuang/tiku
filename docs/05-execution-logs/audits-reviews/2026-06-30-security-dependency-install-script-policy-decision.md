# Security Dependency Install Script Policy Decision Audit Review

- Task id: `security-dependency-install-script-policy-decision-2026-06-30`
- Branch: `codex/security-install-script-policy-20260630`
- Review status: approved
- Date: `2026-06-30`

## Scope Review

| Check                                                     | Status | Notes                                                                                                         |
| --------------------------------------------------------- | ------ | ------------------------------------------------------------------------------------------------------------- |
| State/queue/task plan materialized before policy decision | pass   | Current task has scoped `allowedFiles`, `blockedFiles`, boundaries, validation commands, and `closeoutPolicy` |
| Required standards, ADRs, and dependency gate read        | pass   | AGENTS, code taste, open-source standard, ADRs, dependency SOP, state/queue, and predecessor evidence read    |
| Package/lockfile/workspace edits avoided                  | pass   | Manifest, lockfile, and workspace were read-only                                                              |
| Dependency install/update/remove/audit fix avoided        | pass   | No package manager mutation command executed                                                                  |
| Dependency script or CLI execution avoided                | pass   | No lifecycle script, package script, build script, postinstall, or binary executed                            |
| Network advisory or registry lookup avoided               | pass   | No advisory lookup, registry metadata lookup, package download, private registry, or token access             |
| Source/test/schema/migration edits avoided                | pass   | Blocked by task boundary                                                                                      |
| DB connection/raw row/mutation avoided                    | pass   | No DB action                                                                                                  |
| Provider/AI call avoided                                  | pass   | Provider budget remained zero                                                                                 |
| Browser/dev server/runtime avoided                        | pass   | No browser or runtime action                                                                                  |
| Release readiness/final Pass/Cost Calibration avoided     | pass   | All remain blocked                                                                                            |
| Sensitive evidence avoided                                | pass   | Evidence records counts, policy decisions, command names, and redacted summaries only                         |

## Findings

- Current lockfile has 46 `hasBin` entries.
- Current lockfile has 0 `requiresBuild` entries.
- Current workspace still lists ignored built dependency names `sharp` and `unrs-resolver`.
- Root package scripts total 14.
- These surfaces are supply-chain execution controls, not newly confirmed vulnerabilities in this task.
- No package, lockfile, workspace, source, test, script, schema, migration, or seed file was changed.

## Policy Review

APPROVE: keep install scripts, dependency lifecycle scripts, CLI binaries, lockfile refreshes, and package manager mutation blocked by default. Future package or install-script work must be separately materialized and must use `--ignore-scripts` for lockfile-only resolution unless fresh explicit approval authorizes script execution.

## Residual Risk

- CLI/bin-capable packages remain in the local toolchain, which is expected for a Next.js project but should stay behind task-scoped execution commands.
- Existing `ignoredBuiltDependencies` policy is left unchanged; changing it would require a separate dependency policy task.
- Advisory status for a specific package may still require a future public advisory lookup task if new evidence warrants it.

## Audit Result

APPROVE: No blocking findings for this docs/state-only policy decision. No release readiness, final Pass, or Cost Calibration conclusion is made.
