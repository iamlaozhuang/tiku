# 2026-07-10 0704 Organization Training Edge Acceptance Rerun Plan

## Scope

- taskId: `0704-org-training-edge-acceptance-rerun-2026-07-10`
- branch: `codex/0704-org-training-edge-acceptance-rerun`
- mode: validation-only source/test rerun after repair
- repair dependency: `0704-org-training-deadline-answerability-fix-2026-07-10`

## Required Reading Completed

- `AGENTS.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/acceptance/2026-07-10-0704-post-peripheral-acceptance-ledger.md`
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
- `docs/05-execution-logs/evidence/2026-07-10-0704-org-training-deadline-answerability-fix-evidence.md`
- `docs/05-execution-logs/audits-reviews/2026-07-10-0704-org-training-deadline-answerability-fix-audit.md`

## Readiness

- Private credential index preflight: metadata-only, pass, 9 core role labels found.
- Credential values output: none.
- Current branch is based on clean `master` aligned with `origin/master` at the repair commit.
- Browser login, direct DB access/mutation, Provider execution, staging/prod/deploy/env/secret/Cost Calibration:
  blocked.

## Validation Plan

1. Recheck source markers for repaired deadline flow, source categories, evidence gating, takedown, duplicate-submit,
   visible-list filtering, and formal-domain separation.
2. Run focused organization-training schema/validator/service/route/repository/mapper/admin UI/employee UI tests.
3. Run adjacent AI paper source-consumption tests to ensure DTO compatibility remains intact.
4. Record only redacted status categories and test counts.
5. Perform adversarial review for role boundary, organization scope, deadline/takedown lifecycle, formal-domain
   separation, employee answer privacy, and sensitive evidence.

## Stop Conditions

- Any source/test regression in repaired deadline behavior.
- Any evidence of `mock_exam` source acceptance for first-release training.
- Any formal-domain write path to `practice`, `mock_exam`, formal answer record, `exam_report`, or `mistake_book`.
- Any admin visibility path for raw employee answer, raw learner AI result, raw Prompt, Provider payload, or full
  committed content.
- Any need for source changes. If found, stop this validation-only task and open a separate repair task.

## Planned Gates

- Focused `vitest` pack.
- `corepack pnpm@10.26.1 run lint`.
- `corepack pnpm@10.26.1 run typecheck`.
- `git diff --check`.
- Module Run v2 pre-commit hardening.
- Module Run v2 pre-push readiness.
