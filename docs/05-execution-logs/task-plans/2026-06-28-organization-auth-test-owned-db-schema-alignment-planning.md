# Organization Auth Test-Owned DB Schema Alignment Planning

## Task Metadata

- Task id: `organization-auth-test-owned-db-schema-alignment-planning-2026-06-28`
- Branch: `codex/org-auth-db-alignment-plan-20260628`
- Task kind: `docs_state_alignment_planning`
- Approval source: current user approved execution and closeout after recommendation to plan a local test-owned DB/schema alignment task.
- Result target: prepare a safe, copyable future approval package for local test-owned DB/schema alignment needed to prove `org_auth.edition` and `auth_upgrade`.

## Required Reading Completed

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/04-agent-system/sop/`
- `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`
- `docs/01-requirements/traceability/unified-standard-advanced-source-index.md`
- `docs/05-execution-logs/evidence/2026-06-28-organization-auth-db-backed-proof-local.md`
- `docs/05-execution-logs/acceptance/2026-06-28-organization-auth-db-backed-proof-local.md`

## Boundary

This task may modify only docs/state planning records:

- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/01-requirements/traceability/2026-06-28-organization-auth-test-owned-db-schema-alignment-planning.md`
- `docs/05-execution-logs/task-plans/2026-06-28-organization-auth-test-owned-db-schema-alignment-planning.md`
- `docs/05-execution-logs/evidence/2026-06-28-organization-auth-test-owned-db-schema-alignment-planning.md`
- `docs/05-execution-logs/audits-reviews/2026-06-28-organization-auth-test-owned-db-schema-alignment-planning.md`
- `docs/05-execution-logs/acceptance/2026-06-28-organization-auth-test-owned-db-schema-alignment-planning.md`

This task must not modify or execute:

- `src/**`, `tests/**`, `e2e/**`
- `src/db/schema/**`, `drizzle/**`, migration files, seed files
- `package.json`, lockfiles, `.env*`
- DB connections, DB reads, DB writes, schema generation, migration, seed, destructive DB
- browser, dev server, Playwright/e2e
- Provider, Cost Calibration, staging/prod/deploy, payment/OCR/export/external-service
- PR, force push, release readiness, final Pass

## Planning Conclusion To Produce

The previous DB-backed proof reached `partial_blocked_by_local_schema_gap` because the named local target lacked:

- `org_auth.edition`
- `auth_upgrade`

The future executable work should be split into two strictly gated options:

1. `organization-auth-test-owned-db-schema-alignment-approval-package-2026-06-28`
   - docs/state approval package only;
   - prepares exact future execution text.
2. `organization-auth-test-owned-db-schema-alignment-execution-2026-06-28`
   - executable only after fresh approval;
   - may use a local test-owned target and approved local schema/migration path;
   - must prove `org_auth.edition`, `auth_upgrade`, effective organization edition, standard fallback, upgrade active path, upgrade revoked/expired fallback, and org context selection with redacted aggregate evidence.

## Risk Design

- Source-only planning: low risk.
- Local test-owned DB/schema alignment execution: high risk because it may include schema/migration/seed/local DB writes.
- Provider, Cost Calibration, staging/prod/deploy, payment/OCR/export/external-service: blocked.
- Release readiness and final Pass: blocked.

## Validation Plan

Run only local docs/state validation:

```text
npx.cmd prettier --write --ignore-unknown <changed docs/state files>
npx.cmd prettier --check --ignore-unknown <changed docs/state files>
git diff --check
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Get-TikuProjectStatus.ps1
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId organization-auth-test-owned-db-schema-alignment-planning-2026-06-28
```

Closeout after local commit is approved by the current user request, limited to fast-forward merge to `master`, push `origin/master`, and delete the merged short branch.
