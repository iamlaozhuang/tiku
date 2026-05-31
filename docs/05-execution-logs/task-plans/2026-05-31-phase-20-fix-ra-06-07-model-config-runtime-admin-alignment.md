# Phase 20 Fix RA-06-07 Model Config Runtime Admin Alignment

## Scope

- Task: `phase-20-fix-ra-06-07-model-config-runtime-admin-alignment`
- Branch: `codex/phase-20-fix-ra-06-07-model-config-runtime-admin-alignment`
- Source finding: `F-RA-06-07-001`
- Goal: align admin `model_config` surfaces with local AI runtime selection evidence after persisted runtime selection was implemented in RA-04-07.

## Required Reading

- `AGENTS.md`
- `docs/03-standards/doc-management.md`
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

- No `.env.local` or `.env.example` read/write.
- No dependency, package, or lockfile change.
- No `src/db/schema/**`, `drizzle/**`, migration, or destructive data operation.
- No staging/prod/cloud/deploy, real provider, or external service call.
- Keep provider secrets, raw prompt bodies, raw answers, raw model responses, provider payloads, tokens, passwords, and numeric internal ids out of evidence and API-visible DTOs.

## TDD Plan

1. Add a failing unit test that proves admin `model_config` list metadata exposes a redaction-safe runtime-alignment summary backed by persisted admin config fields.
2. Add a failing unit test that proves enabling/disabling admin `model_config` changes the local persisted runtime selection without reading secrets or providers.
3. Implement the smallest admin service/runtime helper changes needed to reuse persisted admin DTOs for local runtime alignment.
4. Keep API response envelope and JSON camelCase fields unchanged.
5. Run targeted RED/GREEN tests, task validation commands, local CI gates, and write redacted evidence.

## Security Review Plan

- `ai_runtime`: local persisted metadata and deterministic/mock runtime only.
- `admin_ops`: model configuration mutations remain super-admin-only and audited.
- `secret_or_env_change`: remains blocked; evidence records no env access and no secret exposure.
- `local_human_verification`: run required local unit/e2e/build gates where relevant.
- `evidence_integrity`: evidence contains command summaries and sanitized metadata only.
