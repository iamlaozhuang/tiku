# High Risk Approval Package Consolidation Retirement Task Plan

## Task

- Task id: `high-risk-approval-package-consolidation-retirement-2026-06-27`
- Branch: `codex/high-risk-approval-consolidation-20260627`
- Task kind: `docs_state_high_risk_approval_consolidation`
- Objective: consolidate the active AP-01 through AP-11 high-risk approval package queue entries, retire or merge stale placeholders, and preserve all high-risk gates as blocked in a centralized acceptance ledger.

## Approval Boundary

Fresh approval source: `current_user_fresh_docs_state_high_risk_package_consolidation_2026_06_27`.

Allowed:

- update `project-state.yaml`;
- update `task-queue.yaml`;
- create this task plan;
- create evidence, audit review, and acceptance/consolidation ledger docs;
- classify existing high-risk approval packages as `keep`, `retire`, `merge`, or `blocked`;
- update queue evidence and status fields to reflect the classification;
- run docs/state validation gates and create one local task commit.

Blocked:

- browser, dev server, Playwright, e2e, screenshots, traces, or runtime UI validation;
- DB connection, DB read/write, seed, migration, rollback, destructive operation, raw SQL, or `drizzle-kit push`;
- `.env*` read/write, credential read, secret output, token, Authorization header, or DB URL access;
- Provider/model call, Provider retry, Provider configuration, raw prompt/output/provider payload, or Cost Calibration;
- real adoption/retry mutation, formal publish, student-visible runtime, `staging`, `prod`, deploy, payment, OCR execution, export generation, or external service;
- source/test/script/schema/package/lockfile edits;
- PR, force push, release readiness, production readiness, or final Pass.

