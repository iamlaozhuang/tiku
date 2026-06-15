# Task Plan: advanced-organization-training-boundary-readonly-audit

## Objective

Perform a readonly audit of the current organization training boundary before any organization training contract or
validator implementation. The audit must determine whether the next TDD scaffold task is executable under the queued
scope.

## Fresh Approval

- User approval: "批准执行" in the current 2026-06-15 Codex thread.
- Approved actions for this task only: claim the readonly audit, create task plan/evidence/audit docs, update durable
  task state, run declared local validation, commit, fast-forward merge to `master`, push `origin/master`, delete the
  short branch, fetch/prune, and confirm clean.
- This approval does not approve product implementation, DB access, provider/model calls, schema/migration, package or
  lockfile changes, dev server, Browser/Playwright/e2e, staging/prod/cloud/deploy/payment/external-service work, PR, or
  force push.

## Required Context Read

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/adr-001-tech-stack-selection.md`
- `docs/02-architecture/adr/adr-002-runtime-architecture-and-multi-client-contract.md`
- `docs/02-architecture/adr/adr-003-workplace-desktop-web-compatibility.md`
- `docs/02-architecture/adr/adr-004-environment-isolation-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-005-staging-architecture-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-006-runtime-dependency-alignment.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/01-requirements/traceability/capability-catalog.md`
- `docs/04-agent-system/state/advanced-edition-code-stage-seeding-plan.yaml`
- `docs/superpowers/specs/2026-06-06-advanced-edition-mvp-requirements.md`
- `docs/superpowers/plans/2026-06-06-advanced-edition-organization-training-implementation-plan.md`
- `docs/01-requirements/advanced-edition/modules/04-organization-training.md`
- `docs/01-requirements/advanced-edition/stories/epic-02-organization-training.md`
- `docs/01-requirements/advanced-edition/stories/epic-03-employee-answer-statistics.md`
- `docs/05-execution-logs/evidence/2026-06-15-advanced-next-implementation-queue-seeding-post-model-config-redaction.md`
- `docs/05-execution-logs/audits-reviews/2026-06-15-advanced-next-implementation-queue-seeding-post-model-config-redaction.md`

## Readonly Source Surfaces

- `src/server/services/organization-auth-service.ts`
- `src/server/services/organization-auth-route.ts`
- `src/server/services/employee-account-service.ts`
- `src/server/validators/ai-generation-task-request.ts`
- `src/server/services/personal-ai-generation-result-reference-service.ts`
- `src/server/services/personal-ai-generation-request-flow-service.ts`
- `src/server/services/personal-ai-generation-request-route.ts`

## Audit Questions

1. Does current code already provide isolated organization training draft/version/answer runtime surfaces?
2. Does current code preserve ADR-002 layering expectations for existing organization authorization and employee account
   surfaces?
3. Does current AI task request boundary already recognize `organization_training_generation` without provider/model
   execution?
4. Is formal content isolation still true for organization training, including no writes to formal `question`, `paper`,
   `practice`, `mock_exam`, `answer_record`, `exam_report`, or `mistake_book`?
5. Are employee answer privacy and admin summary-only requirements still unimplemented and therefore safe to defer to
   future scoped tasks?
6. Can the next contract/validator TDD scaffold proceed without route/service/repository/schema/provider/package/UI work?

## Blocked Gates

- No `.env*` read/write/output.
- No DB access and no direct row/private data read.
- No provider/model calls or provider configuration.
- No provider payload, raw prompt, or raw answer inspection.
- No quota/cost measurement and no Cost Calibration Gate.
- No dev server, Browser, Playwright, or e2e.
- No staging/prod/cloud/deploy/payment/external-service access.
- No schema, drizzle, scripts, package, lockfile, dependency, route, service, repository, UI, or API contract changes.
- No formal content write or formal adoption target write.
- No public identifier value list exposure in evidence.
- No PR and no force push.

## Planned Outputs

- `docs/05-execution-logs/evidence/2026-06-15-advanced-organization-training-boundary-readonly-audit.md`
- `docs/05-execution-logs/audits-reviews/2026-06-15-advanced-organization-training-boundary-readonly-audit.md`
- Durable state updates in `docs/04-agent-system/state/project-state.yaml` and
  `docs/04-agent-system/state/task-queue.yaml`.

## Validation

```powershell
npm.cmd run test:unit -- "src/server/services/organization-auth-service.test.ts" "src/server/services/employee-account-service.test.ts" "src/server/services/personal-ai-generation-result-reference-service.test.ts"
git diff --check
npm.cmd run lint
npm.cmd run typecheck
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId advanced-organization-training-boundary-readonly-audit
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId advanced-organization-training-boundary-readonly-audit
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId advanced-organization-training-boundary-readonly-audit
```

## Risk Controls

- Evidence records only file paths, field names, policy conclusions, command names, pass/fail results, and redacted
  summaries.
- The audit may recommend the next scaffold task only if it remains limited to contract/model/validator/test files.
- Any finding requiring service, route, repository, schema, DB, provider, package, UI, or formal content write must be
  recorded as blocked or future scoped work, not implemented in this task.
