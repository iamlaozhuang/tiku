# 2026-07-02 Current Thread Requirement Decision Package Evidence

## Scope

Docs-only requirement decision update for all current-thread decisions processed in this round.

Task id: `redeem-code-edition-plaintext-decision-doc-update-2026-07-02`

Branch: `codex/redeem-code-decision-doc-update-2026-07-02`

Cost Calibration Gate remains blocked.

## Confirmed Decisions Recorded

1. Personal `redeem_code` has three first-release kinds:
   - `personal_standard_activation`
   - `personal_advanced_activation`
   - `edition_upgrade`
2. `edition_upgrade` upgrades an active standard `personal_auth` for the same user and `profession + level` through `auth_upgrade`; it does not create a new `personal_auth`.
3. If multiple eligible standard `personal_auth` records match, the user or operator must explicitly select the upgrade target.
4. Generation success provides a distribution window for eligible operators.
5. After leaving the distribution window, `ops_admin` and `super_admin` may still view/copy plaintext `redeem_code` values from ordinary operations list and detail pages.
6. Evidence, committed documents, runtime logs, error logs, screenshots, exports, and non-distribution audit summaries remain redacted and must not contain plaintext `redeem_code` values.
7. Organization authorization overlap is blocked by default and closed only through explicit renewal successor, `auth_upgrade.source_type = ops_manual`, transactional replacement, or increase-only quota expansion.
8. Administrator and employee account domains are separated; the same phone is not reused across admin and learner/employee account domains.
9. Employee import uses target `organization`, required phone/name, optional `initialPassword`, no auth fields, random password one-time distribution when missing, and inherited `org_auth` scopes.
10. Organization tree mutation is platform-owned; node move is `super_admin` only.
11. Organization training uses a four-step wizard, approved sources, platform paper snapshot copy, organization AI draft copy, evidence gating, draft discard, immutable publish, takedown, optional `answerDeadlineAt`, and non-formal boundaries.
12. Organization analytics includes overview/training/employee levels, 7/30/90/custom filters, small-sample warning, knowledge weak-point summaries, no export, and no enterprise AI quota consumption summary.
13. Organization AI output can be copied to training draft but cannot directly enter platform formal `question` or `paper`.
14. `model_config` requires a `super_admin` connection test action using minimal synthetic request and redacted `model_config_health_check` metadata.
15. Prompt first release is read-only registry only; global logs remain redacted and no log export/delete/archive is introduced.
16. Resource management for教材、讲义课件、Markdown/RAG resources moves to the content workspace; `content_admin` and
    `super_admin` own first-release write operations.
17. Registration success must create a learner session and route to `/redeem-code`; redeem uses preview and explicit
    confirmation; forgot password remains contact-support only.
18. Learner AI context selection must explicitly show authorization source, edition, effective edition, expiry, and quota
    owner before organization quota is consumed.
19. `mock_exam` may use a collapsible current/answered/unanswered navigator, while answers/analysis/correctness feedback
    remain hidden until report.
20. Employee `企业训练` requires real question-answer UI and post-submit own-result visibility; organization admins still
    cannot see raw employee answers.
21. Organization analytics separates enterprise-training metrics from formal `practice` / `mock_exam` aggregate signals
    and hides enterprise AI quota summary from organization admins.
22. `super_admin` may view full registered Prompt text in the read-only registry; `ops_admin` sees metadata only.
23. Future discussion packets use locked `CT-REQ-*` rows and only raise actual conflicts, gaps, or missing decisions.

## Reconciliation Ledger Recorded

The current-thread discussion is reconciled into
`docs/01-requirements/traceability/2026-07-02-current-thread-requirement-reconciliation-ledger.md`.

The ledger records:

- cutoff boundary from the current-thread handoff through the owner approval to execute reconciliation;
- recovery protocol for future context compaction;
- classification model for existing decisions, clarifications, supplements, changes, new decisions, implementation gaps,
  UI/UX contract needs, and process guards;
