# Organization Training Runtime API Gap Boundary Audit Evidence

## Summary

- taskId: `organization-training-runtime-api-gap-boundary-audit`
- result: pass
- executionProfile: `local_experience_audit`
- validationPolicy: `docs_state`
- branch: `codex/organization-training-runtime-api-gap-boundary-audit`
- targetExperienceChain: `organization-training-experience`
- targetUseCases:
  - `UC-ADV-ORG-TRAINING-CONTENT-LIFECYCLE`
  - `UC-ADV-EMPLOYEE-TRAINING-ANSWER`

## Approval And Scope

- Approved by the current 2026-06-17 user prompt: "批准执行，按机制规范推进。"
- The approval executes the current handoff recommendation for `organization-training-runtime-api-gap-boundary-audit`.
- Allowed edits were limited to coverage matrix, project-state, task-queue, task plan, evidence, and audit.
- Product source, tests, e2e, scripts, schema/drizzle/migration, package/lockfile/dependency, `.env*`, provider/model,
  dev server, Browser/Playwright runtime, full e2e, staging/prod/cloud/deploy/payment/external-service, PR, force-push,
  Cost Calibration Gate, and sensitive/raw/private data exposure remained blocked.

## Module Run v2 Evidence

- Batch range: single docs/state boundary audit task.
- Commit: `d684ec064a7d2f853a49998940684f1338994846` is the pre-task baseline; the final task commit is produced after
  local validation and docs/state closeout.
- localFullLoopGate: not_used_for_this_local_experience_audit. This task did not start a dev server, run Browser,
  execute Playwright runtime, or run full e2e.
- threadRolloverGate: no rollover required for this single docs/state boundary audit task.
- nextModuleRunCandidate: `organization-training-version-takedown-runtime-route-contract-tdd`.
- Cost Calibration Gate remains blocked.

## Read-Only Boundary Findings

RED:

- Runtime App Router exposure is publish-only for organization-training. No current API route exposes takedown, copy,
  manual draft creation, source context attachment, employee visible training list, employee draft save, employee submit,
  or employee readonly summary.
- Runtime route wiring currently builds a store from publish-version repository capability only. The other organization
  training store methods remain fail-closed and not configured for runtime use.
- The Postgres organization-training repository currently supports visible admin organization scope lookup, trusted
  publish lineage lookup, and published-version insert. It does not expose repository methods for takedown, copy,
  draft/source context, employee visible list, employee draft save, employee submit, or readonly summary.
- The schema source has `organization_training_version` and `organization_training_answer`, but no durable manual-draft
  table and no source-context table. Manual draft creation, source context attachment, and copy-to-new-draft persistence
  require a separate schema approval package before implementation.
- Employee answer UI and local full-flow validation remain absent. `experience_closed` remains blocked.

GREEN:

- Existing `organization_training_version` schema has lifecycle fields that can support a narrow version-takedown
  repository and route task without schema changes if the scope stays limited to status, takedown timestamp, reason, and
  existing organization scope checks.
- Existing `organization_training_answer` schema supports metadata-only answer status, score, total score, submitted
  timestamp, organization snapshot, version, employee, and organization references. Employee answer repository work can
  proceed without a schema change if it does not add raw answer storage or require persisted answered-question counts.
- Existing auth/session and employee/organization schema provide a plausible source for employee public id and current
  organization context resolution, but the employee runtime route still needs focused TDD.
- Organization analytics already consumes `organization_training_answer` as official metadata-only submission source,
  so employee answer persistence should remain aligned with that source and avoid raw answer content.
- Coverage matrix now points the organization admin lifecycle row at the no-schema takedown route task and the employee
  answer row at the metadata-only employee answer repository task.

## Boundary Decision

- `organization-training-version-takedown-runtime-route-contract-tdd` is the safest next task because it closes a real
  runtime/API gap, uses existing version schema, and does not require schema/drizzle/migration approval.
- `organization-training-employee-answer-runtime-repository-contract-tdd` should follow or run with a separate approval
  because existing answer schema is sufficient for metadata-only status and score summaries.
