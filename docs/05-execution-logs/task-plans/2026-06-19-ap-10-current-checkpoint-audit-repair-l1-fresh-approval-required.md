# AP-10 Current Checkpoint Audit Repair L1 Fresh Approval Required Task Plan

## Task

- Task id: `ap-10-current-checkpoint-audit-repair-l1-fresh-approval-required`
- Branch: `codex/ap-10-current-checkpoint-audit-repair-l1-fresh-approval-required`
- Source story: user requested AP-10 current checkpoint audit repair L1 fresh approval required package.
- Use case: `UC-GATE-CURRENT-CHECKPOINT`
- Approval package: `AP-10-CURRENT-CHECKPOINT-AUDIT-REPAIR-L1-FRESH-APPROVAL`

## Read Standards

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/adr-001-tech-stack-selection.md`
- `docs/02-architecture/adr/adr-002-runtime-architecture-and-multi-client-contract.md`
- `docs/02-architecture/adr/adr-003-workplace-desktop-web-compatibility.md`
- `docs/02-architecture/adr/adr-004-environment-isolation-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-005-staging-architecture-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-006-runtime-dependency-alignment.md`
- `docs/05-execution-logs/evidence/2026-06-19-ap-10-current-checkpoint-audit-target-detailing.md`

## Scope

Allowed files:

- `docs/04-agent-system/state/local-experience-coverage-matrix.yaml`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/2026-06-19-ap-10-current-checkpoint-audit-repair-l1-fresh-approval-required.md`
- `docs/05-execution-logs/evidence/2026-06-19-ap-10-current-checkpoint-audit-repair-l1-fresh-approval-required.md`
- `docs/05-execution-logs/audits-reviews/2026-06-19-ap-10-current-checkpoint-audit-repair-l1-fresh-approval-required.md`

## Explicit Non-Goals

- No source repair.
- No test or e2e spec repair.
- No script, runtime, or browser/Playwright execution.
- No DB read or write.
- No `.env*` access.
- No schema, migration, dependency, package, or lockfile change.
- No provider/model call.
- No payment, OCR, export, file generation, or external-service execution.
- No staging/prod/cloud/deploy.
- No Cost Calibration Gate.
- No PR, force push, destructive DB operation, raw source artifact collection, raw row, raw prompt, raw response,
  provider payload, or sensitive evidence collection.

## Approval Boundary

The existing AP-10 target detailing records that the current checkpoint audit target is known, but any repair is blocked.
This task does not perform repair. It only materializes the L1 fresh approval text required before an owner may authorize
a separate AP-10 repair package.

Any future AP-10 repair package must name exact allowed files, exact blocked files, exact commands, target findings,
repair boundary, validation evidence, rollback, redaction, and stop conditions. Without that explicit package, AP-10
remains `release_blocked`.

## Execution Plan

1. Confirm clean `master` aligned with `origin/master`.
2. Create the AP-10 short branch.
3. Seed `ap-10-current-checkpoint-audit-repair-l1-fresh-approval-required` as a closed docs-state task.
4. Add evidence and audit review that keep source/test/e2e repair blocked.
5. Update project-state and coverage matrix so AP-10 no longer appears as an unseeded local-experience candidate.
6. Run scoped Prettier, `git diff --check`, lint, typecheck, and Module Run v2 gates.
7. Commit locally, fast-forward merge to `master`, rerun master gates, push `origin/master`, and delete the merged short
   branch.

## Stop Conditions

- Any request to perform source, test, e2e, script, browser, runtime, DB, env, provider, payment, OCR, export,
  staging/prod/cloud/deploy, schema, migration, dependency, package, lockfile, Cost Calibration Gate, PR, force push, or
  destructive DB work.
- Any AP-10 repair request that lacks exact allowed files, blocked files, commands, target findings, repair boundary,
  validation evidence, rollback, redaction, and stop conditions.
- Any evidence path that could expose secret, token, database URL, raw row, raw prompt, raw response, provider payload,
  raw source artifact, private identifier, or sensitive content.
