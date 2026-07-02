# UI/UX Requirement Design Baseline Gap Analysis Task Plan

Task id: `ui-ux-requirement-design-baseline-gap-analysis-2026-07-02`

Branch: `codex/ui-ux-requirement-baseline-gap-2026-07-02`

## Objective

Create a docs-only UI/UX and requirement design baseline for role flows, operations governance, organization
authorization, organization workspaces, AI generation follow-up actions, and admin AI/model/prompt governance gaps.

## Scope Guard

- Allowed: requirement traceability doc, requirement index pointers, task plan, evidence, audit review, project state,
  and task queue.
- Blocked: product source/test/script changes, dependency/package/lockfile changes, schema/migration/seed changes, DB
  access, Provider calls, browser/runtime validation, env/secret access, staging/prod deploy, payment, external-service
  work, PR, force push, Cost Calibration, release readiness, final Pass, and production usability claims.

## SSOT Read List

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/03-standards/ui-code.md`
- `docs/02-architecture/adr/`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/04-agent-system/sop/requirement-ssot-reading-governance.md`
- `docs/01-requirements/00-index.md`
- `docs/01-requirements/modules/01-user-auth.md`
- `docs/01-requirements/modules/02-question-paper.md`
- `docs/01-requirements/modules/03-student-experience.md`
- `docs/01-requirements/modules/04-ai-scoring.md`
- `docs/01-requirements/modules/05-rag-knowledge.md`
- `docs/01-requirements/modules/06-admin-ops.md`
- `docs/01-requirements/use-cases/use-case-catalog.md`
- `docs/01-requirements/advanced-edition/00-index.md`
- `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`
- `docs/01-requirements/advanced-edition/modules/*.md`
- `docs/01-requirements/advanced-edition/stories/*.md`
- `docs/01-requirements/traceability/2026-07-02-ai-generation-requirements-ssot-alignment.md`
- `docs/01-requirements/traceability/2026-07-02-phase4-requirements-agent-baseline-alignment.md`
- `docs/01-requirements/traceability/2026-07-02-requirements-ssot-cross-doc-alignment-audit.md`
- `docs/01-requirements/traceability/2026-07-02-requirements-code-implementation-alignment-audit.md`
- `docs/01-requirements/traceability/2026-06-24-role-separated-mvp-requirement-alignment.md`
- `docs/01-requirements/traceability/2026-06-27-standard-advanced-backend-ux-design-first-contract.md`
- `docs/01-requirements/traceability/2026-06-28-standard-advanced-next-ux-polish-queue-planning.md`
- `docs/01-requirements/traceability/2026-06-28-standard-advanced-ux-polish-queue-planning.md`
- `docs/01-requirements/traceability/2026-06-23-advanced-ai-generation-scope-clarification.md`
- `docs/01-requirements/traceability/2026-06-21-org-auth-scope-product-decision.md`
- `docs/01-requirements/traceability/2026-06-21-content-admin-ai-generation-scope-decision.md`
- `docs/01-requirements/traceability/2026-06-21-admin-experience-gap-closure-plan.md`
- `docs/01-requirements/traceability/role-experience-fulfillment-matrix.md`
- `docs/01-requirements/traceability/capability-catalog.md`
- `docs/01-requirements/traceability/requirement-fulfillment-matrix.md`
- `docs/01-requirements/traceability/unified-edition-delta-matrix.md`
- `docs/01-requirements/traceability/unified-use-case-technical-matrix.md`

## Requirement Decision Map

