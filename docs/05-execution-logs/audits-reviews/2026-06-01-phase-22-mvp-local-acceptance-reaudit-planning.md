# Phase 22 MVP Local Acceptance Re-Audit Planning Report

## Summary

This report starts Phase 22 without redoing the Phase 18 requirement audit from scratch.

Phase 18 and Phase 19 already established:

- 64 requirement/audit rows reviewed.
- 13 implemented, 48 partial, 3 missing at the Phase 18 baseline.
- 51 finding rows retained.
- 38 canonical finding groups.
- 0 revoked findings.

Phase 20 and Phase 21 then closed the remediation queue and high-risk tail work. Phase 22 should now verify owner-facing local MVP experience, not rediscover the same findings.

## Current Recovery Point

- Git baseline: `master` aligned with `origin/master` at `8027c34c12b78242647368c9959a93737fdb3742` before this branch.
- Latest Phase 21 evidence: `docs/05-execution-logs/evidence/2026-06-01-fresh-local-dev-db-validation-flow-docs.md`.
- Queue before Phase 22 registration: no `pending` or `blocked` tasks.
- Long-lived blocked gates remain in force: real provider/staging, dependency, secret/env, deploy/cloud, and destructive data.

## Re-Audit Strategy

Phase 22 uses evidence reconciliation in this order:

1. Start from `2026-05-27-requirement-traceability-matrix.md`.
2. Map each row to its Phase 18 audit and Phase 19 finding taxonomy.
3. Check Phase 20 fix evidence and Phase 21 closeout evidence for rows that were previously partial or missing.
4. Assign one Phase 22 acceptance status: `runtime_closed`, `local_verified`, `mock_only`, `metadata_only`, `staging_blocked`, `deferred`, or `needs_recheck`.
5. Group rows into local user journeys so owner verification does not require 64 disconnected manual scripts.

## Six Local User Journeys

| Journey                   | Requirement rows                                               | Local acceptance focus                                                                                                                            | Likely non-local blockers                                   |
| ------------------------- | -------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------- |
| Account and authorization | US-01-01 through US-01-14 plus related admin rows              | Login/session, `redeem_code`, effective `authorization`, `organization`, `employee`, `personal_auth`, `org_auth`, disable/enable, transfer/unbind | staging secret/env, staging DB seed, role accounts          |
| Content production        | US-02-01 through US-02-11 plus US-06-08 and US-06-09           | `material`, `question`, `knowledge_node`, `tag`, `paper`, `paper_section`, publish, archive, copy, `paper_asset` metadata                         | real object storage, public URL, imported real paper assets |
| Student answering         | US-03-01 through US-03-08 plus relevant US-04 scoring rows     | student home, `practice`, `mock_exam`, answer save, submit, resume/restart, `exam_report`                                                         | fresh DB seed/bootstrap, full staging data prep             |
| Mistake and learning loop | US-03-09, US-04-04 through US-04-06, US-05-09                  | `mistake_book`, `ai_explanation`, `ai_hint`, `learning_suggestion`, `kn_recommendation`, report knowledge analysis                                | real provider, RAG corpus, provider quota/redaction         |
| Admin operations          | US-06-01 through US-06-13 plus inherited auth/content/RAG rows | `user`, `organization`, `employee`, `org_auth`, `redeem_code`, `resource`, `knowledge_base`, `model_config`, `audit_log`, `ai_call_log`           | staging accounts, cloud resource readiness, real provider   |
| Security and evidence     | Cross-cutting rows                                             | route guards, role denials, public identifiers, audit/AI redaction, evidence hygiene                                                              | staging/prod/cloud/deploy approval gates                    |

## Planned Phase 22 Status Use

- Use `runtime_closed` only when browser/API/service evidence proves the role-to-role loop.
- Use `local_verified` when owner local experience is sufficient but depends on local data or fixtures.
- Use `mock_only` for deterministic AI/mock provider flows.
- Use `metadata_only` for local `paper_asset` or resource flows that do not exercise external object storage or public URLs.
- Use `staging_blocked` for items where local behavior is acceptable but preview release requires cloud, secret/env, migration, seed, deploy, DNS, ICP, or real provider.
- Use `deferred` only for product-approved non-MVP or future-phase behavior.
- Use `needs_recheck` when Phase 20/21 closeout evidence is not enough to claim local acceptance.

## Local Verification Plan

A later approved local verification task should execute the six journeys in this order:

1. Preflight:
   - confirm clean Git;
   - confirm local-only target;
   - record blocked gates;
   - do not read `.env.local`;
   - check whether existing local/dev data is sufficient.
2. Admin preflight:
   - login route and admin shell;
   - content and ops navigation;
   - `audit_log` and `ai_call_log` visibility.
3. Content production:
   - create or identify safe synthetic `material`, `question`, and `paper`;
   - publish one local paper;
   - classify `paper_asset` as metadata-only unless approved object storage exists.
4. Student flow:
   - login as `student`;
   - verify authorization scope;
   - run `practice` or `mock_exam`;
   - check `exam_report` and `mistake_book`.
5. AI/RAG local flow:
   - use mock/local provider only;
   - trigger `ai_explanation`, `ai_hint`, `learning_suggestion`, and `kn_recommendation` where local data supports it;
   - verify `ai_call_log` redaction-safe summaries.
6. Closeout:
   - produce a 64-row acceptance status summary;
   - list local product gaps separately from staging blockers;
   - avoid writing secrets, tokens, raw prompts, raw answers, raw model responses, full papers, or private data.

## Data Readiness Boundary

If local data is missing, the local verification task must stop and classify the blocker:

- `seed/bootstrap required`: existing local mechanisms may be used only after explicit approval.
- `validation data prep required`: generate minimum synthetic data only after explicit approval.
- `migration required`: stop and request a database migration task.
- `fresh DB drift`: follow `docs/04-agent-system/sop/fresh-local-dev-db-validation-playbook.md`.

The verification task must not use raw SQL, destructive reset, migration table repair, `drizzle-kit push`, or `.env.local` inspection to force progress.

## Staging Blocker Separation

The Phase 22 conclusion must keep these out of local product gap counts:

- DNS and ICP status.
- Cloud server and staging database purchase/provisioning.
- Staging `DATABASE_URL`, `BETTER_AUTH_SECRET`, auth callbacks, and object storage credentials.
- Staging migration and rollback rehearsal.
- Staging seed/bootstrap and owner acceptance accounts.
- Deployment, health checks, TLS, monitoring, and rollback.
- Real provider quota, cost controls, redaction, and kill switch.

These are preview release blockers, not proof that local MVP product flows are incomplete.

## Next Task

Recommended next task: `phase-22-mvp-local-acceptance-runtime-verification`.

Before claiming it, get explicit approval for the local-only runtime actions it needs. The task should still keep `.env.local` contents, migrations, raw SQL, destructive data, staging/prod/cloud/deploy, real providers, and dependency changes blocked.

## Readiness Verdict

`APPROVE_PLANNING_ONLY`.

Phase 22 planning may close after validation. Local runtime verification should proceed only as a separate task with explicit approval and bounded evidence rules.
