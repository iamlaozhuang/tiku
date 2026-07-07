# Full-role UI/UX remediation series plan

Date: 2026-07-07

## Scope

This document materializes the approved six-batch UI/UX baseline convergence series for the 68 redacted local screenshots captured on 2026-07-07. It is a planning and traceability artifact only.

The series is docs-first. It does not change product code, dependencies, environment files, schema, migrations, seed files, database content, Provider behavior, deployment state, or Cost Calibration.

## Inputs

- Repository standards and execution discipline in `AGENTS.md`.
- Project state and task queue.
- Code taste commandments.
- ADR set under `docs/02-architecture/adr/`.
- Advanced edition authorization and UI/UX requirements.
- Existing all-role UI remediation baseline dated 2026-07-07.
- Repository-external screenshot set: 68 page screenshots, 9 contact sheets, 1 redacted manifest.

## Batch structure

| Batch | Focus                                | Output                                                                                |
| ----- | ------------------------------------ | ------------------------------------------------------------------------------------- |
| 0     | Global design baseline               | Shared menu, layout, copy, state, and button principles across roles.                 |
| 1     | Operations and super admin           | Admin-shell IA, organization/user/redeem-code/operations console consistency.         |
| 2     | Organization admin                   | Organization dashboard, employees, authorization, training and org-level workflows.   |
| 3     | Organization employee                | Training, AI entry visibility, standard/advanced refusal and working-state messaging. |
| 4     | Personal students                    | Personal standard/advanced student routes, mobile-first shell and learning workflows. |
| 5     | Content admin and cross-role closure | Content draft/review loop, cross-role terminology, final baseline consolidation.      |

After batches 0-5 converge and are committed, merged, pushed, and cleaned up, a separate repository-external local design board task will be materialized. That later task may create visual artifacts outside the repository only.

## Mandatory batch mechanism

Each batch must:

1. Start from `master` after the previous batch is merged and pushed.
2. Use a short-lived `codex/` branch.
3. Re-read the relevant screenshots, docs, and source files before writing.
4. Produce redacted task plan, evidence, and adversarial audit review.
5. Keep changes docs/state only unless a confirmed current-code defect requires a separate fix branch.
6. Avoid new accounts, new content, DB writes, Provider calls, dependency changes, env changes, screenshots in repo, raw DOM capture, and deployment operations.
7. Run scoped formatting/diff checks plus required local gates before commit.
8. Perform a forced self-review before closeout. Batch materialization requires two explicit self-review rounds.
9. Fast-forward merge, push `master`, and delete the short-lived branch only within the approved docs-only boundary.

## Non-goals

- No release readiness, production usability, staging, deployment, or Cost Calibration conclusion.
- No redesign implementation in code.
- No schema, fixture, account, or DB materialization.
- No recording of credentials, sessions, environment values, connection strings, raw rows, internal ids, Provider payloads, prompts, AI outputs, full questions, full papers, or full materials.
