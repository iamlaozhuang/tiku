# Security Dependency Install Script Binary Surface Review Evidence

- Task id: `security-dependency-install-script-binary-surface-review-2026-06-29`
- Branch: `codex/security-dependency-install-script-binary-surface-review-20260629`
- Evidence status: pass
- result: pass
- Result: pass_dependency_install_script_binary_surface_review_task_split_no_dependency_change
- Updated at: `2026-06-29T14:48:30-07:00`
- Cost Calibration Gate remains blocked.
- threadRolloverGate: not required for this offline dependency review.
- localFullLoopGate: pass for scoped formatting, diff check, Module Run v2 pre-commit hardening, closeout readiness, and pre-push readiness before local closeout.

## Boundary Confirmation

- Source/test/schema/migration/package/lockfile/workspace files changed: false.
- Dependency install/update/remove/audit-fix executed: false.
- Dependency lifecycle script, package script, CLI binary, build script, postinstall, or generated binary executed: false.
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
- `docs/05-execution-logs/evidence/2026-06-29-security-dependency-deprecated-transitive-review.md`: read.
- `package.json`, `pnpm-lock.yaml`, and `pnpm-workspace.yaml`: read-only.

## Surface Evidence

| Command / Source                                                          | Status         | Redacted Result                                                          |
| ------------------------------------------------------------------------- | -------------- | ------------------------------------------------------------------------ | ---- | ------------------------------------------------------------------------------------ |
| `rg -n "hasBin:                                                           | requiresBuild: | ignoredBuiltDependencies" pnpm-lock.yaml pnpm-workspace.yaml`            | pass | 47 `hasBin` entries, 0 `requiresBuild` entries, and 2 ignored built dependency names |
| lockfile package classification                                           | pass           | 2 direct runtime, 8 direct dev, and 37 transitive `hasBin` entries       |
| root script inventory                                                     | pass           | 14 root package scripts identified from `package.json` without execution |
| `git diff --name-only -- package.json pnpm-lock.yaml pnpm-workspace.yaml` | pass           | no output; manifest/workspace/lockfile unchanged                         |

## Direct CLI/Binary Package Summary

| Area           | Packages                                                                                                |
| -------------- | ------------------------------------------------------------------------------------------------------- |
| direct runtime | `next`, `shadcn`                                                                                        |
| direct dev     | `@playwright/test`, `drizzle-kit`, `eslint`, `husky`, `lint-staged`, `prettier`, `typescript`, `vitest` |

## Built Dependency Policy Summary

- `requiresBuild` entries in `pnpm-lock.yaml`: 0.
- `ignoredBuiltDependencies` entries in `pnpm-workspace.yaml`: `sharp`, `unrs-resolver`.
- `sharp` is present in the local lockfile graph under Next.js image/tooling surface.
- `unrs-resolver` is present in the local lockfile graph under ESLint/Next resolver tooling surface.
- This task did not execute install, build, postinstall, or native binary behavior.

## Finding Summary

| Id          | Severity | Status              | Evidence Summary                                                                                                       |
| ----------- | -------- | ------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| dep-bin-001 | medium   | policy_watch        | 47 `hasBin` entries create a broad CLI/bin execution surface, mostly in dev/transitive tooling.                        |
| dep-bin-002 | medium   | policy_watch        | Workspace ignores built dependency scripts for `sharp` and `unrs-resolver`; no lockfile `requiresBuild` entries found. |
| dep-bin-003 | medium   | covered_watch       | Root has 14 scripts; execution remains task-declared and was not performed here.                                       |
| dep-bin-004 | medium   | needs_scoped_review | `napi-postinstall` is present as a transitive CLI/bin-capable package; current advisory status was not checked.        |

## Review Conclusion

- The review found dependency execution surface that should stay behind task-scoped script execution and dependency gates.
- This does not establish confirmed vulnerabilities.
- No current CVE/GHSA/public advisory lookup was executed, so current advisory status remains unknown in this task.
- Any package/lockfile/workspace policy change, install-time behavior proof, or dependency script/binary execution needs a separate materialized task and fresh approval.

## Batch Evidence

