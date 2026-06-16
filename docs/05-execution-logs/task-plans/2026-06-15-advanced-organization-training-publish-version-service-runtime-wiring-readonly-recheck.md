# Task Plan: advanced-organization-training-publish-version-service-runtime-wiring-readonly-recheck

## Scope

- Task: `advanced-organization-training-publish-version-service-runtime-wiring-readonly-recheck`
- Branch: `codex/advanced-organization-training-publish-version-service-runtime-wiring-readonly-recheck`
- Task kind: readonly audit.
- Purpose: recheck organization training publish-version service runtime wiring after repository/mapper persistence integration.

## Required Reading

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/*.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/01-requirements/traceability/capability-catalog.md`
- `docs/04-agent-system/state/advanced-edition-code-stage-seeding-plan.yaml`
- `docs/superpowers/plans/2026-06-06-advanced-edition-organization-training-implementation-plan.md`
- `docs/05-execution-logs/evidence/2026-06-15-advanced-organization-training-publish-version-service-runtime-wiring.md`
- `docs/05-execution-logs/audits-reviews/2026-06-15-advanced-organization-training-publish-version-service-runtime-wiring.md`
- `docs/05-execution-logs/evidence/2026-06-15-advanced-organization-training-publish-version-persistence-repository-mapper.md`
- `docs/05-execution-logs/audits-reviews/2026-06-15-advanced-organization-training-publish-version-persistence-repository-mapper.md`

## Readonly Review Plan

1. Confirm the queued task is `pending`, dependencies are closed, fresh approval exists, and the short branch is active.
2. Read the scoped service, repository, mapper, contract/model/validator, schema, and migration files without executing DB or provider behavior.
3. Verify ADR-002 layering:
   - service remains the orchestration boundary;
   - repository remains persistence boundary;
   - mapper remains DB row to metadata DTO adapter;
   - route/API/UI are not expanded by the runtime wiring task.
4. Verify internal `organizationId` and `orgAuthId` lineage is validated in service and only crosses into the persistence boundary.
5. Verify public publish DTOs and tests do not expose internal numeric ids or authorization lineage.
6. Verify metadata-only, formal content separation, and formal target write blocked statements remain accurate.
7. Record findings, needs_recheck, validation outputs, and blocked gates in evidence/audit.
8. Run declared validation commands and Module Run v2 closeout gates.
9. Commit, fast-forward merge to `master`, push `origin/master`, delete the short branch, fetch prune, and confirm clean alignment.

## Risk Controls

- No `.env*` read/write/output.
- No product source edits.
- No DB access, row/private data read, migration generation, migration execution, `drizzle-kit push`, provider/model call, dev server, Browser, Playwright/e2e, staging/prod/cloud/deploy/payment/external-service, package/lockfile/dependency change, formal content write, formal target write, PR, or force push.
- Evidence records only file paths, field names, command results, counts, and redacted conclusions.
