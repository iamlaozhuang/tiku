# Full-role UI/UX batch 1 operations and super admin task plan

Date: 2026-07-07

## Task

Converge the docs-only UI/UX remediation baseline for `ops_admin` and
`super_admin` operations surfaces. This batch covers operations information
architecture, super admin workspace switching, operational list density,
button hierarchy, state copy, and high-risk action guidance.

## Read Gate

- `AGENTS.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/*.md`
- `docs/01-requirements/traceability/2026-07-07-full-role-uiux-remediation-series-plan.md`
- `docs/01-requirements/traceability/2026-07-07-full-role-uiux-batch-0-global-foundation.md`
- `docs/01-requirements/traceability/2026-07-07-full-role-ui-remediation-baseline.md`
- Product Design audit framework and critical overrides
- Repository-external screenshot manifest and the operations/super admin
  contact sheets
- Operations shell and page source files:
  - `src/components/AdminDashboardLayout/AdminDashboardLayout.tsx`
  - `src/features/admin/admin-ops-management/AdminOpsManagement.tsx`
  - `src/features/admin/org-auth-redeem/AdminOrgAuthRedeemPage.tsx`
  - `src/features/admin/contact-config/AdminContactConfigPage.tsx`
  - `src/app/(admin)/ops/ai-audit-logs/AdminAiAuditLogOpsBaseline.tsx`

## Scope

In scope:

- `ops_admin` pages:
  - `ops-organizations`
  - `ops-users`
  - `ops-redeem-codes`
  - `ops-ai-audit-logs`
- `super_admin` operations pages:
  - `ops-contact-config`
  - `ops-users`
  - `ops-organizations`
  - `ops-redeem-codes`
  - `ops-ai-audit-logs`
- `super_admin` workspace switching strategy for `运营后台`, `内容后台`, and
  `组织后台`.

Out of scope:

- Content backend page-level redesign details, except as workspace-switching
  context.
- Organization admin page-level redesign details, except the super admin
  organization workspace entry/state mismatch.
- Code implementation, screenshots, browser reruns, DB reads or writes, account
  or fixture materialization, Provider calls, dependency changes, env changes,
  schema/migration/seed changes, staging/prod/deploy work, release readiness,
  production usability, or Cost Calibration.

## Approach

1. Confirm batch 0 and the series materialization are closed.
2. Inspect the existing operations and super admin screenshots and source
   structure.
3. Record page-level UX opportunities using the Product Design audit lenses:
   task entry, information architecture, hierarchy, state clarity, copy,
   accessibility risks visible from screenshots, and evidence limits.
4. Preserve the explicit product requirement that eligible operations users may
   view plaintext `redeem_code` values in product UI. This batch must not
   recommend masking that surface.
5. Produce a redacted requirement baseline, evidence, and adversarial audit
   review.
6. Update project state and task queue.
7. Run scoped validation, forced self-review, commit, fast-forward merge to
   `master`, push, and clean the short branch.

## Risk Controls

- Evidence records role labels, page labels, counts, and safe UI observations
  only.
- No credentials, sessions, cookies, tokens, env values, DB URLs, DB rows,
  internal ids, provider payloads, raw prompts, raw AI outputs, full questions,
  papers, or materials are recorded.
- Repository-external screenshots stay outside the repository.
- The super admin organization workspace mismatch is treated as a P1 candidate
  for later root-cause analysis, not as a confirmed code defect in this branch.
- No code or runtime behavior is changed.

## Validation Plan

- `git diff --check`
- Scoped Prettier check/write for changed docs and state files
- Redaction scan over new batch 1 documents
- Module Run v2 pre-commit hardening for this task id
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- Module Run v2 pre-push readiness after fast-forward merge
