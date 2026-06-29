# Repair Content Admin Formal Content Workflow Actions Traceability

- Task id: `repair-content-admin-formal-content-workflow-actions-2026-06-29`
- Branch: `codex/repair-content-admin-formal-content-workflow-20260629`
- Status: closed
- Date: `2026-06-29`
- Scope: Stage C local source/test repair for the blocked `content_admin` formal content lifecycle and AI draft
  review/adoption boundary rows.
- Durable goal: scoped repair only. This is not final Pass, release readiness, Cost Calibration, Provider approval,
  staging/prod/deploy, PR, force-push, or production readiness.

## Source Of Truth Read List

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/adr-001-tech-stack-selection.md`
- `docs/02-architecture/adr/adr-002-runtime-architecture-and-multi-client-contract.md`
- `docs/02-architecture/adr/adr-003-workplace-desktop-web-compatibility.md`
- `docs/02-architecture/adr/adr-004-environment-isolation-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-005-staging-architecture-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-006-runtime-dependency-alignment.md`
- `docs/02-architecture/adr/adr-007-edition-aware-authorization-source-of-truth.md`
- `docs/01-requirements/traceability/2026-06-28-owner-facing-role-gap-capture-scope.md`
- `docs/05-execution-logs/evidence/2026-06-29-full-acceptance-content-admin-formal-content-workflow.md`
- `docs/05-execution-logs/audits-reviews/2026-06-29-full-acceptance-content-admin-formal-content-workflow.md`

## Requirement Mapping

| Row                                                      | Required behavior                                                                                                                                                                                                     | Prior evidence                                                                                                             | Repair target                                                                                                                                                                                                               |
| -------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `content_admin.formal_content_lifecycle_mutation_review` | Content admin can safely manage formal `question`, `material`, `paper`, `paper_section`, `knowledge_node`, and lifecycle states without entering ops/provider/deploy surfaces.                                        | Routes and create forms were visible, but safe test-owned create/update/delete/cleanup or lifecycle target was not proven. | Passed for scoped local rerun: question and material create plus visible stop/cleanup completed; paper lifecycle controls verified non-mutating in browser and publish/archive/copy behavior covered by focused unit tests. |
| `content_admin.ai_draft_review_adoption_boundary`        | Content AI output enters content AI draft/review domain first; review distinguishes pending/adopted/rejected/needs revision; formal adoption requires human review and must not call Provider or leak raw AI content. | AI draft review controls were visible but disabled with follow-up-task markers.                                            | Passed for scoped local rerun: content AI question draft adoption and content AI paper draft rejection completed through the existing formal-adoption boundary, with Provider still blocked and no raw AI content evidence. |

## Allowed Files

- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/01-requirements/traceability/2026-06-29-repair-content-admin-formal-content-workflow-actions.md`
- `docs/05-execution-logs/task-plans/2026-06-29-repair-content-admin-formal-content-workflow-actions.md`
- `docs/05-execution-logs/evidence/2026-06-29-repair-content-admin-formal-content-workflow-actions.md`
- `docs/05-execution-logs/audits-reviews/2026-06-29-repair-content-admin-formal-content-workflow-actions.md`
- `docs/05-execution-logs/acceptance/2026-06-29-repair-content-admin-formal-content-workflow-actions.md`
- `src/app/content/**`
- `src/features/admin/**`
- `src/components/**`
- `src/hooks/**`
- `src/lib/**`
- `src/server/**`
- `tests/unit/**`

## Blocked Files And Actions

- `.env*`, package/lockfiles, `src/db/schema/**`, `drizzle/**`, `migrations/**`, `seed/**`, `scripts/**`, `e2e/**`,
  `playwright-report/**`, `test-results/**`, `.next/**`
- Direct DB connection/read/write, migration, seed, schema changes, raw row evidence, destructive DB operations
- Provider call/configuration/credential read, prompt payload, raw AI input/output, Cost Calibration Gate
- Credentials, cookies, tokens, sessions, localStorage, Authorization headers, env contents, connection strings
- Raw DOM, screenshots, traces, raw DB rows, internal ids, PII, email, phone, plaintext `redeem_code`
- Complete `question`, `paper`, `material`, `resource`, or `chunk` content in evidence
- Staging/prod/cloud/deploy, PR, force-push, release readiness, final Pass

## Acceptance Closure Rule

This scoped repair is closed as passed for the two `content_admin` rows above. The durable all-role goal remains
incomplete until every applicable checklist row is covered, and this closure is not final Pass or release readiness.
