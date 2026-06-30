# Security Package Manager Advisory Remediation Gate Traceability

## Task

- Task id: `security-package-manager-advisory-remediation-gate-2026-06-29`
- Branch: `codex/package-manager-advisory-remediation-20260629`
- Human approval: current user authorized this task and explicitly required rechecking before fixing.
- Source finding: `security-dependency-public-advisory-lookup-2026-06-29` recorded prior `pnpm` package-manager advisory matches.

## Requirement Mapping

| Requirement                             | Evidence target                                                                                 | Status |
| --------------------------------------- | ----------------------------------------------------------------------------------------------- | ------ |
| Recheck before remediation              | Current declared `packageManager` version and public advisory lookup                            | pass   |
| Avoid blind dependency/package mutation | No `package.json` change unless the current declared package manager version remains vulnerable | pass   |
| Keep remediation minimal                | No package metadata change was needed after recheck                                             | pass   |
| Preserve dependency gate evidence       | Dependency gate record includes package, purpose, risk, validation, and human approval          | pass   |
| Keep forbidden surfaces blocked         | No source/test/script/DB/Provider/browser/e2e/release/final Pass/Cost Calibration work          | pass   |

## Decision

- Current declared package manager: `pnpm@10.34.4`.
- Prior predecessor evidence for `pnpm@10.33.4` was reproduced as vulnerable by OSV count comparison.
- Current `pnpm@10.34.4` produced one OSV candidate for `GHSA-gj8w-mvpf-x27x`, but public advisory detail places `10.34.4` outside the actual affected 10.x and 11.x ranges.
- Remediation result: no `package.json` change required.

## Boundary

- Writable package scope: `package.json` only.
- Writable governance scope: state, queue, traceability, task plan, evidence, audit review, and acceptance for this task.
- Lockfile/workspace files are read-only and must not change.
