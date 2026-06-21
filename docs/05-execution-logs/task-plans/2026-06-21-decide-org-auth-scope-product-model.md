# Decide Org Auth Scope Product Model Plan

**Date:** 2026-06-21
**Task id:** `decide-org-auth-scope-product-model`
**Branch:** `codex/decide-org-auth-scope-product-model`
**Scope:** docs-only product and architecture decision package.

## Read Before Edit

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/03-standards/glossary.yaml`
- ADRs `adr-001` through `adr-007`
- `docs/01-requirements/use-cases/use-case-catalog.md`
- `docs/01-requirements/traceability/role-experience-fulfillment-matrix.md`
- `docs/05-execution-logs/audits-reviews/2026-06-21-requirement-fulfillment-and-role-experience-review.md`
- `src/db/schema/auth.ts`
- `src/server/contracts/organization-auth-contract.ts`

## Goal

Close the `org_auth` authorization scope audit item by recording the product decision for `subject`, multi-`profession`, multi-`level`, and shared enterprise backend behavior while keeping authorization runtime changes blocked.

## Implementation Steps

1. Create this task plan.
2. Add `docs/01-requirements/traceability/2026-06-21-org-auth-scope-product-decision.md`.
3. Update project-state and task-queue current task status.
4. Create evidence and audit review files.
5. Validate docs with `git diff --check`, Prettier check, no-placeholder search, and Module Run v2 gates.
6. Commit, fast-forward merge to `master`, push `origin/master`, and delete the merged short branch.

## Risk Boundaries

- No schema, migration, seed, database, source, test, e2e, script, package, lockfile, dependency, `.env`, Provider, prompt, browser/dev-server runtime, deploy, PR, force-push, payment, external-service, authorization runtime, or Cost Calibration Gate work.
- Any future authorization-model implementation requires fresh approval with exact contract, schema, UI, service, security review, migration, validation, rollback, and stop-condition boundaries.
