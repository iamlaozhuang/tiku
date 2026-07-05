# 2026-07-05 Full-chain AI Question Visible Draft Review Experience Repair Plan

## Task

- Task id: `full-chain-ai-question-visible-draft-review-experience-repair-2026-07-05`
- Branch: `codex/full-chain-ai-question-visible-draft-review-experience-repair-2026-07-05`
- Goal: repair AI question generation so authorized product UI surfaces show structured question drafts for review/use across `content_admin`, `org_advanced_admin`, `org_advanced_employee`, and `advanced_student`.

## Read Gate

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/adr-001-tech-stack-selection.md`
- `docs/02-architecture/adr/adr-002-runtime-architecture-and-multi-client-contract.md`
- `docs/02-architecture/adr/adr-003-workplace-desktop-web-compatibility.md`
- `docs/02-architecture/adr/adr-004-environment-isolation-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-005-staging-architecture-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-006-runtime-dependency-alignment.md`
- `docs/02-architecture/adr/adr-007-edition-aware-authorization-source-of-truth.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/01-requirements/00-index.md`
- `docs/01-requirements/advanced-edition/00-index.md`
- `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`
- `docs/01-requirements/advanced-edition/modules/03-personal-ai-generation.md`
- `docs/01-requirements/advanced-edition/modules/08-organization-ai-generation.md`
- `docs/01-requirements/advanced-edition/stories/epic-01-personal-ai-generation.md`
- `docs/01-requirements/advanced-edition/stories/epic-07-organization-ai-generation.md`
- `docs/01-requirements/advanced-edition/stories/epic-05-formal-content-separation.md`
- `docs/01-requirements/traceability/2026-07-02-ai-generation-requirements-ssot-alignment.md`
- `docs/01-requirements/traceability/2026-07-02-phase4-requirements-agent-baseline-alignment.md`
- `docs/01-requirements/traceability/2026-07-02-ui-ux-requirement-design-baseline-gap-analysis.md`
- `docs/01-requirements/traceability/2026-07-02-role-auth-training-ops-decision-package.md`
- `docs/01-requirements/traceability/2026-07-02-current-thread-requirement-reconciliation-ledger.md`
- `docs/05-execution-logs/evidence/2026-07-02-ai-generation-acceptance-baseline-normalization.md`
- `docs/05-execution-logs/evidence/2026-07-02-ai-generation-goal-completion-audit.md`
- `docs/05-execution-logs/audits-reviews/2026-07-02-ai-generation-goal-completion-audit.md`
- `docs/05-execution-logs/evidence/2026-07-02-session-cookie-contract-login-and-e2e-alignment.md`
- Relevant source and tests under `src/server/services`, `src/server/contracts`, `src/features/admin/ai-generation`, `src/features/student/ai-generation`, and `tests/unit`.

## Scope

- In scope:
  - Provider instruction contract for AI question generation.
  - Structured preview parsing and typed product-visible draft fields.
  - Content/admin and learner UI rendering for structured question drafts.
  - Focused tests that protect full product visibility while keeping evidence/log summaries redacted.
  - Local browser smoke that does not trigger Provider execution.
- Out of scope:
  - Provider calls, Cost Calibration, staging/prod, dependency changes, schema/migration/seed changes, direct DB mutation, release readiness, final Pass, production usability claims.

## First-principles Diagnosis

The product must distinguish two data planes:

- Authorized product UI: allowed to show structured generated question drafts to the owning/reviewing role.
- Evidence/log/audit/history summary plane: must stay redacted and must not store or print full content.

The observed defect is consistent with an output contract that only asks the Provider for redacted summaries and a UI that renders summary/diagnostic information ahead of the actual draft. The repair must change the product draft contract without weakening authorization or redaction boundaries.

## Implementation Plan

1. Add RED tests for question draft contract and UI visibility.
2. Update AI question output instructions to request structured draft fields needed by product UI.
3. Extend structured preview parsing to retain bounded product-visible draft fields.
4. Render structured draft cards before governance/status details on admin and learner surfaces.
5. Keep persisted/history/evidence summaries redacted.
6. Run focused tests, typecheck, lint, browser smoke, closeout gates, evidence/audit update, commit, fast-forward merge, push, and cleanup.

## Stop Rules

- Stop if a fix requires Provider execution, Provider credential access, Cost Calibration, staging/prod, dependency change, schema/migration/seed, direct DB mutation, authorization weakening, fixture expansion, or redaction bypass.
- Stop if tests indicate role authorization or standard/advanced boundaries would change.
- Stop if any evidence would need raw Prompt, Provider payload, raw AI I/O, full material/question/paper content, secrets, sessions, cookies, raw DOM, screenshots, traces, raw rows, or internal ids.
