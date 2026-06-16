# Advanced Organization Training Publish Version Route Org Admin Actor Boundary Readonly Audit

## Task

- Task id: `advanced-organization-training-publish-version-route-org-admin-actor-boundary-readonly-audit`
- Branch: `codex/advanced-organization-training-publish-version-route-org-admin-actor-boundary-readonly-audit`
- Baseline: `master == origin/master == a0b133db118afc93cf4d8afbe2a7f91e305a5b1f`
- Scope: docs-only readonly audit of the organization-training publish route actor boundary.

## Norms Read

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/*.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/01-requirements/traceability/capability-catalog.md`
- `docs/01-requirements/use-cases/use-case-catalog.md`
- `docs/01-requirements/advanced-edition/modules/04-organization-training.md`
- `docs/01-requirements/advanced-edition/stories/epic-02-organization-training.md`
- `docs/04-agent-system/state/advanced-edition-code-stage-seeding-plan.yaml`
- Prior trusted-lineage evidence/audit for the publish route boundary.

## Plan

1. Confirm git readiness from a clean `master` and create a short branch.
2. Review only the current route/service/repository/session/admin/auth contracts relevant to publish lineage.
3. Decide whether an existing runtime source proves both organization-admin actor and visible organization scope.
4. Write redacted evidence and audit without implementation or runtime DB/provider/browser execution.
5. Run the declared validation and closeout commands, then commit, fast-forward merge, push, and cleanup if all gates pass.

## Risk Controls

- No product source, schema, script, dependency, provider, browser, dev-server, DB, deploy, payment, or formal-write work.
- Evidence remains metadata-only: no row data, private data, raw prompt, raw answer, provider payload, credential, or public identifier value list.
- ADR-002 layering remains authoritative: route may normalize and envelope; service owns business rules; repository owns persistence; trusted lineage must be server-side and repository-verified.
