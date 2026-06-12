# Task Plan: active-queue-slimming-2026-06-11

## Scope

Execute one docs-only active queue slimming pass. Move eligible terminal historical task blocks from the active
`task-queue.yaml` into the existing June archive, append lookup entries to `task-history-index.yaml`, and keep the active
queue focused on recovery context.

This task does not change product code, dependencies, package/lockfiles, schema, migrations, scripts, env/secret files,
provider configuration, staging/prod/cloud/deploy, payment, external-service state, PRs, force-push policy, automation
activation, or Cost Calibration Gate state.

## Task

- id: `active-queue-slimming-2026-06-11`
- branch: `codex/active-queue-slimming`
- source: user request to complete one active queue slimming pass
- task kind: docs-only queue archive/index maintenance

## Required Reads

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/04-agent-system/sop/active-queue-slimming-plan.md`
- `docs/04-agent-system/sop/task-queue-archival-and-index-governance.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/04-agent-system/state/task-history-index.yaml`
- `docs/04-agent-system/state/archive/task-queue-archive-2026-06.yaml`
- `docs/05-execution-logs/evidence/2026-06-07-phase-58-task-queue-archive-execution.md`
- `docs/05-execution-logs/evidence/2026-06-07-phase-82-active-queue-slimming-readiness-audit.md`

## Baseline Inventory

- Active queue before slimming: 155 tasks.
- Terminal tasks before slimming: 155 tasks.
- Evidence-present terminal tasks: 149.
- Evidence-gap terminal tasks retained: 6.
- Non-terminal tasks: 0.

## Retention Policy

Keep these active queue entries:

- current recovery and automation mechanism anchors:
  - `phase-85-automation-activation-readiness-sync`
  - `phase-84-module-run-v2-validation-command-normalization-required-path`
  - `phase-83-module-run-v2-validation-command-normalization`
- evidence-gap debt entries:
  - `phase-1-api-contract-baseline`
  - `phase-1-design-token-baseline`
  - `phase-1-env-logging-baseline`
  - `phase-2-user-auth-planning`
  - `phase-2-auth-schema-and-permission-model-approval`
  - `phase-18-prerequisite-local-role-account-fixture-baseline`
- recent local closeout window:
  - `batch-105-ai-task-and-provider-provider-agnostic-ai-task-lifecycle-contract`
  - `batch-106-ai-task-and-provider-local-task-request-policy-and-result-referen`
  - `batch-107-ai-task-and-provider-redacted-audit-log-and-ai-call-log-evidence`
  - `batch-108-ai-task-and-provider-local-provider-sandbox-proposal-and-evidence`
  - `phase-79-local-e2e-validation-approval-governance`
  - `phase-80-module-run-v2-local-e2e-capability-gates`
  - `phase-81-local-e2e-approval-smoke-verification`
  - `phase-82-personal-learning-ai-module-run-proposal`
  - `batch-109-personal-learning-ai-local-transport-contract-planning`
  - `batch-110-personal-learning-ai-local-transport-contract`
  - `batch-111-personal-learning-ai-request-context-local-contract`
  - `batch-112-personal-learning-ai-redacted-result-reference-local-contract`
  - `batch-113-personal-learning-ai-local-ui-browser-planning`
  - `module-run-v2-mechanism-tuning-p0-p1`
  - `module-run-v2-bounded-queue-drain`
  - `batch-114-personal-learning-ai-local-e2e-smoke-planning`
- current slimming task:
  - `active-queue-slimming-2026-06-11`

## Archive Scope

Move these exact terminal task ids to `docs/04-agent-system/state/archive/task-queue-archive-2026-06.yaml` and append
matching lookup entries to `docs/04-agent-system/state/task-history-index.yaml`:

- `phase-53-requirement-task-coverage-gap-governance`
- `phase-54-task-queue-archival-index-governance`
- `phase-55-thread-rollover-handoff-governance`
- `phase-56-advanced-edition-coverage-audit`
- `phase-57-docs-slimming-readonly-inventory`
- `phase-58-task-queue-archive-execution`
- `phase-59-evidence-gap-reconciliation`
- `phase-60-execution-log-archive-governance`
- `phase-61-execution-log-archive-first-batch`
- `phase-62-mechanism-source-index`
- `phase-63-codex-app-readiness-follow-up`
- `phase-64-advanced-code-stage-seeding-plan`
- `phase-65-advanced-code-stage-queue-seeding-execution`
- `phase-66-local-implementation-readiness-gate`
- `phase-67-automation-readiness-scorecard`
- `phase-68-mode-transition-proposal-final-readiness-audit`
- `local-auto-candidate-mode-transition-confirmation`
- `phase-69-advanced-authorization-context-implementation-planning`
- `phase-70-advanced-ai-task-domain-implementation-planning`
- `phase-71-advanced-personal-ai-generation-implementation-planning`
- `phase-72-advanced-organization-training-implementation-planning`
- `phase-73-advanced-organization-analytics-implementation-planning`
- `phase-74-advanced-ops-auth-quota-implementation-planning`
- `phase-75-advanced-retention-log-governance-implementation-planning`
- `phase-76-advanced-code-stage-schema-dependency-blocker-review`
- `phase-77-advanced-code-stage-security-redaction-review-plan`
- `phase-78-advanced-code-stage-local-validation-planning`
- `phase-79-closeout-readiness-audit`
- `phase-80-post-closeout-state-reconciliation`
- `phase-81-next-docs-only-batch-planning`
- `phase-82-active-queue-slimming-readiness-audit`
- `phase-83-code-stage-approval-request-pack`
- `phase-84-code-stage-narrow-scope-approval-decision-record`
- `phase-85-first-implementation-slice-approval-draft`
- `phase-86-human-approval-checklist`
- `phase-87-authorization-context-read-model-contract`
- `phase-88-ai-task-domain-local-contract`
- `phase-89-paper-mock-exam-scope-read-model`
- `phase-90-audit-ai-call-log-redacted-reference`
- `phase-91-redeem-code-redacted-reference`
- `phase-92-personal-ai-generation-request-contract`
- `phase-93-org-auth-training-scope-summary`
- `batch-94-authorization-read-model-local-contract`
- `batch-94-post-merge-state-reconciliation`
- `batch-95-authorization-display-local-contract`
- `evidence-format-finalization-governance`
- `batch-96-authorization-access-reason-local-contract`
- `batch-97-authorization-reason-presentation-local-contract`
- `batch-98-authorization-reason-view-section-local-contract`
- `batch-99-authorization-reason-view-model-local-contract`
- `batch-100-authorization-reason-view-model-selector-local-contract`
- `advanced-edition-domain-module-run-matrix`
- `advanced-edition-module-run-v2-mechanism-upgrade`
- `module-run-v2-hook-automation-readiness`
- `module-run-v2-pre-work-pre-edit-advisory`
- `module-run-v2-pre-commit-scan-hardening`
- `module-run-v2-hook-automation-hardening-sequence`
- `module-run-v2-authorization-and-access-pilot`
- `module-run-v2-mechanism-completion`
- `module-run-v2-mechanism-state-source-sync`
- `module-run-v2-start-gate-hardening`
- `module-run-v2-closeout-strictness-hardening`
- `module-run-v2-post-commit-advisory`
- `module-run-v2-automation-readiness-scorecard-refresh`
- `module-run-v2-evidence-redaction-scan-hardening`
- `module-run-v2-unattended-automation-control`
- `module-run-v2-autopilot-orchestration-control`
- `module-run-v2-autopilot-hardening`
- `module-run-v2-post-push-state-reconciliation`
- `module-run-v2-autopilot-maturity-hardening`
- `module-run-v2-ai-task-and-provider-planning`
- `module-run-v2-ai-task-lifecycle-local-contract`
- `module-run-v2-post-done-closeout-authorization-adoption`
- `module-run-v2-unattended-blocker-hardening`
- `module-run-v2-closeout-continuity-hardening`
- `module-run-v2-local-experience-closure-alignment`
- `module-run-v2-local-experience-acceptance-planning`
- `module-run-v2-planning-to-implementation-autodrive`
- `module-run-v2-stopped-automation-hygiene`
- `module-run-v2-autodrive-mechanism-html-doc`
- `module-run-v2-automation-handoff-contract-hardening`
- `module-run-v2-empty-scope-scan-repair`
- `module-run-v2-stale-clean-worktree-autocleanup-routing`
- `module-run-v2-approved-closeout-clean-ahead-support`
- `module-run-v2-closeout-policy-hardening`
- `module-run-v2-parallel-coordinator-readiness`
- `module-run-v2-parallel-autopilot-integration`
- `module-run-v2-autopilot-runner-control`
- `module-run-v2-autodrive-phase-0-2`
- `module-run-v2-autodrive-phase-3`
- `module-run-v2-autodrive-phase-4`
- `module-run-v2-autodrive-phase-5`
- `module-run-v2-autodrive-phase-6`
- `module-run-v2-autodrive-phase-7`
- `module-run-v2-autodrive-phase-8`
- `module-run-v2-recovery-chain-hardening`
- `module-run-v2-post-closeout-lifecycle-hardening`
- `module-run-v2-orphan-worktree-cleanup-hardening`
- `module-run-v2-idle-and-hygiene-hardening`
- `module-run-v2-auto-seed-bridge`
- `module-run-v2-autodrive-activation`
- `module-run-v2-autodrive-seed-recovery-hardening`
- `batch-101-authorization-and-access-authorization-read-model-and-display-contrac`
- `batch-102-authorization-and-access-personal-auth-and-org-auth-local-summaries`
- `batch-103-authorization-and-access-paper-and-mock-exam-access-context-without-c`
- `batch-104-authorization-and-access-redeem-code-audit-log-and-ai-call-log-redact`
- `module-run-v2-deferred-cleanup-continuation`
- `module-run-v2-validation-closeout-recovery-hardening`
- `module-run-v2-registry-finalizer-validation-lifecycle-hardening`
- `module-run-v2-standing-unattended-local-closeout-approval`
- `module-run-v2-db-capability-governance-approval`
- `module-run-v2-autopilot-loop-hardening`
- `post-closeout-reconcile-and-posture-cleanup`
- `advanced-edition-implementation-consistency-review-and-autodrive-resume-readiness`
- `mechanism-operating-manual-baseline`
- `mechanism-next-action-readonly-diagnostic`
- `mechanism-status-and-drift-diagnostics`
- `mechanism-runner-consumes-next-action`
- `mechanism-planned-pause-and-tuning-mode`
- `mechanism-project-status-unified-diagnostic`
- `mechanism-seed-proposal-next-action-bridge`
- `mechanism-active-queue-slimming-plan`
- `ai-task-and-provider-auto-seed-approval-decision`
- `runner-pending-seed-decision-gate`
- `controlled-auto-seed-policy`
- `mece-seed-self-review-gate`
- `stop-card-recovery-clarity`
- `closeout-noise-reduction`
- `full-autodrive-dry-run`
- `standing-push-approval-rule-alignment`

## File Scope

Modify:

- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/04-agent-system/state/archive/task-queue-archive-2026-06.yaml`
- `docs/04-agent-system/state/task-history-index.yaml`

