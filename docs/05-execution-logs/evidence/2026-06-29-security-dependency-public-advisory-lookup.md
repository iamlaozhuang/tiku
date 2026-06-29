# Security Dependency Public Advisory Lookup Evidence

- Task id: `security-dependency-public-advisory-lookup-2026-06-29`
- Branch: `codex/security-dependency-public-advisory-lookup-20260629`
- Evidence status: pass
- result: pass
- Result: pass_public_advisory_lookup_task_split_no_dependency_change
- Updated at: `2026-06-29T15:06:50-07:00`
- Cost Calibration Gate remains blocked.

## Boundary Confirmation

- Source/test/schema/migration/package/lockfile/workspace files changed: false.
- Dependency install/update/remove/audit-fix executed: false.
- Package manager audit-fix command executed: false.
- Package download, private registry access, or registry token use executed: false.
- Browser/runtime/dev server/e2e executed: false.
- DB connection/read/write/raw row/schema/migration/seed executed: false.
- Provider/AI call executed: false.
- Provider/model runtime configuration read or written: false.
- Prompt text, Provider payload, raw AI input/output, raw Provider error, or stack trace recorded: false.
- Account, credential, cookie, token, session, localStorage, Authorization header, env, secret, registry token, private registry URL, or connection string accessed: false.
- Raw DOM, screenshots, traces, HTML reports, raw DB rows, internal IDs, PII, email, phone, or plaintext redeem_code recorded: false.
- Release readiness, final Pass, staging/prod/cloud/deploy, PR, force-push, or Cost Calibration executed or claimed: false.

## Read Evidence

- `AGENTS.md`: read.
- `docs/03-standards/code-taste-ten-commandments.md`: read.
- `docs/03-standards/open-source-introduction.md`: read.
- `docs/02-architecture/adr/`: all ADR files read for boundary alignment.
- `docs/04-agent-system/sop/dependency-introduction-gate.md`: read.
- `docs/04-agent-system/state/project-state.yaml`: read and updated within task scope.
- `docs/04-agent-system/state/task-queue.yaml`: read and updated within task scope.
- `docs/05-execution-logs/evidence/2026-06-29-security-dependency-supply-chain-inventory.md`: read.
- `docs/05-execution-logs/evidence/2026-06-29-security-dependency-deprecated-transitive-review.md`: read.
- `docs/05-execution-logs/evidence/2026-06-29-security-dependency-install-script-binary-surface-review.md`: read.
- `package.json`, `pnpm-lock.yaml`, and `pnpm-workspace.yaml`: read-only.

## Public Source Evidence

| Source                   | Use                                               | Link                                                 |
| ------------------------ | ------------------------------------------------- | ---------------------------------------------------- |
| OSV querybatch API       | Package/version advisory lookup                   | https://google.github.io/osv.dev/post-v1-querybatch/ |
| OSV vulnerability pages  | Matched advisory detail summaries                 | https://osv.dev/vulnerability/                       |
| GitHub Advisory Database | GHSA cross-check and public advisory pages        | https://github.com/advisories?ecosystem=npm          |
| NVD                      | CVE cross-reference source when CVE aliases exist | https://nvd.nist.gov/vuln/search                     |

## Query Summary

| Query set                                | Package/version count | Matched advisory records |
| ---------------------------------------- | --------------------- | ------------------------ |
| Direct runtime dependencies              | 17                    | 0                        |
| Direct development dependencies          | 20                    | 0                        |
| Prior flagged deprecated/binary packages | 13                    | 2                        |
| Package-manager/build parent additions   | 7                     | 16                       |
| Total scoped lookup                      | 57                    | 18                       |

Notes:

- An initial local PowerShell summarizer incorrectly counted null OSV results as one match per row; that output was discarded.
- The corrected query explicitly handled null `vulns` results before counting.
- This is not a full 1163-entry transitive audit.

## Matched Advisory Summary

