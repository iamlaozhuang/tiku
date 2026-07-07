# 2026-07-07 Full-role UI/UX batch 2 organization admin workspace task plan

## Task

Converge the documentation-only UI/UX remediation baseline for organization admin workspaces after batch 0 global
foundation and batch 1 operations/super-admin baseline.

## Read Gate

- `AGENTS.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/adr-007-edition-aware-authorization-source-of-truth.md`
- `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`
- `docs/01-requirements/advanced-edition/modules/01-authorization-context.md`
- `docs/01-requirements/advanced-edition/modules/04-organization-training.md`
- `docs/01-requirements/advanced-edition/modules/05-organization-analytics.md`
- `docs/01-requirements/advanced-edition/modules/08-organization-ai-generation.md`
- `docs/01-requirements/traceability/2026-07-02-ui-ux-requirement-design-baseline-gap-analysis.md`
- `docs/01-requirements/traceability/2026-07-07-full-role-uiux-batch-0-global-foundation.md`
- `docs/01-requirements/traceability/2026-07-07-full-role-uiux-batch-1-operations-and-super-admin.md`
- Product Design audit skill instructions and critical overrides.
- Existing repository-external screenshots for `org_standard_admin` and `org_advanced_admin`.
- Current organization workspace source entry points for layout, portal, training, analytics, and AI generation.

## Scope

Roles:

- `org_standard_admin`
- `org_advanced_admin`

Surfaces:

- organization portal;
- organization standard unavailable states;
- organization training management;
- organization analytics;
- organization AI question generation;
- organization AI paper generation;
- shared organization backend navigation and context signals.

## Non-Scope

- No code implementation.
- No new screenshots.
- No DB reads or writes.
- No account, fixture, seed, schema, migration, env, package, lockfile, Provider, staging, production, deployment, Cost
  Calibration, release-readiness, or production-usability work.
- No raw DOM, session, cookie, token, env value, DB URL, raw row, internal id, Provider payload, raw prompt, raw AI output,
  full question, full paper, full material, or employee raw answer recording.

## Approach

1. Reconfirm the active branch and queue item.
2. Read the relevant requirement, architecture, prior baseline, screenshot, and source-entry evidence.
3. Write a page-level organization admin UI/UX baseline.
4. Record redacted evidence and an adversarial review.
5. Run scoped formatting, redaction scan, Module Run v2 hardening, lint, typecheck, and pre-push readiness.
6. Fast-forward merge to `master`, push, and remove the short branch only after validation passes.

## Risk Controls

- Treat UI visibility as a discoverability aid only; authorization remains service-owned through `effectiveEdition`.
- Preserve the first-release boundary that organization admins do not mutate organization tree, employee import, employee
  binding, or `org_auth`.
- Preserve the first-release boundary that organization AI output belongs to the organization draft/training domain and is
  not platform formal content.
- Preserve analytics privacy: no raw employee answer text, no unrelated personal learning, no enterprise AI quota summary
  for organization admins, and no export claim.
- Keep all screenshot observations redacted and avoid copying technical identifier-like values from images or source.

## Validation Plan

- `npm.cmd exec -- prettier --write --ignore-unknown <scoped docs/state files>`
- `npm.cmd exec -- prettier --check --ignore-unknown <scoped docs/state files>`
- Redaction scan over new and changed docs.
- `git diff --check`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId full-role-uiux-batch-2-org-admin-workspace-2026-07-07`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId full-role-uiux-batch-2-org-admin-workspace-2026-07-07 -SkipRemoteAheadCheck`

## Closeout

Closeout is allowed only for this docs-only task under the already-materialized serial UI/UX approval. The branch must be
fast-forward merged to `master`, pushed to `origin/master`, then deleted locally after push success.
