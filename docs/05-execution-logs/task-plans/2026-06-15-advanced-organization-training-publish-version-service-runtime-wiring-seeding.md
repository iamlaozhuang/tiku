# Task Plan: advanced-organization-training-publish-version-service-runtime-wiring-seeding

## Scope

- Task: `advanced-organization-training-publish-version-service-runtime-wiring-seeding`
- Branch: `codex/advanced-organization-training-publish-version-service-runtime-wiring-seeding`
- Task kind: docs/state/log-only implementation planning.
- Purpose: seed the next TDD implementation task for organization training publish-version service runtime wiring after the repository/mapper persistence task closed.

## Required Reading

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/*.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/01-requirements/traceability/capability-catalog.md`
- `docs/04-agent-system/state/advanced-edition-code-stage-seeding-plan.yaml`
- `docs/superpowers/plans/2026-06-06-advanced-edition-organization-training-implementation-plan.md`
- `docs/05-execution-logs/evidence/2026-06-15-advanced-organization-training-publish-version-persistence-repository-mapper.md`
- `docs/05-execution-logs/audits-reviews/2026-06-15-advanced-organization-training-publish-version-persistence-repository-mapper.md`

## Implementation Plan

1. Confirm `master` readiness and no `codex/*` branch residue before creating a short branch.
2. Create this task plan, evidence, and audit review.
3. Append a pending implementation task named `advanced-organization-training-publish-version-service-runtime-wiring`.
4. Keep the pending implementation task narrow:
   - TDD required.
   - Service/repository runtime wiring only.
   - No route, API adapter, UI, schema, migration, DB execution, provider/model, dependency, e2e, formal content write, or formal target write.
5. Run the existing organization training unit set and Module Run v2 closeout gates.
6. Commit, fast-forward merge to `master`, push `origin/master`, delete the short branch, fetch prune, and confirm clean alignment.

## Risk Controls

- No `.env*` read/write/output.
- No product source implementation in this seed task.
- No DB access, migration generation, migration execution, `drizzle-kit push`, row/private data read, provider/model call, dev server, Browser, Playwright/e2e, staging/prod/cloud/deploy/payment/external-service, package/lockfile/dependency change, formal content write, formal target write, PR, or force push.
- Evidence records only commands, file paths, counts, and redacted conclusions.
