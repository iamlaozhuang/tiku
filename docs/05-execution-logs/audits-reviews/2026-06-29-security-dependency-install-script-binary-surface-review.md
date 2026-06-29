# Security Dependency Install Script Binary Surface Review Audit Review

- Task id: `security-dependency-install-script-binary-surface-review-2026-06-29`
- Branch: `codex/security-dependency-install-script-binary-surface-review-20260629`
- Review status: approved
- Date: `2026-06-29`

## Scope Review

| Check                                                 | Status | Notes                                                                                  |
| ----------------------------------------------------- | ------ | -------------------------------------------------------------------------------------- |
| State/queue/task plan materialized before review      | pass   | current branch contains task-scoped docs/state materialization                         |
| Required standards, ADRs, and dependency gate read    | pass   | AGENTS, code taste, open-source standard, ADRs, state/queue, and dependency SOP read   |
| Package/lockfile/workspace edits avoided              | pass   | manifest/workspace/lockfile surfaces were read-only                                    |
| Dependency install/update/remove/audit fix avoided    | pass   | no package manager dependency mutation command executed                                |
| Dependency script or CLI execution avoided            | pass   | no lifecycle script, package script, build script, postinstall, or binary was executed |
| Network advisory lookup avoided                       | pass   | no registry, CVE, GHSA, or public advisory lookup executed                             |
| Source/test/schema/migration edits avoided            | pass   | blocked by task boundary                                                               |
| DB connection/raw row/mutation avoided                | pass   | no DB action                                                                           |
| Provider/AI call avoided                              | pass   | Provider budget remained zero                                                          |
| Browser/dev server/runtime avoided                    | pass   | no browser or runtime action                                                           |
| Release readiness/final Pass/Cost Calibration avoided | pass   | all remain blocked                                                                     |
| Sensitive evidence avoided                            | pass   | evidence records package names, versions, surface counts, and redacted summaries only  |

## Findings

- `pnpm-lock.yaml` contains 47 `hasBin` entries across 42 unique package names.
- Direct CLI/bin-capable packages are expected framework/tooling packages: `next`, `shadcn`, `@playwright/test`, `drizzle-kit`, `eslint`, `husky`, `lint-staged`, `prettier`, `typescript`, and `vitest`.
- `pnpm-lock.yaml` contains 0 `requiresBuild` entries.
- `pnpm-workspace.yaml` records ignored built dependency policy for `sharp` and `unrs-resolver`.
- No package/lockfile/workspace/source/test/schema/migration change was made.
- No script, binary, package manager mutation, or current public advisory lookup was executed.
- A separate script/binary policy gate task was seeded so any policy change or script execution remains behind fresh approval.

## Residual Risk

- CLI/bin and install-script surfaces are execution risk indicators, not confirmed vulnerability findings by themselves.
- Current CVE/GHSA/NPM advisory status is still unknown until the public advisory lookup task is explicitly materialized.
- Install-time behavior was not tested because dependency installation and lifecycle scripts are blocked in this task.
- Any package, lockfile, workspace policy, install, or binary execution change requires a separate task and approval evidence.

## Audit Result

APPROVE: No blocking findings for this docs/state-only offline dependency install-script/binary surface review. Scoped formatting, diff check, and Module Run v2 governance gates are recorded in evidence. No release readiness, final Pass, or Cost Calibration conclusion is made.