## SSOT Read List

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/01-requirements/00-index.md`
- `docs/04-agent-system/sop/requirement-ssot-reading-governance.md`
- `docs/04-agent-system/sop/requirement-task-coverage-and-gap-audit-governance.md`
- `docs/04-agent-system/sop/task-lifecycle-governance.md`
- `docs/04-agent-system/sop/docs-only-fast-lane-governance.md`
- `docs/04-agent-system/sop/active-queue-slimming-plan.md`
- `docs/04-agent-system/sop/task-queue-archival-and-index-governance.md`
- `docs/04-agent-system/sop/repository-hygiene-closeout-checklist.md`
- `docs/04-agent-system/sop/local-first-validation-governance.md`
- `docs/04-agent-system/sop/dependency-introduction-gate.md`
- `docs/04-agent-system/sop/advanced-edition-cost-calibration-blocked-gate.md`
- `docs/02-architecture/adr/adr-001-tech-stack-selection.md`
- `docs/02-architecture/adr/adr-002-runtime-architecture-and-multi-client-contract.md`
- `docs/02-architecture/adr/adr-003-workplace-desktop-web-compatibility.md`
- `docs/02-architecture/adr/adr-004-environment-isolation-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-005-staging-architecture-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-006-runtime-dependency-alignment.md`
- `docs/02-architecture/adr/adr-007-edition-aware-authorization-source-of-truth.md`

## Requirement Decision Map

- Standard MVP excludes online payment, OCR, export, staging/prod, and release readiness unless separately approved.
- ADR-004 and ADR-005 keep `dev`, `staging`, and `prod` isolated and block staging/prod/deploy without fresh approval.
- ADR-006 treats installed AI SDK packages as dependency availability only, not Provider approval.
- ADR-007 blocks payment, Provider, quota defaults, Cost Calibration, staging/prod, schema migration, and deployment until separately approved.
- `docs/04-agent-system/sop/advanced-edition-cost-calibration-blocked-gate.md` keeps Cost Calibration blocked pending fresh explicit approval.

## Requirement Mapping

| Requirement or gate                      | Mapping decision for this task                                                                                                 |
| ---------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| AP-01 Provider smoke                     | Merge and retire six stale AP-01 active queue Provider smoke execution entries; preserve future Provider/Cost gate as blocked. |
| AP-02 Cost Calibration                   | Retire active placeholder and keep Cost Calibration blocked in the consolidated ledger.                                        |
| AP-03 Provider staging                   | Retire active placeholder and keep staging/provider/deploy blocked in the consolidated ledger.                                 |
| AP-04 Standard AI generation scope       | Retire active placeholder as future product-scope non-goal unless fresh product approval changes scope.                        |
| AP-05 Standard organization self-service | Retire active placeholder as future product/privacy/schema non-goal unless fresh approval changes scope.                       |
| AP-06 Online payment                     | Retire active placeholder and keep payment/external-service blocked.                                                           |
| AP-07 OCR auto import                    | Retire active placeholder and keep OCR/provider/parser/schema/dependency blocked.                                              |
| AP-08 Organization data export           | Retire active placeholder and keep export/privacy/runtime/external-service blocked.                                            |
| AP-09 Runtime capability list            | Retire active placeholder and require future exact source/schema/test approval if needed.                                      |
| AP-10 Current checkpoint audit repair    | Retire active placeholder; future repair must name exact audit target and allowed files.                                       |
| AP-11 Source governance change           | Retire active placeholder; future source governance rewrite needs fresh scope and sensitive evidence approval.                 |

## Evidence-Only Sources

- `docs/05-execution-logs/acceptance/2026-06-27-three-layer-acceptance-minimal-closure-high-risk-approval-matrix.md`
- `docs/05-execution-logs/evidence/2026-06-19-blocked-use-case-acceleration-governance-packet.md`
- `docs/05-execution-logs/audits-reviews/2026-06-19-blocked-use-case-acceleration-governance-packet.md`
- `docs/05-execution-logs/evidence/2026-06-26-provider-cost-real-provider-paper-composition-smoke-execution.md`
- `docs/05-execution-logs/evidence/2026-06-26-provider-cost-gate-closeout-review.md`
- `docs/05-execution-logs/evidence/2026-06-26-provider-cost-boundary-or-real-provider-paper-composition-smoke-approval-package.md`
- `docs/05-execution-logs/evidence/2026-06-26-provider-cost-final-pass-boundary-and-cost-calibration-decision-package.md`

These execution logs are used only as historical evidence and queue context. They are not used to create new runtime requirements.

## Conflict Check

No conflict found for this docs-only scope. The queue still contains blocked AP-01 through AP-11 placeholders, while newer evidence already provides a stronger consolidated high-risk gate matrix. Retiring active placeholders reduces queue noise but does not convert any high-risk gate to approved or complete.

## Documentation Approach

1. Add the task entry to `task-queue.yaml` with the approved docs/state-only boundary.
2. Update `project-state.yaml` current task and validation summary.
3. Update the AP-01 through AP-11 task entries in `task-queue.yaml`:
   - AP-01 six Provider smoke execution entries become `closed` with `retired_merged` decisions.
   - AP-02 through AP-11 become `closed` with `retired_consolidated_gate_blocked` decisions.
4. Create an acceptance ledger that records each AP decision and its future fresh approval requirement.
5. Create evidence and audit review that record no high-risk execution occurred.

## Risk Defenses

- Do not inspect `.env*`, credentials, DB, browser, runtime logs, Provider payloads, prompts, or raw outputs.
- Keep Cost Calibration wording as blocked in every changed task record and evidence file.
- Preserve prior AP evidence paths instead of deleting or moving historical evidence.
- Do not archive task blocks in this task; queue archival remains a separate explicit approval path.
- Do not claim Provider readiness, staging readiness, payment readiness, release readiness, or final Pass.

## Validation Commands

- `npx.cmd prettier --write --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-06-27-high-risk-approval-package-consolidation-retirement.md docs/05-execution-logs/evidence/2026-06-27-high-risk-approval-package-consolidation-retirement.md docs/05-execution-logs/audits-reviews/2026-06-27-high-risk-approval-package-consolidation-retirement.md docs/05-execution-logs/acceptance/2026-06-27-high-risk-approval-package-consolidation-retirement.md`
- `npx.cmd prettier --check --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-06-27-high-risk-approval-package-consolidation-retirement.md docs/05-execution-logs/evidence/2026-06-27-high-risk-approval-package-consolidation-retirement.md docs/05-execution-logs/audits-reviews/2026-06-27-high-risk-approval-package-consolidation-retirement.md docs/05-execution-logs/acceptance/2026-06-27-high-risk-approval-package-consolidation-retirement.md`
- `git diff --check`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Get-TikuProjectStatus.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId high-risk-approval-package-consolidation-retirement-2026-06-27`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId high-risk-approval-package-consolidation-retirement-2026-06-27`

## Stop Conditions

Stop if the work requires Provider calls, credential reads, DB/browser/runtime execution, source/test edits, dependency/schema/script changes, staging/prod/payment/external-service work, release readiness, final Pass, PR, force push, or queue archival movement.
