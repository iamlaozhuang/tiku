# unified-repair-organization-auth-layering-lifecycle Task Plan

## Task

- Task id: `unified-repair-organization-auth-layering-lifecycle`
- Branch: `codex/unified-repair-organization-auth-layering-lifecycle`
- Date: 2026-06-14
- Mode: strict serial implementation repair task

## Required Context Read

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/*.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/01-requirements/traceability/unified-standard-advanced-source-index.md`
- `docs/01-requirements/traceability/capability-catalog.md`
- `docs/01-requirements/use-cases/use-case-catalog.md`
- `docs/01-requirements/traceability/unified-edition-delta-matrix.md`
- `docs/01-requirements/traceability/unified-use-case-technical-matrix.md`
- `docs/01-requirements/modules/01-user-auth.md`
- `docs/01-requirements/stories/epic-01-user-auth.md`
- `docs/01-requirements/modules/06-admin-ops.md`
- `docs/01-requirements/stories/epic-06-admin-ops.md`
- `docs/05-execution-logs/evidence/2026-06-14-unified-standard-mvp-organization-auth-code-audit.md`
- `docs/05-execution-logs/audits-reviews/2026-06-14-unified-standard-mvp-organization-auth-code-audit.md`
- `docs/05-execution-logs/evidence/2026-06-14-unified-repair-auth-session-personal-auth-boundary.md`
- Existing read-only code shape under `src/app/api/v1/organizations/**`, `src/server/services/admin-organization-org-auth-runtime.ts`, `src/server/services/organization-auth-service.ts`, `src/server/contracts/organization-auth-contract.ts`, `src/server/repositories/organization-auth-repository.ts`, `src/server/mappers/organization-auth-mapper.ts`, `src/server/validators/organization.ts`, and `src/server/validators/org-auth.ts`.

## Scope

Allowed implementation surfaces are limited to:

- `src/app/api/v1/organizations/**`
- `src/app/(admin)/ops/organizations/**`
- `src/app/(admin)/ops/redeem-codes/**`
- `src/server/services/organization/**`
- `src/server/repositories/organization/**`
- `src/server/contracts/organization/**`
- `src/server/mappers/organization/**`
- `src/server/validators/organization/**`
- `tests/unit/organization/**`

Governance outputs are limited to state, queue, task plan, evidence, and audit/review files.

## Blocked Boundaries

- No schema, migration, `src/db/schema/**`, or `drizzle/**` edits.
- No advanced organization portal or organization training implementation.
- No env/secret/provider configuration, e2e, dependency/package/lockfile, staging/prod/cloud/deploy, payment, external-service, PR, force-push, or Cost Calibration work.
- Do not edit existing out-of-scope runtime files; wrap them through scoped organization boundaries instead.

## TDD Plan

1. Add `tests/unit/organization/organization-auth-layering-lifecycle.test.ts` first.
2. RED assertions:
   - scoped `organization` contract/service/repository/mapper/validator modules exist;
   - organization route adapters import the scoped route handler factory, not the out-of-scope runtime factory directly;
   - DTOs expose public ids, hierarchy, status, timestamps, lifecycle summaries, and redacted metadata only;
   - organization tree depth and parent tier rules are represented;
   - `org_auth` overlap rules reject duplicate active coverage;
   - employee unbind records organization lifecycle effects and keeps personal authorization fallback distinct;
   - standard MVP platform-managed organization auth is explicit while advanced organization portal/training stays blocked.
3. Run the target unit test and record the expected RED failure.
4. Implement the minimum scoped contract/service/repository/mapper/validator and route bridge needed for GREEN.
5. Re-run the target test and required validation commands.

## Validation Commands

- `git diff --check`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `npm.cmd run test:unit -- tests/unit/organization/organization-auth-layering-lifecycle.test.ts`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId unified-repair-organization-auth-layering-lifecycle`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId unified-repair-organization-auth-layering-lifecycle`

## Risk Defense

- Keep route adapters thin per ADR-002 while moving the visible import boundary to `src/server/services/organization/**`.
- Keep new scoped modules additive; do not rewrite the existing runtime service or schema.
- Use glossary terms and casing: `organization`, `employee`, `org_auth`, `auth_scope_type`, `personal_auth`, `redeem_code`.
- Keep evidence redacted: no cleartext redeem code, employee private data, Authorization header, token, secret, database URL, or row data.
