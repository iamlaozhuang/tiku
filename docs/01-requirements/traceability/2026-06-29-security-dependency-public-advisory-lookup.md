# Security Dependency Public Advisory Lookup Traceability

- Task id: `security-dependency-public-advisory-lookup-2026-06-29`
- Branch: `codex/security-dependency-public-advisory-lookup-20260629`
- Scope: public advisory read-only lookup for scoped package/version set
- Package or lockfile change: blocked
- Dependency install/update/remove/audit fix: blocked
- Status: closed_pass

## Governance Boundary

| Boundary                                      | Status       | Evidence                                                                                                     |
| --------------------------------------------- | ------------ | ------------------------------------------------------------------------------------------------------------ |
| Task materialized before public lookup        | pass         | `project-state.yaml`, `task-queue.yaml`, and task plan were materialized before network advisory lookup      |
| Package/lockfile/workspace modification       | not executed | `package.json`, `pnpm-lock.yaml`, and `pnpm-workspace.yaml` remained read-only                               |
| Dependency install/update/remove/audit fix    | not executed | no package manager mutation or audit-fix command executed                                                    |
| Package download or private registry access   | not executed | lookup used public advisory sources only                                                                     |
| Source/test/schema/migration modification     | not executed | blocked by task boundary                                                                                     |
| DB connection/raw row/mutation                | not executed | blocked by task boundary                                                                                     |
| Provider/AI execution                         | not executed | Provider budget remained zero                                                                                |
| Browser/dev server/runtime                    | not executed | no browser, e2e, dev server, or runtime action                                                               |
| Release readiness/final Pass/Cost Calibration | not executed | all gates remain blocked                                                                                     |
| Sensitive evidence capture                    | not executed | evidence records package names, versions, advisory ids, links, severity, status, and redacted summaries only |

## Source Method

| Source                         | Use                                                                                      |
| ------------------------------ | ---------------------------------------------------------------------------------------- |
| OSV `/v1/querybatch`           | Package/version match for scoped npm package set                                         |
| OSV `/v1/vulns/{id}`           | Public advisory detail summary for matched ids                                           |
| GitHub Advisory Database pages | Public cross-check for matched GHSA ids and severity/affected range summaries            |
| NVD public pages               | Reserved for CVE cross-reference only; no per-CVE NVD enrichment was needed in this task |

## Scoped Package Set

| Set                                      | Count | Result summary                                               |
| ---------------------------------------- | ----- | ------------------------------------------------------------ |
| direct runtime dependencies              | 17    | 0 matched advisories                                         |
| direct development dependencies          | 20    | 0 matched advisories                                         |
| prior flagged deprecated/binary packages | 13    | 2 matched `esbuild` advisories                               |
| package-manager/build parent additions   | 7     | 14 matched `pnpm` advisories and 2 matched `vite` advisories |
| total package/version checks             | 57    | 18 matched advisory records                                  |

This is not a full 1163-entry transitive audit.

## Finding Matrix

| Id          | Package / Version       | Severity summary             | Status                    | Evidence summary                                                                                          | Follow-up                                                       |
| ----------- | ----------------------- | ---------------------------- | ------------------------- | --------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------- |
| dep-adv-001 | `pnpm@10.33.4`          | 8 high, 6 moderate           | remediation_gate_required | Public OSV/GHSA lookup matched 14 advisories affecting the declared package manager version.              | `security-package-manager-advisory-remediation-gate-2026-06-29` |
| dep-adv-002 | `vite@8.0.13`           | 1 high, 1 moderate           | remediation_gate_required | Public OSV/GHSA lookup matched 2 advisories affecting the transitive Vite toolchain version.              | `security-dev-toolchain-advisory-remediation-gate-2026-06-29`   |
| dep-adv-003 | `esbuild@0.18.20`       | 1 moderate                   | remediation_gate_required | Public lookup matched a dev-server advisory; local graph shows this version under `@esbuild-kit` tooling. | `security-dev-toolchain-advisory-remediation-gate-2026-06-29`   |
| dep-adv-004 | `esbuild@0.28.0`        | 1 low                        | remediation_gate_required | Public lookup matched a Windows dev-server advisory; local graph shows this version under Vite tooling.   | `security-dev-toolchain-advisory-remediation-gate-2026-06-29`   |
| dep-adv-005 | direct runtime packages | no matched advisory in scope | covered_watch             | OSV package/version lookup found no matched advisory for the 17 direct runtime dependency versions.       | continue through future dependency reviews                      |
| dep-adv-006 | direct dev packages     | no matched advisory in scope | covered_watch             | OSV package/version lookup found no matched advisory for the 20 direct dev dependency versions.           | continue through future dependency reviews                      |

## Matched Advisory Index

| Package   | Version | Advisory ids                                                                                                                                                                                                                                                                                                                     |
| --------- | ------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `pnpm`    | 10.33.4 | `GHSA-3qhv-2rgh-x77r`, `GHSA-4gxm-v5v7-fqc4`, `GHSA-54hh-g5mx-jqcp`, `GHSA-5wx6-mg75-v57r`, `GHSA-72r4-9c5j-mj57`, `GHSA-cjhr-43r9-cfmw`, `GHSA-fr4h-3cph-29xv`, `GHSA-gj8w-mvpf-x27x`, `GHSA-hwx4-2j3j-g496`, `GHSA-p4xf-rf54-rj3x`, `GHSA-q6j5-fjx5-2mc3`, `GHSA-qrv3-253h-g69c`, `GHSA-rxhj-4m44-96r4`, `GHSA-w466-c33r-3gjp` |
| `vite`    | 8.0.13  | `GHSA-fx2h-pf6j-xcff`, `GHSA-v6wh-96g9-6wx3`                                                                                                                                                                                                                                                                                     |
| `esbuild` | 0.18.20 | `GHSA-67mh-4wv8-2f99`                                                                                                                                                                                                                                                                                                            |
| `esbuild` | 0.28.0  | `GHSA-g7r4-m6w7-qqqr`                                                                                                                                                                                                                                                                                                            |

## Remediation Task Split

| Future Task Id                                                  | Type                    | Suggested Priority | Approval Needed                                                                                            |
| --------------------------------------------------------------- | ----------------------- | ------------------ | ---------------------------------------------------------------------------------------------------------- |
| `security-package-manager-advisory-remediation-gate-2026-06-29` | dependency gate package | p0                 | fresh approval for package-manager version decision, package/lockfile or toolchain changes, and validation |
| `security-dev-toolchain-advisory-remediation-gate-2026-06-29`   | dependency gate package | p1                 | fresh dependency approval before any Vite/esbuild/drizzle-kit/vitest/toolchain package or lockfile change  |

## Next Recommended Task

Next safe step is `security-package-manager-advisory-remediation-gate-2026-06-29`, but it must remain blocked until fresh dependency/package-manager approval is recorded.