Create:

- `docs/05-execution-logs/task-plans/2026-06-11-active-queue-slimming.md`
- `docs/05-execution-logs/evidence/2026-06-11-active-queue-slimming.md`
- `docs/05-execution-logs/audits-reviews/2026-06-11-active-queue-slimming.md`

## Execution Steps

1. Split active `task-queue.yaml` into exact task blocks.
2. Move the 130 archive-scope task blocks into the existing June archive.
3. Remove the moved blocks from active `task-queue.yaml`.
4. Add the current `active-queue-slimming-2026-06-11` task entry to the active queue.
5. Append one `task-history-index.yaml` entry per moved task.
6. Update `project-state.yaml` current task and handoff.
7. Write evidence and audit review.
8. Format changed files and run validation.

## Validation Plan

- PyYAML parse check for active queue, June archive, history index, and project state.
- Count check: active queue before/after, archived count, retained count, history index appended count, duplicate ids.
- Evidence path check for archived entries.
- Dependency resolution check through active queue plus history index.
- `node .\node_modules\prettier\bin\prettier.cjs --check` for all changed YAML/Markdown files.
- Required anchor scan for `active queue`, `task-history-index.yaml`, `task-queue-archive-2026-06.yaml`,
  `authorization`, `paper`, `mock_exam`, `redeem_code`, `audit_log`, `ai_call_log`, and Cost Calibration Gate remains
  blocked.
- `git diff --check`.
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`.

## Risk Controls

- Do not change archived task semantics.
- Do not archive the six evidence-gap debt entries.
- Do not archive the current recovery pointer or recent local closeout window.
- Do not delete evidence or audit files.
- Do not execute e2e, provider calls, schema/migration, deployment, payment, external-service, PR, force-push, or Cost
  Calibration Gate work.
- Do not change dependencies, package manifests, or lockfiles. If Git hooks cannot run because local `node_modules`
  executables are absent, restore the local hook environment only with the existing lockfile and without scripts or
  manifest/lockfile changes.
