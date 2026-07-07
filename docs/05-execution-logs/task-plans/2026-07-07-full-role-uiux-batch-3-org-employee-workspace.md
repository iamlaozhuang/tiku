# 2026-07-07 Full-role UI/UX batch 3 organization employee workspace task plan

## Task

Converge the documentation-only UI/UX remediation baseline for organization employee learner surfaces after batch 0
global foundation and batch 2 organization-admin baseline.

## Read Gate

- `AGENTS.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/adr-007-edition-aware-authorization-source-of-truth.md`
- `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`
- `docs/01-requirements/advanced-edition/modules/01-authorization-context.md`
- `docs/01-requirements/advanced-edition/modules/03-personal-ai-generation.md`
- `docs/01-requirements/advanced-edition/modules/04-organization-training.md`
- `docs/01-requirements/advanced-edition/modules/08-organization-ai-generation.md`
- `docs/01-requirements/traceability/2026-07-07-full-role-uiux-batch-0-global-foundation.md`
- `docs/01-requirements/traceability/2026-07-07-full-role-uiux-batch-2-org-admin-workspace.md`
- Product Design audit critical overrides and current screenshot evidence.
- Student shell, home, AI generation, organization training, profile/redeem, practice, mock, report, and mistake-book
  source entry points.

## Scope

Roles:

- `org_standard_employee`
- `org_advanced_employee`

Surfaces:

- learner shell and bottom navigation;
- learner home and authorization context visibility;
- organization employee `AI训练`;
- organization employee `企业训练`;
- standard employee direct-route unavailable states;
- standard employee core learning pages visible in the screenshot set.

## Non-Scope

- No code implementation.
- No browser automation, new screenshots, DB reads/writes, Provider calls, account/fixture changes, env/package/lockfile
  changes, schema/migration/seed changes, staging/prod/deploy, release readiness, production usability, or Cost
  Calibration.
- No raw DOM, session, cookie, token, env value, DB URL, raw row, internal id, Provider payload, raw prompt, raw AI output,
  full question, full paper, full material, employee raw answer, account value, or screenshot technical identifier value.

## Approach

1. Reconfirm clean pushed `master`, create the batch branch, and read the queued task.
2. Read the relevant requirements, prior UI/UX baselines, screenshots, and source-entry files.
3. Produce a page-level organization employee UI/UX baseline with P1/P2/P3 recommendations.
4. Record redacted evidence and adversarial review.
5. Run scoped formatting, redaction scan, Module Run v2 hardening, lint, typecheck, and pre-push readiness.
6. Commit, fast-forward merge to `master`, push, and clean the short branch.

## Risk Controls

- Treat standard employee hidden/denied behavior as a required boundary; do not weaken it with discoverable advanced
  actions.
- Keep organization employee AI output owned by the employee in the selected organization authorization context.
- Keep enterprise training separate from formal `practice`, `mock_exam`, `exam_report`, and `mistake_book`.
- Do not record full training questions, paper names, account labels, phone/email values, screenshot text, raw generated
  content, or internal identifiers.
- Do not classify UX polish as a confirmed code defect; fix branches require separate root-cause work.

## Validation Plan

- `npm.cmd exec -- prettier --write --ignore-unknown <scoped docs/state files>`
- `npm.cmd exec -- prettier --check --ignore-unknown <scoped docs/state files>`
- Added-line redaction scan.
- `git diff --check`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId full-role-uiux-batch-3-org-employee-workspace-2026-07-07`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId full-role-uiux-batch-3-org-employee-workspace-2026-07-07 -SkipRemoteAheadCheck`
