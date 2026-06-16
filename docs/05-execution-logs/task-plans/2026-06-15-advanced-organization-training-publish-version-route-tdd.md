# Task Plan: advanced-organization-training-publish-version-route-tdd

## Scope

- Task: `advanced-organization-training-publish-version-route-tdd`
- Branch: `codex/advanced-organization-training-publish-version-route-tdd`
- Task kind: local route implementation, RED-first TDD.
- Purpose: implement the narrow route/runtime boundary for
  `POST /api/v1/organization-trainings/{publicId}/publish`.

## Required Reading

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/*.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/01-requirements/traceability/capability-catalog.md`
- `docs/04-agent-system/state/advanced-edition-code-stage-seeding-plan.yaml`
- `docs/superpowers/plans/2026-06-06-advanced-edition-organization-training-implementation-plan.md`
- `docs/05-execution-logs/evidence/2026-06-15-advanced-organization-training-publish-version-route-tdd-seeding.md`
- `docs/05-execution-logs/audits-reviews/2026-06-15-advanced-organization-training-publish-version-route-tdd-seeding.md`
- `docs/05-execution-logs/evidence/2026-06-15-advanced-organization-training-publish-version-route-boundary-readonly-audit.md`
- `docs/05-execution-logs/audits-reviews/2026-06-15-advanced-organization-training-publish-version-route-boundary-readonly-audit.md`

## Implementation Plan

1. Confirm repository readiness from `master`, clean worktree, aligned `origin/master`, and no `codex/*` residue before
   creating this short branch.
2. Write route tests first in `src/server/services/organization-training-route.test.ts` and run the scoped unit command to
   observe RED before creating route runtime code.
3. Implement the minimal route helper in `src/server/services/organization-training-route.ts`:
   - parse JSON safely;
   - normalize with the existing organization training validator;
   - enforce path/body `draftPublicId` match;
   - resolve internal persistence lineage only through an injected trusted resolver;
   - call the existing `OrganizationTrainingService.publishVersion`;
   - return standard API envelopes without leaking internal lineage or raw/private fields.
4. Add a thin App Router entrypoint at
   `src/app/api/v1/organization-trainings/[publicId]/publish/route.ts`.
5. Run route unit tests, scoped organization training units, diff check, lint, typecheck, and Module Run v2 gates.
6. Record evidence/audit, commit, fast-forward merge to `master`, push `origin/master`, delete the short branch, fetch
   prune, and confirm clean alignment.

## Risk Controls

- No `.env*` read/write/output.
- No DB access or direct row/private data read.
- No migration generation, migration execution, schema/drizzle edits, scripts, package/lockfile/dependency changes,
  provider/model calls, provider configuration, dev server, Browser, Playwright/e2e, staging/prod/cloud/deploy/payment
  external-service, formal content write, formal target write, PR, force push, or Cost Calibration Gate work.
- No service business-rule changes, repository/mapper/contract/model/validator changes, or UI changes.
- Evidence records only commands, file paths, counts, and redacted conclusions.
