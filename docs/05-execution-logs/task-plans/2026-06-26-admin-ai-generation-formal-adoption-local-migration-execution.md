# Admin AI generation formal adoption local migration execution task plan

Task id: `admin-ai-generation-formal-adoption-local-migration-execution-2026-06-26`

Branch: `codex/admin-ai-formal-adoption-local-migration-execution-20260626`

Task kind: `local_migration_execution`

## SSOT Read List

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/adr-004-environment-isolation-and-release-boundaries.md`
- `docs/04-agent-system/operating-manual.md`
- `docs/04-agent-system/sop/requirement-ssot-reading-governance.md`
- `docs/04-agent-system/sop/task-lifecycle-governance.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/01-requirements/00-index.md`
- `docs/01-requirements/advanced-edition/00-index.md`
- `docs/01-requirements/advanced-edition/stories/epic-05-formal-content-separation.md`
- `docs/01-requirements/traceability/2026-06-23-advanced-ai-generation-scope-clarification.md`

## Requirement Decision Map

- Formal adoption metadata must exist before route integration can persist reviewed adoption decisions.
- ADR-004 allows local dev migration rehearsal under explicit task-level approval.
- Staging/prod migration remains blocked.

## Requirement Mapping

- Execute the reviewed local migration for `admin_ai_generation_formal_adoption` so later route integration can use the DB adapter.
- Keep generated-result history isolated and keep formal draft writes blocked.
- Do not add route behavior or formal draft creation in this task.

## Evidence-Only Sources

- `docs/05-execution-logs/acceptance/2026-06-26-admin-ai-generation-formal-adoption-local-migration-execution-approval-package.md`
- `docs/05-execution-logs/evidence/2026-06-26-admin-ai-generation-formal-adoption-db-schema-and-adapter-tdd.md`
- `docs/05-execution-logs/audits-reviews/2026-06-26-admin-ai-generation-formal-adoption-db-schema-and-adapter-tdd.md`

## Conflict Check

No conflict was found. The approval package allows exactly one local migration execution and one sanitized schema-read confirmation. Route smoke and formal draft writes remain blocked.

## Execution Plan

1. Run `npx.cmd drizzle-kit migrate` once using the existing local Drizzle configuration.
2. Run one sanitized schema-read confirmation that reports only whether `admin_ai_generation_formal_adoption` exists.
3. Record pass/fail status without DB URL, env contents, raw rows, or credentials.
4. Run docs/state formatting and Module Run v2 gates.

## Blocked Scope

- Do not modify schema, migration, source, tests, package, lockfile, or env files.
- Do not run route smoke or route integration.
- Do not write formal `question` or `paper` drafts.
- Do not call Provider or touch Provider credentials.
- Do not access staging/prod, payment, deploy, external service, Cost Calibration, release readiness, or final Pass.

## Validation Commands

- `npx.cmd drizzle-kit migrate`
- sanitized schema-read confirmation for `admin_ai_generation_formal_adoption`
- `npx.cmd prettier --check --ignore-unknown <changed docs/state files>`
- `git diff --check`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId admin-ai-generation-formal-adoption-local-migration-execution-2026-06-26`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId admin-ai-generation-formal-adoption-local-migration-execution-2026-06-26 -SkipRemoteAheadCheck`

## Stop Conditions

- Migration command requires staging/prod or unknown non-local target.
- Migration attempts destructive operations beyond applying reviewed migration metadata.
- Schema confirmation would expose DB URL, env values, rows, or generated content.
- Any need arises for route smoke, formal draft writes, Provider work, dependency changes, or external services.
