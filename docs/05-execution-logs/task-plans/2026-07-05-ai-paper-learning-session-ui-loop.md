# 2026-07-05 AI Paper Learning Session UI Loop Plan

Task id: `ai-paper-learning-session-ui-loop-2026-07-05`

Branch: `codex/ai-paper-learning-session-ui-2026-07-05`

## Scope

Implement the learner-side AI组卷 result-use loop for `personal_advanced_student` and `org_advanced_employee` only.
When a current generated AI paper draft is sufficiently grounded and contains usable nested `questionDrafts`, the
learner can start an in-page isolated self-test, answer all objective generated questions, submit, and see
deterministic per-question and aggregate feedback.

## Required Reading

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/01-requirements/00-index.md`
- `docs/01-requirements/advanced-edition/00-index.md`
- `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`
- `docs/01-requirements/advanced-edition/modules/03-personal-ai-generation.md`
- `docs/01-requirements/traceability/2026-07-02-ai-generation-requirements-ssot-alignment.md`
- `docs/01-requirements/traceability/2026-07-02-phase4-requirements-agent-baseline-alignment.md`
- `docs/05-execution-logs/evidence/2026-07-02-ai-generation-acceptance-baseline-normalization.md`
- `docs/05-execution-logs/evidence/2026-07-02-ai-generation-goal-completion-audit.md`
- `docs/01-requirements/traceability/2026-07-02-role-auth-training-ops-decision-package.md`
- `docs/01-requirements/traceability/2026-07-02-current-thread-requirement-reconciliation-ledger.md`

Relevant rows and decisions: advanced learner AI generation baseline, formal-content separation, `CT-REQ-033` through
`CT-REQ-035` learner experience follow-up, and AI generated content isolation from formal `question`, `paper`,
`practice`, `answer_record`, `exam_report`, and `mistake_book`.

## Implementation Plan

1. Add RED unit coverage in `tests/unit/student-personal-ai-generation-ui.test.ts` proving a personal advanced AI组卷
   draft with two usable question drafts starts a self-test, renders both questions, accepts answers, and shows aggregate
   feedback plus formal-write disclaimers.
2. Add or extend organization employee AI组卷 coverage to prove the same self-test path works under organization
   authorization context.
3. Refactor `StudentPersonalAiGenerationPage.tsx` to reuse the existing generated-draft learning session helpers for
   all usable AI paper draft questions instead of only the first question.
4. Keep insufficient or summary-only paper drafts blocked from self-test entry.
5. Validate focused UI tests, typecheck, lint, scoped formatting, blocked-path diff, and Module Run v2 gates.

## Boundaries

- No Provider call, provider credential read, provider configuration, prompt payload, raw AI input/output, or Cost
  Calibration.
- No `.env*`, secret, credential, cookie, session, localStorage, authorization header, phone, email, or plaintext
  `redeem_code` access or evidence.
- No DB connection, raw row read, mutation, schema, migration, seed, cleanup, reset, or `drizzle-kit push`.
- No dependency or lockfile change.
- No browser runtime, dev server, e2e, screenshot, raw DOM, trace, staging, production, deploy, PR, or force push.
- No release readiness, final Pass, or production usability claim.

## Risk Defense

- Reuse existing parsed draft and isolated learning session helpers; avoid role-specific generation or parsing forks.
- Test both personal and organization employee surfaces against the same UI path.
- Keep formal-write disclaimers visible in the self-test panel.
- Use redacted evidence only: command names, pass/fail, aggregate counts, file paths, and task ids.
