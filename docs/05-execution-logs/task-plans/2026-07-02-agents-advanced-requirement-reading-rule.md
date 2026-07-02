# AGENTS Advanced Requirement Reading Rule Plan

Task id: `agents-advanced-requirement-reading-rule-2026-07-02`

Branch: `codex/agents-advanced-requirement-reading-rule`

## Objective

Add a general `AGENTS.md` recovery rule so future tasks involving advanced edition, edition-aware authorization, organization backend, enterprise training, organization analytics, retention/log governance, role-separated standard/advanced boundaries, and content-admin AI draft/review work read the advanced requirement SSOT before relying on older execution logs.

## SSOT Read List

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/**`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/04-agent-system/sop/requirement-ssot-reading-governance.md`
- `docs/01-requirements/00-index.md`
- `docs/01-requirements/advanced-edition/00-index.md`
- `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`
- `docs/01-requirements/traceability/2026-06-23-advanced-ai-generation-scope-clarification.md`
- `docs/01-requirements/traceability/2026-06-24-role-separated-mvp-requirement-alignment.md`
- `docs/01-requirements/traceability/role-experience-fulfillment-matrix.md`
- `docs/01-requirements/traceability/2026-07-02-ai-generation-requirements-ssot-alignment.md`

## Requirement Decision Map

| Decision                                                      | Source order                                                | Result                                                                                                          |
| ------------------------------------------------------------- | ----------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| Whether `AGENTS.md` should contain full advanced requirements | `00-index.md`, advanced edition index, requirement SSOT SOP | No. `AGENTS.md` remains execution discipline and recovery-rule document.                                        |
| Whether future agents need a general advanced-reading rule    | User approval plus requirement SSOT SOP                     | Yes. Add a broad trigger list for advanced, edition, authorization, organization, AI, and role-separated tasks. |
| Whether execution logs can drive advanced scope by themselves | Requirement SSOT SOP                                        | No. Execution logs remain evidence/history after requirement SSOT is read.                                      |

## Requirement Mapping

| Area                                      | Mapping                                                                                                                                                                                            |
| ----------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Advanced edition scope                    | `docs/01-requirements/advanced-edition/00-index.md` remains required for advanced, edition, quota, AI generation, organization training, and authorization work.                                   |
| Edition-aware authorization               | `edition-aware-authorization-requirements.md` and ADR-007 remain required for `edition`, `effectiveEdition`, `authorization`, `personal_auth`, `org_auth`, `redeem_code`, and `auth_upgrade` work. |
| Role-separated standard/advanced boundary | 2026-06-24 traceability remains required for role-separated tasks.                                                                                                                                 |
| AI generation current baseline            | 2026-07-02 AI generation SSOT alignment remains required for AI出题 / AI组卷 tasks.                                                                                                                |

## Evidence-Only Sources

Execution logs are not the requirement SSOT for this task. They may be used only as history, evidence, and validation recovery after the requirement source order is established.

Evidence must not include credentials, env values, raw DB rows, Provider payloads, raw prompts, raw AI I/O, complete generated content, full question text, full paper content, materials, or chunk content.

## Conflict Check

No product conflict was found. The rule resolves the user concern by clarifying source order:

- `AGENTS.md` keeps execution governance only.
- Advanced business requirements stay in `docs/01-requirements/advanced-edition/` and traceability.
- Ambiguity after reading the required sources must stop implementation and return to the user for decision.

## Scope Guard

Allowed:

- `AGENTS.md` execution discipline update.
- Project state, task queue, task plan, evidence, and audit.
- Formatting and Module Run v2 governance checks.

Blocked:

- Source/test/runtime changes.
- Browser/dev-server/e2e execution.
- Provider or AI calls.
- Direct DB access, mutation, schema, migration, seed, or raw row inspection.
- Dependency or lockfile changes.
- Staging/prod/cloud deploy.
- Release readiness, final Pass, production usability, and Cost Calibration claims.

## Validation Plan

1. Scoped Prettier write.
2. Scoped Prettier check.
3. `git diff --check`.
4. Module Run v2 pre-commit hardening.
5. Module Run v2 module closeout readiness.
6. Module Run v2 pre-push readiness with remote-ahead check skipped before local closeout.
