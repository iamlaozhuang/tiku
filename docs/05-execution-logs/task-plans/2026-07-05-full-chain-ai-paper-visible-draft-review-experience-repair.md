# 2026-07-05 Full-chain AI Paper Visible Draft Review Experience Repair Plan

## Task

- Task id: `full-chain-ai-paper-visible-draft-review-experience-repair-2026-07-05`
- Branch: `codex/full-chain-ai-paper-visible-draft-review-experience-repair-2026-07-05`
- Goal: repair AI paper generation so authorized product UI surfaces show structured paper drafts for review/training across `content_admin`, `org_advanced_admin`, `org_advanced_employee`, and `advanced_student`.

## Read Gate

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/01-requirements/traceability/2026-07-02-ai-generation-requirements-ssot-alignment.md`
- `docs/01-requirements/traceability/2026-07-02-phase4-requirements-agent-baseline-alignment.md`
- `docs/01-requirements/advanced-edition/modules/03-personal-ai-generation.md`
- `docs/01-requirements/advanced-edition/modules/08-organization-ai-generation.md`
- Relevant source and tests under `src/server/services`, `src/server/contracts`, `src/features/admin/ai-generation`, `src/features/student/ai-generation`, and `tests/unit`.

## Scope

- In scope:
  - AI paper output contract.
  - Structured preview parsing for product-visible paper draft fields.
  - Content/admin and learner UI rendering for structured paper drafts.
  - Focused tests for four role labels and redaction boundaries.
  - Local browser smoke that does not trigger Provider execution.
- Out of scope:
  - Provider calls, Cost Calibration, staging/prod, dependency changes, schema/migration/seed changes, direct DB mutation, release readiness, final Pass, production usability claims.

## Root Cause

AI paper generation currently asks for and parses a paper draft summary: `paperSections`, `questionTypeDistribution`, `knowledgeCoverage`, and `totalQuestionCount`. Product UI then renders only counts such as paper section count and question count. That is correct for redacted evidence but insufficient for authorized product use. The same separation used for AI question generation is required here: product UI can show owning/reviewing users the structured draft body, while evidence/log/audit/history summaries remain redacted.

## Implementation Plan

1. Add RED tests for AI paper draft contract and UI visibility.
2. Extend AI paper output instruction to request bounded structured paper section and question draft fields.
3. Extend structured preview parsing to retain product-visible paper draft fields.
4. Render structured paper draft sections and questions before secondary status/count details on admin and learner surfaces.
5. Keep persisted/history/evidence summaries redacted.
6. Run focused tests, typecheck, lint, browser smoke, closeout gates, evidence/audit update, commit, fast-forward merge, push, and cleanup.

## Stop Rules

- Stop if a fix requires Provider execution, Provider credential access, Cost Calibration, staging/prod, dependency change, schema/migration/seed, direct DB mutation, authorization weakening, fixture expansion, or redaction bypass.
- Stop if tests indicate role authorization or standard/advanced boundaries would change.
- Stop if any evidence would need raw Prompt, Provider payload, raw AI I/O, full material/question/paper content, secrets, sessions, cookies, raw DOM, screenshots, traces, raw rows, or internal ids.
