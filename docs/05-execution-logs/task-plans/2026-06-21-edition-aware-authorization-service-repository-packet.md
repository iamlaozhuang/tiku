# Edition-aware authorization service repository packet

## Scope

- Task id: `edition-aware-authorization-service-repository-packet`
- Branch: `codex/edition-auth-service-repository-packet`
- Fresh approval: current user prompt on 2026-06-21 approves this packet after schema and API packets are closed.
- This packet is limited to service/repository/domain mapping and focused unit tests for edition-aware authorization.

## Read Standards

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`
- `docs/01-requirements/traceability/edition-aware-authorization-acceptance-matrix.md`

## Allowed Files

- `src/server/services/**`
- `src/server/repositories/**`
- `src/server/models/**`
- `src/server/contracts/**`
- `src/server/validators/**`
- `src/server/mappers/**`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/**`
- `docs/05-execution-logs/evidence/**`
- `docs/05-execution-logs/audits-reviews/**`

## Blocked Files And Gates

- No `.env*`, package or lockfile changes.
- No `src/db/schema/**`, `drizzle/**`, `src/app/**`, `src/features/**`, `src/components/**`, `e2e/**`, `scripts/**`, reports, dependency, provider, payment, deploy, PR, force-push, destructive DB, real DB write, DB migration apply, or Cost Calibration Gate.
- No raw employee answer text, full paper content, raw prompt, raw generated AI content, provider payload, internal DB row, database URL, secret, token, Authorization header, or plaintext `redeem_code` in evidence.

## Implementation Plan

1. Materialize packet fresh approval in docs/state and record this plan before product code.
2. Add RED service/repository unit tests for original `edition`, active/expired/revoked `auth_upgrade`, quota owner context, scope filters, and audit-safe summaries.
3. Implement a repository contract with sanitized row types and pure helper behavior only; no runtime DB connection or writes.
4. Implement service logic using injected repository and clock.
5. Return packet 2 API DTOs via the mapper, preserving camelCase and public identifiers only.
6. Run focused unit tests, lint, typecheck, `git diff --check`, hardening, closeout readiness, and pre-push readiness.
7. Commit, FF merge to `master`, push `origin/master`, delete merged short branch, then run stage-end status commands.

## Risk Controls

- Real DB writes and local Docker DB capabilities remain blocked.
- Tests use fake repositories only.
- `effectiveEdition` is derived at runtime and never overwrites source `edition`.
