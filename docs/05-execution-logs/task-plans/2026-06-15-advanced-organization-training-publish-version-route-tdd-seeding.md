# Task Plan: advanced-organization-training-publish-version-route-tdd-seeding

## Scope

- Task: `advanced-organization-training-publish-version-route-tdd-seeding`
- Branch: `codex/advanced-organization-training-publish-version-route-tdd-seeding`
- Task kind: docs/state/log-only implementation planning.
- Purpose: seed the next narrow RED-first TDD route/runtime task after the route boundary readonly audit closed with
  `pass_readonly_audit_with_tdd_route_seeding_recommended`.

## Required Reading

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/*.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/01-requirements/traceability/capability-catalog.md`
- `docs/04-agent-system/state/advanced-edition-code-stage-seeding-plan.yaml`
- `docs/superpowers/plans/2026-06-06-advanced-edition-organization-training-implementation-plan.md`
- `docs/05-execution-logs/evidence/2026-06-15-advanced-organization-training-publish-version-route-boundary-readonly-audit.md`
- `docs/05-execution-logs/audits-reviews/2026-06-15-advanced-organization-training-publish-version-route-boundary-readonly-audit.md`

## Implementation Plan

1. Confirm repository readiness, clean worktree, `master == origin/master`, and no `codex/*` residue before using the short branch.
2. Create this task plan, evidence, and audit review.
3. Append a closed seed task and one pending route TDD task:
   - `advanced-organization-training-publish-version-route-tdd-seeding`
   - `advanced-organization-training-publish-version-route-tdd`
4. Keep the pending TDD task narrow:
   - route shape: `POST /api/v1/organization-trainings/{publicId}/publish`
   - RED-first route tests required before implementation
   - route handlers remain thin and use the standard `{ code, message, data, pagination? }` envelope
   - public URL/body boundary uses public identifiers only and rejects path/body public id mismatch
   - output remains metadata-only and redacted
   - no service/repository/mapper/schema/provider/UI/formal write expansion
5. Run the existing organization training unit set and Module Run v2 closeout gates.
6. Commit, fast-forward merge to `master`, push `origin/master`, delete the short branch, fetch prune, and confirm clean alignment.

## Risk Controls

- No `.env*` read/write/output.
- No product source implementation in this seed task.
- No DB access, migration generation, migration execution, `drizzle-kit push`, row/private data read, provider/model call,
  dev server, Browser, Playwright/e2e, staging/prod/cloud/deploy/payment/external-service, package/lockfile/dependency
  change, formal content write, formal target write, PR, force push, or Cost Calibration Gate work.
- Evidence records only commands, file paths, counts, and redacted conclusions.
