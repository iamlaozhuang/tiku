# Visible Chinese UI Technical Label Runtime Cleanup Residual Repair Plan

Task id: `visible-chinese-ui-technical-label-runtime-cleanup-residual-repair-2026-06-25`

Branch: `codex/visible-label-runtime-repair-20260625`

## Fresh Approval

The active goal approves continuing with the smallest necessary local source repair toward strict full eight-row
role-separated browser acceptance. This task is limited to runtime-visible Chinese UI technical-label residual cleanup
after the full eight-row rerun and the learner/employee AI paper action repair.

## SSOT Read List

- `AGENTS.md`.
- `docs/03-standards/code-taste-ten-commandments.md`.
- `docs/02-architecture/adr/`.
- `docs/04-agent-system/operating-manual.md`.
- `docs/04-agent-system/sop/requirement-ssot-reading-governance.md`.
- `docs/04-agent-system/sop/task-lifecycle-governance.md`.
- `docs/04-agent-system/state/project-state.yaml`.
- `docs/04-agent-system/state/task-queue.yaml`.
- `docs/05-execution-logs/acceptance/2026-06-24-visible-chinese-ui-technical-label-cleanup-planning.md`.
- `docs/05-execution-logs/evidence/2026-06-24-visible-chinese-ui-technical-label-cleanup.md`.
- `docs/05-execution-logs/evidence/2026-06-25-role-separated-full-8-row-post-org-training-visible-list-repair-browser-rerun.md`.
- `docs/05-execution-logs/audits-reviews/2026-06-25-role-separated-full-8-row-post-org-training-visible-list-repair-browser-rerun.md`.
- `docs/05-execution-logs/evidence/2026-06-25-learner-employee-ai-paper-action-enabled-state-repair.md`.

## Runtime Residuals

- `content_admin` strict row still observed visible technical label `publicId` on `/content/papers`.
- `ops_admin` strict row still observed visible technical labels including `org_auth` and raw role names on `/ops/users`.
- The learner/employee AI paper action blocker has since been repaired in the previous task; this task does not reopen
  that surface.

## Allowed Files

- `src/features/admin/paper-management/AdminPaperManagementClient.tsx`.
- `src/features/admin/admin-ops-management/AdminOpsManagement.tsx`.
- `tests/unit/admin-paper-ui.test.ts`.
- `tests/unit/phase-9-admin-ops-runtime-ui-completion.test.ts`.
- `docs/04-agent-system/state/project-state.yaml`.
- `docs/04-agent-system/state/task-queue.yaml`.
- `docs/05-execution-logs/task-plans/2026-06-25-visible-chinese-ui-technical-label-runtime-cleanup-residual-repair.md`.
- `docs/05-execution-logs/evidence/2026-06-25-visible-chinese-ui-technical-label-runtime-cleanup-residual-repair.md`.
- `docs/05-execution-logs/audits-reviews/2026-06-25-visible-chinese-ui-technical-label-runtime-cleanup-residual-repair.md`.

## Blocked Files And Capabilities

- `.env*`.
- `package.json`, package lockfiles, and dependency changes.
- `src/db/schema/**`, `drizzle/**`, seed files, schema/migration files, DB write paths, and account mutation paths.
- Provider/model calls, Provider configuration, Cost Calibration, staging/prod/cloud/deploy, payment, external services,
  PRs, force-push, and final acceptance Pass.

## Implementation Plan

1. Add RED focused assertions proving the visible text for the content paper compose/attachment UI and the ops runtime
   dashboard still exposes `publicId`, `metadata`, raw role names, raw authorization type, raw audit status, and raw AI
   function/status labels.
2. Replace visible content paper copy with Chinese operator-facing labels such as `业务标识` and `元数据`.
3. Add local display mappings in the ops dashboard for admin roles, organization tiers, authorization types, audit
   result/resource labels, AI function types, and AI call statuses. Preserve raw identifiers in data attributes, API
   fields, request paths, and `data-testid` values.
4. Run focused unit tests, a focused local browser rerun for `content_admin` `/content/papers` and `ops_admin`
   `/ops/users`, lint, typecheck, formatting, diff check, and Module Run v2 gates.

## Risk Controls

- This task changes display labels only. It must not weaken authorization checks, route guards, or data redaction.
- Business identifiers may remain visible when needed, but their UI labels must be Chinese and must not expose internal
  auto-increment ids.
- Browser evidence may record only role labels, paths, technical-label token presence/absence counts, and route status.
  No credentials, tokens, raw DOM, screenshots, raw account identifiers, or raw DB rows may be recorded.

No Standard/Advanced MVP final Pass will be claimed.