| Decision area                       | Active reading                                                                                                                                   |
| ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| UI/UX design baseline               | Backend UX design-first contract plus UI code standards define IA, states, route concepts, and token/state constraints.                          |
| Role-separated flows                | Role-separated MVP alignment defines the required actors, entries, allowed behavior, and denied behavior.                                        |
| Authorization and edition           | Edition-aware authorization requirements plus ADR-007 define `edition`, `effectiveEdition`, `auth_upgrade`, and context rules.                   |
| Organization authorization packages | Org auth scope decision defines atomic scope direction; schema/runtime implementation remains separately gated.                                  |
| AI出题 / AI组卷                     | 2026-07-02 AI generation SSOT and baseline evidence are the current first-read sources; old residuals are not reopened.                          |
| Prompt/model governance             | Standard AI scoring and admin ops docs allow model configuration; editable Prompt UI remains a separate design/security decision.                |
| Logs and evidence                   | Retention/log governance requires redacted summaries and forbids raw prompt, Provider payload, raw output, secrets, and plaintext `redeem_code`. |

## Requirement Mapping

Output path:

- `docs/01-requirements/traceability/2026-07-02-ui-ux-requirement-design-baseline-gap-analysis.md`

Required mapping results:

- UI/UX first-principles baseline.
- Role flow and workspace baseline.
- Operations governance baseline for `organization`, `employee`, `redeem_code`, `org_auth`, quota, model, prompt, and logs.
- Organization admin and employee baseline for training, analytics, AI generation, and standard/advanced denial.
- Gap register with concrete decision items.
- Non-claim and supersession register.
- Recommended next docs-only design tasks.

## Evidence-Only Sources

- `docs/05-execution-logs/evidence/2026-07-02-ai-generation-acceptance-baseline-normalization.md`
- `docs/05-execution-logs/evidence/2026-07-02-ai-generation-goal-completion-audit.md`
- `docs/05-execution-logs/evidence/2026-07-02-session-cookie-contract-login-and-e2e-alignment.md`

These files are used only to establish current baseline and supersession. They do not create new product scope or
runtime claims.

## Conflict Check

Expected conflicts or ambiguity:

- Standard base AI generation non-goal versus advanced/content AI generation entries.
- `org_auth_scope` direction versus current single-`profession`, single-`level` implementation reality.
- AI call log detail wording versus redaction rules for prompt, Provider payload, and raw output.
- Prompt template governance as service-side files versus a possible admin-editable Prompt UI.
- Organization admin employee-management rights versus platform operations ownership of the organization tree.
- Organization training and AI generated content lifecycle details beyond the current high-level requirement.

Decision rule: record current baseline and mark unresolved implementation-shaping ambiguity as `decision_required`.
Do not change product source, schema, runtime, Provider, or tests in this task.

## Validation Plan

- `npm.cmd exec -- prettier --write --ignore-unknown docs/01-requirements/00-index.md docs/01-requirements/advanced-edition/00-index.md docs/01-requirements/traceability/2026-07-02-ui-ux-requirement-design-baseline-gap-analysis.md docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-07-02-ui-ux-requirement-design-baseline-gap-analysis.md docs/05-execution-logs/evidence/2026-07-02-ui-ux-requirement-design-baseline-gap-analysis.md docs/05-execution-logs/audits-reviews/2026-07-02-ui-ux-requirement-design-baseline-gap-analysis.md`
- `npm.cmd exec -- prettier --check --ignore-unknown docs/01-requirements/00-index.md docs/01-requirements/advanced-edition/00-index.md docs/01-requirements/traceability/2026-07-02-ui-ux-requirement-design-baseline-gap-analysis.md docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-07-02-ui-ux-requirement-design-baseline-gap-analysis.md docs/05-execution-logs/evidence/2026-07-02-ui-ux-requirement-design-baseline-gap-analysis.md docs/05-execution-logs/audits-reviews/2026-07-02-ui-ux-requirement-design-baseline-gap-analysis.md`
- `git diff --check`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId ui-ux-requirement-design-baseline-gap-analysis-2026-07-02`

## Acceptance Criteria

- The traceability doc records a current UI/UX and requirement design baseline for all named surfaces.
- The gap register distinguishes resolved-by-source-order items from `decision_required` items.
- AI generation old residuals are not reopened without current-baseline evidence.
- Indexes point future agents to the new baseline.
- Evidence and audit review record redacted results only.
- No source/test/runtime/provider/browser/DB/dependency/schema/deploy change or release/final claim is made.
