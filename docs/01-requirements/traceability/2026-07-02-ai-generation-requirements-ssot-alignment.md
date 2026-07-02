# 2026-07-02 AI Generation Requirements SSOT Alignment

## Status

This is the current requirement-reading overlay for AI出题 and AI组卷 work after the 2026-07-02 acceptance baseline normalization.

It is a requirements and governance alignment artifact only. It does not claim release readiness, final Pass, production usability, Cost Calibration, deployment, staging, broad production/full resource coverage, or unrestricted Provider execution.

## Authority Order

Future AI出题 / AI组卷 tasks must read sources in this order before reopening historical gaps:

1. This alignment document.
2. `docs/05-execution-logs/evidence/2026-07-02-ai-generation-acceptance-baseline-normalization.md`.
3. `docs/05-execution-logs/evidence/2026-07-02-ai-generation-goal-completion-audit.md`.
4. `docs/01-requirements/traceability/2026-06-23-advanced-ai-generation-scope-clarification.md`.
5. The affected standard or advanced requirement module.
6. Older execution logs, capability rows, use-case rows, and audit matrices as provenance only.

## Requirement Baseline

| Surface                   | Eligible actor              | Entry                               | Route/API boundary                                         | Output boundary                                                | Current acceptance reading                                                                                             |
| ------------------------- | --------------------------- | ----------------------------------- | ---------------------------------------------------------- | -------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| Content backend           | `content_admin`             | `AI出题`, `AI组卷`                  | Content AI generation requests                             | Content AI draft/review domain                                 | In scope for role-separated unified acceptance; generated output must not directly write formal `question` or `paper`. |
| Organization backend      | `org_advanced_admin`        | `AI出题`, `AI组卷`                  | Organization AI generation requests                        | Organization-owned draft domain                                | In scope for advanced organization acceptance; `org_standard_admin` remains denied or unavailable.                     |
| Learner surface           | `personal_advanced_student` | `AI训练` with `AI出题` and `AI组卷` | Personal AI generation requests                            | Personal learner AI content domain                             | In scope for advanced learner acceptance; standard personal learners remain denied, hidden, or upgrade-guided.         |
| Learner surface           | `org_advanced_employee`     | `AI训练` with `AI出题` and `AI组卷` | Personal AI generation requests under organization context | Employee-owned learner AI content in organization auth context | In scope for advanced organization employee acceptance; standard organization employees remain denied or unavailable.  |
| System operations backend | `ops_admin`                 | None for authoring                  | Governance/log/config surfaces only                        | No content authoring output                                    | `ops_admin` local login residual was closed by later evidence; it does not create an AI authoring entry.               |

## Stale Source Handling

- Standard base MVP still treats AI出题 and AI组卷 as excluded from the original standard-only MVP. The 2026-06-23 and 2026-06-24 supplements define the unified standard/advanced repair scope for content backend and advanced roles.
- The 2026-06-21 content-admin AI decision rows that describe content-admin buttons or routes as blocked are historical. The same decision chain is superseded at requirement level by the 2026-06-23 scope clarification and the current baseline evidence.
- Capability and use-case catalog rows with `blocked_until_gate_approved` are still valid as historical governance boundaries. They must not be used to reopen already covered local owner-preview or bounded Provider acceptance findings without comparing later 2026-07-02 baseline evidence.
- 2026-07-01 walkthrough and repair-roadmap findings are historical after the 2026-07-02 goal-completion audit, unless a later task produces new regression evidence.

## Reuse And Regression Policy

- AI出题 and AI组卷 must keep shared task-count semantics, shared structured preview parsing, shared Provider instruction contracts, shared route/service contracts, and cross-surface UI regression tests as the protected baseline.
- Role-specific behavior is allowed only at authorization, ownership, route boundary, and copy/state presentation points. Do not fork core generation, parsing, counting, or evidence semantics per role unless a future design task explicitly approves it.
- Future fixes must first map the affected issue to content backend, organization backend, personal learner, organization employee learner, or governance-only surfaces before touching shared code.
- Historical residual wording may be closed or superseded only by dated evidence and must be recorded as such rather than silently deleted.

## Requirement Mapping

| Requirement                                                          | Current mapped source                                  | Status           |
| -------------------------------------------------------------------- | ------------------------------------------------------ | ---------------- |
| Content-admin AI draft and review                                    | `STD-REQ-06`, `DEC-2026-06-23-AI-SCOPE`, this document | current_baseline |
| Advanced personal learner AI generation                              | `ADV-MOD-03`, this document                            | current_baseline |
| Advanced organization employee AI generation                         | `ADV-MOD-03`, this document                            | current_baseline |
| Advanced organization admin AI generation                            | `ADV-MOD-08`, this document                            | current_baseline |
| Standard learners and standard organization roles denied/unavailable | `ADV-MOD-03`, `ADV-MOD-08`, this document              | current_baseline |
| Formal content separation                                            | `ADV-STORY-05`, `STD-REQ-02`, this document            | current_baseline |
| Redacted evidence only                                               | AGENTS.md, current evidence baseline, this document    | current_baseline |

## Explicit Non-Claims

- No release readiness.
- No final Pass.
- No production usability.
- No Cost Calibration.
- No staging/prod/cloud deploy.
- No broad claim that every possible logistics production/full resource path is validated.
- No permission to record credentials, env values, raw DB rows, Provider payloads, raw prompts, raw AI I/O, or complete generated/material/chunk content.

## Conflict Check

| Conflict                                                                                                                           | Resolution                                                                                                                                           | Decision status          |
| ---------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------ |
| Standard base MVP excludes AI generation while later unified supplements include content-admin and advanced-role AI generation.    | Keep standard base non-goal for standard-only MVP; use later supplements and this document for unified standard/advanced AI generation repair scope. | resolved_by_source_order |
| Older content-admin blocked wording conflicts with later accepted content backend entries.                                         | Treat older blocked rows as historical and superseded by 2026-06-23 clarification plus 2026-07-02 baseline evidence.                                 | resolved_by_source_order |
| Catalog `blocked_until_gate_approved` wording conflicts with completed local owner-preview / bounded Provider acceptance evidence. | Keep catalog rows as implementation/provenance gates, not current acceptance blockers.                                                               | resolved_by_source_order |

No unresolved product decision was found in this documentation alignment task.

## Next Recommended Work

After this alignment, the next task should choose one explicit path:

- Continue experience walkthroughs against the current baseline.
- Prepare release-readiness gates without claiming readiness before evidence exists.
- Clean stale diagnostic wording such as non-blocking runtime import diagnostics.

Each path needs a separate task plan, scoped acceptance criteria, and redacted evidence.
