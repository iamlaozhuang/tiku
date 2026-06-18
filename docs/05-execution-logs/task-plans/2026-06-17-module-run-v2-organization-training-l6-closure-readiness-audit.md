# Module Run v2 Organization Training L6 Closure Readiness Audit Plan

## Task

- Task ID: `module-run-v2-organization-training-l6-closure-readiness-audit`
- Branch: `codex/organization-training-l6-closure-readiness-audit`
- Execution profile: `local_experience_audit`
- Evidence mode: `full`
- Validation policy: `docs_state`
- Queue selection mode: `ready_set`
- Target experience chain: `organization-training-experience`
- Target use cases:
  - `UC-ADV-ORG-TRAINING-CONTENT-LIFECYCLE`
  - `UC-ADV-EMPLOYEE-TRAINING-ANSWER`

## Approval Boundary

Approved by the current 2026-06-17 user prompt to create and execute
`module-run-v2-organization-training-l6-closure-readiness-audit` with `executionProfile: local_experience_audit`.

Allowed:

- Read requirements, source, tests, e2e spec names, evidence, audit, and state files.
- Run `Get-TikuProjectStatus.ps1`.
- Run `Get-TikuNextAction.ps1 -VerboseHistory`.
- Run read-only diagnostics.
- Run `npm.cmd run test:e2e -- --list`.
- Run lint, typecheck, scoped Prettier check, `git diff --check`, and Module Run v2 readiness gates.
- Modify only docs/state/task-plan/evidence/audit files required for this audit.
- Commit, fast-forward merge to `master`, push `origin/master`, and clean the short branch after validation passes.

Blocked:

- Product source edits.
- Test, e2e, and script edits.
- Dev server startup.
- Browser or Playwright runtime validation.
- Full e2e suite.
- Provider/model calls.
- Schema, drizzle, migration, package, lockfile, or dependency changes.
- `.env*` access, output, or edits.
- Staging, prod, cloud, deploy, payment, external-service, PR, force-push, and Cost Calibration Gate work.
- Secrets, tokens, cookies, Authorization headers, database URLs, provider payloads, raw prompts, raw answers, public identifier inventories, row data, private data, full paper content, and raw employee answer text in evidence.

## Required Context Read

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/*.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/04-agent-system/state/execution-profiles.yaml`
- `docs/04-agent-system/state/mechanism-source-of-truth-index.yaml`
- `docs/04-agent-system/state/advanced-edition-domain-module-run-matrix.yaml`
- `docs/04-agent-system/state/local-experience-coverage-matrix.yaml`
- Requirements traceability and advanced organization-training sources.
- Recent organization-training local role-flow planning and smoke evidence/audit.

## Audit Method

1. Confirm repository posture and current task state from local diagnostics.
2. Materialize this task in `task-queue.yaml` because the current queue has no pending task and the handoff points to this candidate.
3. Inventory organization-training requirement coverage for admin content lifecycle and employee answer lifecycle.
4. Inventory implementation surfaces by path only: service, route, repository, mapper, validator, API route, unit tests, and e2e list.
5. Decide whether the two organization-training use cases can advance to `experience_closed`, or whether the evidence only supports a narrower next local flow task.
6. Update coverage matrix, project state, task queue, evidence, and audit review with the decision.
7. Run docs-state validation and Module Run v2 closeout gates.

## Expected Decision Criteria

`experience_closed` is allowed only if fresh evidence proves a complete local role-flow experience at the approved local level without blocked surfaces. A route-guard smoke, service unit evidence, or publish-only API route is not enough by itself to close L6 if admin or employee entry surfaces are missing.

If the audit finds missing UI/entry/API surfaces, the correct outcome is to keep the affected use cases as `local_experience_ready` or `partial`, and recommend one narrow next task.

## Validation Commands

- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Get-TikuProjectStatus.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Get-TikuNextAction.ps1 -VerboseHistory`
- `npm.cmd run test:e2e -- --list`
- `npx.cmd prettier --check --ignore-unknown docs/04-agent-system/state/local-experience-coverage-matrix.yaml docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-06-17-module-run-v2-organization-training-l6-closure-readiness-audit.md docs/05-execution-logs/evidence/2026-06-17-module-run-v2-organization-training-l6-closure-readiness-audit.md docs/05-execution-logs/audits-reviews/2026-06-17-module-run-v2-organization-training-l6-closure-readiness-audit.md`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `git diff --check`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId module-run-v2-organization-training-l6-closure-readiness-audit`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId module-run-v2-organization-training-l6-closure-readiness-audit`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId module-run-v2-organization-training-l6-closure-readiness-audit`

## Risk Controls

- Keep all evidence redacted and path/count/outcome based.
- Do not promote `local_experience_ready` to `experience_closed` without local role-flow evidence.
- Do not infer release readiness from local audit evidence.
- Preserve provider, env/secret, schema, dependency, staging/prod/deploy, PR/force-push, and Cost Calibration Gate blocks.
