# 0704 Paper Composer Workbench Adversarial Review

## Scope

- taskId: `0704-paper-composer-workbench-2026-07-11`
- review target: paper draft creation handoff, question/material selection, paper structure editing, validation, and lifecycle controls
- database schema/migration/seed, dependency, Provider, authorization/edition, and external runtime changes: none

## Adversarial Matrix

| boundary                    | result | review summary                                                                                                                                                              |
| --------------------------- | ------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Role authorization          | pass   | The workbench calls existing content-admin protected routes; client visibility does not replace server actor checks.                                                        |
| Draft lifecycle             | pass   | Add, update, remove, and publish controls render only for drafts; services continue rejecting non-draft mutations.                                                          |
| Source isolation            | pass   | The workbench never PATCHes source questions/materials and does not offer source stem, option, answer, analysis, or binding edits.                                          |
| Snapshot immutability       | pass   | Add continues through the existing snapshot service; paper-question update changes paper-scoped fields and moves stored rows without source re-read.                        |
| Material completeness       | pass   | A material-linked source question cannot be added until its material detail resolves; the material-first query returns only linked questions.                               |
| Group atomicity             | pass   | A material question group moves as one unit with every child paper question, avoiding split material/child structure.                                                       |
| Scoring boundary            | pass   | Score precision, subjective scoring-point totals, fill-blank totals, and server publish validation remain intact; scoring-point edits stay paper-scoped.                    |
| Publish authority           | pass   | Local validation supports navigation and disabled state only; the existing server publish service remains authoritative.                                                    |
| Lifecycle confirmation      | pass   | Publish, archive, copy, and remove use explicit alert dialogs with focus, Escape, and keyboard-loop behavior.                                                               |
| Sensitive data              | pass   | Product requests use public identifiers internally, while visible UI and evidence omit content identifiers, internal IDs, credentials, sessions, raw rows, and raw AI data. |
| Loading/error/empty states  | pass   | Paper load, picker load, filtered empty, unauthorized, forbidden/not-found, mutation failure, disabled and confirmation states are distinct.                                |
| Dependency/runtime boundary | pass   | No package/lockfile, schema, migration, seed, direct database, env/secret, Provider, staging, production, deployment, or fresh screenshot/raw DOM action occurred.          |

## Residual Risk

- No fresh browser screenshot or raw DOM capture was authorized; visual assurance is based on the approved existing paper screenshot, design tokens, source review, component tests, lint, and typecheck.
- The existing persistence model materializes a paper section when its first question/group is added or moved. This task does not invent a separate empty-section API.
- The content-admin product may intentionally select a material outside the paper scope in future; current picker defaults to exact paper scope, while existing mismatched snapshots remain visible as non-blocking warnings.

## Decision

- decision: pass_ready_for_fast_forward_merge_push_and_cleanup
- claim boundary: localhost UI source/test optimization only