- Batch range: single offline dependency install-script/binary surface review.
- Source/test/schema/migration/package/lockfile/workspace files changed: 0.
- Governance docs/state files changed or created: 7.
- Runtime execution: none.
- Dependency install/update/remove/fix execution: none.
- Dependency script/binary execution: none.
- Network advisory execution: none.
- Future task candidates recorded: script/binary policy gate plus existing advisory lookup and deprecated transitive remediation gate.

## RED Evidence

- RED: not applicable for this review-only task.
- Reason: no dependency change, source/test repair, runtime flow, install command, script execution, or advisory lookup was authorized or performed.
- Regression evidence consulted: dependency inventory, dependency introduction gate, ADRs, and lockfile/manifest/workspace context only.

## GREEN Evidence

- GREEN: not applicable for this review-only task.
- Review result: CLI/bin and built dependency policy surfaces were identified and mapped to local dependency context without package/lockfile/workspace mutation.
- Verification result: scoped governance validation passed.

## Validation Results

| Command                                                                   | Status | Redacted Result                                                             |
| ------------------------------------------------------------------------- | ------ | --------------------------------------------------------------------------- |
| `rg` for `hasBin`, `requiresBuild`, and `ignoredBuiltDependencies`        | pass   | 47 hasBin entries, no requiresBuild entries, two ignored built dependencies |
| `git diff --name-only -- package.json pnpm-lock.yaml pnpm-workspace.yaml` | pass   | no package/lockfile/workspace changes                                       |
| `npx.cmd prettier --write --ignore-unknown ...`                           | pass   | scoped docs/state files formatted                                           |
| `npx.cmd prettier --check --ignore-unknown ...`                           | pass   | scoped docs/state files passed formatting check                             |
| `git diff --check`                                                        | pass   | no whitespace errors                                                        |
| `Test-ModuleRunV2PreCommitHardening.ps1`                                  | pass   | scope and sensitive evidence scans passed                                   |
| `Test-ModuleRunV2ModuleCloseoutReadiness.ps1`                             | pass   | closeout readiness passed                                                   |
| `Test-ModuleRunV2PrePushReadiness.ps1 -SkipRemoteAheadCheck`              | pass   | local git readiness and evidence/audit paths passed                         |

## Batch Commit Evidence

- Base commit: `df8f3322f2d558d568971307df7c405b81f6a55b`.
- Commit: `df8f3322f2d558d568971307df7c405b81f6a55b`
- Commit scope: docs/state-only dependency install-script/binary surface review, traceability, evidence, audit review, acceptance, task plan, project state, and task queue updates.

## Local Full Loop Gate

- localFullLoopGate: pass for scoped formatting, diff check, Module Run v2 pre-commit hardening, closeout readiness, and pre-push readiness before local closeout.
- Runtime execution: skipped by task boundary.
- Source/test/schema/migration/package/lockfile/workspace changes: none.
- DB, Provider, browser, dependency install/update/remove/fix, dependency script/binary execution, schema/migration/seed, release, final Pass, Cost Calibration, PR, and force-push actions: none.

## Automation Handoff Policy

- automationHandoffPolicy: no unattended release readiness, final Pass, Cost Calibration, staging smoke, Provider, DB, dependency change, dependency script/binary execution, network advisory lookup, schema/migration/seed, PR, force-push, browser runtime, or sensitive evidence capture is allowed from this task.
- Future execution must use task-specific materialized allowedFiles, blockedFiles, dependency boundary, network boundary, DB boundary, AI/Provider boundary, credential boundary, evidence redaction rules, validation commands, and closeoutPolicy.

## Next Module Run Candidate

Recommended dependency-security task if network approval is available:
`security-dependency-public-advisory-lookup-2026-06-29`.

Without network approval, select another local docs/source-read-only queue item and materialize its own task boundary first.

## Blocked Remainder

Release readiness, final Pass, Cost Calibration, staging smoke, staging/prod/cloud/deploy, PR, force-push, DB connection, schema/migration/seed, raw DB rows, Provider/AI calls, Provider/model configuration, prompts, Provider payloads, raw AI input/output, browser/runtime/dev-server, dependency install/update/remove/fix, dependency script/binary execution, package/lockfile/workspace changes, network advisory lookup, private credentials, env/secret/connection strings, registry tokens, account sessions, cookies, tokens, localStorage, Authorization headers, raw DOM, screenshots, traces, and sensitive evidence capture remain blocked.
