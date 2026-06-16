# Task Plan: advanced-organization-training-publish-version-route-boundary-readonly-audit-seeding

## Scope

- Task: `advanced-organization-training-publish-version-route-boundary-readonly-audit-seeding`
- Branch: `codex/advanced-organization-training-publish-version-route-boundary-readonly-audit-seeding`
- Task kind: docs/state/log-only readonly audit queue seeding.
- Purpose: seed a pending readonly route/API boundary audit before any organization training publish-version route implementation.

## Required Reading

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/*.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/01-requirements/traceability/capability-catalog.md`
- `docs/04-agent-system/state/advanced-edition-code-stage-seeding-plan.yaml`
- `docs/superpowers/plans/2026-06-06-advanced-edition-organization-training-implementation-plan.md`
- `docs/05-execution-logs/evidence/2026-06-15-advanced-organization-training-publish-version-service-runtime-wiring-readonly-recheck.md`
- `docs/05-execution-logs/audits-reviews/2026-06-15-advanced-organization-training-publish-version-service-runtime-wiring-readonly-recheck.md`

## Implementation Plan

1. Confirm `master` readiness and no `codex/*` branch residue before creating the short branch.
2. Create this task plan, evidence, and audit review.
3. Append a pending readonly audit task named `advanced-organization-training-publish-version-route-boundary-readonly-audit`.
4. Keep the pending audit narrow:
   - readonly review only.
   - Review route naming, public-id-only URL policy, standard response envelope, ADR-002 route to service layering, metadata-only DTO exposure, route/API/UI non-expansion, and formal target write blocking.
   - Do not implement route/API/UI behavior.
5. Run the existing organization training unit set and Module Run v2 closeout gates.
6. Commit, fast-forward merge to `master`, push `origin/master`, delete the short branch, fetch prune, and confirm clean alignment.

## Risk Controls

- No `.env*` read/write/output.
- No product source implementation in this seed task.
- No DB access, migration generation, migration execution, `drizzle-kit push`, row/private data read, provider/model call, dev server, Browser, Playwright/e2e, staging/prod/cloud/deploy/payment/external-service, package/lockfile/dependency change, formal content write, formal target write, PR, or force push.
- Evidence records only commands, file paths, counts, and redacted conclusions.
