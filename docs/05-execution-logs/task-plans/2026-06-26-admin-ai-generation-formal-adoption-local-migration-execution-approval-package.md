# Admin AI generation formal adoption local migration execution approval package task plan

Task id: `admin-ai-generation-formal-adoption-local-migration-execution-approval-package-2026-06-26`

Branch: `codex/admin-ai-formal-adoption-local-migration-approval-20260626`

Task kind: `docs_only_approval_package`

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

- Formal adoption into platform `question` or `paper` requires governed review and attribution.
- The prior implementation task created the reviewed migration file and adapter, but did not execute migration.
- ADR-004 allows local dev migration rehearsal only under explicit approval; staging/prod migration remains blocked.

## Requirement Mapping

- This package prepares the local migration execution decision needed before route integration can rely on `admin_ai_generation_formal_adoption`.
- It approves only local dev migration execution for the reviewed file `drizzle/20260626235000_add_admin_ai_generation_formal_adoption.sql` in a later task.
- It does not approve formal draft creation, Provider work, route smoke, or staging/prod release readiness.

## Evidence-Only Sources

- `docs/05-execution-logs/evidence/2026-06-26-admin-ai-generation-formal-adoption-db-schema-and-adapter-tdd.md`
- `docs/05-execution-logs/audits-reviews/2026-06-26-admin-ai-generation-formal-adoption-db-schema-and-adapter-tdd.md`
- `docs/05-execution-logs/acceptance/2026-06-26-admin-ai-generation-formal-adoption-db-schema-adapter-or-route-integration-approval-package.md`

## Conflict Check

No requirement conflict was found. The migration file exists and is reviewed, but applying it still requires this task-level approval boundary. The package keeps migration execution separate from route integration and formal draft writes.

## Approval Decision To Prepare

- Approve next task: `admin-ai-generation-formal-adoption-local-migration-execution-2026-06-26`.
- Allow reading only the already-approved local private DB connection source needed by the existing local migration command.
- Allow applying the reviewed local migration once against local dev DB.
- Allow a minimal sanitized schema-read confirmation that the table exists after migration.
- Do not allow data dumps, row-level reads, route smoke, formal content writes, Provider, env evidence, staging/prod, payment, external service, dependency, or release readiness.

## Validation Commands

- `npx.cmd prettier --check --ignore-unknown <changed docs/state files>`
- `git diff --check`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId admin-ai-generation-formal-adoption-local-migration-execution-approval-package-2026-06-26`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId admin-ai-generation-formal-adoption-local-migration-execution-approval-package-2026-06-26 -SkipRemoteAheadCheck`

## Stop Conditions

- Any need to execute migration in this task.
- Any need to reveal or record local DB URL or env values.
- Any need to connect to staging/prod or apply destructive DB operations.
- Any need to route-integrate, route-smoke, call Provider, or write formal `question`/`paper` drafts.
