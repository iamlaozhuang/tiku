# Security Dependency Install Script Binary Surface Review Traceability

- Task id: `security-dependency-install-script-binary-surface-review-2026-06-29`
- Branch: `codex/security-dependency-install-script-binary-surface-review-20260629`
- Scope: offline dependency CLI/bin and built dependency policy review
- Network advisory lookup: blocked in this task
- Dependency script execution: blocked in this task
- Package or lockfile change: blocked in this task
- Status: closed_pass

## Governance Boundary

| Boundary                                      | Status       | Evidence                                                                                                  |
| --------------------------------------------- | ------------ | --------------------------------------------------------------------------------------------------------- |
| Task materialized before lockfile review      | pass         | `project-state.yaml`, `task-queue.yaml`, and task plan were materialized before dependency surface review |
| Package/lockfile/workspace modification       | not executed | `package.json`, `pnpm-lock.yaml`, and `pnpm-workspace.yaml` were read-only                                |
| Dependency install/update/remove/audit fix    | not executed | no package manager dependency mutation command executed                                                   |
| Dependency lifecycle script or CLI execution  | not executed | no package script, dependency binary, install script, or build script executed                            |
| Network advisory/registry lookup              | not executed | current CVE/GHSA/public advisory status remains split to a separately scoped task                         |
| Source/test/schema/migration modification     | not executed | blocked by task boundary                                                                                  |
| DB connection/raw row/mutation                | not executed | blocked by task boundary                                                                                  |
| Provider/AI execution                         | not executed | Provider budget remained zero                                                                             |
| Browser/dev server/runtime                    | not executed | blocked by task boundary                                                                                  |
| Release readiness/final Pass/Cost Calibration | not executed | all gates remain blocked                                                                                  |
| Sensitive evidence capture                    | not executed | evidence records package names, versions, surface counts, and redacted summaries only                     |

## Surface Index

| Surface                                    | Count / Status | Local Evidence                                                                                          |
| ------------------------------------------ | -------------- | ------------------------------------------------------------------------------------------------------- |
| lockfile `hasBin` entries                  | 47             | `pnpm-lock.yaml`                                                                                        |
| unique package names with `hasBin`         | 42             | derived from `pnpm-lock.yaml`                                                                           |
| direct runtime packages with `hasBin`      | 2              | `next`, `shadcn`                                                                                        |
| direct dev packages with `hasBin`          | 8              | `@playwright/test`, `drizzle-kit`, `eslint`, `husky`, `lint-staged`, `prettier`, `typescript`, `vitest` |
| transitive package entries with `hasBin`   | 37             | lockfile-derived transitive tooling surface                                                             |
| lockfile `requiresBuild` entries           | 0              | `rg -n "requiresBuild:" pnpm-lock.yaml` had no matches                                                  |
| workspace ignored built dependency entries | 2              | `sharp`, `unrs-resolver`                                                                                |
| root package scripts                       | 14             | `package.json` script names inspected read-only                                                         |

## Findings Matrix

| Id          | Risk Family                       | Severity | Status              | Evidence Summary                                                                                                 | Follow-up                                                                           |
| ----------- | --------------------------------- | -------- | ------------------- | ---------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| dep-bin-001 | CLI/bin execution surface         | medium   | policy_watch        | 47 lockfile `hasBin` entries, including 10 direct packages and 37 transitive entries.                            | `security-dependency-script-binary-policy-gate-2026-06-29`                          |
| dep-bin-002 | dependency install/build surface  | medium   | policy_watch        | `requiresBuild` entries are 0, while workspace ignores built dependency scripts for `sharp` and `unrs-resolver`. | `security-dependency-script-binary-policy-gate-2026-06-29`                          |
| dep-bin-003 | root script execution surface     | medium   | covered_watch       | `package.json` contains 14 scripts; this task did not execute scripts.                                           | Future runtime/test tasks must declare script commands explicitly.                  |
| dep-bin-004 | install helper transitive surface | medium   | needs_scoped_review | `napi-postinstall` appears as a CLI/bin-capable transitive package under the local lockfile graph.               | `security-dependency-public-advisory-lookup-2026-06-29` for current advisory status |

## Risk Classification

- The review found a broad CLI/bin surface typical of a modern Next.js toolchain.
- No dependency lifecycle script or CLI binary was executed, so this task does not prove runtime behavior.
- No package manager mutation was executed, so install-time behavior remains untested by design.
- No current CVE/GHSA/public advisory lookup was executed because this task is offline and forbids network lookup.
- Existing `ignoredBuiltDependencies` policy is a supply-chain control surface and should stay behind a fresh policy gate if changed.

## Task Split

| Future Task Id                                                          | Type                    | Suggested Priority | Approval Needed                                                                           |
| ----------------------------------------------------------------------- | ----------------------- | ------------------ | ----------------------------------------------------------------------------------------- |
| `security-dependency-public-advisory-lookup-2026-06-29`                 | read-only network audit | p1                 | explicit network-read-only materialization; no install/fix/package/lockfile change        |
| `security-dependency-script-binary-policy-gate-2026-06-29`              | dependency policy gate  | p2                 | fresh approval before package/lockfile/workspace policy change or script/binary execution |
| `security-dependency-deprecated-transitive-remediation-gate-2026-06-29` | dependency gate package | p2                 | fresh dependency gate approval before any package or lockfile change                      |

## Next Recommended Task

The next dependency-security task is `security-dependency-public-advisory-lookup-2026-06-29` if the owner wants current vulnerability/advisory status. It requires separately materialized network-read-only scope.

Without network approval, the next safe work should return to another local docs/source-read-only queue item under the same governance constraints.
