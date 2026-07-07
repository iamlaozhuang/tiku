# Fix Student AI Button Accessible Name Task Plan

Date: 2026-07-07
Branch: `codex/fix-student-ai-button-accessible-name-2026-07-07`

## Scope

Fix the pre-existing unit-test blocker found during the shared UI state templates branch: one component test still assumed AI出题 and AI组卷 primary submit buttons are visible at the same time, while the current page uses tabs and renders one submit action per active task.

This task only changes the stale test expectation and redacted evidence. It does not change business logic, authorization, UI runtime behavior, DB, Provider behavior, packages, lockfiles, env files, schema, migrations, seed files, deployment, staging, production, Cost Calibration, account fixtures, or generated content semantics.

## SSOT Read List

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/03-standards/ui-code.md`
- `docs/02-architecture/adr/*.md`
- `docs/01-requirements/00-index.md`
- `docs/01-requirements/advanced-edition/00-index.md`
- `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`
- `docs/01-requirements/traceability/2026-07-07-full-role-uiux-source-implementation-entry.md`
- `src/features/student/ai-generation/StudentPersonalAiGenerationPage.tsx`
- `src/features/student/ai-generation/StudentPersonalAiGenerationPage.test.tsx`

## Root Cause

`StudentPersonalAiGenerationPage` renders a tabbed AI训练 surface. The current page exposes the AI出题 submit action first, then exposes the AI组卷 submit action after switching tabs. The existing colocated component test expected both submit actions under task-prefixed names without switching tabs, while the broader unit suite already exercises the current visible button labels.

## Fix Plan

- Keep runtime source unchanged.
- Update the stale component test to assert the current tab flow and visible submit labels.
- Do not change task routing, Provider behavior, authorization, persistence, or generated content handling.

## Verification Plan

- Run the focused learner AI unit test.
- Run the full unit suite after merging this fix so the original blocker no longer masks the shared UI branch verification.
