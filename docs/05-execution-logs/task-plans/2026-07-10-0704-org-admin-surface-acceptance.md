# 2026-07-10 0704 Organization Admin Surface Acceptance Plan

## Scope

- taskId: `0704-org-admin-surface-acceptance-2026-07-10`
- branch: `codex/0704-org-admin-surface-acceptance`
- mode: validation-only localhost/source/test acceptance
- goal: prove organization administrator workspaces preserve standard/advanced surface separation, organization-scoped access, and raw learner/AI/privacy boundaries.

## Required Reading Completed

- `AGENTS.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/adr-007-edition-aware-authorization-source-of-truth.md`
- `docs/01-requirements/00-index.md`
- `docs/01-requirements/advanced-edition/00-index.md`
- `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`
- `docs/01-requirements/advanced-edition/modules/04-organization-training.md`
- `docs/01-requirements/advanced-edition/modules/05-organization-analytics.md`
- `docs/01-requirements/advanced-edition/modules/07-retention-log-governance.md`
- `docs/01-requirements/modules/06-admin-ops.md`
- `docs/01-requirements/traceability/2026-07-02-role-auth-training-ops-decision-package.md`
- `docs/01-requirements/traceability/2026-07-02-current-thread-requirement-reconciliation-ledger.md`
- `docs/05-execution-logs/acceptance/2026-07-10-0704-post-peripheral-acceptance-ledger.md`
- latest rerun evidence for `0704-org-tree-auth-inheritance-acceptance-rerun-2026-07-10`

## Readiness

- Private credential index preflight: metadata-only, pass, 9 core role labels found.
- Credential values output: none.
- Browser login, direct DB access, Provider execution, staging/prod/deploy/env/secret/Cost Calibration: blocked.

## Acceptance Targets

- `org_standard_admin` sees only scoped employee roster/status, organization authorization/status, organization info, and support surfaces.
- `org_advanced_admin` additionally sees eligible organization training, organization analytics, and organization AI surfaces inside organization scope.
- Organization admins cannot access global operations, content authoring, model configuration, Prompt governance, global logs, global `redeem_code`, or global `org_auth`.
- Organization admins cannot view employee learner AI raw results, raw answers, raw generated content, Provider payloads, raw Prompt text, or global AI task payloads.
- Standard organization admin direct access to advanced organization routes returns an explicit denied/unavailable state.

## Validation Plan

1. Inspect source and route/test markers for organization admin navigation, role guards, advanced route denial, operations/content/global surface exclusion, and redaction boundaries.
2. Run focused tests for admin dashboard navigation, workspace role guard, organization portal/training/analytics entry surfaces, organization AI entry boundary, and AI audit/log redaction where relevant.
3. Record only redacted role labels, route/control labels, state categories, command names, and test counts.
4. If a true product defect is found, stop this validation task, record redacted evidence, and open a separate repair branch before continuing the queue.

## Adversarial Review Checklist

- Role boundary: standard org admin is not granted advanced-only enterprise training, analytics, or organization AI.
- Data boundary: all organization admin lists/details/statistics remain scoped to the bound organization context.
- Sensitive information: no raw employee answer, learner AI raw result, raw AI IO, Provider payload, raw Prompt, credential, session, or plaintext `redeem_code` evidence.
- Workspace boundary: organization admins do not inherit platform operations, content authoring, model/Prompt, global log, global `redeem_code`, or global `org_auth` surfaces.
- Standard/advanced boundary: denied states are explicit and not menu-only hiding.

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
