# Phase 26 MVP Readiness Baseline

## Summary

- Date: 2026-06-01.
- Branch: `codex/phase-26-mvp-health-audit`.
- Scope: docs-only/read-only MVP completeness and health audit.
- Product-code changes: none.
- Baseline verdict: local/dev MVP is substantially runnable and validated; staging planning and owner acceptance prep are the next appropriate moves, but staging/prod/provider/deploy remain blocked until explicit approval packages exist.

## Evidence Basis

- Phase 18 requirement audit: `64` items, initially `13 implemented`, `48 partial`, `3 missing`.
- Phase 20 requirement gap closeout: `50` gap tasks closed, accepted deferred blockers carried forward instead of falsely closing them.
- Phase 21 high-risk tail closure: AI scoring retry persistence and admin permission/concurrency tail handled through approved follow-up work.
- Phase 22 local runtime acceptance: auth, admin, student, and mock AI flows passed, with one non-blocking e2e order/data-state observation that passed on rerun.
- Phase 23 fresh DB bootstrap/validation: fresh local/dev first-run path passed after seed, validation data prep, full e2e, and build.
- Phase 24/25 fresh validation runner: repeatability and diagnostics hardened; Phase 25 full runner passed on `tiku_fresh_phase25_20260601_001`.

## Scope Inventory

| Scope                        | Current classification                | Notes                                                                                                        |
| ---------------------------- | ------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| Roadmap Phase 0-11           | closed/planned                        | Architecture, foundation, MVP, local RC, and staging planning docs exist.                                    |
| Phase 20 gap fixes           | closed with accepted deferred history | Closed work should be treated as implemented only where later evidence exists.                               |
| Phase 21 high-risk tail      | closed                                | Follow-up work converted two Phase 20 deferred blockers into approved implementation/documentation outcomes. |
| Phase 22 local acceptance    | verified                              | Local/dev and mock-safe acceptance evidence exists.                                                          |
| Phase 23 fresh DB first run  | verified                              | Migration, seed, validation data prep, e2e, and build evidence exists.                                       |
| Phase 24/25 runner hardening | verified                              | Repeatable fresh validation runner exists and passed.                                                        |
| Staging/prod/cloud/deploy    | blocked/deferred                      | ADR and planning exist; implementation is not approved.                                                      |
| Real provider quality        | mock-only/deferred                    | Mock-first local confidence exists; real provider needs separate approval and redaction gates.               |

## Runtime Capability Matrix

| Capability    | Status                | Evidence basis                                                               | Readiness implication                                                        |
| ------------- | --------------------- | ---------------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| 学员端        | verified              | Student routes/UI and Phase 22 student smoke.                                | Good for owner prep with scripted data.                                      |
| 后台端        | verified              | Admin routes/UI and Phase 22 admin smoke.                                    | Needs role-based owner walkthrough.                                          |
| 用户/会话     | verified              | Auth/session tests and e2e.                                                  | Staging callback/secret configuration remains gated.                         |
| 授权          | verified              | Authorization, org_auth, redeem, student paper routes and Phase 20/21 fixes. | Good local baseline; external purchase/contact and staging data need review. |
| 组织/员工     | implemented           | Organization/employee/org_auth runtime and UI files.                         | Needs owner acceptance on real hierarchy scenarios.                          |
| 题库          | implemented           | Question services/routes/UI/tests.                                           | Teacher workflow quality should be reviewed before staging.                  |
| 材料          | implemented           | Material services/routes/UI.                                                 | File conversion/storage remains bounded by local/mock evidence.              |
| 试卷          | verified              | Paper lifecycle routes/services/evidence.                                    | Strong local baseline.                                                       |
| 练习          | verified              | Practice services/UI/e2e.                                                    | Offline/retry remains limited.                                               |
| 模考          | verified              | Mock exam services/UI/e2e.                                                   | Long-running scoring and timeout should be owner-tested.                     |
| 报告          | implemented           | Exam report services/UI/routes.                                              | Analytics and learning suggestion quality need review.                       |
| 错题本        | verified              | Mistake book UI/routes and fresh-data e2e hardening.                         | Data-prep dependent but currently healthy.                                   |
| AI 评分       | mock-only verified    | Mock provider, `ai_call_log`, retry persistence, unit/e2e evidence.          | Do not claim real model quality yet.                                         |
| AI 讲解/提示  | mock-only implemented | Explanation/hint services/tests.                                             | Needs real-provider/redaction approval for quality proof.                    |
| RAG/知识库    | mock-only implemented | Resource/knowledge/chunk/retrieval/mock embedding evidence.                  | Real-content scale and rerank remain future work.                            |
| 审计          | verified              | Audit log route/UI and admin navigation evidence.                            | Staging retention/monitoring still gated.                                    |
| Fresh DB 验证 | verified              | Phase 23-25 evidence.                                                        | Strong local reproducibility baseline.                                       |

