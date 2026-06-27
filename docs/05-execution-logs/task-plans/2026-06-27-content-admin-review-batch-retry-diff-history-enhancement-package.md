# Content-admin review batch retry diff history enhancement package plan

Task ID: `content-admin-review-batch-retry-diff-history-enhancement-package-2026-06-27`

## Scope

- Produce a docs/state approval package for content-admin batch review, failed retry, result diff, and adoption history enhancements.
- Split the enhancement surface into future verifiable tasks with explicit source/UI/runtime boundaries.
- Do not implement source, tests, UI, DB, Provider, retry, batch adoption, publish, student-visible runtime, browser/e2e, dev server, staging/prod, payment, external service, release readiness, or final Pass.

## Read Inputs

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/04-agent-system/operating-manual.md`
- `docs/04-agent-system/sop/batch-execution-package-governance.md`
- `docs/04-agent-system/sop/requirement-ssot-reading-governance.md`
- `docs/04-agent-system/sop/task-lifecycle-governance.md`
- `docs/04-agent-system/sop/local-first-validation-governance.md`
- `docs/05-execution-logs/acceptance/2026-06-27-content-admin-review-ux-design-traceability-package.md`
- `docs/05-execution-logs/acceptance/2026-06-27-content-admin-review-ui-implementation-local-validation.md`
- `docs/05-execution-logs/evidence/2026-06-27-content-admin-review-ui-implementation-local-validation.md`

## Boundary Plan

1. Batch review selection is allowed only as future source/read-model contract work until a separate mutation approval exists.
2. Failed retry is allowed only as future retry request contract/source work until Provider execution and retry mutation receive separate approval.
3. Result diff is allowed only as future redacted read-model/source work before any UI/browser validation.
4. Adoption history is allowed only as future read-only traceability source work before any persistence or browser validation.
5. A combined UI local validation task may follow after source contracts exist; browser/e2e/dev-server validation remains separately blocked.

## Validation Plan

- Scoped Prettier write/check on docs/state files.
- `git diff --check`.
- Module Run v2 pre-commit hardening, project status diagnostic, and pre-push readiness.
