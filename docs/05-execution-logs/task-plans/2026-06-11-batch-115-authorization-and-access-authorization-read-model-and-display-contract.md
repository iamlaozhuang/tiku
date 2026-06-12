# Batch 115 Authorization Read Model And Display Contract Plan

## Scope

- Task: `batch-115-authorization-and-access-authorization-read-model-and-display-contrac`
- Target closure: authorization read-model and display contracts.
- Allowed code surfaces: `src/server/models/**`, `src/server/contracts/**`, `src/server/validators/**`, `src/server/services/**`.
- Blocked surfaces: `.env*`, package and lock files, `src/db/schema/**`, `drizzle/**`, provider, deploy, payment, external-service, and Cost Calibration Gate.

## Read Documents

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

## Implementation Plan

1. Add focused service-level tests for the effective authorization read model:
   - advanced `org_auth` display capabilities when local production enablement is configured;
   - production enablement missing keeps advanced capabilities blocked;
   - serialized DTO output does not expose numeric ids, plaintext `redeem_code`, provider payload, prompt, token, secret, or database URL.
2. Keep implementation within the existing `effective-authorization-service` and contract types. Do not add schema, migration, repository SQL, mapper, route, dependency, or env changes.
3. If code changes are needed, keep them limited to explicit DTO/read-model behavior and stable capability flags.
4. Run scoped focused tests first, then required validation commands.
5. Write redacted evidence and audit review before closeout.

## Risk Defense

- No provider calls; Cost Calibration Gate remains blocked.
- No production quota defaults are inferred.
- No internal numeric ids or sensitive raw payloads may appear in API DTOs or evidence.
- Existing `/api/v1/authorizations` response envelope remains `{ code, message, data }`.