| Package   | Version | Advisory count | Severity summary   | Fixed-version summary                                                                             |
| --------- | ------- | -------------- | ------------------ | ------------------------------------------------------------------------------------------------- |
| `pnpm`    | 10.33.4 | 14             | 8 high, 6 moderate | fixed across `10.34.0` through `10.34.4`; some 11.x ranges fixed across `11.4.0` through `11.8.0` |
| `vite`    | 8.0.13  | 2              | 1 high, 1 moderate | fixed in `8.0.16` for both matched Vite 8.x advisory ranges                                       |
| `esbuild` | 0.18.20 | 1              | 1 moderate         | fixed in `0.25.0`                                                                                 |
| `esbuild` | 0.28.0  | 1              | 1 low              | fixed in `0.28.1`                                                                                 |

## Advisory Ids

| Package   | Version | Advisory ids                                                                                                                                                                                                                                                                                                                     |
| --------- | ------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `pnpm`    | 10.33.4 | `GHSA-3qhv-2rgh-x77r`, `GHSA-4gxm-v5v7-fqc4`, `GHSA-54hh-g5mx-jqcp`, `GHSA-5wx6-mg75-v57r`, `GHSA-72r4-9c5j-mj57`, `GHSA-cjhr-43r9-cfmw`, `GHSA-fr4h-3cph-29xv`, `GHSA-gj8w-mvpf-x27x`, `GHSA-hwx4-2j3j-g496`, `GHSA-p4xf-rf54-rj3x`, `GHSA-q6j5-fjx5-2mc3`, `GHSA-qrv3-253h-g69c`, `GHSA-rxhj-4m44-96r4`, `GHSA-w466-c33r-3gjp` |
| `vite`    | 8.0.13  | `GHSA-fx2h-pf6j-xcff`, `GHSA-v6wh-96g9-6wx3`                                                                                                                                                                                                                                                                                     |
| `esbuild` | 0.18.20 | `GHSA-67mh-4wv8-2f99`                                                                                                                                                                                                                                                                                                            |
| `esbuild` | 0.28.0  | `GHSA-g7r4-m6w7-qqqr`                                                                                                                                                                                                                                                                                                            |

## Risk Interpretation

- The direct runtime dependency set had no matched advisory in this scoped OSV package/version lookup.
- `pnpm@10.33.4` is the highest-priority finding because the repository declares it as `packageManager`.
- `vite@8.0.13` and `esbuild` findings are developer-toolchain/dev-server risk surfaces; this task did not execute dev server, browser, Vite, esbuild, or package scripts.
- Current task does not approve remediation. Package manager or dependency changes require fresh dependency gate approval and an isolated commit.

## Task Split Evidence

| Future task                                                     | Status                                                     | Purpose                                                                                        |
| --------------------------------------------------------------- | ---------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| `security-package-manager-advisory-remediation-gate-2026-06-29` | blocked_requires_fresh_dependency_package_manager_approval | Decide package-manager remediation path for `pnpm@10.33.4` advisory matches                    |
| `security-dev-toolchain-advisory-remediation-gate-2026-06-29`   | blocked_requires_fresh_dependency_approval                 | Decide dependency remediation path for `vite@8.0.13` and transitive `esbuild` advisory matches |

## Batch Evidence

- Batch range: single network-read-only public advisory lookup task.
- Scoped package/version checks: 57.
- Matched advisory records: 18.
- Source/test/schema/migration/package/lockfile/workspace files changed: 0.
- Governance docs/state files changed or created: 7.
- Dependency install/update/remove/fix execution: none.
- Dependency script/binary execution: none.
- Runtime execution: none.
- Future task candidates recorded: package-manager advisory remediation gate and dev-toolchain advisory remediation gate.

## RED Evidence

- RED: prior dependency inventory, deprecated transitive review, and install-script/binary review explicitly left current public advisory status unknown.
- RED: public advisory lookup found 18 matched advisory records in the scoped set, concentrated in `pnpm@10.33.4`, `vite@8.0.13`, and transitive `esbuild` versions.
- RED: package-manager/toolchain remediation cannot proceed under this task because dependency/package/lockfile changes remain prohibited without a fresh dependency gate approval.

