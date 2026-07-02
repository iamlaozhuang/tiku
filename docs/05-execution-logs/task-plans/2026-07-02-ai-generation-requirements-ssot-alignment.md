# AI Generation Requirements SSOT Alignment Plan

Task id: `ai-generation-requirements-ssot-alignment-2026-07-02`

Branch: `codex/ai-generation-requirements-ssot-alignment`

## Objective

Align AI出题 / AI组卷 requirements, traceability, AGENTS recovery rules, project state, and task queue with the current 2026-07-02 acceptance baseline. This task prevents future work from starting from stale historical residuals while still preserving non-claims: no release readiness, no final Pass, no production usability, no Cost Calibration, and no deployment.

## SSOT Read List

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/**`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/04-agent-system/sop/requirement-ssot-reading-governance.md`
- `docs/01-requirements/00-index.md`
- `docs/01-requirements/modules/02-question-paper.md`
- `docs/01-requirements/modules/04-ai-scoring.md`
- `docs/01-requirements/modules/05-rag-knowledge.md`
- `docs/01-requirements/modules/06-admin-ops.md`
- `docs/01-requirements/advanced-edition/00-index.md`
- `docs/01-requirements/advanced-edition/modules/02-ai-task-domain.md`
- `docs/01-requirements/advanced-edition/modules/03-personal-ai-generation.md`
- `docs/01-requirements/advanced-edition/modules/08-organization-ai-generation.md`
- `docs/01-requirements/advanced-edition/stories/epic-01-personal-ai-generation.md`
- `docs/01-requirements/advanced-edition/stories/epic-07-organization-ai-generation.md`
- `docs/01-requirements/advanced-edition/stories/epic-05-formal-content-separation.md`
- `docs/01-requirements/use-cases/use-case-catalog.md`
- `docs/01-requirements/traceability/capability-catalog.md`
- `docs/01-requirements/traceability/unified-standard-advanced-source-index.md`
- `docs/01-requirements/traceability/2026-06-23-advanced-ai-generation-scope-clarification.md`
- `docs/01-requirements/traceability/2026-06-24-role-separated-mvp-requirement-alignment.md`
- `docs/01-requirements/traceability/2026-07-01-ai-generation-root-cause-and-reuse-protocol.md`
- `docs/01-requirements/traceability/2026-07-01-ai-generation-core-walkthrough-contract.md`
- `docs/05-execution-logs/evidence/2026-07-02-ai-generation-acceptance-baseline-normalization.md`
- `docs/05-execution-logs/evidence/2026-07-02-ai-generation-goal-completion-audit.md`
- `docs/05-execution-logs/evidence/2026-07-02-ai-generation-deterministic-acceptance-matrix-rollup.md`

## Requirement Decision Map

| Decision                                                               | Source order                                                                                | Result                                                                                                                |
| ---------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| Standard base MVP AI generation exclusion vs later AI generation scope | `00-index.md` plus 2026-06-23/2026-06-24 traceability plus current baseline                 | Standard-only base exclusion remains; unified content-admin and advanced-role AI generation remains in current scope. |
| Content-admin historical blocked wording                               | 2026-06-21 content-admin decision plus 2026-06-23 scope clarification plus current baseline | Historical blocked rows are superseded for current requirement reading.                                               |
| Old quick acceptance and MML residuals                                 | 2026-07-02 acceptance baseline normalization and goal-completion audit                      | Closed or superseded inside current local owner-preview / bounded Provider acceptance scope.                          |
| Release readiness and production claims                                | Current evidence baseline and AGENTS discipline                                             | Still not claimed.                                                                                                    |

## Requirement Mapping

| Area                                           | Files to update                                                                                                    | Expected outcome                                                                          |
| ---------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------- |
| Current AI generation traceability             | `docs/01-requirements/traceability/2026-07-02-ai-generation-requirements-ssot-alignment.md`                        | One current requirement reading overlay exists.                                           |
| Standard requirement index and content backend | `docs/01-requirements/00-index.md`, `docs/01-requirements/modules/06-admin-ops.md`                                 | Standard base non-goal and unified repair scope are both explicit.                        |
| Advanced index and modules                     | `advanced-edition/00-index.md`, `modules/03-personal-ai-generation.md`, `modules/08-organization-ai-generation.md` | Current role, entry, ownership, and non-claim boundaries are explicit.                    |
| Traceability catalogs                          | source index, capability catalog, use-case catalog                                                                 | Catalog rows point readers to the current overlay before using stale gate wording.        |
| Agent recovery rule                            | `AGENTS.md`                                                                                                        | Future agents must resolve stale AI generation residuals by current baseline order first. |
| Governance state                               | project state, task queue, plan, evidence, audit                                                                   | The task is materialized, verifiable, and closeout-scoped.                                |

## Evidence-Only Sources

Execution logs are used only to establish current acceptance baseline and residual disposition. They are not copied as raw runtime data and do not become standalone requirement SSOT unless promoted into `docs/01-requirements/traceability/`.

Evidence must remain summary-only and must not include credentials, env values, raw DB rows, Provider payloads, raw prompts, raw AI I/O, full generated content, full question text, full paper content, materials, or chunk content.

## Conflict Check

Identified conflicts are resolvable by existing source order:

- Standard base MVP non-goal vs later unified repair scope: resolved by keeping the standard-only non-goal and using later supplements for content-admin and advanced roles.
- Historical content-admin blocked rows vs current content backend AI entries: resolved by marking the older rows historical and superseded.
- Catalog `blocked_until_gate_approved` vs current completion evidence: resolved by treating catalog wording as implementation/provenance gating, not an active current acceptance blocker.

No unresolved product conflict is expected. If validation surfaces a conflict that cannot be resolved by these rules, stop and ask the user for a decision.

## Scope Guard

Allowed:

- Requirement and traceability documentation.
- AGENTS recovery-rule clarification.
- Project state, task queue, task plan, evidence, and audit review.
- Formatting and Module Run v2 governance checks.

Blocked:

- Source/test code changes.
- Browser/dev-server/e2e execution.
- Provider or AI calls.
- Direct DB access, mutation, schema, migration, seed, or raw row inspection.
- Dependency or lockfile changes.
- Staging/prod/cloud deploy.
- Release readiness, final Pass, production usability, and Cost Calibration claims.

## Validation Plan

1. Run scoped Prettier write.
2. Run scoped Prettier check.
3. Run `git diff --check`.
4. Run Module Run v2 pre-commit hardening.
5. Run Module Run v2 module closeout readiness.
6. Run Module Run v2 pre-push readiness with remote-ahead check skipped before local closeout.

## Acceptance Criteria

- Current AI出题 / AI组卷 requirements have a single current traceability overlay.
- Standard, advanced, content backend, learner, and organization admin docs point to the current overlay.
- Catalog readers are warned that older `blocked_until_gate_approved` rows are provenance/gate context, not current acceptance blockers after 2026-07-02 evidence.
- AGENTS includes a recovery rule for future AI generation tasks.
- State and queue record this task, allowed files, blocked files, validation commands, and closeout policy.
- Evidence and audit record no unresolved conflict and no prohibited runtime or sensitive data.
