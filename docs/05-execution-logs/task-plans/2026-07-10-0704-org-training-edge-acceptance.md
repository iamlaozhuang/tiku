# 2026-07-10 0704 Organization Training Edge Acceptance Plan

## Scope

- taskId: `0704-org-training-edge-acceptance-2026-07-10`
- branch: `codex/0704-org-training-edge-acceptance`
- mode: validation-only localhost/source/test acceptance
- goal: prove enterprise training edge behavior for source domains, publish scope, version immutability, takedown,
  employee submit-once handling, refresh/resume categories, and formal-learning separation.

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
- `docs/01-requirements/advanced-edition/modules/08-organization-ai-generation.md`
- `docs/01-requirements/advanced-edition/stories/epic-02-organization-training.md`
- `docs/01-requirements/advanced-edition/2026-06-21-enterprise-training-path-closure-plan.md`
- `docs/01-requirements/traceability/2026-07-02-role-auth-training-ops-decision-package.md`
- `docs/01-requirements/traceability/2026-07-02-organization-training-ui-ux-contract.md`
- `docs/01-requirements/traceability/2026-07-02-current-thread-requirement-reconciliation-ledger.md`
- `docs/01-requirements/traceability/2026-07-02-ai-generation-requirements-ssot-alignment.md`
- `docs/01-requirements/traceability/2026-07-02-phase4-requirements-agent-baseline-alignment.md`
- `docs/01-requirements/traceability/2026-07-05-ai-generation-closed-loop-target-alignment.md`
- `docs/01-requirements/traceability/2026-07-06-ai-generation-recontract-requirements-materialization.md`
- `docs/05-execution-logs/acceptance/2026-07-10-0704-post-peripheral-acceptance-ledger.md`
- recent 2026-07-10 organization admin surface, resource/RAG, model/Prompt/log, and audit/privacy evidence

## Readiness

- Private credential index preflight: metadata-only, pass, 9 core role labels found.
- Credential values output: none.
- Browser login, direct DB access, Provider execution, staging/prod/deploy/env/secret/Cost Calibration: blocked.

## Acceptance Targets

- Platform formal content snapshot, organization AI result, and organization-private manual grouping/manual questions are
  represented as enterprise-training source categories where implemented.
- `mock_exam` is not an approved first-release organization training source.
- Publish scope supports current organization and current-plus-descendant categories with organization-boundary checks.
- Published versions are immutable; change paths use copy-to-draft/new-version categories.
- Takedown blocks unstarted and in-progress answers while keeping submitted summaries read-only.
- One employee can submit once per published version; duplicate submit and stale continuation fail safely.
- Deadline, refresh, relogin, resume, and in-progress states converge by status category.
- Enterprise training answer/result records stay outside formal `practice`, `mock_exam`, `exam_report`, and
  `mistake_book` domains.
- Organization admins see redacted aggregate/timeline status only and not employee raw answers.

## Validation Plan

1. Inspect route/service/validator/model/UI tests for source category, publish, version, takedown, answer, duplicate,
   deadline/resume, and formal-domain separation markers.
2. Run focused organization training admin/employee/service/route/repository/contract tests plus relevant organization AI
   handoff and analytics separation tests if needed.
3. Record only role labels, route/control labels, status categories, source categories, command names, and test counts.
4. If a real product defect is found, stop this validation task, record redacted evidence, and open a separate repair
   branch before continuing the serial queue.

## Adversarial Review Checklist

- Role boundary: `org_standard_admin` and `org_standard_employee` cannot manage or answer enterprise training.
- Data boundary: organization training does not write formal `practice`, `mock_exam`, `exam_report`, or `mistake_book`
  records.
- Tenant boundary: organization scope and descendant scope cannot expose sibling or unrelated organization training.
- Employee/admin boundary: organization admins receive summaries/status only; employee raw answers stay out of admin
  surfaces and evidence.
- Source boundary: organization AI output copies only into training draft categories; no formal platform content write or
  Provider execution occurs.
- Lifecycle boundary: publish immutability, copy-to-draft, takedown, deadline, duplicate submit, and resume states fail
  closed.
- Environment boundary: no direct DB, Provider, env/secret, staging/prod/deploy, browser screenshot/raw DOM, package, or
  lockfile action.

## Planned Gates

- metadata-only private credential index preflight
- source marker summary checks
- focused `vitest` pack
- `corepack pnpm@10.26.1 prettier --write --ignore-unknown` on scoped docs
- `corepack pnpm@10.26.1 run lint`
- `corepack pnpm@10.26.1 run typecheck`
- `git diff --check`
- Module Run v2 pre-commit hardening
- Module Run v2 pre-push readiness