## GREEN Evidence

- GREEN: task boundaries were materialized before network advisory lookup.
- GREEN: corrected OSV package/version lookup found 0 matched advisories for 17 direct runtime dependency versions and 0 matched advisories for 20 direct dev dependency versions.
- GREEN: matched package-manager and toolchain advisory records were summarized with ids, severity counts, fixed-version summaries, and public source links only.
- GREEN: remediation was split into blocked follow-up gate tasks without dependency mutation.

## Validation Results

| Command                                                                   | Status | Redacted Result                                                      |
| ------------------------------------------------------------------------- | ------ | -------------------------------------------------------------------- |
| `rg` for `OSV`, `GitHub Advisory`, `NVD`, `GHSA`, `CVE`, and `advisory`   | pass   | source links and advisory summaries present in traceability/evidence |
| `git diff --name-only -- package.json pnpm-lock.yaml pnpm-workspace.yaml` | pass   | no package, workspace, or lockfile changes                           |
| `npx.cmd prettier --write --ignore-unknown ...`                           | pass   | scoped docs/state files formatted                                    |
| `npx.cmd prettier --check --ignore-unknown ...`                           | pass   | scoped docs/state files passed formatting check                      |
| `git diff --check`                                                        | pass   | no whitespace errors                                                 |
| `Test-ModuleRunV2PreCommitHardening.ps1`                                  | pass   | scope and sensitive evidence scans passed                            |
| `Test-ModuleRunV2ModuleCloseoutReadiness.ps1`                             | pass   | closeout readiness passed after strict evidence anchor repair        |
| `Test-ModuleRunV2PrePushReadiness.ps1 -SkipRemoteAheadCheck`              | pass   | local git readiness and evidence/audit paths passed                  |

## Batch Commit Evidence

- Base commit: `c9f3a105ae8a1ec5b1a00b9e974b48faea0e82b4`.
- Commit: to_be_created_by_current_closeout_commit_after_module_closeout_readiness.
- Commit scope: docs/state-only public advisory lookup, traceability, evidence, audit review, acceptance, task plan, project state, and task queue updates.

## Local Full Loop Gate

- localFullLoopGate: pass for scoped public advisory evidence, scoped formatting, diff check, and Module Run v2 pre-commit hardening before state/queue closure.
- Runtime execution: skipped by task boundary.
- Source/test/schema/migration/package/lockfile/workspace changes: none.
- DB, Provider, browser, dependency install/update/remove/fix, dependency script/binary execution, schema/migration/seed, release, final Pass, Cost Calibration, PR, and force-push actions: none.

## Thread Rollover Decision

- threadRolloverGate: not required for this scoped public advisory lookup.
- Recovery sources are project state, task queue, this evidence, the acceptance document, and the traceability matrix.

## Automation Handoff Policy

- automationHandoffPolicy: no unattended package-manager change, dependency change, release readiness, final Pass, Cost Calibration, staging smoke, Provider, DB, schema/migration/seed, PR, force-push, browser runtime, or sensitive evidence capture is allowed from this task.
- Future remediation must use task-specific allowedFiles, blockedFiles, dependency boundary, network boundary, DB boundary, AI/Provider boundary, credential boundary, evidence redaction rules, validation commands, and closeoutPolicy.

## Next Module Run Candidate

- `security-package-manager-advisory-remediation-gate-2026-06-29`.
- Status: blocked until fresh dependency/package-manager approval is recorded.

## Blocked Remainder

Release readiness, final Pass, Cost Calibration, staging smoke, staging/prod/cloud/deploy, PR, force-push, DB connection, schema/migration/seed, raw DB rows, Provider/AI calls, Provider/model configuration, prompts, Provider payloads, raw AI input/output, browser/runtime/dev-server, dependency install/update/remove/fix, dependency script/binary execution, package/lockfile/workspace changes, private credentials, env/secret/connection strings, registry tokens, account sessions, cookies, tokens, localStorage, Authorization headers, raw DOM, screenshots, traces, and sensitive evidence capture remain blocked.
