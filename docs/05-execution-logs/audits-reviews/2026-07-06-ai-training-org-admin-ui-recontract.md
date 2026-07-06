# 2026-07-06 Organization Admin AI Training UI Recontract Audit Review

## Metadata

- Task id: `ai-training-org-admin-ui-recontract-2026-07-06`
- Branch: `codex/ai-training-org-admin-ui-recontract-2026-07-06`
- Date: 2026-07-06
- Review mode: adversarial local source/unit review.
- Redaction: this audit records only file paths, command statuses, role labels, UI labels, and count values.

## Requirement Mapping Result

- Source of truth used: `docs/01-requirements/traceability/2026-07-06-ai-generation-recontract-requirements-materialization.md`
- Package boundary: organization advanced admin UI contract only.
- Current package does not claim content admin UI completion, route DB runtime, Provider behavior, browser role matrix, release readiness, production usability, staging/prod, deploy, or Cost Calibration.

## Adversarial Findings

- Finding 1: Existing organization admin page copy still used old `组织 AI出题` and `组织 AI组卷` labels.
  - Evidence: new focused unit tests failed before implementation.
  - Resolution: page header now uses `企业 AI 训练内容`, with `训练题草稿` and `训练试卷草稿`.
  - Status: closed by focused unit pass.
- Finding 2: Organization admin visible defaults were not aligned with the 3/30 contract.
  - Evidence: focused unit tests asserted `3` and `30` while current UI showed old values.
  - Resolution: organization workspace defaults now use AI出题 `3` and AI组卷 `30`; visible max values are `10` and `80`.
  - Status: closed by focused unit pass.
- Finding 3: A first implementation draft changed content-admin paper defaults by sharing the new organization defaults too broadly.
  - Evidence: adjacent component unit test failed for content paper parameter defaults.
  - Root cause: default parameter helper lacked workspace-specific default resolution.
  - Resolution: default resolution now distinguishes organization workspace from content workspace.
  - Status: closed by adjacent unit pass.
- Finding 4: New organization question and paper next-action labels initially reused paper-oriented actions for question results.
  - Evidence: source review against AI出题 result contract.
  - Resolution: organization question result next actions now use question-oriented labels; paper results retain paper draft labels.
  - Status: closed by source review and unit coverage for paper action labels.

## Residual Risks

- This is unit/source UI evidence only; browser role matrix and DB-backed runtime are not proven here.
- Content admin AI辅助 UI remains a later package.
- This package does not add backend persistence for source preference or knowledge coverage beyond current parameter fields.
- This package does not prove Provider-disabled or Provider-enabled runtime behavior.

## Boundary Check

- No dependency, package, lockfile, schema, migration, seed, env, DB runtime, Provider, browser, staging/prod, deploy, or Cost Calibration operation was executed.
- Evidence remains redacted and does not include full question, full paper, material, Provider payload, raw prompt, raw AI output, DB rows, internal ids, credentials, tokens, sessions, cookies, screenshots, DOM, traces, or private fixture values.

## Conclusion

- source/unit: pass for focused organization advanced admin UI contract tests.
- DB-backed runtime: not tested.
- browser: not tested.
- Provider-disabled: not tested.
- Provider-enabled small sample: not tested.
- release readiness: not claimed.
- production usability: not claimed.
- staging: not executed; requires fresh approval.
- Cost Calibration: not executed; requires fresh approval.
