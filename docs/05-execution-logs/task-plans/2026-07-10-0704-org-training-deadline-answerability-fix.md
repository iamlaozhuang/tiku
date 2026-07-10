# 2026-07-10 0704 Organization Training Deadline Answerability Fix Plan

## Scope

- taskId: `0704-org-training-deadline-answerability-fix-2026-07-10`
- branch: `codex/0704-org-training-deadline-answerability-fix`
- mode: targeted source repair with redacted local validation
- trigger: `0704-org-training-edge-acceptance-2026-07-10` blocked on
  `missing_answer_deadline_persistence_and_answerability_enforcement`.

## Required Reading Completed

- `AGENTS.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/01-requirements/00-index.md`
- `docs/01-requirements/advanced-edition/00-index.md`
- `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`
- `docs/01-requirements/advanced-edition/modules/04-organization-training.md`
- `docs/01-requirements/advanced-edition/stories/epic-02-organization-training.md`
- `docs/01-requirements/advanced-edition/2026-06-21-enterprise-training-path-closure-plan.md`
- `docs/01-requirements/traceability/2026-07-02-role-auth-training-ops-decision-package.md`
- `docs/01-requirements/traceability/2026-07-02-organization-training-ui-ux-contract.md`
- `docs/01-requirements/traceability/2026-07-02-current-thread-requirement-reconciliation-ledger.md`
- `docs/05-execution-logs/evidence/2026-07-10-0704-org-training-edge-acceptance-evidence.md`
- `docs/05-execution-logs/audits-reviews/2026-07-10-0704-org-training-edge-acceptance-audit.md`

## Readiness

- Private credential index preflight: metadata-only, pass, 9 core role labels found.
- Credential values output: none.
- Browser login, direct DB access/mutation, Provider execution, staging/prod/deploy/env/secret/Cost Calibration:
  blocked.

## TDD Repair Plan

1. RED: add failing validator/model/service/repository/mapper/UI tests proving `answerDeadlineAt` is accepted,
   persisted/mapped, rendered in publish input, and blocks visible list, draft save, and submit after expiry.
2. GREEN: add minimal `answerDeadlineAt` wiring through publish input, validator, service write, schema field, mapper,
   repository select/insert, and admin publish form.
3. GREEN: change answerability to use injected clock and return `answer_deadline_expired` for employee draft/submit after
   the deadline.
4. REFACTOR: keep deadline handling isolated and preserve existing takedown, duplicate-submit, organization scope,
   formal-domain separation, and redaction behavior.

## Implementation Boundaries

- Allowed source area: organization training schema/model/contract/validator/service/repository/mapper/admin and employee
  UI/tests listed in the queue item.
- Migration file may be created but not executed against any database.
- No package or lockfile changes.
- No direct DB connection, DB mutation, destructive DB operation, seed, fixture import, Provider call, staging/prod/deploy,
  env/secret read, screenshot, trace, or raw DOM capture.
- Evidence records only file/test/gate status categories and contains no account, credential, DB row, internal id, raw
  employee answer, full question/material, Provider payload, raw prompt, or raw AI output.

## Adversarial Review Checklist

- Role boundary: standard organization roles remain denied enterprise training capability.
- Data boundary: enterprise training still does not write formal `practice`, `mock_exam`, `exam_report`, or
  `mistake_book`.
- Tenant boundary: deadline repair must not weaken publish-scope or employee organization visibility checks.
- Employee/admin boundary: admin surfaces stay summary/status oriented; raw employee answers remain blocked.
- Lifecycle boundary: deadline, takedown, duplicate submit, published-version immutability, and read-only submitted
  summaries fail closed.
- Environment boundary: no direct DB execution, Provider, env/secret, staging/prod/deploy, package, or lockfile change.

## Planned Gates

- RED focused tests before production code.
- Targeted focused tests after implementation.
- Scoped Prettier on changed files.
- `git diff --check`.
- `corepack pnpm@10.26.1 run lint`.
- `corepack pnpm@10.26.1 run typecheck`.
- Module Run v2 pre-commit hardening.
- Module Run v2 pre-push readiness.
