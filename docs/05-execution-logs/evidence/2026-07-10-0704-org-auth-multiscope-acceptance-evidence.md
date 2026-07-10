# 2026-07-10 0704 Org Auth Multiscope Acceptance Evidence

## Boundary

- Task id: `0704-org-auth-multiscope-acceptance-2026-07-10`
- Branch: `codex/0704-org-auth-multiscope-acceptance`
- Mode: validation-only source and targeted local test inspection.
- Runtime browser: not executed because source inspection confirmed a priority product capability gap before any product
  route write.
- Provider/staging/prod/deploy/env/secret/DB/payment/external-service/Cost Calibration: not executed.
- Evidence redaction: role labels, route labels, status categories, file paths, command names, and test counts only.

## Baseline

- Base branch: latest `origin/master`
- Baseline commit category: `1efadc...`
- Working tree at task start: clean

## Required Reading

Read:

- `AGENTS.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/adr-002-runtime-architecture-and-multi-client-contract.md`
- `docs/02-architecture/adr/adr-004-environment-isolation-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-007-edition-aware-authorization-source-of-truth.md`
- `docs/01-requirements/00-index.md`
- `docs/01-requirements/advanced-edition/00-index.md`
- `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`
- `docs/01-requirements/advanced-edition/modules/06-ops-authorization-quota.md`
- `docs/01-requirements/modules/01-user-auth.md`
- `docs/01-requirements/modules/06-admin-ops.md`
- `docs/01-requirements/traceability/2026-07-02-role-auth-training-ops-decision-package.md`
- `docs/01-requirements/traceability/2026-07-02-current-thread-requirement-reconciliation-ledger.md`
- `docs/05-execution-logs/acceptance/2026-07-10-0704-post-peripheral-acceptance-ledger.md`
- `docs/05-execution-logs/acceptance/2026-07-10-0704-acceptance-coverage-ledger.md`
- `docs/05-execution-logs/handoffs/2026-07-10-0704-private-account-usage-guide.md`
- private 0704 credential index and catalog metadata only

## Redacted Readiness Preflight

| Role catalog category | Result |
| --------------------- | ------ |
| Core roles checked    | 9      |
| Core readiness state  | pass   |
| Auxiliary fixture     | usable |
| Credential output     | none   |

## Requirement Findings

The requirement source requires the operations enterprise authorization package to support a multi-scope commercial flow:

- one package may cover multiple `profession + level` combinations;
- the UI should show selected bundle, expanded atomic scope rows, quota, expiry, cancellation differences, and conflict
  warnings before submit;
- active overlap on the same atomic scope is blocked by default;
- source records keep original `edition`, while capability checks use computed `effectiveEdition`.

## Source Inspection Findings

| Area                         | Files inspected                                                                                                 | Redacted finding                                                                                              |
| ---------------------------- | --------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| Operations UI surface        | `src/features/admin/admin-ops-management/AdminOpsManagement.tsx`                                                | The enterprise authorization panel is list-only; no create flow, no multi-select package UI, no preview step. |
| Create input validator       | `src/server/validators/org-auth.ts`                                                                             | Create input accepts scalar `profession` and scalar `level`; no multi-value arrays or `subject` scope input.  |
| Service and route contract   | `src/server/services/organization-auth-service.ts`, `src/server/services/organization-auth-route.ts`            | Create route submits one normalized `org_auth` object; no atomic expansion loop or preview contract.          |
| DTO/repository shape         | `src/server/contracts/organization-auth-contract.ts`, `src/server/repositories/organization-auth-repository.ts` | Organization authorization DTO/repository row carries one `profession` and one `level` per authorization row. |
| Targeted baseline test shape | `src/server/services/organization-auth-service.test.ts`, `src/server/services/organization-auth-route.test.ts`  | Existing tests cover single-scope create/cancel and overlap rejection only.                                   |

## Acceptance Decision

Result: `blocked_requires_priority_repair`.

The acceptance standard is not met because the product currently lacks the required operations multi-select enterprise
authorization UI, expanded atomic-scope preview, and backend contract for one submitted package to atomize multiple
selected scopes. This is a real product capability gap, not an account readiness issue.

Required next task: `0704-org-auth-multiscope-ui-fix-2026-07-10`.

The serial queue must not continue to `0704-org-employee-import-acceptance-2026-07-10` until the repair is merged,
pushed, cleaned up, and this affected validation is rerun successfully.

## Targeted Test Evidence

| Command category                                    | Result                    |
| --------------------------------------------------- | ------------------------- |
| Initial targeted test command with unsupported flag | failed_tool_option_retry  |
| Targeted org auth and ops UI baseline tests         | pass: 6 files / 22 tests  |
| Scoped Prettier write                               | pass                      |
| Scoped Prettier check                               | pass                      |
| `git diff --check`                                  | pass                      |
| `lint`                                              | pass                      |
| `typecheck`                                         | pass                      |
| Initial Module Run v2 pre-commit hardening          | failed_queue_anchor_parse |
| Module Run v2 pre-commit hardening after queue fix  | pass                      |
| Module Run v2 pre-push readiness                    | pass                      |

Passing baseline tests confirm the existing single-scope behavior still works; they do not satisfy the missing
multi-scope acceptance standard.

The Module Run v2 retry did not change product source. It normalized the current task's `blockedFiles` list so the guard
can parse the active validation task while preserving the shared blocked-file anchor for later tasks.

## Redaction Check

No credential, password, session, cookie, token, Authorization header, env value, DB URL, raw DB row, internal numeric id,
Provider payload, raw prompt, raw AI output, full question, full paper, material, resource, chunk, employee raw answer,
plaintext `redeem_code`, screenshot, trace, raw DOM, or private fixture value is recorded in this evidence.
