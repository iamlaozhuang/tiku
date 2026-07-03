# 2026-07-03 Organization AI Post Actions Source Landing Plan

## Task

`organization-ai-post-actions-source-landing-2026-07-03`

## SSOT Read List

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/03-standards/ui-code.md`
- `docs/02-architecture/adr/adr-001-tech-stack-selection.md`
- `docs/02-architecture/adr/adr-002-runtime-architecture-and-multi-client-contract.md`
- `docs/02-architecture/adr/adr-003-workplace-desktop-web-compatibility.md`
- `docs/02-architecture/adr/adr-004-environment-isolation-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-005-staging-architecture-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-006-runtime-dependency-alignment.md`
- `docs/02-architecture/adr/adr-007-edition-aware-authorization-source-of-truth.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/01-requirements/00-index.md`
- `docs/01-requirements/advanced-edition/00-index.md`
- `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`
- `docs/01-requirements/advanced-edition/modules/08-organization-ai-generation.md`
- `docs/01-requirements/advanced-edition/stories/epic-07-organization-ai-generation.md`
- `docs/01-requirements/traceability/2026-07-02-ai-generation-requirements-ssot-alignment.md`
- `docs/01-requirements/traceability/2026-07-02-phase4-requirements-agent-baseline-alignment.md`
- `docs/01-requirements/traceability/2026-07-02-ui-ux-requirement-design-baseline-gap-analysis.md`
- `docs/01-requirements/traceability/2026-07-02-role-auth-training-ops-decision-package.md`
- `docs/01-requirements/traceability/2026-07-02-current-thread-requirement-reconciliation-ledger.md`
- `docs/01-requirements/traceability/2026-07-02-organization-ai-post-actions-ui-ux-contract.md`
- `docs/05-execution-logs/evidence/2026-07-02-ai-generation-goal-completion-audit.md`
- `docs/05-execution-logs/evidence/2026-07-02-ai-generation-acceptance-baseline-normalization.md`
- `docs/05-execution-logs/evidence/2026-07-02-organization-ai-post-actions-ui-ux-contract.md`
- `docs/05-execution-logs/audits-reviews/2026-07-02-organization-ai-post-actions-ui-ux-contract.md`

## Requirement Mapping Result

- `UX-REQ-08`, `CT-REQ-048`: organization AI results can only create and associate an organization training draft, not directly publish as formal `paper` or `mock_exam` content.
- The draft creation action must stay in the same organization and authorization scope, preserve the four-step organization training workflow, and use the existing draft `sourceTaskPublicId` field as the first-release source attribution anchor.
- `sufficient` evidence may create an associated draft; `weak` evidence requires an explicit confirmation action before creation; `none` blocks creation/publish and asks the operator to regenerate or add evidence.
- Creating organization AI associated drafts must not consume additional AI quota and must not expose raw Prompt, Provider payload, global AI logs, cross-organization payloads, raw employee learner AI output, or enterprise AI quota consumption summaries.
- Existing source inspection shows organization AI output is transient for full generated content; persisted history only has redacted summaries and evidence metadata. This package must not add schema, new source-context enum values, or raw AI output persistence.

## Implementation Boundary

Allowed:

- Update the organization AI admin UI and local-contract DTOs to represent draft creation post actions, evidence-state handling, same-organization handoff metadata, and non-formal wording.
- Update organization training manual-draft route/service/validator tests so AI-associated drafts can carry a `sourceTaskPublicId` without changing the current source-context enum.
- Use the existing organization training create-draft route from the UI; do not add migrations, new source-context enum values, or persist raw generated content.
- Record redacted evidence and two adversarial review passes.

Blocked:

- No schema, migration, seed, direct database connection, raw row evidence, Provider call, model config read/write, prompt payload, dependency change, browser/e2e runtime, staging/prod deploy, raw AI input/output persistence, plaintext generated question content in evidence, release readiness, final Pass, production usability, or Cost Calibration.

## Implementation Plan

1. Materialize state and queue entry for this task.
2. Extend organization AI history DTOs with safe organization/authorization/public-owner handoff metadata and draft creation readiness fields.
3. Replace organization AI post-action wording from formal adoption language to enterprise-training draft language.
4. Add UI actions for creating associated organization training drafts from `sufficient` results and explicit `weak` confirmation before creation; keep `none` disabled.
5. Create organization training drafts with `sourceTaskPublicId` pointing to the organization AI task, without extra AI calls or quota display.
6. Keep current source-context enum behavior unchanged: `paper` remains the first-release attachable source-context type and `mock_exam` stays blocked.
7. Add focused unit tests for draft creation action, weak confirmation, none blocking, wording boundaries, source-task attribution, and route payloads.
8. Run focused unit tests, `typecheck`, `lint`, `format:check`, `git diff --check`, and Module Run v2 gates.

## Risk Controls

- Reuse existing AI generation and organization training contracts; do not fork AI generation semantics by role.
- Do not claim full persisted generated-field review when the current persistence model only stores redacted summaries.
- Keep source attribution to public task/result ids and business labels; do not expose internal ids or raw generated content in logs/evidence.
- Preserve `org_advanced_admin` availability and `org_standard_admin` unavailable boundary.
