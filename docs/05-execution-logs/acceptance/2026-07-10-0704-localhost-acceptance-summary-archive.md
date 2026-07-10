# 2026-07-10 0704 Localhost Acceptance Summary Archive And Preview Decision Framework

## Status

- archiveStatus: `closed_localhost_acceptance_summary`
- taskId: `0704-summary-archive-decision-framework-2026-07-10`
- branch: `codex/0704-summary-archive-decision-framework`
- executionBoundary: docs/state archive only
- environmentScope: localhost evidence summary and future decision framework
- stagingExecution: not executed
- releaseClaim: none

This archive summarizes the completed 0704 localhost acceptance work and proposes a decision framework for judging whether Tiku is ready to enter a controlled staging preview preparation phase later.

It does not execute or approve staging/prod/cloud/deploy/env/secret/Provider/Cost Calibration work. It does not claim staging readiness, production readiness, release readiness, final Pass, Provider readiness, deployment readiness, data migration readiness, or customer-network acceptance.

## Executive Conclusion

Current evidence supports this conclusion:

- 0704 localhost business and perimeter acceptance is closed at local evidence level.
- The original AI generation and learning core flows are no longer the main uncertainty.
- The major peripheral business closures have also been validated: authorization, employee governance, organization boundary, resource/RAG, model/Prompt/log governance, audit/privacy, enterprise training edges, organization analytics, content lifecycle, ordinary learning, route boundary, failure degradation, and staging-readiness design.
- The project is not yet ready to execute a staging preview run because resource, secret/env, staging account, migration/rollback, Provider/observability, and owner-acceptance prerequisites have not been executed or approved.

Recommended decision posture:

- Ready to start a management-level preview-readiness assessment.
- Not ready to start staging execution until the framework gates below are evaluated and explicitly approved.

## Closed Evidence Groups

| Group                          | Status        | Current meaning                                                                                                                                                                       | Primary anchor                                         |
| ------------------------------ | ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------ |
| 0704 account catalog           | closed        | Nine core localhost role labels were consolidated and used through redacted readiness rules.                                                                                          | `2026-07-10-0704-acceptance-coverage-ledger.md`        |
| Core AI generation loops       | closed local  | Content admin, advanced personal learner, advanced organization employee, and advanced organization admin AI generation loops have local evidence and should not be rerun by default. | `2026-07-10-0704-acceptance-coverage-ledger.md`        |
| Standard/advanced boundary     | closed local  | Standard personal and organization users are denied advanced AI capabilities; advanced users receive scoped capability.                                                               | `2026-07-10-0704-post-ai-acceptance-roadmap.md`        |
| Learner and content baselines  | closed local  | Ordinary practice, `mock_exam`, reports, `mistake_book`, and non-AI content publish/takedown/edit-copy boundaries remain validated.                                                   | `2026-07-10-0704-acceptance-coverage-ledger.md`        |
| Authorization and multitenancy | closed local  | `effectiveEdition`, `personal_auth`, `org_auth`, tenant scope, and admin/employee separation have targeted validation evidence.                                                       | `2026-07-10-0704-post-ai-acceptance-roadmap.md`        |
| Peripheral 17-task queue       | closed local  | All 17 planned peripheral tasks are closed, including validation-discovered repairs and reruns.                                                                                       | `2026-07-10-0704-post-peripheral-acceptance-ledger.md` |
| Staging readiness design       | closed design | Staging data isolation, account matrix, credential governance, resource boundary, migration/rollback, monitoring, evidence template, and stop conditions are designed only.           | `2026-07-10-0704-staging-readiness-design.md`          |

## Repair And Rerun Summary

The 0704 peripheral run found and closed four repair paths before continuing the queue:

| Trigger area                               | Repair result                                                                                                               | Current status |
| ------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------- | -------------- |
| Enterprise multi-scope `org_auth` UI       | Multi-select bundle and atomic scope preview/contract closure were repaired before continuing.                              | closed         |
| Employee roster import                     | Upload entry, template, preview, inherited authorization categories, and import safeguards were repaired before continuing. | closed         |
| Organization tree employee transfer        | Transfer mutation, quota/session/history convergence, and affected validation rerun were completed.                         | closed         |
| Enterprise training deadline answerability | Answer deadline propagation through publish, persistence, visibility, draft, and submit paths was repaired and rerun.       | closed         |

These repairs are part of localhost readiness evidence. They do not prove staging migration, staging data, or production behavior.

## What Is Closed

Use the following as the no-rerun baseline unless later fresh evidence contradicts it:

