# Phase 9 MVP Acceptance Contract

## Status

Planning anchor for Phase 9.

## Purpose

Phase 9 is the MVP acceptance completion phase. Its goal is to make the current approved MVP requirements runnable across the in-scope clients and operational surfaces, then prove that result with browser and API verification.

This phase does not mean product expansion beyond `docs/01-requirements`. It closes the remaining gaps between the requirements, the Phase 8 product surfaces, and a locally runnable MVP that can be exercised end to end.

## Inputs

- `docs/01-requirements/00-index.md`
- `docs/01-requirements/modules/01-user-auth.md`
- `docs/01-requirements/modules/02-question-paper.md`
- `docs/01-requirements/modules/03-student-experience.md`
- `docs/01-requirements/modules/04-ai-scoring.md`
- `docs/01-requirements/modules/05-rag-knowledge.md`
- `docs/01-requirements/modules/06-admin-ops.md`
- `docs/01-requirements/stories/epic-01-user-auth.md`
- `docs/01-requirements/stories/epic-02-question-paper.md`
- `docs/01-requirements/stories/epic-03-student-experience.md`
- `docs/01-requirements/stories/epic-04-ai-scoring.md`
- `docs/01-requirements/stories/epic-05-rag-knowledge.md`
- `docs/01-requirements/stories/epic-06-admin-ops.md`
- `docs/02-architecture/interfaces/runtime-slice-contract.md`
- `docs/02-architecture/interfaces/phase-8-product-surface-contract.md`
- `docs/05-execution-logs/evidence/2026-05-22-phase-8-product-surface-browser-verification.md`

## In-Scope Clients And Surfaces

- Student mobile-first Web surfaces.
- Admin PC Web surfaces for operations and content management.
- REST API contracts required by ADR-002 for future multi-client delivery.
- Local browser and API verification for the above surfaces.

Future WeChat mini program implementation is not in scope for Phase 9 unless a later human-approved task explicitly changes the queue. Phase 9 must keep REST DTO and route contracts compatible with that future client boundary.

## Acceptance Scope

Phase 9 must cover the current MVP stories, with P0 requirements treated as required acceptance blockers and P1/P2 requirements either implemented or explicitly recorded in closeout with a product-approved deferral.

Required coverage groups:

1. User registration, login, session invalidation, account lock, account disablement, password reset, employee creation/import boundary, personal authorization, organization authorization, and authorization expiry behavior.
2. Question, material, paper draft, paper composition, publishing validation, archiving, copying, paper assets, and content admin UI.
3. Student home, practice, mock exam, answer saving, termination, scoring status, exam report, learning suggestion, and mistake book.
4. Mock-provider-first AI scoring, AI explanation, AI hint, knowledge recommendation, model config boundary, prompt version tracking, and `ai_call_log` redaction.
5. RAG retrieval, `evidence_status`, authorization filtering, resource lifecycle, chunking, knowledge node management, and citation display without fabricated references.
6. Admin operations for users, organizations, employees, org auth, redeem codes, resources, model configs, audit logs, AI call logs, roles, and read-only log guarantees.
7. Final browser and API acceptance verification that proves student and admin flows without exposing secrets or internal auto-increment IDs.

## Current Gap Signals

The planning task observed the following high-level signals after Phase 8:

- Phase 8 completed visible student profile, redeem, mistake book, and admin org/auth/redeem surfaces.
- Several API route handlers still intentionally use `createUnavailable...` service boundaries for question, material, paper draft, paper asset, resource, knowledge node, model config mutation, user reset password, and selected student workflow surfaces.
- Existing E2E coverage is still a product-surface verification baseline, not a full MVP acceptance suite.
- Full resource conversion and vector indexing may require dependency or environment decisions; those changes must pass the dependency introduction gate before implementation.

## Non-Goals

- Do not deploy, create production resources, or change production data.
- Do not connect real SMS, email, payment, AI provider, object storage, or production credentials.
- Do not introduce dependencies without the dependency introduction gate and explicit human approval.
- Do not implement a WeChat mini program client in Phase 9 without a separate human-approved queue update.
- Do not expose auto-increment IDs in external URLs or DTOs.
- Do not expose session tokens, passwords, secrets, API keys, `code_hash`, raw prompts, raw answers, or raw model responses in UI, logs, or evidence.
- Do not weaken auth/session runtime or return fixture-only success for protected runtime paths.

## Task Ordering

1. `phase-9-requirements-runtime-gap-inventory`
2. `phase-9-auth-session-account-completion`
3. `phase-9-authorization-expiry-termination-completion`
4. `phase-9-content-question-material-runtime`
5. `phase-9-paper-composition-lifecycle-runtime`
6. `phase-9-content-admin-ui-completion`
7. `phase-9-student-practice-runtime-completion`
8. `phase-9-student-mock-exam-report-runtime-completion`
9. `phase-9-student-experience-ui-completion`
10. `phase-9-ai-scoring-explanation-hint-runtime`
11. `phase-9-ai-knowledge-model-config-runtime`
12. `phase-9-rag-resource-knowledge-runtime`
13. `phase-9-resource-knowledge-admin-ui-completion`
14. `phase-9-admin-ops-runtime-ui-completion`
15. `phase-9-multi-client-rest-contract-verification`
16. `phase-9-mvp-acceptance-browser-api-verification`
17. `phase-9-closeout-release-readiness`

`phase-9-planning-and-queue-seeding` seeds this contract and the queue before any of the above implementation tasks are claimed.

## Security And Privacy Boundaries

- Auth, session, authorization, employee, account disablement, password reset, model config, AI/RAG, audit log, and secret-handling tasks require security review when they modify runtime behavior.
- Admin mutation tasks must write `audit_log` or record why a path is read-only.
- AI tasks must use mock or local deterministic providers unless a future approved task changes the provider boundary.
- RAG and resource tasks must not create public file URLs and must not log long-lived signed URLs.
- E2E and evidence must check that sensitive fields are absent from visible UI and network responses.

## Validation Expectations

Each implementation task must include:

- Task plan before code changes unless the queue explicitly sets `taskPlanPolicy: evidence_only`.
- Evidence under `docs/05-execution-logs/evidence/`.
- Unit tests for service, mapper, validator, or route behavior when runtime changes.
- Browser or Playwright verification for UI changes.
- `Test-TaskClaimReadiness.ps1` for the claimed task.
- `Invoke-QualityGate.ps1`.
- `npm.cmd run build` when runtime or UI changes are included.
- `npm.cmd run test:e2e` when browser coverage changes or end-to-end flow correctness is required.
- `Test-NamingConventions.ps1`.
- `Test-GitCompletionReadiness.ps1 -BaseBranch master`.

Final Phase 9 verification must include `docker compose ps`, browser console/network review, screenshot or trace artifact status, tab cleanup or fallback rationale, and explicit residual-risk notes.
