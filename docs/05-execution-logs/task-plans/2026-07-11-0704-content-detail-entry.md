# 0704 Content Detail Entry Implementation Plan

## Task Metadata

- taskId: `0704-content-detail-entry-2026-07-11`
- branch: `codex/0704-content-detail-entry`
- base: `59812c3f18f4fb989ae4bd3b7d250addbc5b5ec0`
- goal: provide stable read-only detail access for papers, questions, and materials without changing content write, permission, lock, snapshot, or lifecycle semantics.

## Required Reading

- `AGENTS.md`, current project state and task queue, code taste commandments, and every ADR
- requirement indexes, question/paper module and stories, admin/content stories, full-role UI/UX source entry, and content-admin closure baseline
- task 1 plan/evidence/audit, approved paper/question/material screenshots, existing list clients, detail GET routes/contracts/services, rich-text renderer, and focused tests
- Product Design audit guidance and Superpowers brainstorming, planning, and TDD guidance

## Frozen Business Semantics

- Existing paper, question, material, and paper-asset GET authorization remains authoritative.
- Existing create, edit, copy, disable, compose, publish, archive, attachment, lock, snapshot, scoring, and confirmation behavior remains unchanged.
- Published or locked content is always viewable to an authorized content administrator but never becomes editable through the detail surfaces.
- Provider stays disabled. No Provider, direct database, staging, production, deployment, env/secret, Cost Calibration, or fresh screenshot/raw DOM action is allowed.

## Scope

1. Add RED tests for a stable paper detail route and question/material read-only drawers, including GET-only behavior, lock boundaries, refresh-restored drawer state, and error states.
2. Add `/content/papers/[publicId]` as a dedicated read-only paper detail route using the existing paper detail and paper-asset list GET contracts.
3. Add a shared accessible admin detail drawer with overlay close, Escape close, initial focus, focus restoration, stable width, and scroll containment.
4. Add question and material detail drawers that fetch the existing detail GET endpoint on demand and render safe rich text, readable metadata, lock/status explanations, scoring/binding summaries, and available reference summaries.
5. Add a visible `查看试卷`, `查看题目`, and `查看材料` entry to each row. Keep edit and high-risk actions separate and unchanged.
6. Persist the active question/material detail target in URL query and restore it after refresh without polluting the server list query.
7. Distinguish loading, ready, empty-content, not-found, forbidden, unauthorized, and generic error states.

## Allowed Files

- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/2026-07-11-0704-content-detail-entry.md`
- `docs/05-execution-logs/evidence/2026-07-11-0704-content-detail-entry-evidence.md`
- `docs/05-execution-logs/audits-reviews/2026-07-11-0704-content-detail-entry-audit.md`
- `src/app/(admin)/content/papers/[publicId]/page.tsx`
- `src/components/admin/AdminDetailDrawer/index.tsx`
- `src/features/admin/paper-management/AdminPaperDetailPage.tsx`
- `src/features/admin/paper-management/AdminPaperManagementClient.tsx`
- `src/features/admin/question-material-management/AdminContentDetailDrawer.tsx`
- `src/features/admin/question-material-management/AdminQuestionMaterialManagementClient.tsx`
- `src/features/admin/content-detail/AdminContentDetail.test.tsx`
- `tests/unit/admin-paper-ui.test.ts`
- `tests/unit/admin-question-material-ui.test.ts`

## Explicit Exclusions

- no API contract, service, repository, validator, schema, migration, seed, dependency, package/lockfile, object storage, download capability, write endpoint, permission, lock, snapshot, lifecycle, publish validation, or confirmation change
- no paper composer, resource, knowledge-node, AI generation, Provider, env/secret, direct database, staging, production, deployment, PR, force push, new screenshot, or raw DOM capture
- no attempt to resolve unavailable human-readable names by N+1 requests or to expose hidden identifiers as a substitute

## TDD And Verification

1. RED component tests for visible detail entries, dedicated paper route, GET-only drawers/page, URL restore, safe rich text, locked read-only access, and detail state handling. JSX tests live under the repository's existing `src/**/*.test.tsx` Vitest collection boundary.
2. GREEN with the smallest shared drawer and read-only detail components.
3. Adversarial review of role, lock, snapshot, sensitive display, no-write behavior, URL state, safe rich text, focus, and error-state boundaries.
4. Run focused tests, lint, typecheck, full format check, `git diff --check`, and Module Run v2 pre-commit/pre-push gates.
5. Write redacted evidence/audit, commit, fast-forward merge, rerun on master, push, delete the short branch, and confirm clean/aligned.

## Acceptance

- every paper row has a stable `查看试卷` route; draft, published, and archived details render read-only metadata, structure, snapshots, scores, attachment summary, and publish-state explanation
- every question/material row has an always-enabled view action; locked content remains viewable while edit remains disabled
- question detail shows stem, options, answer, analysis, scoring points, knowledge/tag/material counts, status, and lock reason using safe rich-text rendering
- material detail shows complete material content and readable available question/paper reference summaries without exposing internal numeric IDs
- detail opening performs GET requests only and cannot trigger POST, PATCH, DELETE, publish, archive, disable, copy, or Provider behavior
- drawer query state survives refresh and closing removes only the detail query while preserving list filters
- loading, not found, forbidden, unauthorized, generic error, and empty content states are distinct and accessible