- Nine core 0704 localhost role labels are known and covered by redacted readiness rules.
- Advanced AI出题/AI组卷 learner and organization flows are locally closed at product-loop level.
- Standard edition denial for advanced AI capabilities is locally closed.
- Enterprise comprehensive authorization, employee roster import, organization tree transfer, and `org_auth` inheritance are locally closed.
- Personal `redeem_code` activation, advanced activation, upgrade, and unsafe-code rejection are locally closed.
- Organization admin surfaces, global admin separation, content admin separation, model/Prompt/log governance, `audit_log`, and `ai_call_log` privacy boundaries are locally closed.
- Resource/RAG `knowledge_node`, citation, and `evidence_status` binding are locally closed.
- Enterprise training source/publish/version/takedown/deadline/submit/formal-record separation is locally closed.
- Organization analytics summary-only and raw-answer exclusion are locally closed.
- Ordinary learner practice, `mock_exam`, reports, `mistake_book`, resume, and invalidation boundaries are locally closed.
- Direct URL/API adversarial authorization, cross-tenant denial, stale/disabled/expired handling, and error redaction are locally closed.
- Failure and degradation categories are locally closed at source/test level.

## What Is Not Claimed

Do not infer any of the following from this archive:

- staging readiness;
- production readiness;
- release readiness;
- final Pass;
- Provider readiness;
- Provider quality, cost, or quota readiness;
- Cost Calibration completion;
- cloud resource readiness;
- secret/env readiness;
- deployment readiness;
- database migration readiness;
- backup/rollback readiness;
- customer-network acceptance;
- customer data handling approval;
- production operational support readiness.

## Remaining Decision Risks

These risks do not reopen localhost acceptance, but they matter before preview execution:

| Risk category            | Why it matters                                                                       | Required decision before staging preview execution                                                              |
| ------------------------ | ------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------- |
| Environment isolation    | Localhost evidence used local/dev boundaries only.                                   | Confirm staging DB, storage, auth, logs, domain, and runtime are isolated from prod.                            |
| Secrets and env          | No staging/prod secret/env values were read, created, or injected.                   | Approve secret store, env injection, callback values, and rotation/rollback owner.                              |
| Staging account matrix   | Localhost private credentials must not be reused.                                    | Create or verify staging-only nine-role account catalog with redacted readiness.                                |
| Migration and rollback   | Localhost validation does not prove staging schema or migration safety.              | Approve migration source, backup point, restore method, drift check, and rollback stop criteria.                |
| Provider and cost        | Provider-enabled and Cost Calibration remained blocked.                              | Decide Provider disabled vs limited staging quota, model allowlist, logging allowlist, budget, and kill switch. |
| Data handling            | Staging data must avoid production/customer-like content unless separately approved. | Approve seed/reset strategy and redaction rules.                                                                |
| Observability            | Local evidence does not prove staging runtime monitoring.                            | Define health, DB, storage, route, Provider-disabled, audit, and error category signals.                        |
| Owner acceptance process | Local closeout is not owner preview acceptance.                                      | Define approval owner, evidence reviewer, stop conditions, and decision meeting inputs.                         |

## Preview-Readiness Decision Framework

Use this framework before deciding whether to enter a formal staging preview phase.

### Decision Levels

| Level                                   | Meaning                                                                                                                          | Current 0704 posture                  |
| --------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------- |
| L0 local validation only                | Continue localhost validation and repair.                                                                                        | Completed for the current 0704 scope. |
| L1 preview-readiness assessment         | Evaluate whether staging preparation can start without environment execution.                                                    | Recommended next decision step.       |
| L2 staging preparation                  | Approve resource, secret/env, account, migration, Provider/observability, and evidence gates without business preview execution. | Not yet started.                      |
| L3 controlled staging preview execution | Execute approved staging owner acceptance flows against isolated staging resources.                                              | Not ready until L2 gates pass.        |
| L4 production release planning          | Design production-only release, backup, incident, and rollout gates.                                                             | Out of scope now.                     |

### Go / Defer / Block Rules

| Outcome                | Use when                                                                                                 | Allowed next action                                           |
| ---------------------- | -------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------- |
| `go_to_l1_assessment`  | Local evidence is closed and no fresh P0/P1 localhost issue is open.                                     | Run a docs/read-only project reality assessment.              |
| `go_to_l2_preparation` | L1 confirms resource ownership, infra path, data strategy, and approvals can be cleanly separated.       | Start approval-gate tasks, still no staging business preview. |
| `defer_preview`        | Local evidence is closed but external readiness, staffing, data, or owner acceptance process is unclear. | Resolve missing decisions before staging work.                |
| `block_preview`        | Any hard blocker below is present.                                                                       | Stop and open the specific blocker task.                      |

### Hard Blockers

Any one of these blocks L3 controlled staging preview execution:

