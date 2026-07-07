# Full-role UI/UX batch 4 personal students task plan

Date: 2026-07-07

## Scope

This batch covers `personal_standard_student` and `personal_advanced_student` learner surfaces:

- learner shell and home;
- personal `AI训练` entry and direct-route standard unavailable state;
- personal profile and `redeem_code` flow;
- standard learning surfaces: `practice`, `mock_exam`, `exam_report`, and `mistake_book`;
- personal direct access to `企业训练` route.

This is a documentation-only baseline. It does not change source code, accounts, fixtures, database content, Provider
behavior, packages, lockfiles, environment files, schema, migrations, seed files, deployment state, release readiness,
production usability, staging, or Cost Calibration.

## Read Gate

Required sources read before writing this batch:

- `AGENTS.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/*.md`
- `docs/01-requirements/00-index.md`
- `docs/01-requirements/advanced-edition/00-index.md`
- `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`
- `docs/01-requirements/advanced-edition/modules/03-personal-ai-generation.md`
- `docs/01-requirements/advanced-edition/stories/epic-01-personal-ai-generation.md`
- `docs/01-requirements/traceability/2026-07-02-ui-ux-requirement-design-baseline-gap-analysis.md`
- `docs/01-requirements/traceability/2026-07-07-full-role-uiux-batch-0-global-foundation.md`
- `docs/01-requirements/traceability/2026-07-07-full-role-uiux-batch-3-org-employee-workspace.md`
- repository-external personal student contact sheets under the approved local screenshot directory
- relevant learner source entry files under `src/components/StudentAppLayout/` and `src/features/student/`

Screenshot review is limited to role/page labels and safe UI observations. The batch records no credentials, session,
cookie, token, environment values, database URL, raw database rows, internal ids, Provider payloads, raw prompts, raw AI
output, plaintext `redeem_code`, full question, full paper, full material, or fixture values.

## Method

1. Compare personal student screenshots with the batch 0 shared UI/UX rules.
2. Reconcile personal standard and personal advanced boundaries against the advanced-edition requirements.
3. Read learner source structure only to identify likely future implementation areas, without changing code.
4. Produce a redacted baseline document with P1/P2 items and page-level recommendations.
5. Produce redacted evidence and adversarial audit review.
6. Run scoped formatting, redaction scan, Module Run v2 hardening, lint, and typecheck.
7. Commit the docs/state/evidence/audit-only change, fast-forward merge to `master`, push to `origin/master`, and clean the
   short branch under the approved closeout policy.

## Risk Controls

- Do not copy screenshot text that could be full questions, papers, materials, account details, or card values.
- Do not inspect or record private account documents for this batch; existing screenshot labels are sufficient.
- Do not run browser automation, local server, database commands, Provider calls, or screenshot capture.
- Do not modify `.env*`, package or lockfiles, `src/**`, tests, schema, migrations, seed, runtime output, or screenshots.
- If a future issue appears to require source work, record it as a fix candidate only; root-cause confirmation and repair
  require a separate short branch.

## Planned Validation

- scoped Prettier write/check for the six allowed files;
- `git diff --check`;
- added-line redaction scan for common credential, token, URL, phone, email, raw id, and secret patterns;
- `Test-ModuleRunV2PreCommitHardening.ps1` with this task id;
- `npm.cmd run lint`;
- `npm.cmd run typecheck`;
- after merge, `Test-ModuleRunV2PrePushReadiness.ps1` with this task id and `-SkipRemoteAheadCheck`.
