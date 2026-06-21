# Decide Paper Count And Question Type Policy Plan

**Date:** 2026-06-21
**Task id:** `decide-paper-count-and-question-type-policy`
**Branch:** `codex/decide-paper-count-question-type-policy`
**Scope:** docs-only product policy package.

## Read Before Edit

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/03-standards/glossary.yaml`
- ADRs `adr-001` through `adr-007`
- `docs/01-requirements/traceability/role-experience-fulfillment-matrix.md`
- `docs/05-execution-logs/audits-reviews/2026-06-21-requirement-fulfillment-and-role-experience-review.md`
- `docs/05-execution-logs/evidence/2026-06-21-requirement-fulfillment-and-role-experience-review.md`
- `src/db/schema/paper.ts`
- `src/server/models/paper.ts`
- `src/server/contracts/student-paper-contract.ts`
- Student practice/mock_exam compatibility points in `src/features/student/**` and `src/server/services/**`

## Goal

Close the `paper` maximum question count and legacy `question_type` alias audit items by recording a concrete product policy, performance acceptance boundary, and deprecation plan.

## Implementation Steps

1. Create this task plan.
2. Add `docs/01-requirements/traceability/2026-06-21-paper-question-count-and-type-policy.md`.
3. Update project-state and task-queue current task status.
4. Create evidence and audit review files.
5. Validate docs with `git diff --check`, Prettier check, no-placeholder search, and Module Run v2 gates.
6. Commit, fast-forward merge to `master`, push `origin/master`, and delete the merged short branch.

## Risk Boundaries

- No source/test/e2e/schema/migration/seed/database/script/package/lockfile/dependency/`.env`/Provider/browser/dev-server/deploy/PR/force-push/payment/external-service/Cost Calibration Gate work.
- The policy records follow-up implementation boundaries only; it does not enforce the 100-question limit or remove alias compatibility in this task.