- staging DB, object storage, auth, log, domain, or runtime would share writable prod resources;
- no approved secret/env governance path;
- no staging-only nine-role account matrix;
- migration/rollback lacks backup, restore owner, drift check, or reviewed migration source;
- staging data would require production/customer-like content without a data handling plan;
- Provider execution is enabled without explicit model, quota, logging, redaction, and kill-switch approval;
- evidence process would record credentials, session material, raw Provider data, raw prompt/output, full content, raw employee answers, DB URLs, raw DB rows, internal ids, screenshots, raw DOM, or plaintext `redeem_code`;
- owner acceptance criteria and stop conditions are not written before execution;
- any current P0/P1 product, privacy, authorization, or data-boundary defect is open.

### Assessment Dimensions

Score each dimension as `pass`, `defer`, or `block`. A single `block` means do not enter L3. Two or more `defer` items means stay in L1/L2.

| Dimension                   | Pass condition                                                                                | Defer condition                                                     | Block condition                                                           |
| --------------------------- | --------------------------------------------------------------------------------------------- | ------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| Business closure            | 0704 local evidence covers required core and peripheral workflows.                            | Evidence exists but decision owner wants an additional local smoke. | Fresh P0/P1 localhost regression or missing core workflow.                |
| Role and authorization      | Nine role labels and standard/advanced boundaries are closed locally.                         | Staging role catalog not yet created.                               | Staging cannot represent required roles or authorization contexts.        |
| Tenant and privacy boundary | Local admin/employee/cross-org privacy evidence is closed.                                    | Need staging-specific redaction reviewer.                           | Any raw employee/learner/AI/admin-sensitive exposure risk is unresolved.  |
| Content and learning data   | Formal content, learning, reports, and training separation are locally closed.                | Need synthetic staging content plan.                                | Staging needs production content without approved redaction/data plan.    |
| AI/RAG behavior             | AI/RAG local contract and Provider-disabled behavior are closed.                              | Provider remains disabled for staging.                              | Provider enabled without quota, model, logging, and kill-switch approval. |
| Operational governance      | `audit_log`, `ai_call_log`, and failure categories are locally closed.                        | Need staging log retention owner.                                   | Logs would expose forbidden sensitive material.                           |
| Technical gates             | Latest `master` passes lint/typecheck/diff/Module Run v2 and targeted tests where applicable. | Need one more master-side RC packet before L2.                      | Gate failure on current master.                                           |
| Infrastructure isolation    | Staging resource plan can isolate DB/storage/auth/log/domain/runtime.                         | Resource procurement status unclear.                                | Any staging/prod resource sharing or unclear ownership.                   |
| Secret/env governance       | Secret store, env injection, callback, and rotation owner are defined without values in docs. | Owner not assigned yet.                                             | Secret values must be exposed to proceed.                                 |
| Migration/rollback          | Backup, restore, drift check, migration source, rollback owner are defined.                   | Migration plan not written yet.                                     | Destructive or unreviewed migration required.                             |
| Owner acceptance            | Decision owner, evidence reviewer, stop conditions, and acceptance routes are written.        | Owner review schedule unclear.                                      | No owner or no stop conditions.                                           |

## Recommended Assessment Packet

Before any staging preparation task, create one assessment packet that answers these questions without executing staging:

1. Which business scope is in or out of preview?
2. Which 0704 evidence anchors are authoritative, and which are no-rerun?
3. Are there any open P0/P1 defects or sensitive-evidence findings?
4. Are staging resources purchased or planned, and who owns them?
5. How will staging secrets/env values be stored, injected, rotated, and rolled back?
6. How will the nine staging roles be created or verified without exposing credentials?
7. What synthetic or reviewed data will be used, and how will reset work?
8. Will Provider remain disabled, or is there an approved limited-quota staging Provider plan?
9. What migration/rollback rehearsal must happen before business preview?
10. Who reviews evidence redaction and signs the owner acceptance decision?

Recommended output of that packet:

- `previewDecision`: `go_to_l2_preparation | defer_preview | block_preview`
- `blockedReasons`: redacted categories only
- `requiredNextTasks`: ordered approval-gate tasks
- `nonClaims`: staging/prod/release/final/Provider/Cost claims remain blocked until proven

## Suggested Immediate Next Work

Do not begin staging preparation automatically after this archive.

Suggested next task for owner decision support:

- taskId: `0704-project-reality-preview-readiness-assessment`
- mode: docs/read-only assessment
- purpose: evaluate current repository, local evidence, unresolved risks, external readiness assumptions, and owner decision criteria against the framework above
- explicit non-goals: no staging/prod/cloud/deploy/env/secret/Provider/Cost Calibration, no DB, no browser, no source/test/package/schema/migration/seed change

## Archive Result

The 0704 localhost acceptance body of evidence is organized enough to support a structured preview-readiness decision. The evidence does not itself authorize preview execution.

Current recommended decision category: `go_to_l1_assessment`.
