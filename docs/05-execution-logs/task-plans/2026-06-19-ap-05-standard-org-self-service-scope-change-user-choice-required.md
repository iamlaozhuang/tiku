# AP-05 Standard Org Self-Service Scope Change User Choice Required Task Plan

## Task

- Task id: `ap-05-standard-org-self-service-scope-change-user-choice-required`
- Branch: `codex/ap-05-standard-org-self-service-scope-change-user-choice-required`
- Source story: user requested AP-05 product/privacy scope user-choice-required package.
- Use case: `UC-FUTURE-STANDARD-ORG-SELF-SERVICE-NON-GOAL`
- Approval package: `AP-05-STANDARD-ORG-SELF-SERVICE-USER-CHOICE`

## Read Standards

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/adr-001-tech-stack-selection.md`
- `docs/02-architecture/adr/adr-002-runtime-architecture-and-multi-client-contract.md`
- `docs/02-architecture/adr/adr-003-workplace-desktop-web-compatibility.md`
- `docs/02-architecture/adr/adr-004-environment-isolation-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-005-staging-architecture-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-006-runtime-dependency-alignment.md`
- `docs/05-execution-logs/evidence/2026-06-19-ap-05-standard-org-self-service-scope-decision-detailing.md`

## Scope

Allowed files:

- `docs/04-agent-system/state/local-experience-coverage-matrix.yaml`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/2026-06-19-ap-05-standard-org-self-service-scope-change-user-choice-required.md`
- `docs/05-execution-logs/evidence/2026-06-19-ap-05-standard-org-self-service-scope-change-user-choice-required.md`
- `docs/05-execution-logs/audits-reviews/2026-06-19-ap-05-standard-org-self-service-scope-change-user-choice-required.md`

## Explicit Non-Goals

- No product scope change.
- No source, API, UI, test, e2e, or script change.
- No privacy data access.
- No DB read or write.
- No schema, migration, dependency, package, or lockfile change.
- No `.env*` access.
- No staging/prod/cloud/deploy.
- No payment or external-service execution.
- No formal adoption, PR, force push, destructive DB operation, or sensitive evidence collection.

## Product Choice Boundary

The existing AP-05 decision detailing exposed these options:

- A: keep standard organization self-service out of current release.
- B: add limited standard organization self-service later.
- C: make organization self-service advanced-only.
- D: defer to customer-specific review.

This task does not choose an option. It records that the selected option is `none` and that AP-05 remains blocked until
the owner chooses an option. Non-A options require a separate fresh approval with exact allowed files, commands, product
boundary, privacy/data boundary, release boundary, validation, rollback, redaction, and stop conditions.

## Execution Plan

1. Confirm clean `master` aligned with `origin/master`.
2. Create the AP-05 short branch.
3. Seed `ap-05-standard-org-self-service-scope-change-user-choice-required` as a closed docs-state task.
4. Add evidence and audit review that preserve `future_non_goal_for_standard`.
5. Update project-state and coverage matrix so AP-05 no longer appears as an unseeded automated task.
6. Run scoped Prettier, `git diff --check`, lint, typecheck, and Module Run v2 gates.
7. Commit locally, fast-forward merge to `master`, rerun master gates, push `origin/master`, and delete the merged short
   branch.

## Stop Conditions

- Any request to select B, C, or D without a separate exact-scope fresh approval.
- Any need to edit product source, tests, e2e, scripts, schema, migrations, package files, lockfiles, provider config,
  DB data, privacy data, environment files, or runtime behavior.
- Any request to run DB access, payment/external-service execution, staging/prod/deploy, PR, force push, or sensitive
  evidence collection.
