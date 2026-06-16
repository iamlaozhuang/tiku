# Task Plan: advanced-organization-training-publish-version-service-runtime-wiring-readonly-recheck-seeding

## Scope

- Task: `advanced-organization-training-publish-version-service-runtime-wiring-readonly-recheck-seeding`
- Branch: `codex/advanced-organization-training-publish-version-service-runtime-wiring-readonly-recheck-seeding`
- Task kind: docs/state/log-only readonly recheck queue seeding.
- Purpose: convert the completed organization training publish-version service runtime wiring closeout into a narrow pending readonly recheck task.

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

## Implementation Plan

1. Confirm current branch is the approved short branch and the worktree is clean before edits.
2. Create this task plan, evidence, and audit review.
3. Append a pending readonly recheck task named `advanced-organization-training-publish-version-service-runtime-wiring-readonly-recheck`.
4. Keep the pending task narrow:
   - readonly review only.
   - Service, repository, mapper, contract/model/validator, schema/migration file inventory may be read.
   - No product source edits, route/API/UI implementation, schema/drizzle edits, migration generation or execution, DB access, provider/model work, dependency changes, e2e, formal content write, or formal target write.
5. Run the existing organization training unit set and Module Run v2 closeout gates.
6. Commit, fast-forward merge to `master`, push `origin/master`, delete the short branch, fetch prune, and confirm clean alignment.

## Risk Controls

- No `.env*` read/write/output.
- No product source implementation in this seed task.
- No DB access, migration generation, migration execution, `drizzle-kit push`, row/private data read, provider/model call, dev server, Browser, Playwright/e2e, staging/prod/cloud/deploy/payment/external-service, package/lockfile/dependency change, formal content write, formal target write, PR, or force push.
- Evidence records only commands, file paths, counts, and redacted conclusions.
