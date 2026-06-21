# Clarify Student Subject And Paper Count Copy Plan

**Date:** 2026-06-21
**Task id:** `clarify-student-subject-and-paper-count-copy`
**Branch:** `codex/clarify-student-home-copy`
**Scope:** low-risk student home UI copy and focused unit test.

## Read Before Edit

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/03-standards/glossary.yaml`
- `docs/02-architecture/adr/adr-001-tech-stack-selection.md`
- `docs/02-architecture/adr/adr-002-runtime-architecture-and-multi-client-contract.md`
- `docs/02-architecture/adr/adr-003-workplace-desktop-web-compatibility.md`
- `docs/02-architecture/adr/adr-004-environment-isolation-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-005-staging-architecture-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-006-runtime-dependency-alignment.md`
- `docs/02-architecture/adr/adr-007-edition-aware-authorization-source-of-truth.md`
- `docs/05-execution-logs/audits-reviews/2026-06-21-requirement-fulfillment-and-role-experience-review.md`
- `docs/01-requirements/traceability/role-experience-fulfillment-matrix.md`

## Goal

Clarify the student homepage wording so learners understand that `theory` and `skill` are `subject` groups, the page list shows up to 20 `paper` items, and each card's question count is the per-paper question count.

## TDD Steps

1. Add a focused unit test to `tests/unit/student-home-ui.test.ts` that expects the clarifying copy and `套试卷` count wording.
2. Run `npm.cmd run test:unit -- tests/unit/student-home-ui.test.ts` and confirm the new assertion fails because the copy is absent.
3. Update `src/features/student/home/StudentHomePage.tsx` with the smallest UI copy change:
   - introduce a single page-size constant for `20`;
   - show two concise clarification lines near the page header;
   - render subject group count as `N 套试卷`.
4. Re-run the focused unit test and confirm it passes.
5. Run lint, typecheck, diff check, Prettier check, and Module Run v2 gates.
6. Write evidence and audit review, then commit/merge/push/cleanup under the current approval boundary.

## Risk Boundaries

- No browser/dev-server/e2e runtime.
- No API contract, session, Provider, env, dependency, package, schema, migration, database, deploy, PR, force-push, payment, external service, or Cost Calibration Gate work.
- Copy must keep canonical terms `subject`, `paper`, `theory`, and `skill` semantics intact without inventing new domain terms.
