# 2026-07-03 Admin Model Prompt Log Governance Source Landing Plan

## Task

`admin-model-prompt-log-governance-source-landing-2026-07-03`

## Required Reads

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/03-standards/ui-code.md`
- `docs/02-architecture/adr/`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/01-requirements/00-index.md`
- `docs/01-requirements/advanced-edition/00-index.md`
- `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`
- `docs/02-architecture/adr/adr-007-edition-aware-authorization-source-of-truth.md`
- `docs/01-requirements/modules/04-ai-scoring.md`
- `docs/01-requirements/modules/05-rag-knowledge.md`
- `docs/01-requirements/modules/06-admin-ops.md`
- `docs/01-requirements/advanced-edition/modules/07-retention-log-governance.md`
- `docs/01-requirements/traceability/2026-07-02-admin-model-prompt-log-governance-ui-ux-contract.md`
- `docs/01-requirements/traceability/2026-07-02-role-auth-training-ops-decision-package.md`
- `docs/01-requirements/traceability/2026-07-02-current-thread-requirement-reconciliation-ledger.md`
- `docs/01-requirements/traceability/2026-07-02-ui-ux-requirement-design-baseline-gap-analysis.md`
- `docs/01-requirements/traceability/2026-07-02-ai-generation-requirements-ssot-alignment.md`
- `docs/01-requirements/traceability/2026-07-02-phase4-requirements-agent-baseline-alignment.md`
- latest relevant evidence for the accepted UI/UX contract and AI generation baseline.

## Source Observations

- `AdminModelConfigManagement.tsx` currently exposes model provider/config forms and Prompt template form/toggle controls.
- `AdminAiAuditLogOpsBaseline.tsx` loads model providers, model configs, Prompt templates, audit logs, AI call logs, and summaries through protected API paths.
- Runtime services already restrict model configuration mutation to `super_admin`, while `super_admin` and `ops_admin` can read log summaries.
- Prompt source registry exists in `src/ai/prompts/templates.ts`, but full Prompt text is not represented in the current admin Prompt DTO/UI.
- No current model config connection-test route/action was found.

## Implementation Plan

1. Extend the admin AI/log contract with redacted connection-test DTOs and Prompt registry metadata/full-text visibility fields.
2. Make Prompt management first-release read-only in the UI: no visible create/update/toggle/copy/export/delete actions, with full text available only when the DTO explicitly permits it.
3. Add a model config connection-test action for super-admin flows using minimal synthetic health-check semantics, redacted audit metadata, and no real Provider call.
4. Add read-only log detail affordances and visible 20/50/100 page-size controls without export/delete/archive actions.
5. Update route/service/repository mappings and focused tests only within the declared file boundary.

## Boundaries

- No schema, migration, seed, dependency, package/lockfile, Provider call, env secret access, browser/dev-server/e2e, direct DB connection, staging/prod deploy, PR, force push, Cost Calibration, release readiness, final Pass, or production-readiness claim.
- Evidence must not record credentials, sessions, cookies, auth headers, env values, raw DB rows, PII, plaintext `redeem_code`, Provider payloads, raw Prompt/full Prompt text, raw AI IO, raw employee answers, full question/paper/material/resource/chunk content, screenshots, traces, or raw DOM.

## Validation

- `npm.cmd run test:unit -- tests/unit/admin-ai-audit-log-ops-baseline.test.ts tests/unit/admin-model-config-management-ui.test.ts tests/unit/phase-12-model-config-server-runtime.test.ts tests/unit/phase-20-ra-04-07-persisted-model-config-runtime-selection.test.ts tests/unit/phase-20-ra-06-07-model-config-runtime-admin-alignment.test.ts src/app/(admin)/ops/ai-audit-logs/AdminAiAuditLogOpsBaseline.test.tsx src/ai/prompts/templates.test.ts`
- `npm.cmd run typecheck`
- `npm.cmd run lint`
- `npm.cmd run format:check`
- `git diff --check`
- Module Run v2 pre-commit, closeout, and pre-push readiness gates for this task id.