- 43 `CT-REQ-*` rows covering the current-thread requirement topics;
- no-omission controls and recommended next design-first package split.

## Post-Report Adversarial Recheck Addendum

After the owner requested additional review for omissions and conflicts, the ledger was rechecked against the decision
package and stable requirement modules. The recheck tightened ledger row details for:

- `edition_upgrade` non-consumption and no-new-`personal_auth` semantics;
- `auth_scope_type` non-overload boundary;
- personal learner account binding as employee without overwriting password, history, or personal authorization;
- employee import negative fields and organization admin creation fields;
- scoped organization tree summary leakage boundary;
- organization training publish scope, manual question types, evidence gating, one-submit rule, non-formal report/book
  boundary, and short-answer scoring rule;
- organization analytics default range and small-sample threshold;
- backend role management and organization admin account ownership;
- organization AI draft editability;
- API key masking and `ops_admin` summary-only model-config boundary.

## Third-Pass Reverse Assertion Recheck

A further reverse assertion pass checked decision-package details that could be lost if future work reads only the
ledger. The ledger now explicitly records:

- no implicit default to standard activation for personal `redeem_code` generation;
- non-eligible plaintext roles, plaintext view/copy audit metadata, and evidence/screenshot/export redaction;
- `auth_upgrade.source_type = ops_manual` as the explicit organization upgrade closure action;
- organization admin denial from global logs, model/provider configuration, Prompt governance, global authorization
  surfaces, system user management, and raw employee answers;
- exact operations guided-flow steps for enterprise authorization and `redeem_code` generation;
- organization AI cannot create formal platform question bank or paper-library records;
- model connection test excludes user data, raw prompt, private content, full question, and paper material, and writes
  redacted `audit_log` / `ai_call_log` metadata.

## UI/UX Contract Supplemental Recheck

After the follow-up UI/UX contract discussion and owner approval to improve efficiency, the ledger was extended with
`CT-REQ-031` through `CT-REQ-043`. The added rows cover:

- content-owned resource management and removal/redirect/read-only treatment for the operations main resource entry;
- backend account management for no-auth, standard, advanced, employee, and admin accounts;
- learner auth context, login/register/redeem/profile, practice, `mock_exam`, report, and `mistake_book` UI;
- employee `企业训练` answer/result state and organization-admin raw-answer boundary;
- organization training management detail and organization analytics formal-learning separation;
- Prompt full-text read-only visibility for `super_admin`;
- organization tree UX, operations pending-work routing, employee lifecycle, and no-repeat discussion process.

## Updated Files

- `docs/01-requirements/00-index.md`
- `docs/01-requirements/modules/01-user-auth.md`
- `docs/01-requirements/modules/05-rag-knowledge.md`
- `docs/01-requirements/modules/06-admin-ops.md`
- `docs/01-requirements/stories/epic-01-user-auth.md`
- `docs/01-requirements/stories/epic-06-admin-ops.md`
- `docs/01-requirements/advanced-edition/00-index.md`
- `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`
- `docs/01-requirements/advanced-edition/modules/04-organization-training.md`
- `docs/01-requirements/advanced-edition/modules/05-organization-analytics.md`
- `docs/01-requirements/advanced-edition/modules/06-ops-authorization-quota.md`
- `docs/01-requirements/advanced-edition/modules/08-organization-ai-generation.md`
- `docs/01-requirements/advanced-edition/stories/epic-02-organization-training.md`
- `docs/01-requirements/advanced-edition/stories/epic-03-employee-answer-statistics.md`
- `docs/01-requirements/advanced-edition/stories/epic-04-ops-authorization-quota-governance.md`
- `docs/01-requirements/advanced-edition/stories/epic-07-organization-ai-generation.md`
- `docs/01-requirements/traceability/2026-06-23-advanced-ai-generation-scope-clarification.md`
- `docs/01-requirements/traceability/2026-07-02-ui-ux-requirement-design-baseline-gap-analysis.md`
- `docs/01-requirements/traceability/2026-07-02-redeem-code-edition-and-plaintext-ops-decision.md`
- `docs/01-requirements/traceability/2026-07-02-role-auth-training-ops-decision-package.md`
- `docs/01-requirements/traceability/2026-07-02-current-thread-requirement-reconciliation-ledger.md`
- `docs/01-requirements/traceability/edition-aware-authorization-acceptance-matrix.md`
- `docs/01-requirements/traceability/unified-standard-advanced-source-index.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/2026-07-02-redeem-code-edition-plaintext-decision-doc-update.md`
- `docs/05-execution-logs/evidence/2026-07-02-redeem-code-edition-plaintext-decision-doc-update.md`
- `docs/05-execution-logs/audits-reviews/2026-07-02-redeem-code-edition-plaintext-decision-doc-update.md`

