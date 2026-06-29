# Security Dependency Deprecated Transitive Review Evidence

- Task id: `security-dependency-deprecated-transitive-review-2026-06-29`
- Branch: `codex/security-dependency-deprecated-transitive-review-20260629`
- Evidence status: pass
- result: pass
- Result: pass_dependency_deprecated_transitive_review_task_split_no_dependency_change
- Updated at: `2026-06-29T14:33:19-07:00`
- Cost Calibration Gate remains blocked.
- threadRolloverGate: not required for this offline dependency review.
- localFullLoopGate: pass for scoped formatting, diff check, Module Run v2 pre-commit hardening, closeout readiness, and pre-push readiness before local closeout.

## Boundary Confirmation

- Source/test/schema/migration/package/lockfile files changed: false.
- Dependency install/update/remove/audit-fix executed: false.
- Network advisory lookup, registry metadata lookup, package download, or public CVE/GHSA lookup executed: false.
- Browser/runtime/dev server executed: false.
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
- `docs/05-execution-logs/evidence/2026-06-29-security-db-migration-policy-reconciliation.md`: read.
- `package.json`, `pnpm-lock.yaml`, and `pnpm-workspace.yaml`: read-only.

## Deprecated Entry Evidence

| Command / Source                                                          | Status | Redacted Result                                                                                               |
| ------------------------------------------------------------------------- | ------ | ------------------------------------------------------------------------------------------------------------- |
| `rg -n "deprecated:" pnpm-lock.yaml`                                      | pass   | 3 deprecated lockfile entries found                                                                           |
| local lockfile parent mapping                                             | pass   | `drizzle-kit` chain accounts for two entries; `shadcn`/`node-fetch`/`fetch-blob` chain accounts for one entry |
| `git diff --name-only -- package.json pnpm-lock.yaml pnpm-workspace.yaml` | pass   | no output; manifest/workspace/lockfile unchanged                                                              |

## Finding Summary

| Id           | Package                   | Version | Severity | Status            | Evidence Summary                                                                         |
| ------------ | ------------------------- | ------- | -------- | ----------------- | ---------------------------------------------------------------------------------------- |
| dep-depr-001 | `@esbuild-kit/esm-loader` | 2.6.5   | medium   | remediation_gated | Deprecated in lockfile and pulled by direct dev dependency `drizzle-kit@0.31.10`.        |
| dep-depr-002 | `@esbuild-kit/core-utils` | 3.3.2   | medium   | remediation_gated | Deprecated in lockfile and pulled through `@esbuild-kit/esm-loader@2.6.5`.               |
| dep-depr-003 | `node-domexception`       | 1.0.0   | medium   | remediation_gated | Deprecated in lockfile and pulled through `fetch-blob` from `node-fetch` under `shadcn`. |

## Review Conclusion

- The review found 3 deprecated transitive entries.
- This does not establish 3 confirmed security vulnerabilities.
- No current CVE/GHSA/public advisory lookup was executed, so current advisory status remains unknown in this task.
- Any dependency remediation needs a separate dependency gate task because package/lockfile changes and package manager mutation remain blocked here.

## Batch Evidence

- Batch range: single offline deprecated transitive dependency review.
- Source/test/schema/migration/package/lockfile files changed: 0.
- Governance docs/state files changed or created: 7.
- Runtime execution: none.
- Dependency install/update/remove/fix execution: none.
- Network advisory execution: none.
- Future task candidates recorded: remediation gate package plus existing advisory lookup and install-script/binary surface reviews.

## RED Evidence

- RED: not applicable for this review-only task.
- Reason: no dependency change, source/test repair, runtime flow, or advisory lookup was authorized or performed.
- Regression evidence consulted: dependency inventory, dependency introduction gate, ADRs, and lockfile/manifest context only.

## GREEN Evidence

- GREEN: not applicable for this review-only task.
- Review result: deprecated transitive entries were identified and mapped to local dependency chains without package/lockfile mutation.
- Verification result: scoped governance validation passed.

## Validation Results

| Command                                                                   | Status | Redacted Result                                     |
| ------------------------------------------------------------------------- | ------ | --------------------------------------------------- |
| `rg -n "deprecated:" pnpm-lock.yaml`                                      | pass   | 3 entries found                                     |
| `git diff --name-only -- package.json pnpm-lock.yaml pnpm-workspace.yaml` | pass   | no package/lockfile/workspace changes               |
| `npx.cmd prettier --write --ignore-unknown ...`                           | pass   | scoped docs/state files formatted                   |
| `npx.cmd prettier --check --ignore-unknown ...`                           | pass   | scoped docs/state files passed formatting check     |
| `git diff --check`                                                        | pass   | no whitespace errors                                |
| `Test-ModuleRunV2PreCommitHardening.ps1`                                  | pass   | scope and sensitive evidence scans passed           |
| `Test-ModuleRunV2ModuleCloseoutReadiness.ps1`                             | pass   | closeout readiness passed                           |
| `Test-ModuleRunV2PrePushReadiness.ps1 -SkipRemoteAheadCheck`              | pass   | local git readiness and evidence/audit paths passed |

## Batch Commit Evidence

- Base commit: `27830bde241e9d6e886ea323ec4a36c2363bc6f4`.
- Commit: `27830bde241e9d6e886ea323ec4a36c2363bc6f4`
- Commit scope: docs/state-only deprecated transitive dependency review, traceability, evidence, audit review, acceptance, task plan, project state, and task queue updates.

## Local Full Loop Gate

- localFullLoopGate: pass for scoped formatting, diff check, Module Run v2 pre-commit hardening, closeout readiness, and pre-push readiness before local closeout.
- Runtime execution: skipped by task boundary.
- Source/test/schema/migration/package/lockfile changes: none.
- DB, Provider, browser, dependency install/update/remove/fix, schema/migration/seed, release, final Pass, Cost Calibration, PR, and force-push actions: none.

## Automation Handoff Policy

- automationHandoffPolicy: no unattended release readiness, final Pass, Cost Calibration, staging smoke, Provider, DB, dependency change, network advisory lookup, schema/migration/seed, PR, force-push, browser runtime, or sensitive evidence capture is allowed from this task.
- Future execution must use task-specific materialized allowedFiles, blockedFiles, dependency boundary, network boundary, DB boundary, AI/Provider boundary, credential boundary, evidence redaction rules, validation commands, and closeoutPolicy.

## Next Module Run Candidate

Recommended next smallest local no-network task:
`security-dependency-install-script-binary-surface-review-2026-06-29`.

Owner may choose `security-dependency-public-advisory-lookup-2026-06-29` first if current CVE/GHSA status is prioritized. That would require an explicit network-read-only boundary and still would not approve dependency fix, install, package change, Provider execution, browser runtime, release readiness, final Pass, or Cost Calibration.

## Blocked Remainder

Release readiness, final Pass, Cost Calibration, staging smoke, staging/prod/cloud/deploy, PR, force-push, DB connection, schema/migration/seed, raw DB rows, Provider/AI calls, Provider/model configuration, prompts, Provider payloads, raw AI input/output, browser/runtime/dev-server, dependency install/update/remove/fix, package/lockfile changes, network advisory lookup, private credentials, env/secret/connection strings, registry tokens, account sessions, cookies, tokens, localStorage, Authorization headers, raw DOM, screenshots, traces, and sensitive evidence capture remain blocked.
