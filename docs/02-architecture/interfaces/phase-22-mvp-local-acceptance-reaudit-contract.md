# Phase 22 MVP Local Acceptance Re-Audit Contract

## Status

Planning boundary for local MVP acceptance re-audit.

## Purpose

Phase 22 reuses the existing 64-item requirement audit matrix to answer two narrower questions:

1. Can the MVP be fully experienced in local `dev` with approved local/mock boundaries?
2. Which remaining blockers belong to local product behavior versus staging release infrastructure?

This phase is not a from-scratch requirements audit. Phase 18 and Phase 19 already established the baseline matrix and finding taxonomy. Phase 22 must reconcile that baseline with Phase 20 and Phase 21 closeout evidence.

## Source Of Truth Inputs

- `docs/05-execution-logs/audits-reviews/2026-05-27-requirement-traceability-matrix.md`
- `docs/05-execution-logs/audits-reviews/2026-05-27-phase-18-total-requirement-audit-report.md`
- `docs/05-execution-logs/audits-reviews/2026-05-27-phase-19-coverage-matrix-review.md`
- `docs/05-execution-logs/audits-reviews/2026-05-27-phase-19-follow-up-queue-alignment.md`
- Phase 20 fix evidence under `docs/05-execution-logs/evidence/phase-20-fix-*.md`
- Phase 21 closeout evidence under `docs/05-execution-logs/evidence/2026-06-01-*.md`
- `docs/04-agent-system/sop/local-human-verification.md`
- `docs/04-agent-system/sop/fresh-local-dev-db-validation-playbook.md`

## Status Vocabulary

Phase 22 uses a product acceptance vocabulary instead of the Phase 18 implementation vocabulary:

- `runtime_closed`: browser/API/service evidence proves the role-to-role business loop.
- `local_verified`: local evidence is enough for owner experience, but the result depends on local/dev fixtures or existing local data.
- `mock_only`: behavior relies on deterministic mock/local AI or fake provider behavior.
- `metadata_only`: local flow validates metadata but not external object storage, binary upload, OCR, public URL, or cloud callbacks.
- `staging_blocked`: local behavior is acceptable, but preview release needs staging/cloud/secret/env/migration/deploy/provider work.
- `deferred`: product-approved non-MVP or future-phase behavior.
- `needs_recheck`: existing evidence is insufficient after Phase 20/21 closeout and requires a later local verification task.

## Planned User Journeys

Phase 22 local verification should compress the 64 audit rows into these six journeys:

1. Account and authorization: registration, login, session, `redeem_code`, `authorization`, `personal_auth`, `org_auth`, `organization`, and employee access.
2. Content production: `material`, `question`, `knowledge_node`, `tag`, `paper`, `paper_section`, `paper_asset` metadata, publish, archive, and copy.
3. Student answering: home, `practice`, `mock_exam`, answer save, submit, resume/restart, timeout/termination, and `exam_report`.
4. Mistake and learning loop: `mistake_book`, `ai_explanation`, `ai_hint`, `learning_suggestion`, `kn_recommendation`, and report knowledge analysis.
5. Admin operations: `user`, `organization`, `employee`, `org_auth`, `redeem_code`, `resource`, `knowledge_base`, `model_config`, `audit_log`, and `ai_call_log`.
6. Security and evidence: route guards, role denials, public identifier safety, audit redaction, AI redaction, no secret leakage, and staging/prod untouched.

## Non-Goals

- No `.env.local` or `.env.example` read/write.
- No staging/prod/cloud/deploy.
- No migration, seed/bootstrap, raw SQL, `drizzle-kit push`, destructive data operation, or migration table repair.
- No real provider or external service call.
- No dependency, package, lockfile, source, test, e2e, schema, drizzle, or script change during the planning task.
- No claim of production readiness, customer-network acceptance, or staging release completion.

## Required Follow-Up Approval

A later local verification task must receive explicit approval before it may:

- start a local dev server;
- use Browser or Playwright against localhost;
- run `npm.cmd run test:e2e`;
- connect to the local/dev DB indirectly through the application;
- perform seed/bootstrap or validation data prep;
- record screenshots or browser observations.

If that later task needs `.env.local` inspection, migration, raw SQL, seed reset, schema/source/test/e2e/script/dependency changes, staging/prod/cloud/deploy, real provider, or destructive data, it must stop and request a separate approval.

## Closeout Rule

Phase 22 planning is complete when:

- this contract exists;
- `mvp-roadmap.md` includes Phase 22;
- `task-queue.yaml` registers the planning task and a separately approved future local verification task;
- `project-state.yaml` points to the current Phase 22 task;
- task plan and evidence exist;
- the re-audit planning report maps the 64-item source matrix into the six local user journeys and blocker categories.
