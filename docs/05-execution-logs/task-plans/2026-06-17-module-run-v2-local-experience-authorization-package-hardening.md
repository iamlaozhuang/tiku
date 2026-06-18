# Module Run v2 Local Experience Authorization Package Hardening Plan

## Task

- Task ID: `module-run-v2-local-experience-authorization-package-hardening`
- Branch: `codex/local-experience-governance-hardening`
- Created at: `2026-06-17T17:45:56-07:00`
- Execution profile: `docs_state_lite`
- Evidence mode: `full`
- Validation policy: `docs_state`

## Approval

Approved by the current 2026-06-17 user prompt to run a small docs/state correction task, then commit, fast-forward
merge to `master`, push `origin/master`, and clean up the short branch. Scope remains docs/state/task-plan/evidence/audit
only.

## Standards Read

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/*.md`

## Scope

Allowed edits:

- `docs/04-agent-system/sop/local-experience-closure-governance.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- Current branch docs/state artifacts from `module-run-v2-local-experience-governance-hardening`
- This task plan, evidence, and audit review

Non-goals:

- Product source, tests, e2e specs, scripts, schema/drizzle/migration, package/lockfile, dependency, provider/model,
  staging/prod/cloud/deploy/payment/external-service, Browser/Playwright runtime validation, dev server, PR, force-push,
  raw/private data exposure, and Cost Calibration Gate work.

## Implementation Plan

1. Add executable authorization package templates to local experience closure governance.
2. Add the current correction task to the queue and make the coverage refresh task depend on it.
3. Complete `humanApproval`, `closeoutPolicy`, and `validationCommandLifecycle` for
   `unified-standard-advanced-current-coverage-refresh`.
4. Update project-state current task and handoff metadata.
5. Write evidence/audit and run declared docs-state validation.
6. Commit, fast-forward merge to `master`, push `origin/master`, and delete the merged short branch after validation.

## Risk Controls

- Keep `local_experience_audit` read-only except docs/state/evidence/audit updates.
- Keep `local_full_flow` separate and task-scoped.
- Do not convert `release_blocked` rows into release approval.
- Preserve all env/secret, provider, schema, dependency, deploy, payment, external-service, PR/force-push, and Cost
  Calibration blocks.