- `organization-training-draft-source-context-schema-approval-package` is required before manual draft, source context,
  and copy-to-new-draft persistence can be implemented.
- No future task may claim `experience_closed` until runtime APIs, UI entry surfaces, and a separately approved
  localhost-only local full-flow validation exist.

## Planned Next Queue

1. `organization-training-version-takedown-runtime-route-contract-tdd`
   - Profile: `local_unit_tdd`.
   - Schema gate: not required if the task remains limited to version takedown.
2. `organization-training-employee-answer-runtime-repository-contract-tdd`
   - Profile: `local_unit_tdd`.
   - Schema gate: not required for metadata-only answer status, score, submitted timestamp, and snapshot persistence.
3. `organization-training-employee-answer-runtime-route-contract-tdd`
   - Profile: `local_unit_tdd`.
   - Schema gate: not required if no raw answer or answered-count persistence is added.
4. `organization-training-draft-source-context-schema-approval-package`
   - Profile: `docs_state_lite`.
   - Schema gate: required.
5. `organization-training-admin-entry-surface-local-ui`
   - Profile: `local_unit_tdd`.
6. `organization-training-employee-answer-entry-surface-local-ui`
   - Profile: `local_unit_tdd`.
7. `organization-training-admin-employee-local-full-flow-validation`
   - Profile: `local_full_flow`.
   - Requires future `localFullFlowGate: approved_localhost_only`.

## Validation Commands

- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Get-TikuProjectStatus.ps1`
  - Result: pass. Reported branch `codex/organization-training-runtime-api-gap-boundary-audit`, dirty docs/state
    worktree, no executable pending task, and Cost Calibration Gate remains blocked.
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Get-TikuNextAction.ps1 -VerboseHistory`
  - Result: pass. Reported no pending task, no seed candidate, no bridge candidate, and blocked gates still enforced.
- `npm.cmd run test:e2e -- --list`
  - Result: pass. Listed 28 tests in 11 files. No Browser or Playwright runtime execution was run.
- `npx.cmd prettier --check --ignore-unknown docs/04-agent-system/state/local-experience-coverage-matrix.yaml docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-06-17-organization-training-runtime-api-gap-boundary-audit.md docs/05-execution-logs/evidence/2026-06-17-organization-training-runtime-api-gap-boundary-audit.md docs/05-execution-logs/audits-reviews/2026-06-17-organization-training-runtime-api-gap-boundary-audit.md`
  - Result: pass. All matched files use Prettier code style.
- `npm.cmd run lint`
  - Result: pass.
- `npm.cmd run typecheck`
  - Result: pass.
- `git diff --check`
  - Result: pass.
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId organization-training-runtime-api-gap-boundary-audit`
  - Result: pass. Test-ModuleRunV2PreCommitHardening accepted all six changed files as task-scoped docs/state files.
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId organization-training-runtime-api-gap-boundary-audit`
  - Result: pass. Test-ModuleRunV2ModuleCloseoutReadiness accepted evidence, audit, validation anchors,
    localFullLoopGate, threadRolloverGate, and nextModuleRunCandidate.
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId organization-training-runtime-api-gap-boundary-audit`
  - Result: pass. Test-ModuleRunV2PrePushReadiness accepted git readiness, state SHA match, evidence, and audit.

## Blocked Remainder

- `experience_closed` remains blocked for both use cases until runtime/API gaps, UI entry surfaces, and a future approved
  localhost-only local full-flow validation are complete.
- Manual draft, source context, and copy-to-new-draft persistence remain schema-gated.
- Any schema/drizzle/migration, package/lockfile/dependency, provider/model, env/secret, staging/prod/cloud/deploy/
  payment/external-service, Browser/Playwright runtime, full e2e, PR, force-push, or Cost Calibration Gate work remains
  blocked unless separately approved.
- Evidence intentionally does not include secrets, tokens, cookies, Authorization headers, DB URLs, provider payloads,
  raw prompts, raw answers, public identifier inventories, row data, private data, screenshots, traces, or DOM dumps.
