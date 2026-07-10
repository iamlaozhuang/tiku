# 2026-07-10 0704 Org Employee Import Acceptance Plan

## Task

- taskId: `0704-org-employee-import-acceptance-2026-07-10`
- branch: `codex/0704-org-employee-import-acceptance`
- mode: validation-only localhost acceptance
- priority repair gate: if upload entry or downloadable template is missing, stop queue and open `0704-org-employee-import-template-fix-2026-07-10`

## Read Gate

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/01-requirements/00-index.md`
- `docs/01-requirements/modules/01-user-auth.md`
- `docs/01-requirements/modules/06-admin-ops.md`
- `docs/01-requirements/stories/epic-01-user-auth.md`
- `docs/01-requirements/stories/epic-06-admin-ops.md`
- `docs/01-requirements/advanced-edition/00-index.md`
- `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`
- `docs/01-requirements/advanced-edition/modules/06-ops-authorization-quota.md`
- `docs/01-requirements/advanced-edition/stories/epic-04-ops-authorization-quota-governance.md`
- `docs/01-requirements/traceability/2026-07-02-role-auth-training-ops-decision-package.md`
- `docs/01-requirements/traceability/2026-07-02-current-thread-requirement-reconciliation-ledger.md`
- `docs/01-requirements/traceability/2026-07-02-ui-ux-requirement-design-baseline-gap-analysis.md`
- `docs/01-requirements/traceability/2026-07-07-full-role-uiux-source-implementation-entry.md`
- `docs/05-execution-logs/acceptance/2026-07-10-0704-post-peripheral-acceptance-ledger.md`
- recent org auth multiscope repair/rerun evidence
- private credential index metadata-only readiness preflight

## Acceptance Focus

- Operations or organization surface exposes an employee roster upload entry.
- A downloadable reusable employee import template exists.
- Template excludes `profession`, `level`, `edition`, and internal authorization scope identifiers.
- Preview shows count categories, validation failures, quota impact, inherited authorization categories, and confirmation state.
- Duplicate account, malformed row, insufficient quota, cross-domain conflict, disabled account, and cross-organization conflict categories fail safely.
- Confirmed employees inherit current organization authorization context.
- Disable, removal, password reset, and transfer converge permissions without stale access.

## Execution Boundary

- No source or test edits in this validation task.
- No package or lockfile changes.
- No schema, migration, seed, direct DB connection, DB mutation, destructive DB operation, Provider, env/secret, staging/prod/deploy, screenshot, raw DOM, or Cost Calibration.
- Evidence records only role labels, route labels, status categories, file paths, command results, and test counts.
- Evidence must not record credentials, passwords, cookies, tokens, sessions, localStorage, Authorization headers, env values, DB URLs, raw DB rows, internal numeric ids, Provider payloads, raw prompts, raw AI output, full content, employee raw answers, plaintext `redeem_code`, or private fixture values.

## Validation Steps

1. Confirm branch and repository alignment.
2. Run metadata-only private credential readiness preflight.
3. Inspect requirement SSOT and current source/test contract for employee import.
4. Classify acceptance result:
   - `pass` only if upload entry, downloadable template, preview, and inherited auth/quota categories are represented.
   - `blocked_requires_priority_repair` if a real product capability gap is confirmed.
5. Run targeted employee import/admin ops tests.
6. Run `typecheck`, `lint`, `git diff --check`, and Module Run v2 gates.
7. Write redacted evidence and adversarial audit.
8. Commit, merge to `master`, run master gates, push, delete short branch, confirm clean/aligned.

## Stop Conditions

- Readiness preflight fails.
- Source inspection or tests require credentials, raw DB rows, Provider, env/secret, staging/prod, or direct DB action.
- A product capability gap is confirmed; queue must continue with the priority repair task before task 3.