## Validation Health

| Layer                    | Current confidence | Notes                                                                                          |
| ------------------------ | ------------------ | ---------------------------------------------------------------------------------------------- |
| Unit                     | high               | Phase 25 recorded `154` files and `634` tests passing.                                         |
| E2E                      | medium-high        | Phase 25 recorded `27` passing; still local/dev synthetic-data based.                          |
| Build                    | high               | Phase 25 production build passed.                                                              |
| Quality gate             | high               | Phase 25 `Invoke-QualityGate.ps1` passed after formatting repair.                              |
| Fresh DB runner          | high for local/dev | Phase 25 full runner passed through preflight, migrate, seed, validation prep, e2e, and build. |
| Real provider validation | low                | Blocked by real-provider/staging redaction gate.                                               |
| Staging validation       | low                | No staging resources or deployment approved.                                                   |

## Blocked Gates

| Gate                              | Must unlock before staging implementation?                  | Phase 26 stance                                                                            |
| --------------------------------- | ----------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| `secret-env-change`               | yes                                                         | Keep blocked until explicit staging secret/env plan is approved.                           |
| `deploy-and-cloud-change`         | yes                                                         | Keep blocked until resource inventory, deploy plan, monitoring, and rollback are approved. |
| `real-provider-staging-redaction` | optional for staging, required for real-provider acceptance | Keep blocked until redaction/quota/kill-switch evidence exists.                            |
| `dependency-change`               | only if staging task needs a package change                 | Keep blocked by default.                                                                   |
| `destructive-data-operation`      | no for current path                                         | Keep blocked; prefer non-destructive migration/seed paths.                                 |

## Readiness Scorecard

| Dimension                      | Score | Baseline                                                       |
| ------------------------------ | ----- | -------------------------------------------------------------- |
| Local MVP runtime completeness | 8/10  | Runnable and recently validated.                               |
| Fresh validation repeatability | 9/10  | Strong local/dev repeatability after Phase 25.                 |
| Test and quality health        | 8/10  | Broad gates green, with local/synthetic caveats.               |
| Staging readiness              | 5/10  | Planning exists; implementation approvals missing.             |
| Owner acceptance readiness     | 6/10  | Needs role scripts, acceptance data, and human review package. |
| Production readiness           | 3/10  | Explicitly not ready; staging and production gates remain.     |

## P0 Risks

- Staging implementation is blocked by secret/env, cloud/deploy, resource inventory, migration/rollback, and owner acceptance approval requirements.
- Mock-provider-first AI/RAG evidence cannot be treated as real provider acceptance.
- Owner acceptance needs a controlled role-by-role script and acceptance data package; automated tests alone are insufficient.

## P1 Risks

- Some UI and browser confidence is synthetic-data or fixture dependent.
- AI explanation/hint and RAG citation quality need real-content/provider validation after approval.
- Admin role and permission acceptance should be reviewed with real owner expectations.

## P2 Risks

- Evidence density is high; future owner-facing artifacts should be shorter and scenario-based.
- Long-lived gate status should be summarized in one current decision table during staging planning.

## Recommended Next Batches

1. `phase-27-owner-acceptance-prep`: role scripts, acceptance data checklist, evidence index, and owner review packet.
2. `phase-28-staging-implementation-approval-package`: secret/env, cloud/deploy, database, migration/rollback, monitoring, owner account, and redaction approvals.
3. `phase-29-staging-dry-run-after-approval`: staging implementation only after approval.
4. `phase-30-real-provider-redaction-and-quality-after-approval`: bounded real-provider smoke and redaction validation.
5. `phase-31-mvp-gap-reaudit-after-owner-prep`: convert accepted owner findings into product-code tasks.

## Non-Claims

- No production readiness claim.
- No staging deployment claim.
- No real provider quality claim.
- No customer-network acceptance claim.
- No secret/env, DB, cloud, deploy, schema, migration, dependency, source, script, test, or e2e change was performed by Phase 26.
