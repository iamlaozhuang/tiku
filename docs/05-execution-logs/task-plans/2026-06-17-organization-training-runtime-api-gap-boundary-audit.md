# Organization Training Runtime API Gap Boundary Audit

## Task

- Task ID: `organization-training-runtime-api-gap-boundary-audit`
- Branch: `codex/organization-training-runtime-api-gap-boundary-audit`
- Execution profile: `local_experience_audit`
- Evidence mode: `full`
- Validation policy: `docs_state`
- Target experience chain: `organization-training-experience`
- Target use cases:
  - `UC-ADV-ORG-TRAINING-CONTENT-LIFECYCLE`
  - `UC-ADV-EMPLOYEE-TRAINING-ANSWER`

## Approval Boundary

Approved by the current 2026-06-17 user prompt: "批准执行，按机制规范推进。"

This approval executes the current handoff recommendation recorded in `project-state.yaml`:
`organization-training-runtime-api-gap-boundary-audit`.

Allowed:

- Read requirements, traceability, source, tests, e2e spec names, evidence, audit, and state.
- Read relevant schema source files only to decide whether a future implementation needs a schema approval gate.
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
  identifier inventories, row data, private data, full paper content, raw employee answer text, screenshots, traces, and
  DOM dumps in evidence.

## Required Context Read

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/*.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/04-agent-system/state/execution-profiles.yaml`
- `docs/04-agent-system/state/local-experience-coverage-matrix.yaml`
- Previous task evidence and audit:
  - `docs/05-execution-logs/evidence/2026-06-17-organization-training-admin-employee-entry-surface-planning.md`
  - `docs/05-execution-logs/audits-reviews/2026-06-17-organization-training-admin-employee-entry-surface-planning.md`
- Organization-training requirements, source, route/API, repository, validator, contract, mapper, focused tests, e2e spec
  names, and relevant schema source inventory.

## Audit Method

1. Reconfirm the organization-training use-case boundaries from requirements and traceability.
2. Inventory current runtime API surfaces and distinguish exposed route handlers from service-only capabilities.
3. Inventory route store and repository persistence boundaries to identify which service capabilities are not runtime
   wired.
4. Read relevant schema source files only enough to decide whether each future implementation slice can proceed without
   schema changes, needs a schema gate, or needs a narrower audit first.
5. Update coverage matrix and handoff state with a concrete next task and blocked gates.
6. Keep future source implementation tasks planned but not activated unless the task queue explicitly marks them as
   executable with fresh approval.

## Validation Commands

- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Get-TikuProjectStatus.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Get-TikuNextAction.ps1 -VerboseHistory`
- `npm.cmd run test:e2e -- --list`
- `npx.cmd prettier --check --ignore-unknown docs/04-agent-system/state/local-experience-coverage-matrix.yaml docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-06-17-organization-training-runtime-api-gap-boundary-audit.md docs/05-execution-logs/evidence/2026-06-17-organization-training-runtime-api-gap-boundary-audit.md docs/05-execution-logs/audits-reviews/2026-06-17-organization-training-runtime-api-gap-boundary-audit.md`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `git diff --check`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId organization-training-runtime-api-gap-boundary-audit`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId organization-training-runtime-api-gap-boundary-audit`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId organization-training-runtime-api-gap-boundary-audit`

## Expected Output

- A docs/state runtime API boundary audit.
- A decision on whether the next implementation task can proceed without schema changes.
- A concrete next recommended task with allowedFiles, blockedFiles, validation commands, and risk gates.
- No source or schema implementation in this task.
