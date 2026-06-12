# Batch 116 Personal Auth And Org Auth Local Summaries Plan

**Task id:** `batch-116-authorization-and-access-personal-auth-and-org-auth-local-summaries`

**Branch:** `codex/batch-116-authorization-and-access-personal-auth-and-org-auth-local-summaries`

**Task kind:** `implementation`

## Sources Read

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/04-agent-system/operating-manual.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/04-agent-system/state/autodrive-control-schema.yaml`
- `docs/04-agent-system/state/mechanism-source-of-truth-index.yaml`
- `docs/04-agent-system/state/advanced-edition-domain-module-run-matrix.yaml`
- `docs/superpowers/specs/2026-06-06-advanced-edition-mvp-requirements.md`
- `docs/superpowers/specs/2026-06-06-advanced-edition-ops-config-contract.md`
- `docs/superpowers/plans/2026-06-06-advanced-edition-requirements-to-implementation-handoff.md`
- `docs/superpowers/plans/2026-06-06-advanced-edition-doc-source-of-truth-index.md`
- `docs/superpowers/plans/2026-06-06-advanced-edition-auth-context-implementation-plan.md`
- `docs/05-execution-logs/evidence/batch-115-authorization-and-access-authorization-read-model-and-display-contrac.md`
- `docs/05-execution-logs/evidence/batch-102-authorization-and-access-personal-auth-and-org-auth-local-summaries.md`

## Goal

Harden the existing local `authorization` source type summary so each `personal_auth` and `org_auth` source keeps its
local owner, quota owner, and effective edition summary explicit. This is a local contract/read-model task only.

## Scope

Allowed implementation surfaces:

- `src/server/models/**`
- `src/server/contracts/**`
- `src/server/validators/**`
- `src/server/services/**`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/**`
- `docs/05-execution-logs/evidence/**`
- `docs/05-execution-logs/audits-reviews/**`

Blocked surfaces:

- `.env.local`, `.env.example`
- `package.json`, lockfiles
- `src/db/schema/**`, `drizzle/**`
- provider calls or configuration
- schema/migration or destructive database work
- staging/prod/cloud/deploy, payment, external-service, PR, force push
- Cost Calibration Gate

## Implementation Plan

1. Add RED tests to `authorization-source-type-summary` service/validator for:
   - `personal_auth` owner and quota owner resolved to the user public id.
   - `org_auth` owner and quota owner resolved to the organization public id.
   - `effectiveEdition` remains explicit per source and defaults to `standard` for legacy inputs.
   - numeric ids, plaintext `redeem_code`, and private source payloads remain absent.
2. Extend model and contract types with camelCase DTO fields.
3. Extend validator normalization without accepting empty strings or invalid edition values.
4. Extend service mapping with no production capability or permission behavior changes.
5. Run focused tests, lint, typecheck, `git diff --check`, auto-seed readiness, and module closeout readiness.
6. Write evidence and audit review before approved closeout.

## Risk Defenses

- Keep `personal_auth` and `org_auth` distinct.
- Use public identifiers only; never expose auto-increment ids.
- Use `null` for optional organization fields, never empty strings.
- Do not add production defaults, quota enforcement, role/permission behavior, provider calls, schema changes, or dependencies.
- Keep evidence redacted; Cost Calibration Gate remains blocked.
