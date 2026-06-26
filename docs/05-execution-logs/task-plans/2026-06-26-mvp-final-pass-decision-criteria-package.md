# MVP Final Pass Decision Criteria Package Task Plan

Task id: `mvp-final-pass-decision-criteria-package-2026-06-26`

Branch: `codex/mvp-final-pass-criteria-package-20260626`

## Goal

Prepare a docs-only criteria package that defines when the owner may enter an MVP final Pass decision process, and which
external or release gates must remain separately approved before they can be included in any final Pass claim.

This task does not enter the final Pass decision process and does not claim Standard/Advanced MVP final Pass.

## SSOT Read List

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/adr-001-tech-stack-selection.md`
- `docs/02-architecture/adr/adr-002-runtime-architecture-and-multi-client-contract.md`
- `docs/02-architecture/adr/adr-003-workplace-desktop-web-compatibility.md`
- `docs/02-architecture/adr/adr-004-environment-isolation-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-005-staging-architecture-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-006-runtime-dependency-alignment.md`
- `docs/02-architecture/adr/adr-007-edition-aware-authorization-source-of-truth.md`
- `docs/04-agent-system/operating-manual.md`
- `docs/04-agent-system/sop/requirement-ssot-reading-governance.md`
- `docs/04-agent-system/sop/task-lifecycle-governance.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/01-requirements/00-index.md`
- `docs/01-requirements/advanced-edition/00-index.md`
- `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`
- `docs/01-requirements/traceability/2026-06-24-role-separated-mvp-requirement-alignment.md`
- `docs/01-requirements/traceability/role-experience-fulfillment-matrix.md`

## Requirement Decision Map

| Source                                                                                     | Decision used by this package                                                                                                                                                                                             |
| ------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `docs/01-requirements/00-index.md`                                                         | Standard/advanced role-separated repair addendum does not approve Provider, Cost Calibration, `staging`/`prod`, payment, external services, or final Pass.                                                                |
| `docs/01-requirements/advanced-edition/00-index.md`                                        | Role-separated runtime acceptance requires all eight mandatory rows to pass; Provider, env/secret, `staging`/`prod`, payment, external-service, and Cost Calibration work remain out of scope unless separately approved. |
| `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`        | Production quota defaults, payment, Provider/model calls, Cost Calibration, env/secret, schema/migration, `staging`, production, and deployment remain non-goals without later approval.                                  |
| `docs/01-requirements/traceability/2026-06-24-role-separated-mvp-requirement-alignment.md` | The role-separated runtime gate may close only after all eight rows pass fresh redacted runtime observation; this traceability decision itself does not approve final MVP Pass or external gates.                         |
| ADR-004 and ADR-005                                                                        | `staging` and `prod` require separated resources and explicit approval; staging success cannot imply production readiness.                                                                                                |
| ADR-006                                                                                    | Installed AI SDK packages are dependency facts only and do not approve Provider/runtime usage, env/secret access, Cost Calibration, or external-service work.                                                             |
| ADR-007                                                                                    | Payment, pricing, Provider, quota defaults, `staging`/`prod`, and migration execution are separately gated.                                                                                                               |

## Requirement Mapping

- This package maps to final acceptance governance only.
- It does not add product behavior requirements and does not modify runtime acceptance scope.
- It converts the current owner package question into criteria for deciding whether a later human-owned final Pass
  decision process may begin.
- It preserves the distinction between local product acceptance evidence and external/release gate evidence.

## Evidence-Only Sources

- `docs/05-execution-logs/evidence/2026-06-26-role-separated-full-8-row-post-ops-visible-label-repair-browser-rerun.md`
- `docs/05-execution-logs/audits-reviews/2026-06-26-role-separated-full-8-row-post-ops-visible-label-repair-browser-rerun.md`
- `docs/05-execution-logs/acceptance/2026-06-26-owner-acceptance-decision-package-after-full-8-row-local-browser-pass.md`
- `docs/05-execution-logs/evidence/2026-06-26-owner-acceptance-decision-package-after-full-8-row-local-browser-pass.md`
- `docs/05-execution-logs/audits-reviews/2026-06-26-owner-acceptance-decision-package-after-full-8-row-local-browser-pass.md`

## Conflict Check

No conflict found. The latest local runtime evidence records a full eight-row local browser pass, while the relevant
requirements, ADRs, evidence, and audit reviews consistently leave Provider/Cost/`staging`/`prod`/payment/external
services and final Pass unapproved.

## Allowed Files

- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/2026-06-26-mvp-final-pass-decision-criteria-package.md`
- `docs/05-execution-logs/acceptance/2026-06-26-mvp-final-pass-decision-criteria-package.md`
- `docs/05-execution-logs/evidence/2026-06-26-mvp-final-pass-decision-criteria-package.md`
- `docs/05-execution-logs/audits-reviews/2026-06-26-mvp-final-pass-decision-criteria-package.md`

## Blocked Scope

- Browser or Playwright runtime execution.
- Credential file read/input.
- DB read/write, seed, schema, migration, Drizzle changes, account mutation.
- Source, tests, package, lockfile, dependency, script, or environment changes.
- Provider/model calls, Provider configuration, Cost Calibration, quota/pricing measurement.
- `staging`, `prod`, cloud deployment, payment, external services, PR, force-push, or final MVP Pass.

## Documentation Approach

1. Define the minimum criteria to enter a later MVP final Pass decision process.
2. Define stale-evidence conditions that require rerun or new evidence before the decision process can start.
3. Define the external/release gates that require fresh task-specific approval before inclusion.
4. Define owner decision wording without selecting a final Pass outcome.
5. Record evidence and audit conclusions with redaction-safe summaries only.

## Validation Plan

- `npx.cmd prettier --check --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-06-26-mvp-final-pass-decision-criteria-package.md docs/05-execution-logs/acceptance/2026-06-26-mvp-final-pass-decision-criteria-package.md docs/05-execution-logs/evidence/2026-06-26-mvp-final-pass-decision-criteria-package.md docs/05-execution-logs/audits-reviews/2026-06-26-mvp-final-pass-decision-criteria-package.md`
- `git diff --check`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId mvp-final-pass-decision-criteria-package-2026-06-26`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId mvp-final-pass-decision-criteria-package-2026-06-26 -SkipRemoteAheadCheck`

## Stop Conditions

- Any criterion would imply final Pass without a later explicit owner decision.
- Any criterion would approve Provider, Cost Calibration, `staging`, `prod`, payment, external-service, env/secret,
  schema/migration, DB/account mutation, source/test, dependency, PR, force-push, or deployment work.
- Evidence would need credentials, account identifiers, secrets, raw DB rows, raw public ids, raw DOM, screenshots,
  traces, Provider payloads, prompts, generated content, private answer content, or cleartext `redeem_code`.
