# Security Dependency Public Advisory Lookup Audit Review

- Task id: `security-dependency-public-advisory-lookup-2026-06-29`
- Branch: `codex/security-dependency-public-advisory-lookup-20260629`
- Review status: approved
- Date: `2026-06-29`

## Scope Review

| Check                                                 | Status | Notes                                                                                        |
| ----------------------------------------------------- | ------ | -------------------------------------------------------------------------------------------- |
| State/queue/task plan materialized before lookup      | pass   | task boundary was written before public advisory network lookup                              |
| Required standards, ADRs, and dependency gate read    | pass   | AGENTS, code taste, open-source standard, ADRs, state/queue, and dependency SOP read         |
| Package/lockfile/workspace edits avoided              | pass   | manifest/workspace/lockfile surfaces were read-only                                          |
| Dependency install/update/remove/audit fix avoided    | pass   | no package manager dependency mutation command executed                                      |
| Package download/private registry access avoided      | pass   | public advisory sources only                                                                 |
| Source/test/schema/migration edits avoided            | pass   | blocked by task boundary                                                                     |
| DB connection/raw row/mutation avoided                | pass   | no DB action                                                                                 |
| Provider/AI call avoided                              | pass   | Provider budget remained zero                                                                |
| Browser/dev server/runtime avoided                    | pass   | no browser, dev server, Vite, esbuild serve, or runtime execution                            |
| Release readiness/final Pass/Cost Calibration avoided | pass   | all remain blocked                                                                           |
| Sensitive evidence avoided                            | pass   | evidence records package names, versions, ids, links, severities, counts, and summaries only |

## Findings

- 57 scoped package/version rows were checked against public advisory sources.
- 18 advisory records matched: 14 for `pnpm@10.33.4`, 2 for `vite@8.0.13`, 1 for `esbuild@0.18.20`, and 1 for `esbuild@0.28.0`.
- No direct runtime dependency version matched a public advisory in this scoped OSV package/version lookup.
- No package, lockfile, workspace, source, test, schema, or migration change was made.
- No dev server, browser, Provider, DB, package manager mutation, dependency script, or binary execution was performed.

## Residual Risk

- This was a scoped public advisory lookup, not a full 1163-entry transitive audit.
- `pnpm` package-manager advisories are high-priority because install and lockfile handling are governance-critical, but changing package-manager or lockfile state is outside this task.
- `vite` and `esbuild` advisories are relevant to developer-toolchain/dev-server surfaces. Runtime exploitability was not tested because dev server/browser execution is blocked here.
- Any package-manager, dependency, package, lockfile, workspace, or script policy change requires a separate dependency gate task and fresh approval.

## Audit Result

APPROVE: public advisory lookup findings and blocked remediation gate split are recorded. Scoped formatting, diff check, and Module Run v2 pre-commit hardening passed. No package/lockfile change, dependency mutation, source/test change, DB, Provider, browser/dev-server, release readiness, final Pass, or Cost Calibration conclusion is made.