## Implementation Observation

Read-only implementation inspection found:

- `redeem_code_type` enum exists, but current admin list/detail remains masked-oriented.
- Employee import and transfer surfaces need alignment with optional generated password and quota-blocking transfer decisions.
- Organization training, analytics, organization AI follow-up, and model connection test have source/UI gaps relative to the confirmed requirements.
- Registration currently records user creation without confirmed session persistence in the inspected registration
  service.
- Resource management is still visible through an operations route while the confirmed ownership is content workspace.
- Employee training and organization training source/UI remain partial relative to the confirmed full question-answer and
  wizard contracts.
- Prompt/model surfaces need realignment to read-only Prompt registry plus super-admin full-text view and model health
  test.

This task records implementation gaps only and does not change product source.

## Module Run V2 Closeout Anchors

Batch range: current-thread requirement reconciliation package covering `CT-REQ-001` through `CT-REQ-043`.

RED: owner-identified omission and duplication risk in the current-thread requirement discussion; docs had to reconcile
existing SSOT decisions, current deltas, implementation gaps, and UI/UX contract needs without starting source work.

GREEN: docs-only reconciliation package records 43 ledger rows, supplemental UI/UX decisions, implementation-gap
posture, and no-repeat recovery rules; scoped formatting, diff check, and pre-commit hardening passed.

Commit: `996f135b` branch base before this docs-only evidence commit; final closeout commit is reported in the handoff
after local commit/merge/push.

localFullLoopGate: not applicable for this docs-only requirement decision task; product source, runtime, browser,
database, Provider, and local full-loop execution remain blocked unless a later task explicitly approves them.

threadRolloverGate: continue from this ledger/evidence/state after closeout; future work must recover from `CT-REQ-*`
rows rather than chat memory.

nextModuleRunCandidate: UI/UX contract package using this ledger as checklist, starting with role/workspace contracts
that have actual source or UX gaps instead of asking the owner to reconfirm locked decisions.

blocked remainder: product source, tests, schema/migration, dependency changes, runtime/browser/DB/Provider/env access,
deployment, PR, force-push, release-readiness, final Pass, production-usability, and Cost Calibration Gate remain blocked
for this task.

## Validation Results

Passed:

- `npm.cmd exec -- prettier --write --ignore-unknown ...`
- `npm.cmd exec -- prettier --check --ignore-unknown ...`
- `git diff --check`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId redeem-code-edition-plaintext-decision-doc-update-2026-07-02`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId redeem-code-edition-plaintext-decision-doc-update-2026-07-02`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId redeem-code-edition-plaintext-decision-doc-update-2026-07-02 -SkipRemoteAheadCheck`

Module Run v2 pre-commit hardening scanned 28 task-scoped files and passed.
Module Run v2 module-closeout readiness passed.
Module Run v2 pre-push readiness passed.

## Non-Actions

- No product source files changed.
- No tests changed.
- No schema or migration changed.
- No dependency or lockfile changed.
- No Provider, Prompt, env/secret, database, browser, deployment, payment, release readiness, final Pass, or production usability action.
