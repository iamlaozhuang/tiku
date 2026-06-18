# Organization Training Admin Employee Entry Surface Planning

## Task

- Task ID: `organization-training-admin-employee-entry-surface-planning`
- Branch: `codex/organization-training-entry-surface-planning`
- Execution profile: `local_experience_audit`
- Evidence mode: `full`
- Validation policy: `docs_state`
- Target experience chain: `organization-training-experience`
- Target use cases:
  - `UC-ADV-ORG-TRAINING-CONTENT-LIFECYCLE`
  - `UC-ADV-EMPLOYEE-TRAINING-ANSWER`

## Approval Boundary

Approved by the current 2026-06-17 user prompt to create and execute
`organization-training-admin-employee-entry-surface-planning`.

Allowed:

- Read requirements, source, tests, e2e spec names, evidence, audit, and state.
- Run `Get-TikuProjectStatus.ps1`.
- Run `Get-TikuNextAction.ps1 -VerboseHistory`.
- Run `npm.cmd run test:e2e -- --list`.
- Run lint, typecheck, scoped Prettier, `git diff --check`, and Module Run v2 readiness gates.
- Modify only coverage matrix, project-state, task-queue, task plan, evidence, and audit.

Closeout:

- This task may use the standing docs/state closeout authorization only if its task queue entry materializes
  `closeoutPolicy` and all readiness gates pass.

Blocked:

- Product source edits.
- Test, e2e, and script edits.
- Schema, drizzle, migration, package, lockfile, or dependency changes.
- `.env*` access, output, or edits.
- Provider/model calls.
- Dev server startup.
- Browser/Playwright runtime validation.
- Full e2e.
- Staging, prod, cloud, deploy, payment, external-service, PR, force-push, and Cost Calibration Gate.
- Secrets, tokens, cookies, Authorization headers, database URLs, provider payloads, raw prompts, raw answers, public
  identifier inventories, row data, private data, full paper content, and raw employee answer text in evidence.

## Required Context Read

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/*.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/04-agent-system/state/execution-profiles.yaml`
- `docs/04-agent-system/state/local-experience-coverage-matrix.yaml`
- `docs/05-execution-logs/evidence/2026-06-17-module-run-v2-organization-training-l6-closure-readiness-audit.md`
- `docs/05-execution-logs/audits-reviews/2026-06-17-module-run-v2-organization-training-l6-closure-readiness-audit.md`
- Organization-training requirements, source, tests, and e2e spec names.

## Planning Method

1. Reconfirm current admin and employee organization-training requirement gaps.
2. Reconfirm current route, repository, service, UI, and e2e surfaces by path only.
3. Split the smallest executable task queue that can advance from service/publish-only readiness toward role-flow
   closure without mock-only shortcuts.
4. Keep the future sequence ordered so runtime/API gaps precede visible UI entry work, and visible UI precedes future
   `local_full_flow` validation.
5. Update coverage matrix, project-state, task-queue, evidence, and audit.

## Validation Commands

- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Get-TikuProjectStatus.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Get-TikuNextAction.ps1 -VerboseHistory`
- `npm.cmd run test:e2e -- --list`
- `npx.cmd prettier --check --ignore-unknown docs/04-agent-system/state/local-experience-coverage-matrix.yaml docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-06-17-organization-training-admin-employee-entry-surface-planning.md docs/05-execution-logs/evidence/2026-06-17-organization-training-admin-employee-entry-surface-planning.md docs/05-execution-logs/audits-reviews/2026-06-17-organization-training-admin-employee-entry-surface-planning.md`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `git diff --check`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId organization-training-admin-employee-entry-surface-planning`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId organization-training-admin-employee-entry-surface-planning`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId organization-training-admin-employee-entry-surface-planning`

## Expected Output

- A closed docs/state planning task.
- A narrow pending implementation queue for:
  - organization-training runtime route/API gaps.
  - organization admin entry surface.
  - employee training answer entry surface.
  - later local full-flow validation only after entry surfaces exist.
- No source or test implementation in this task.
