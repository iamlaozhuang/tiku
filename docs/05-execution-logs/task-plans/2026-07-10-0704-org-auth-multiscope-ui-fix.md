# 2026-07-10 0704 Org Auth Multiscope UI Fix Plan

## Task

- Task id: `0704-org-auth-multiscope-ui-fix-2026-07-10`
- Branch: `codex/0704-org-auth-multiscope-ui-fix`
- Trigger: `0704-org-auth-multiscope-acceptance-2026-07-10` found a priority capability gap.

## Required Reading

Read:

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/01-requirements/00-index.md`
- `docs/01-requirements/advanced-edition/00-index.md`
- `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`
- `docs/01-requirements/advanced-edition/modules/06-ops-authorization-quota.md`
- `docs/01-requirements/modules/01-user-auth.md`
- `docs/01-requirements/modules/06-admin-ops.md`
- `docs/01-requirements/traceability/2026-07-02-role-auth-training-ops-decision-package.md`
- `docs/01-requirements/traceability/2026-07-02-current-thread-requirement-reconciliation-ledger.md`
- `docs/01-requirements/traceability/2026-07-07-full-role-uiux-source-implementation-entry.md`
- `docs/01-requirements/traceability/2026-07-07-full-role-ui-remediation-baseline.md`
- `docs/01-requirements/traceability/2026-07-07-full-role-uiux-batch-0-global-foundation.md`
- `docs/01-requirements/traceability/2026-07-07-full-role-uiux-batch-1-operations-and-super-admin.md`
- `docs/01-requirements/traceability/2026-07-07-full-role-uiux-local-design-board-materialization.md`
- `docs/01-requirements/traceability/2026-07-07-full-role-uiux-baseline-design-review.md`
- `docs/05-execution-logs/evidence/2026-07-10-0704-org-auth-multiscope-acceptance-evidence.md`
- private 0704 credential index metadata only

## Scope

Implement the smallest source repair needed for operations enterprise authorization package creation:

- UI supports selecting multiple `profession` values and multiple `level` values in one package flow.
- Submit payload carries `scopeSelections` as expanded `profession + level` atoms.
- Backend validates either legacy single-scope payload or new package payload.
- Backend checks overlaps for every atom before creating any atom.
- Backend creates one existing `org_auth` row per selected atom, preserving the current no-migration boundary.
- Response includes `orgAuths` plus legacy `orgAuth` for compatibility.

## Out Of Scope

- No schema or migration.
- No subject-scoped persistence; current `org_auth` has no `subject` column. Existing source treats missing subject as broad subject coverage until a future reviewed `org_auth_scope` schema task.
- No Provider, staging, prod, deploy, env, secret, dependency, Cost Calibration, screenshot, or raw DOM work.
- No destructive DB operation.

## TDD Plan

1. Add failing service tests for package expansion, full overlap preflight, and legacy single-scope compatibility.
2. Add failing admin runtime route tests for `scopeSelections` payload and `orgAuths` response.
3. Add failing UI test proving multi-profession / multi-level preview and submit payload.
4. Implement validator, service, route, contract, mapper, and UI changes.
5. Re-run targeted tests, then quality gates.

## Validation Plan

- `corepack pnpm@10.26.1 vitest run src/server/services/organization-auth-service.test.ts src/server/services/organization-auth-route.test.ts tests/unit/phase-11-system-ops-org-auth-management-loop.test.ts tests/unit/admin-user-org-auth-ops-baseline.test.ts`
- Scoped Prettier write/check for changed source, test, plan, evidence, and audit files.
- `git diff --check`
- `corepack pnpm@10.26.1 run lint`
- `corepack pnpm@10.26.1 run typecheck`
- Module Run v2 pre-commit hardening for this task id.
- Module Run v2 pre-push readiness for this task id with remote-ahead skip when already verified by git status.

## Evidence Rules

Evidence records only file paths, command names, pass/fail status, test counts, role labels, route labels, and status categories. It must not record credentials, sessions, cookies, tokens, env values, DB URLs, raw DB rows, internal numeric ids, Provider payloads, raw prompts, raw AI outputs, full question/paper/material/resource/chunk, raw employee answers, or plaintext `redeem_code`.

## Adversarial Review Focus

- Standard/advanced edition remains source-backed and service-enforced.
- UI visibility does not become authorization boundary.
- `auth_scope_type` remains organization coverage only.
- One package submission is atomized into existing single-scope rows.
- Any overlap blocks the whole package before creation.
- Employee ability still derives from `org_auth`, not employee import fields.
- Evidence and audit stay redacted.
