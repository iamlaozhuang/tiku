# unified-repair-admin-log-retention-redaction-layering Task Plan

## Task

- Task id: `unified-repair-admin-log-retention-redaction-layering`
- Branch: `codex/unified-repair-admin-log-retention-redaction-layering`
- Date: 2026-06-14
- Mode: strict serial repair task

## Required Context Read

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/adr-001-tech-stack-selection.md`
- `docs/02-architecture/adr/adr-002-runtime-architecture-and-multi-client-contract.md`
- `docs/02-architecture/adr/adr-003-workplace-desktop-web-compatibility.md`
- `docs/02-architecture/adr/adr-004-environment-isolation-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-005-staging-architecture-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-006-runtime-dependency-alignment.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/01-requirements/traceability/unified-standard-advanced-source-index.md`
- `docs/01-requirements/traceability/capability-catalog.md`
- `docs/01-requirements/use-cases/use-case-catalog.md`
- `docs/01-requirements/traceability/unified-edition-delta-matrix.md`
- `docs/01-requirements/traceability/unified-use-case-technical-matrix.md`
- `docs/01-requirements/modules/06-admin-ops.md`
- `docs/01-requirements/stories/epic-06-admin-ops.md`
- `docs/01-requirements/advanced-edition/modules/07-retention-log-governance.md`
- `docs/01-requirements/advanced-edition/stories/epic-06-retention-log-governance.md`
- `docs/superpowers/specs/2026-06-06-advanced-edition-ops-config-contract.md`
- `docs/05-execution-logs/evidence/2026-06-14-unified-standard-mvp-admin-ops-logs-code-audit.md`
- `docs/05-execution-logs/audits-reviews/2026-06-14-unified-standard-mvp-admin-ops-logs-code-audit.md`
- `docs/05-execution-logs/evidence/2026-06-14-unified-code-audit-findings-rollup-and-repair-queue-seeding.md`
- `docs/05-execution-logs/audits-reviews/2026-06-14-unified-code-audit-findings-rollup-and-repair-queue-seeding.md`

## Scope

Allowed implementation surfaces are limited to:

- `src/app/api/v1/audit-logs/**`
- `src/app/api/v1/ai-call-logs/**`
- `src/app/(admin)/ops/**`
- `src/server/services/audit-log/**`
- `src/server/services/ai-call-log/**`
- `src/server/repositories/audit-log/**`
- `src/server/repositories/ai-call-log/**`
- `src/server/contracts/audit-log/**`
- `src/server/contracts/ai-call-log/**`
- `src/server/mappers/audit-log/**`
- `src/server/mappers/ai-call-log/**`
- `src/server/validators/audit-log/**`
- `src/server/validators/ai-call-log/**`
- `tests/unit/admin-logs/**`

Governance outputs are limited to state, queue, task plan, evidence, and audit/review files.

## Blocked Boundaries

- No `.env.local`, `.env.*`, secret, provider configuration, token, or database URL access.
- No raw prompt/provider response viewer, raw sensitive viewer, hard-delete executor, export, file generation, or download implementation.
- No real provider/model request, quota use, cost measurement, prompt payload, provider payload, or model response handling beyond redacted metadata contracts.
- No schema, migration, `src/db/schema/**`, or `drizzle/**` edits.
- No dependency, `package.json`, or lockfile edits.
- No e2e, staging/prod/cloud/deploy, payment, external-service, PR, force-push, or Cost Calibration work.
- If implementation requires a blocked surface, stop and record evidence instead of widening scope.

## TDD Plan

1. Add `tests/unit/admin-logs/admin-log-retention-redaction-layering.test.ts` first.
2. RED assertions:
   - scoped `audit-log` and `ai-call-log` contract/service/repository/mapper/validator modules exist;
   - route-facing handlers expose standard `{ code, message, data, pagination? }` responses without leaking numeric ids;
   - list requests normalize pagination and filters for operation type, actor, time range, AI function, status, profession, level, and organization context;
   - DTOs expose only public ids, counts, statuses, timestamps, model/provider public metadata, `evidenceStatus`, retention metadata, and redacted summaries;
   - raw prompt, provider response, token, secret, database URL, row data, and private user/customer data are rejected or stripped;
   - retention policy defaults reflect `audit_log_retention_day = 1095`, `ai_call_log_retention_day = 180`, read-only log behavior, export blocking, raw viewer blocking, and hard-delete executor blocking.
3. Run the target unit test and record the expected RED failure.
4. Implement the minimum scoped contract/service/repository/mapper/validator and route handler factory needed for GREEN.
5. Re-run the target unit test and required validation commands.

## Validation Commands

- `git diff --check`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `npm.cmd run test:unit -- tests/unit/admin-logs/admin-log-retention-redaction-layering.test.ts`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId unified-repair-admin-log-retention-redaction-layering`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId unified-repair-admin-log-retention-redaction-layering`

## Risk Defense

- Keep REST route handlers thin per ADR-002; route adapters validate transport input, call scoped services, and return standard API envelopes.
- Keep `audit_log` and `ai_call_log` surfaces read-only for exposed log APIs.
- Use project glossary terms and casing: database-facing names remain `snake_case`, JSON DTO fields remain `camelCase`.
- Reuse public identifiers only; do not expose auto-increment ids.
- Keep evidence redacted: only command names, pass/fail state, file counts, test counts, public ids, statuses, timestamps, and summaries.
- Preserve blocked advanced gates by representing raw viewer/export/hard-delete/provider/schema work as explicit blocked capabilities, not implementation.
