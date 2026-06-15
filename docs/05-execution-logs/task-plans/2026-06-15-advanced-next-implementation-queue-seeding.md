# advanced-next-implementation-queue-seeding

## Task

Docs-only current-state queue seeding after the public identifier display policy readonly audit.

The task must:

- confirm current queue state from local files;
- carry forward the public identifier display policy `needs_recheck`;
- seed narrow follow-up tasks without executing them;
- preserve all blocked gates.

## Read Before Work

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/*.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/01-requirements/traceability/capability-catalog.md`
- `docs/04-agent-system/state/advanced-edition-code-stage-seeding-plan.yaml`
- `docs/05-execution-logs/evidence/2026-06-15-advanced-personal-ai-generation-result-public-id-display-policy-readonly-audit.md`
- `docs/05-execution-logs/audits-reviews/2026-06-15-advanced-personal-ai-generation-result-public-id-display-policy-readonly-audit.md`

## Queue Baseline

- Before this task, active queue status is `closed=163`, `done=9`, `blocked_validation_failure=1`, `pending=0`.
- The only non-closed item is historical `fix-student-login-local-session-token`, which remains blocked by validation
  failure and is not selected by this seeding task.

## Seed Plan

1. Seed `advanced-personal-ai-generation-result-public-id-display-policy-decision` as the next recommended docs-only
   decision task.
2. Seed `advanced-student-ai-generation-result-public-id-display-ux-redaction` as a conditional implementation candidate
   that remains blocked until the policy decision closes and the user gives fresh approval.
3. Do not execute either seeded task in this task.

## Scope

Allowed writes:

- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- this task plan
- `docs/05-execution-logs/evidence/2026-06-15-advanced-next-implementation-queue-seeding.md`
- `docs/05-execution-logs/audits-reviews/2026-06-15-advanced-next-implementation-queue-seeding.md`

## Blocked Gates

- no `.env*` read/write/output
- no DB access or row/private data inspection
- no provider/model call or provider payload/raw prompt/raw answer inspection
- no quota/cost/Cost Calibration
- no dev server
- no Browser/Playwright/e2e
- no staging/prod/cloud/deploy/payment/external-service
- no schema/drizzle/scripts/package/lockfile/dependency changes
- no formal adoption write
- no implementation or seeded-task execution
- no PR or force push

## Validation

- `git diff --check`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId advanced-next-implementation-queue-seeding`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId advanced-next-implementation-queue-seeding`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId advanced-next-implementation-queue-seeding`
