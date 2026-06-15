# Task Plan: advanced-organization-training-contract-validation-scaffold

## Objective

Implement the narrow organization training contract/model/validator scaffold using TDD. The scaffold defines DTOs,
domain status/type constants, first-release question type validation, publish confirmation validation, takedown reason
validation, and copy-to-new-draft validation. It must not add runtime route/service/repository/schema/provider/UI
behavior.

## Fresh Approval

- User approval: "批准执行" in the current 2026-06-15 Codex thread.
- Approved actions for this task only: claim this TDD scaffold task, create task plan/evidence/audit docs, update durable
  task state, edit the four queued source/test files, run declared local validation, commit, fast-forward merge to
  `master`, push `origin/master`, delete the short branch, fetch/prune, and confirm clean.
- This approval does not approve route/service/repository/API runtime work, DB access, schema/migration, provider/model
  calls, package/lockfile/dependency changes, dev server, Browser/Playwright/e2e, staging/prod/cloud/deploy/payment/
  external-service work, formal content writes, PR, or force push.

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
- `docs/05-execution-logs/evidence/2026-06-15-advanced-organization-training-boundary-readonly-audit.md`
- `docs/05-execution-logs/audits-reviews/2026-06-15-advanced-organization-training-boundary-readonly-audit.md`

## Allowed Files

- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/2026-06-15-advanced-organization-training-contract-validation-scaffold.md`
- `docs/05-execution-logs/evidence/2026-06-15-advanced-organization-training-contract-validation-scaffold.md`
- `docs/05-execution-logs/audits-reviews/2026-06-15-advanced-organization-training-contract-validation-scaffold.md`
- `src/server/contracts/organization-training-contract.ts`
- `src/server/models/organization-training.ts`
- `src/server/validators/organization-training.ts`
- `src/server/validators/organization-training.test.ts`

## TDD Plan

1. RED: create `src/server/validators/organization-training.test.ts` first, importing the intended model and validator
   APIs before implementation exists.
2. Verify RED: run `npm.cmd run test:unit -- "src/server/validators/organization-training.test.ts"` and record expected
   missing-module or missing-export failure.
3. GREEN: add the minimum model, contract, and validator code required for the tests.
4. Verify GREEN: rerun the scoped unit test until it passes.
5. Broaden validation only after GREEN: `git diff --check`, `npm.cmd run lint`, `npm.cmd run typecheck`, and Module Run
   v2 closeout gates.

## Expected Behaviors

- First-release question types accepted: `single_choice`, `multi_choice`, `true_false`, `short_answer`.
- Deferred question types rejected: `fill_blank`, `case_analysis`, `calculation`.
- Publish confirmation requires title, question list, allowed question type, positive score, standard answer, analysis
  summary, organization scope, and capability context.
- Takedown input requires a non-empty reason.
- Copy-to-new-draft input requires a source version public id and a non-empty new draft title.
- DTOs use camelCase fields and optional fields use `null`, not empty strings or omitted keys.
- DTO/model types contain public identifiers only; no numeric id fields, plaintext `redeem_code`, raw prompt, raw model
  output, provider payload, secret, token, employee subjective answer text, or formal content write behavior.

## Blocked Gates

- No `.env*` read/write/output.
- No DB access and no direct row/private data read.
- No provider/model calls or provider configuration.
- No provider payload, raw prompt, or raw answer inspection.
- No quota/cost measurement and no Cost Calibration Gate.
- No dev server, Browser, Playwright, or e2e.
- No staging/prod/cloud/deploy/payment/external-service access.
- No schema, drizzle, scripts, package, lockfile, dependency, route, service, repository, mapper, UI, or API runtime
  changes.
- No formal `question`, `paper`, `practice`, `mock_exam`, `answer_record`, `exam_report`, or `mistake_book` writes.
- No public identifier value list exposure in evidence.
- No PR and no force push.

## Validation

```powershell
npm.cmd run test:unit -- "src/server/validators/organization-training.test.ts"
git diff --check
npm.cmd run lint
npm.cmd run typecheck
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId advanced-organization-training-contract-validation-scaffold
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId advanced-organization-training-contract-validation-scaffold
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId advanced-organization-training-contract-validation-scaffold
```

## Risk Controls

- Keep implementation declarative and local-only; no repository or runtime side effects.
- Use existing normalization style from adjacent validators.
- Keep evidence redacted and limited to command results, file paths, and policy conclusions.
- Stop immediately on validation failure, remote divergence, out-of-scope file changes, or blocked gate.
