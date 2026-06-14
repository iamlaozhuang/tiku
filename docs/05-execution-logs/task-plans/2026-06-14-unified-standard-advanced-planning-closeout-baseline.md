# Task Plan: unified-standard-advanced-planning-closeout-baseline

## Goal

Close out the local planning and campaign baseline by fast-forward merging it into `master`, validating on `master`,
pushing `origin master`, and deleting merged short branches.

## Required Reads

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/*.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/01-requirements/traceability/unified-standard-advanced-use-case-audit-plan.md`
- `docs/01-requirements/traceability/unified-standard-advanced-audit-campaign-plan.md`
- `docs/05-execution-logs/evidence/2026-06-14-unified-standard-advanced-use-case-audit-planning.md`
- `docs/05-execution-logs/evidence/2026-06-14-unified-standard-advanced-audit-campaign-seeding.md`

## Approved Files

- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/2026-06-14-unified-standard-advanced-planning-closeout-baseline.md`
- `docs/05-execution-logs/evidence/2026-06-14-unified-standard-advanced-planning-closeout-baseline.md`
- `docs/05-execution-logs/audits-reviews/2026-06-14-unified-standard-advanced-planning-closeout-baseline.md`

## Fresh Approval

The user prompt on 2026-06-14 approved:

- executing `unified-standard-advanced-planning-closeout-baseline`;
- merging planning and campaign seeding into `master`;
- running closeout and pre-push validation on `master`;
- pushing `origin master`;
- deleting merged short branches;
- rereading state/queue and stopping without claiming follow-up tasks.

## Blocked Files And Actions

- No `src/**`, `tests/**`, `e2e/**`, `scripts/**`, `schema/migration`, `drizzle/**`, `package.json`, or lockfile changes.
- No `.env.local`, `.env.*`, real secret, provider configuration, raw provider payload, raw prompt, raw response,
  database URL, row data, or cleartext `redeem_code` reads or outputs.
- No real provider calls, model requests, quota use, staging/prod/cloud/deploy/payment/external-service operations.
- No e2e execution, PR creation, force-push, schema/migration, dependency, package, or lockfile work.
- No source code audit, source code fix, or follow-up task claim.

## Implementation Steps

1. Create `codex/unified-standard-advanced-planning-closeout-baseline` from the campaign seeding commit.
2. Update state/queue for this closeout task and record the fresh approval.
3. Write task plan, evidence, and audit review.
4. Run branch validation.
5. Commit only the closeout task files.
6. Fast-forward merge the closeout branch into `master`.
7. Run closeout and pre-push validation on `master`.
8. Push `origin master`.
9. Delete merged local short branches:
   - `codex/unified-standard-advanced-use-case-audit-planning`
   - `codex/unified-standard-advanced-audit-campaign-seeding`
   - `codex/unified-standard-advanced-planning-closeout-baseline`
10. Reread `project-state.yaml` and `task-queue.yaml`, then stop.

## Validation Plan

- `git diff --check`
- `npx.cmd prettier --check --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-06-14-unified-standard-advanced-planning-closeout-baseline.md docs/05-execution-logs/evidence/2026-06-14-unified-standard-advanced-planning-closeout-baseline.md docs/05-execution-logs/audits-reviews/2026-06-14-unified-standard-advanced-planning-closeout-baseline.md`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `npm.cmd run test:unit`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId unified-standard-advanced-planning-closeout-baseline`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId unified-standard-advanced-planning-closeout-baseline`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId unified-standard-advanced-planning-closeout-baseline`

## Risk Defense

- Treat this as baseline closeout only.
- Do not claim `unified-standard-advanced-input-freeze-and-source-index`.
- Do not create PRs or force-push.
- Delete only branches that are already merged into `master`.
- Preserve provider, env/secret, staging/prod/cloud/deploy, payment, external-service, schema/migration, e2e, dependency,
  and Cost Calibration blocks.
