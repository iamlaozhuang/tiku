# 2026-07-05 Personal AI Generation `generationParameters` Null Contract Plan

## Scope

Repair the current full-unit red subset where three personal AI generation request tests expect `generationParameters` to be omitted, while ADR-002 and current route/service contracts require optional API fields to return `null`.

## Required Reading

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/adr-001-tech-stack-selection.md`
- `docs/02-architecture/adr/adr-002-runtime-architecture-and-multi-client-contract.md`
- `docs/02-architecture/adr/adr-003-workplace-desktop-web-compatibility.md`
- `docs/02-architecture/adr/adr-004-environment-isolation-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-005-staging-architecture-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-006-runtime-dependency-alignment.md`
- `docs/02-architecture/adr/adr-007-edition-aware-authorization-source-of-truth.md`
- `docs/01-requirements/00-index.md`
- `docs/01-requirements/advanced-edition/00-index.md`
- `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`
- `docs/01-requirements/traceability/2026-07-02-ai-generation-requirements-ssot-alignment.md`
- `docs/01-requirements/traceability/2026-07-02-phase4-requirements-agent-baseline-alignment.md`
- Latest task evidence and audit for `organization-ai-training-auth-lineage-2026-07-05`

## Implementation Approach

1. Run the focused existing failing tests first and record the RED result.
2. Inspect the validator/service flow to confirm whether `generationParameters: null` is produced by the current normalized contract.
3. If the behavior is contract-correct, update only the stale focused test expectations. If source behavior is proven wrong, make the smallest service/validator change instead.
4. Run focused tests, typecheck, lint, format check, diff check, and full unit audit to confirm this subset is closed and remaining red tests are unrelated follow-up tasks.

## Boundaries

- No Provider call.
- No DB connection, seed, migration, schema, or resource import.
- No env, credential, session, token, cookie, or private fixture access.
- No browser/dev-server/e2e execution.
- No package or lockfile change.
- No release readiness, final Pass, staging/prod, deployment, or Cost Calibration claim.

## Risk Controls

- Preserve ADR-002 API contract: optional fields return `null` rather than disappearing.
- Keep changes scoped to the failing personal AI generation request contract tests unless RED analysis proves source repair is necessary.
- Do not fork shared AI generation contracts or duplicate role-specific logic.
