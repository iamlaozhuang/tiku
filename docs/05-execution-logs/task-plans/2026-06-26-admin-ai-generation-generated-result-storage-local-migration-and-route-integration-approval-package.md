# Task Plan: Admin AI Generation Generated Result Storage Local Migration And Route Integration Approval Package

Task id: `admin-ai-generation-generated-result-storage-local-migration-and-route-integration-approval-package-2026-06-26`

Branch: `codex/admin-ai-result-storage-migration-approval-20260626`

Task kind: `docs_only_approval_package`

## SSOT Read List

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/04-agent-system/operating-manual.md`
- `docs/04-agent-system/sop/requirement-ssot-reading-governance.md`
- `docs/04-agent-system/sop/task-lifecycle-governance.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/01-requirements/00-index.md`
- `docs/01-requirements/advanced-edition/00-index.md`
- `docs/01-requirements/advanced-edition/modules/02-ai-task-domain.md`
- `docs/01-requirements/advanced-edition/modules/08-organization-ai-generation.md`
- `docs/01-requirements/advanced-edition/stories/epic-05-formal-content-separation.md`
- `docs/01-requirements/advanced-edition/stories/epic-07-organization-ai-generation.md`
- `docs/01-requirements/traceability/2026-06-23-advanced-ai-generation-scope-clarification.md`
- `docs/01-requirements/traceability/2026-06-24-role-separated-mvp-requirement-alignment.md`
- `docs/01-requirements/traceability/role-experience-fulfillment-matrix.md`

## Requirement Decision Map

- Advanced AI generated content remains separate from formal `question` and `paper`.
- Admin AI task status may be tracked with redacted evidence.
- Organization admin and content admin AI generated result storage is allowed only as draft/review-domain data.
- Provider, Cost Calibration, formal adoption, staging/prod, payment, external service, deployment, release readiness,
  and final Pass remain separately gated.

## Requirement Mapping

- AI task domain: local migration and route smoke may validate task/result persistence only when evidence stays redacted.
- Organization AI generation: organization-owned generated result drafts remain scoped to `organization`.
- Formal content separation: generated result storage does not adopt into formal `question` or `paper`.
- Role-separated MVP alignment: content/admin organization AI entries remain role-scoped and do not imply release Pass.

## Evidence-Only Sources

- `docs/05-execution-logs/acceptance/2026-06-26-admin-ai-generation-generated-result-storage-approval-package.md`
- `docs/05-execution-logs/evidence/2026-06-26-admin-ai-generation-generated-result-storage-schema-contract-adapter-tdd.md`
- `docs/05-execution-logs/audits-reviews/2026-06-26-admin-ai-generation-generated-result-storage-schema-contract-adapter-tdd.md`
- `docs/05-execution-logs/evidence/2026-06-26-admin-ai-generation-local-db-read-history-route-smoke-execution.md`

## Conflict Check

No conflict found. Requirement SSOT supports separated generated result storage, while the latest implementation evidence
shows the migration file and adapter exist but local migration execution and route integration remain unapproved.

## Documentation Approach

1. Create an approval package deciding whether to allow applying the existing local migration
   `drizzle/20260626203000_add_admin_ai_generation_result.sql`.
2. Decide whether a follow-up task may wire content/org admin local routes to
   `AdminAiGenerationResultPersistenceRepository`.
3. Define a minimal local route smoke boundary, request limits, redaction rules, stop conditions, and blocked gates.
4. Update evidence, audit review, `task-queue.yaml`, and `project-state.yaml`.

## Allowed Files

- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/2026-06-26-admin-ai-generation-generated-result-storage-local-migration-and-route-integration-approval-package.md`
- `docs/05-execution-logs/acceptance/2026-06-26-admin-ai-generation-generated-result-storage-local-migration-and-route-integration-approval-package.md`
- `docs/05-execution-logs/evidence/2026-06-26-admin-ai-generation-generated-result-storage-local-migration-and-route-integration-approval-package.md`
- `docs/05-execution-logs/audits-reviews/2026-06-26-admin-ai-generation-generated-result-storage-local-migration-and-route-integration-approval-package.md`

## Explicit Blocks

- No migration execution in this task.
- No live DB connection, route smoke, direct SQL, seed, account mutation, browser/dev-server/e2e, Provider call,
  credential/env read, source/test/schema/migration/package/lockfile change, formal content write, staging/prod,
  payment, external service, deployment, release readiness, or final Pass.

## Validation Commands

- `npx.cmd prettier --write --ignore-unknown <changed docs/state files>`
- `npx.cmd prettier --check --ignore-unknown <changed docs/state files>`
- `git diff --check`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId admin-ai-generation-generated-result-storage-local-migration-and-route-integration-approval-package-2026-06-26`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId admin-ai-generation-generated-result-storage-local-migration-and-route-integration-approval-package-2026-06-26 -SkipRemoteAheadCheck`

Cost Calibration Gate remains blocked.
