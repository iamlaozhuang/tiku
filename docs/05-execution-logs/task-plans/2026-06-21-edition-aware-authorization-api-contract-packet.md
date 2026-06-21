# Edition-aware authorization API contract packet

## Scope

- Task id: `edition-aware-authorization-api-contract-packet`
- Branch: `codex/edition-auth-api-contract-packet`
- Fresh approval: current user prompt on 2026-06-21 approves the five edition-aware authorization packets in fixed serial order.
- This packet is limited to transport contract, validators, mappers, model type exports, and thin route handler tests for edition-aware authorization.

## Read Standards

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`
- `docs/01-requirements/traceability/edition-aware-authorization-acceptance-matrix.md`

## Allowed Files

- `src/server/contracts/**`
- `src/server/validators/**`
- `src/server/mappers/**`
- `src/server/models/**`
- `src/server/services/edition-aware-authorization-route.ts`
- `src/server/services/edition-aware-authorization-route.test.ts`
- `src/app/api/v1/authorizations/**`
- `src/app/api/v1/personal-auths/**`
- `src/app/api/v1/org-auths/**`
- `src/app/api/v1/redeem-codes/**`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/**`
- `docs/05-execution-logs/evidence/**`
- `docs/05-execution-logs/audits-reviews/**`

## Blocked Files And Gates

- No `.env*`, package or lockfile changes.
- No `src/db/schema/**`, `drizzle/**`, `src/server/repositories/**`, `src/features/**`, `src/components/**`, `e2e/**`, `scripts/**`, reports, dependency, provider, payment, deploy, PR, force-push, destructive DB, DB migration apply, or Cost Calibration Gate.
- No raw employee answer text, full paper content, raw prompt, raw generated AI content, provider payload, internal DB row, database URL, secret, token, Authorization header, or plaintext `redeem_code` in evidence.

## Implementation Plan

1. Materialize packet fresh approval in docs/state and record this plan before product code.
2. Add RED unit tests for query/input normalization, DTO mapping, and thin route handler response envelope.
3. Implement minimal contract/type/validator/mapper/route code with API JSON `camelCase` and no internal id exposure.
4. Keep real `effectiveEdition` calculation, repository queries, and upgrade evaluation out of this packet for packet 3.
5. Run focused unit tests, lint, typecheck, `git diff --check`, hardening, closeout readiness, and pre-push readiness.
6. Commit, FF merge to `master`, push `origin/master`, delete merged short branch, then run stage-end status commands.

## Risk Controls

- Contract-only route handler uses injected service and user resolver; it performs no DB read/write.
- Mapper inputs are sanitized row-like summaries and return only public identifiers.
- Evidence records command result summaries only.
