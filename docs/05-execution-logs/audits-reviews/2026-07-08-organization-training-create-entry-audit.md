# 2026-07-08 Organization Training Create Entry Adversarial Audit

## Scope Check

- Allowed UI surface: `src/features/admin/organization-training/AdminOrganizationTrainingPage.tsx`.
- Allowed tests: `tests/unit/organization-training-admin-entry-surface.test.ts`.
- Governance/evidence files only under the current task id.
- No backend service, route, repository, contract, model, schema, migration, seed, fixture, package, lockfile, Provider, env, staging, prod, deploy, or Cost Calibration changes.

## Adversarial Findings

- Standard organization admin boundary:
  - Existing standard-unavailable checks are unchanged.
  - The create-entry UI is still behind the existing ready-state access resolver.
- Formal content boundary:
  - UI copy states AI output enters enterprise training drafts only.
  - It does not claim formal `question`, formal `paper`, `mock_exam`, `exam_report`, or `mistake_book` writes.
- Source clarity:
  - The ambiguous `企业 AI 结果` source label is removed from the product UI.
  - Question training and paper training no longer display each other's sources.
  - `mock_exam` exclusion remains visible.
- Sensitive information:
  - The removed source form prevents the main create entry from asking users to type an internal-like platform paper identifier.
  - No raw JSON, prompt, Provider payload, raw AI output, full question, full paper, or material text is introduced.
- Regression risk:
  - Existing write APIs are not changed.
  - Organization training route/service tests and adjacent AI entry tests pass.

## Residual Risk

- Platform paper snapshot selection is now represented as a list-based handoff message, not a completed picker. The actual selector/detail preview belongs to the later draft-detail and preview stage, not this source-only create-entry branch.
- Browser acceptance was not executed in this stage because the task is unit-validated and browser runtime was not required by the queue entry.

## 品味合规自检 Checklist

- No pure black, hard-coded new color, or purple-blue gradient introduced.
- Loading/empty/error states were not weakened.
- Clickable controls retain active feedback.
- Tailwind formatting was checked by Prettier.
- No backend query or SQL change introduced.
- API response contracts were not changed.
- No useless explanatory comments added.
- Names remain domain-specific and aligned with glossary terms.
- React state updates remain immutable.
- No package, lockfile, schema, migration, seed, env, Provider, staging, prod, or Cost Calibration work performed.
