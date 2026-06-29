# Security Dependency Deprecated Transitive Review Traceability

- Task id: `security-dependency-deprecated-transitive-review-2026-06-29`
- Branch: `codex/security-dependency-deprecated-transitive-review-20260629`
- Scope: offline deprecated transitive dependency review
- Network advisory lookup: blocked in this task
- Package or lockfile change: blocked in this task
- Status: closed_pass

## Governance Boundary

| Boundary                                      | Status       | Evidence                                                                                          |
| --------------------------------------------- | ------------ | ------------------------------------------------------------------------------------------------- |
| Task materialized before lockfile review      | pass         | `project-state.yaml`, `task-queue.yaml`, and task plan were materialized before dependency review |
| Package/lockfile modification                 | not executed | `package.json`, `pnpm-lock.yaml`, and `pnpm-workspace.yaml` were read-only                        |
| Dependency install/update/remove/audit fix    | not executed | no package manager dependency mutation command executed                                           |
| Network advisory/registry lookup              | not executed | current CVE/GHSA/public advisory status remains split to a separately scoped task                 |
| Source/test/schema/migration modification     | not executed | blocked by task boundary                                                                          |
| DB connection/raw row/mutation                | not executed | blocked by task boundary                                                                          |
| Provider/AI execution                         | not executed | Provider budget remained zero                                                                     |
| Browser/dev server/runtime                    | not executed | blocked by task boundary                                                                          |
| Release readiness/final Pass/Cost Calibration | not executed | all gates remain blocked                                                                          |
| Sensitive evidence capture                    | not executed | evidence records package names, versions, dependency areas, and redacted summaries only           |

## Deprecated Entry Index

| Id           | Package                   | Version | Direct Parent / Area                                      | Local Dependency Area | Severity | Status            |
| ------------ | ------------------------- | ------- | --------------------------------------------------------- | --------------------- | -------- | ----------------- |
| dep-depr-001 | `@esbuild-kit/esm-loader` | 2.6.5   | `drizzle-kit@0.31.10`                                     | dev DB tooling        | medium   | remediation_gated |
| dep-depr-002 | `@esbuild-kit/core-utils` | 3.3.2   | `@esbuild-kit/esm-loader@2.6.5` via `drizzle-kit@0.31.10` | dev DB tooling        | medium   | remediation_gated |
| dep-depr-003 | `node-domexception`       | 1.0.0   | `fetch-blob@3.2.0` via `node-fetch@3.3.2` and `shadcn`    | CLI/tooling surface   | medium   | remediation_gated |

## Local Evidence Mapping

| Finding      | Local Evidence Summary                                                                                                    | Follow-up                                                               |
| ------------ | ------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| dep-depr-001 | `pnpm-lock.yaml` marks `@esbuild-kit/esm-loader@2.6.5` deprecated and shows `drizzle-kit@0.31.10` depends on it.          | `security-dependency-deprecated-transitive-remediation-gate-2026-06-29` |
| dep-depr-002 | `pnpm-lock.yaml` marks `@esbuild-kit/core-utils@3.3.2` deprecated and shows it is under `@esbuild-kit/esm-loader@2.6.5`.  | `security-dependency-deprecated-transitive-remediation-gate-2026-06-29` |
| dep-depr-003 | `pnpm-lock.yaml` marks `node-domexception@1.0.0` deprecated; the local chain is `shadcn` -> `node-fetch` -> `fetch-blob`. | `security-dependency-deprecated-transitive-remediation-gate-2026-06-29` |

## Risk Classification

- The review found 3 deprecated transitive entries and 0 direct dependencies with a local `deprecated:` marker.
- No current CVE/GHSA/public advisory status was checked because this task is offline and forbids network lookup.
- No exploitability conclusion is made from deprecation markers alone.
- The `drizzle-kit` chain is relevant to DB migration tooling governance, but this task did not run DB tooling or migrations.
- The `shadcn` chain belongs to package/tooling dependency surface; dependency classification or upgrades require a separate gate.

## Task Split

| Future Task Id                                                          | Type                      | Suggested Priority | Approval Needed                                                                    |
| ----------------------------------------------------------------------- | ------------------------- | ------------------ | ---------------------------------------------------------------------------------- |
| `security-dependency-public-advisory-lookup-2026-06-29`                 | read-only network audit   | p1                 | explicit network-read-only materialization; no install/fix/package/lockfile change |
| `security-dependency-deprecated-transitive-remediation-gate-2026-06-29` | dependency gate package   | p2                 | fresh dependency gate approval before any package or lockfile change               |
| `security-dependency-install-script-binary-surface-review-2026-06-29`   | offline dependency review | p2                 | fresh manifest/lock read scope; no package manager mutation by default             |

## Next Recommended Task

The next smallest local no-network task is `security-dependency-install-script-binary-surface-review-2026-06-29`.

If current vulnerability/advisory currency is the priority, run
`security-dependency-public-advisory-lookup-2026-06-29` first with a separately materialized network-read-only boundary.
