# Admin AI generation formal adoption local route smoke approval package task plan

Task id: `admin-ai-generation-formal-adoption-local-route-smoke-approval-package-2026-06-26`

Branch: `codex/admin-ai-formal-adoption-route-smoke-approval-20260626`

Task kind: `docs_only_approval_package`

## SSOT Read List

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/adr-001-tech-stack-selection.md`
- `docs/02-architecture/adr/adr-002-runtime-architecture-and-multi-client-contract.md`
- `docs/02-architecture/adr/adr-004-environment-isolation-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-006-runtime-dependency-alignment.md`
- `docs/04-agent-system/operating-manual.md`
- `docs/04-agent-system/sop/requirement-ssot-reading-governance.md`
- `docs/04-agent-system/sop/task-lifecycle-governance.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/01-requirements/00-index.md`
- `docs/01-requirements/modules/02-question-paper.md`
- `docs/01-requirements/advanced-edition/00-index.md`
- `docs/01-requirements/advanced-edition/stories/epic-05-formal-content-separation.md`
- `docs/01-requirements/traceability/2026-06-23-advanced-ai-generation-scope-clarification.md`

## Requirement Decision Map

- Content admin generated output can enter formal adoption only through governed review metadata.
- The previous route integration task added the route/service/runtime path but intentionally did not run a live local DB
  route smoke.
- Local route smoke requires a separate approval because it uses the local DB-backed adapter and may create adoption
  metadata rows.
- Formal `question`/`paper` draft writes remain separate from adoption metadata and are not approved here.

## Requirement Mapping

- This task prepares approval for the next local dev route smoke task only.
- The approved next task may prove the route-handler path can create or reuse adoption metadata for content admin
  generated results.
- The approved next task must still keep formal target writes at `blocked_without_follow_up_task`.
- If no eligible local content generated result exists, the next task must stop with a minimal diagnostic instead of
  seeding data or broadening scope.

## Evidence-Only Sources

- `docs/05-execution-logs/evidence/2026-06-26-admin-ai-generation-formal-adoption-route-integration-tdd.md`
- `docs/05-execution-logs/audits-reviews/2026-06-26-admin-ai-generation-formal-adoption-route-integration-tdd.md`
- `docs/05-execution-logs/evidence/2026-06-26-admin-ai-generation-formal-adoption-local-migration-execution.md`

## Conflict Check

No requirement conflict was found. The route and local migration are present, but route smoke still needs explicit
approval. This approval package does not itself execute route smoke, connect to DB, or write data.

## Allowed Scope

- Create approval package, task plan, evidence, and audit review.
- Update project state and task queue for the approval decision.
- Approve the next task to run at most two local route-handler POST smoke calls with redacted evidence.

## Blocked Scope

- Do not connect to DB or run route smoke in this task.
- Do not execute migration, generate migration files, seed data, or create fixtures.
- Do not write formal `question`/`paper` draft rows.
- Do not approve organization-scoped adoption.
- Do not call Provider, read Provider credentials, read or edit `.env*`, change dependencies, or touch staging/prod,
  deploy, payment, external services, Cost Calibration, release readiness, or final Pass.

## Validation Commands

- `npx.cmd prettier --write --ignore-unknown <changed docs/state files>`
- `npx.cmd prettier --check --ignore-unknown <changed docs/state files>`
- `git diff --check`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId admin-ai-generation-formal-adoption-local-route-smoke-approval-package-2026-06-26`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId admin-ai-generation-formal-adoption-local-route-smoke-approval-package-2026-06-26 -SkipRemoteAheadCheck`

## Stop Conditions

- Any need to inspect local DB state, run route smoke, or write adoption metadata in this task.
- Any need to seed data or create eligible generated-result rows.
- Any need to approve formal draft writes, organization adoption, Provider, env/secret, dependency, staging/prod,
  deploy, payment, external service, or Cost Calibration work beyond the explicit next-task boundary.
