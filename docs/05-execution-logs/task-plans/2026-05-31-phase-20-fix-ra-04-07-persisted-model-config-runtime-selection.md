# Phase 20 Fix RA-04-07 Persisted Model Config Runtime Selection

## Scope

- Task: `phase-20-fix-ra-04-07-persisted-model-config-runtime-selection`
- Branch: `codex/phase-20-fix-ra-04-07-persisted-model-config-runtime-selection`
- Source finding: `F-RA-04-07-001`
- Goal: prove local AI runtime selection can be driven by persisted admin-managed `model_config` records without real provider calls or secret/env changes.

## Required Reading

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/03-standards/local-ci.md`
- `docs/03-standards/testing-tdd.md`
- `docs/02-architecture/adr/`
- `docs/02-architecture/interfaces/`
- `docs/04-agent-system/sop/automation-loop.md`
- `docs/04-agent-system/sop/local-human-verification.md`
- `docs/04-agent-system/sop/security-review-gate.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/04-agent-system/state/blocked-gates.yaml`

## Constraints

- Do not read or modify `.env*`.
- Do not modify dependency manifests or lockfiles.
- Do not modify `src/db/schema/**`, `drizzle/**`, or migrations.
- Do not call real providers or change external service configuration.
- Keep provider secrets and raw provider payloads out of evidence.

## TDD Plan

1. Add a failing unit test showing a persisted `model_config` summary becomes the selected runtime `ModelConfigSnapshot`.
2. Add a student-flow runtime test proving the default local AI scoring path uses a persisted catalog loader when provided.
3. Implement a pure mapper from persisted admin model config/prompt template DTOs into `ModelConfigRuntimeCatalog`.
4. Defer default student AI scoring model selection until scoring time, preferring persisted catalog loading and falling back to the existing local catalog only when no persisted catalog is available.
5. Run targeted RED/GREEN plus full task/local CI validation and record redacted evidence.

## Security Review Notes

- `ai_runtime`: local deterministic/mock runtime only; no provider network call.
- `secret_or_env_change`: no env file access and no provider secret exposure.
- `external_service_config`: no staging/prod/cloud/real provider configuration changes.
- `evidence_integrity`: evidence records command results and sanitized metadata only.
