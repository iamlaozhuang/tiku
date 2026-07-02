# AGENTS Advanced Requirement Reading Rule Evidence

Task id: `agents-advanced-requirement-reading-rule-2026-07-02`

Branch: `codex/agents-advanced-requirement-reading-rule`

Evidence status: pass

result: pass

Result detail: `AGENTS.md` now has a general advanced-edition requirement reading rule. It requires future advanced, edition, authorization, organization, enterprise training, organization analytics, retention/log governance, role-separated, and content-admin AI draft/review tasks to read advanced requirement SSOT and latest traceability before execution logs.

Cost Calibration Gate remains blocked.

## Requirement Mapping Result

| Requirement area                          | Status | Redacted summary                                                                                       |
| ----------------------------------------- | ------ | ------------------------------------------------------------------------------------------------------ |
| Advanced edition reading entry            | pass   | `AGENTS.md` points future advanced-scope tasks to `docs/01-requirements/advanced-edition/00-index.md`. |
| Edition-aware authorization reading entry | pass   | `AGENTS.md` points edition and authorization tasks to edition-aware requirements and ADR-007.          |
| Execution-log ordering                    | pass   | Rule states execution logs come after requirement SSOT.                                                |
| Conflict handling                         | pass   | Rule requires stopping and asking the user when sources remain conflicting or ambiguous.               |
| Business SSOT boundary                    | pass   | Rule states `AGENTS.md` is execution discipline, not business requirement SSOT.                        |

## Validation Results

| Command                                                                                                                                                                                                 | Status | Redacted summary                                                                               |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ | ---------------------------------------------------------------------------------------------- |
| `npm.cmd exec -- prettier --write --ignore-unknown <scoped files>`                                                                                                                                      | pass   | Scoped docs/state formatting completed.                                                        |
| `npm.cmd exec -- prettier --check --ignore-unknown <scoped files>`                                                                                                                                      | pass   | Scoped docs/state formatting check completed.                                                  |
| `git diff --check`                                                                                                                                                                                      | pass   | No whitespace errors.                                                                          |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId agents-advanced-requirement-reading-rule-2026-07-02`                     | pass   | Module Run v2 pre-commit hardening passed.                                                     |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId agents-advanced-requirement-reading-rule-2026-07-02`                | pass   | Module Run v2 closeout readiness passed.                                                       |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId agents-advanced-requirement-reading-rule-2026-07-02 -SkipRemoteAheadCheck` | pass   | Module Run v2 pre-push readiness passed with remote-ahead check skipped before local closeout. |

## RED Evidence

RED: before this task, `AGENTS.md` had a specific AI generation baseline recovery rule, but it did not state a general advanced-edition reading trigger for edition, authorization, organization, enterprise training, analytics, retention/log governance, or role-separated tasks.

## GREEN Evidence

GREEN: `AGENTS.md` now records a general advanced-edition requirement reading rule while keeping business requirements in the requirement tree and traceability documents.

## Batch Evidence

Batch range: single docs/governance task `agents-advanced-requirement-reading-rule-2026-07-02`.

Commit: `6ccf0916f42b11183dbfc2dc58cc9ac1edf7adfd`

localFullLoopGate: pass after scoped formatting, diff check, Module Run v2 pre-commit, Module Run v2 module closeout, and Module Run v2 pre-push readiness.

blocked remainder: source/test/runtime changes, Provider execution, browser runtime, DB action, dependency changes, schema/migration/seed, deployment, release readiness, final Pass, production usability, and Cost Calibration remain blocked or unclaimed.

## Thread Rollover

threadRolloverGate: no rollover required.

automationHandoffPolicy: no automation handoff.

## Next Module Run

nextModuleRunCandidate: choose a separate experience walkthrough, requirement expansion, or release-readiness gate package if needed. None is executed here.

## Not Executed

- No source or test code was changed.
- No Provider or AI call was executed.
- No browser runtime, local server, or e2e was used.
- No direct DB access, mutation, schema, migration, seed, or raw row inspection was performed.
- No dependency, package, lockfile, or environment file was changed.
- No staging, production, cloud deploy, release readiness, final Pass, production usability, or Cost Calibration action was executed.
