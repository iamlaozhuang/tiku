# Plan Org Auth Implementation Split

**Date:** 2026-06-21
**Task id:** `plan-org-auth-implementation-split`
**Branch:** `codex/plan-org-auth-implementation-split`
**Scope:** docs-only implementation split and security checklist.

## Read Before Edit

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/03-standards/glossary.yaml`
- ADRs `adr-001` through `adr-007`
- `docs/01-requirements/traceability/2026-06-21-org-auth-scope-product-decision.md`
- `src/db/schema/auth.ts`
- `src/server/contracts/organization-auth-contract.ts`
- Static scans of org_auth services, repositories, validators, and admin UI.

## Goal

Close the `org_auth` implementation-split item by recording contract, service, UI, schema-approval, runtime-verification, and security-review packages without changing authorization runtime behavior.

## Implementation Steps

1. Create this task plan.
2. Add `docs/02-architecture/interfaces/2026-06-21-org-auth-implementation-split.md`.
3. Update project-state and task-queue current task status.
4. Create evidence and audit review files.
5. Validate docs with `git diff --check`, Prettier check, no-placeholder search, and Module Run v2 gates.
6. Commit, fast-forward merge to `master`, push `origin/master`, and delete the merged short branch.

## Risk Boundaries

- No runtime authorization, source/test/e2e/schema/migration/seed/database/script/package/lockfile/dependency/`.env`/Provider/browser/dev-server/deploy/PR/force-push/payment/external-service/Cost Calibration Gate work.
- Schema and authorization model implementation remain blocked until fresh approval.
