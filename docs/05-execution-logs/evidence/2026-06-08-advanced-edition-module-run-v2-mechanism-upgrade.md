# Advanced Edition Module Run v2 Mechanism Upgrade Evidence

## Summary

- task id: `advanced-edition-module-run-v2-mechanism-upgrade`
- task kind: `docs_only`
- branch: `codex/module-run-v2-mechanism-upgrade`
- base branch: `master`
- base SHA: `d273a3a8217119cbd8bc3d0946bb6d29c8f4024b`
- local validation level: L0 docs-only governance
- product behavior changed: no
- hook or script implementation changed: no
- Cost Calibration Gate remains blocked

## Changes

- Upgraded `advanced-edition-domain-module-run-matrix.yaml` to Module Run v2.
- Added six execution modules while preserving seven source planning modules through `sourceModuleMapping`.
- Raised default Module Run capacity to 8 Batches.
- Added `localFullLoopGate`, `localProviderSandboxGate`, `threadRolloverGate`, `automationHandoffPolicy`, and
  `hookIntegrationMatrix`.
- Updated Module Lifecycle, Local-First Validation, Thread Rollover, Automated Advancement, and Code-Stage Task Seeding
  SOPs.
- Updated `project-state.yaml` and `task-queue.yaml` for the docs-only upgrade task and current Git recovery SHA.

## Mechanism Consistency Review

Verdict: pass.

Reviewed against:

- ADR-004 environment isolation and release boundaries.
- ADR-005 staging architecture and release boundaries.
- Module Lifecycle Governance SOP.
- Local-First Validation Governance SOP.
- Automated Advancement Governance SOP.
- Thread Rollover And Handoff Governance SOP.
- Security Review Gate SOP.

Findings:

- Module Run v2 does not approve staging, prod, cloud, deploy, payment, external-service, dependency, schema, migration,
  env/secret, provider configuration, or script implementation work.
- Local provider sandbox is explicitly local-only, approval-gated, and redacted. It must not read `.env.local` contents
  and must not record API keys, raw prompts, raw responses, generated AI content, provider payloads, secrets, database
  URLs, or Authorization headers.
- Cost Calibration Gate remains blocked and is not weakened by local provider sandbox wording.
- `authorization`, `paper`, `mock_exam`, `redeem_code`, `audit_log`, and `ai_call_log` are retained as terminology and
  redaction anchors.
- The six execution modules preserve the seven source planning modules through `sourceModuleMapping`.

## Dry-Run Review

Verdict: pass.

### authorization-and-access

- candidate source module: `authorization-context`
- max Batches: 8
- expected local target: L4 when approved local API or Server Action contract checks exist; otherwise highest safe
  model/contract/service level must be recorded.
- allowed batch composition: authorization read-model, display, personal_auth/org_auth summary, paper/mock_exam context,
  and redacted redeem_code/audit_log/ai_call_log references.
- thread rollover: Batches 0-3 may continue in-thread, after Batch 4 suggest rollover, after Batch 6 require new thread
  unless user explicitly approves continuation and recovery audit passes.
- stop condition: real authorization permission model, new permission/role/quota/entitlement, plaintext redeem_code,
  schema, dependency, provider, env/secret, deploy, payment, external-service, or Cost Calibration Gate execution.

Decision: Module Run v2 gives a clear go/no-go boundary and supports batching without changing real permission behavior.

### ai-task-and-provider

- candidate source module: `ai-task-domain`
- max Batches: 8
- expected local target: L2 by default, with higher local levels only when the Module Run plan explicitly approves them.
- local provider sandbox: available only after explicit user approval for a specific local call.
- evidence rule: record redacted metadata, success/failure category, and local validation result only.
- forbidden evidence: API key, secret, token, `.env.local` content, raw prompt, raw response, generated AI content,
  provider payload, database URL, Authorization header.
- stop condition: provider SDK/config/quota/endpoint/fallback, staging/prod/cloud/deploy, env/secret, dependency,
  payment, external-service, or Cost Calibration Gate execution.

Decision: Module Run v2 allows local AI validation planning without treating provider cost calibration or provider
configuration as approved.

## Validation Results

Passed:

- `git diff --check`: pass
- scoped `prettier --write`: pass
- scoped `prettier --check`: pass
- required anchor check for `Module Run v2`, `localFullLoopGate`, `localProviderSandboxGate`, `threadRolloverGate`,
  `hookIntegrationMatrix`, `authorization`, `paper`, `mock_exam`, `redeem_code`, `audit_log`, `ai_call_log`, and
  `Cost Calibration Gate remains blocked`: pass
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1
-BaseBranch master`: pass

Docs-only note: product lint/typecheck/tests were not run because no product code, script, dependency, schema, or test
files were changed.

## Changed Files

- `docs/04-agent-system/state/advanced-edition-domain-module-run-matrix.yaml`
- `docs/04-agent-system/sop/module-lifecycle-governance.md`
- `docs/04-agent-system/sop/local-first-validation-governance.md`
- `docs/04-agent-system/sop/thread-rollover-and-handoff-governance.md`
- `docs/04-agent-system/sop/automated-advancement-governance.md`
- `docs/04-agent-system/sop/code-stage-task-seeding-governance.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/2026-06-08-advanced-edition-module-run-v2-mechanism-upgrade.md`
- `docs/05-execution-logs/evidence/2026-06-08-advanced-edition-module-run-v2-mechanism-upgrade.md`
- `docs/05-execution-logs/audits-reviews/2026-06-08-advanced-edition-module-run-v2-mechanism-upgrade.md`

## Residual Risks

- Hook matrix is mechanism design only. Implementing pre-work, pre-edit, pre-push, post-commit, or module-closeout
  scripts requires a separate approved task.
- Module Run v2 grouping improves throughput, but high-risk work still needs task-specific approvals and validation.
- Local provider sandbox is not provider readiness, staging readiness, prod readiness, or cost calibration.
