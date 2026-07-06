# 2026-07-05 Paper Legacy Alias Inventory Cleanup Plan

## Scope

Remove unexpected `multiple_choice` legacy alias compatibility from source paths flagged by the paper legacy alias inventory test.

## Required Reading

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/01-requirements/00-index.md`
- `docs/01-requirements/modules/02-question-paper.md`
- Current full-unit evidence from the admin permission/session cleanup task

## Implementation Approach

1. Run the focused inventory test first and record RED.
2. Inspect the two unexpected hit files and nearby tests.
3. Remove unsupported alias acceptance from those production paths, keeping canonical `multi_choice` and `short_answer` handling.
4. Rerun the inventory test plus adjacent owner-preview import and admin AI generation focused tests.
5. Run typecheck, lint, format, diff, and full unit audit.

## Boundaries

- No DB connection, resource import execution, Provider call, browser/e2e/dev-server, env/credential access, dependency change, schema/migration/seed, staging/prod/deploy, release readiness, final Pass, or Cost Calibration claim.
- Do not expand the compatibility allow list to hide new production alias handling.

## Risk Controls

- Canonical question types remain `single_choice`, `multi_choice`, `true_false`, `fill_blank`, and `short_answer`.
- Student snapshot/runtime compatibility surfaces remain untouched.
- AI formal draft conversion should continue to support canonical AI output types without accepting new legacy aliases in the formal draft path.
