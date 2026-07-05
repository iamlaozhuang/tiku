# 2026-07-04 Full-Chain Scenario 9 Edition Upgrade Redeem Runtime Repair Plan

## Scope

- Task id: `full-chain-scenario-9-edition-upgrade-redeem-runtime-repair-2026-07-04`
- Branch: `codex/full-chain-scenario-9-edition-upgrade-redeem-runtime-repair-2026-07-04`
- Source blocked task: `full-chain-scenario-9-advanced-personal-pre-provider-2026-07-04`

## Read Gate

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- ADR-007
- `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`
- `docs/01-requirements/traceability/2026-07-02-redeem-code-edition-and-plaintext-ops-decision.md`
- Scenario 9 pre-runtime evidence and audit
- `src/server/repositories/redeem-code-authorization-repository.ts`
- `src/server/services/redeem-code-authorization-service.ts`
- `src/server/repositories/student-authorization-redeem-runtime-repository.ts`
- `src/server/services/redeem-code-authorization-service.test.ts`
- `tests/unit/phase-8-student-authorization-redeem-runtime.test.ts`
- `tests/unit/phase-11-redeem-code-batch-management-loop.test.ts`

## Implementation

1. Extend the redeem repository contract to carry `redeem_code_type`.
2. For `personal_standard_activation`, create standard `personal_auth`.
3. For `personal_advanced_activation`, create advanced `personal_auth`.
4. For `edition_upgrade`, require one active matching standard `personal_auth`, create `auth_upgrade`, and return the source `personal_auth` without creating another one.
5. Add focused unit coverage for advanced activation and edition upgrade.
6. Update related test fixtures to keep the stricter repository row contract required.

No schema, migration, seed, dependency, browser, DB runtime, Provider, staging/prod, Cost Calibration, release readiness, final Pass, or production usability claim is in scope.
