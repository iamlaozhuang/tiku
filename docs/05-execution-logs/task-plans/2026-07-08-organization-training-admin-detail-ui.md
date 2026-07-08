# 2026-07-08 Organization Training Admin Detail UI

## Task

- Task id: `organization-training-admin-detail-ui-2026-07-08`
- Branch: `codex/org-training-admin-detail-ui`
- Goal: make the organization training list actions show real admin-safe detail for published versions and use draft configuration semantics for drafts.

## SSOT Read List

- `AGENTS.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/03-standards/ui-code.md`
- `docs/02-architecture/adr/`
- `docs/01-requirements/00-index.md`
- `docs/01-requirements/advanced-edition/00-index.md`
- `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`
- `docs/01-requirements/advanced-edition/modules/04-organization-training.md`
- `docs/01-requirements/traceability/2026-07-02-ai-generation-requirements-ssot-alignment.md`
- `docs/01-requirements/traceability/2026-07-06-ai-generation-recontract-requirements-materialization.md`
- `docs/01-requirements/traceability/2026-07-02-role-auth-training-ops-decision-package.md`
- `docs/01-requirements/traceability/2026-07-02-current-thread-requirement-reconciliation-ledger.md`
- `docs/01-requirements/traceability/2026-07-07-full-role-uiux-source-implementation-entry.md`
- `docs/01-requirements/traceability/2026-07-07-full-role-uiux-batch-2-org-admin-workspace.md`
- `D:/tiku-local-private/acceptance/design-boards/2026-07-07-full-role-uiux/README.md`
- `D:/tiku-local-private/acceptance/design-boards/2026-07-07-full-role-uiux/manifest.redacted.json`
- `D:/tiku-local-private/acceptance/design-boards/2026-07-07-full-role-uiux/page-matrix.html`

## Requirement Mapping Result

- `CT-REQ-016`: organization training management must show lifecycle detail and redacted aggregate/detail status.
- `CT-REQ-024` and `CT-REQ-048`: organization AI output copied into enterprise training remains organization training content, not platform formal content.
- `CT-REQ-055`: this branch remains scoped to eligible `org_advanced_admin`; standard organization admins still cannot enter enterprise training.
- Batch 2 org-admin workspace P2 organization training: list rows expose lifecycle next actions; published versions support view summary, copy, and takedown.
- Design board page matrix: `org_advanced_admin / org-organization-training` uses list first, then detail or wizard.

## Scope

Allowed:

- `src/features/admin/organization-training/AdminOrganizationTrainingPage.tsx`
- `tests/unit/organization-training-admin-entry-surface.test.ts`
- task plan, evidence, audit, state, queue

Out of scope:

- No API/DTO/service/repository/backend contract change.
- No DB/schema/migration/seed/fixture change.
- No Provider, Prompt, raw AI output, model config, env, credential, session, cookie, token, or localStorage access.
- No package or lockfile change.
- No formal `question`, formal `paper`, `practice`, `mock_exam`, `exam_report`, or `mistake_book` write path.

## TDD Plan

1. Add failing UI assertions:
   - published `查看` loads `/api/v1/organization-trainings/{publicId}` and renders real question detail.
   - answer and analysis are collapsed by default and only render after explicit expansion.
   - loading, error, and no-question detail states are explicit.
   - draft `继续配置` opens the creation/configuration wizard instead of showing a fake detail panel.
2. Implement the smallest UI changes in the organization training page.
3. Keep list filters, pagination, copy-to-draft, takedown, and publish flows unchanged.

## Validation Plan

- `npm.cmd exec -- vitest run tests/unit/organization-training-admin-entry-surface.test.ts --reporter=dot`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `npm.cmd exec -- prettier --check --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-07-08-organization-training-admin-detail-ui.md docs/05-execution-logs/evidence/2026-07-08-organization-training-admin-detail-ui-evidence.md docs/05-execution-logs/audits-reviews/2026-07-08-organization-training-admin-detail-ui-audit.md src/features/admin/organization-training/AdminOrganizationTrainingPage.tsx tests/unit/organization-training-admin-entry-surface.test.ts`
- `git diff --check`
- Localhost Browser verification if the existing session/server permits it without credential/session/storage capture.
- Module Run v2 pre-commit and pre-push readiness.

## Adversarial Review

- Verify no internal identifiers, raw JSON, Provider/prompt/raw AI output, raw employee answers, or credential/session material are rendered or recorded.
- Verify standard organization admin route denial remains untouched.
- Verify published versions are read-only and keep copy/takedown boundaries.
- Verify draft continuation does not imply published detail and does not fabricate missing snapshots.
- Verify API error and empty states are recoverable and visible near the list/detail region.
