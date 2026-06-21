# Plan Admin Experience Gap Closures

**Date:** 2026-06-21
**Task id:** `plan-admin-experience-gap-closures`
**Branch:** `codex/plan-admin-experience-gap-closures`
**Scope:** docs-only split plan for content/ops admin experience gaps.

## Read Before Edit

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/03-standards/glossary.yaml`
- ADRs `adr-001` through `adr-007`
- `docs/01-requirements/traceability/role-experience-fulfillment-matrix.md`
- `docs/05-execution-logs/audits-reviews/2026-06-21-requirement-fulfillment-and-role-experience-review.md`
- `src/server/contracts/admin-content-knowledge-ops-contract.ts`
- `src/server/contracts/admin-user-org-auth-ops-contract.ts`
- Static admin UI scans for question/material, redeem_code, organization, and employee surfaces.

## Goal

Close the admin experience gap item by recording separate implementation packages for question/material binding, redeem_code detail, and organization/employee management.

## Implementation Steps

1. Create this task plan.
2. Add `docs/01-requirements/traceability/2026-06-21-admin-experience-gap-closure-plan.md`.
3. Update project-state and task-queue current task status.
4. Create evidence and audit review files.
5. Validate docs with `git diff --check`, Prettier check, no-placeholder search, and Module Run v2 gates.
6. Commit, fast-forward merge to `master`, push `origin/master`, and delete the merged short branch.

## Risk Boundaries

- No source/test/e2e/schema/migration/seed/database/script/package/lockfile/dependency/`.env`/Provider/browser/dev-server/deploy/PR/force-push/payment/external-service/Cost Calibration Gate work.
- This plan does not mark the admin runtime experiences as complete; it records the next scoped packages and their verification gates.
