# Content Admin Platform F0 Acceptance Readiness Plan

Date: 2026-07-14

Task: `content-admin-platform-f0-acceptance-readiness-2026-07-13`

Branch: `codex/content-admin-platform-f0-acceptance-readiness`

Profile: R3 / `independent_audit`

Baseline: `master == origin/master == 1e6a0f8d3fbf81858557ae3fc054d2f690db26a4`

## Goal

Prepare one current, redacted localhost acceptance surface for F1-F4: bind the service to the canonical 0704DB target by
process-only override, keep Provider execution closed, prove all nine core role credentials and authorization contexts
are ready, inventory only the controlled data categories required by each role task, and materialize an exact F1-F4
acceptance matrix. This task is readiness only: it does not execute representative business mutations, change accounts
or fixtures, call a Provider, or claim F acceptance. The only persistence side effect allowed is the product's normal
temporary login/logout session lifecycle required to authenticate the read-only probes.

## Required Reading

- `AGENTS.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/01-requirements/00-index.md`
- `docs/01-requirements/advanced-edition/00-index.md`
- `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`
- `docs/02-architecture/adr/adr-007-edition-aware-authorization-source-of-truth.md`
- `docs/01-requirements/traceability/2026-07-02-ai-generation-requirements-ssot-alignment.md`
- `docs/01-requirements/traceability/2026-07-02-phase4-requirements-agent-baseline-alignment.md`
- `docs/05-execution-logs/evidence/2026-07-02-ai-generation-goal-completion-audit.md`
- `docs/05-execution-logs/task-plans/2026-07-13-content-admin-platform-b-to-f-serial-program.md`
- `docs/05-execution-logs/acceptance/2026-07-13-content-admin-platform-b-to-f-standing-authorization.md`
- `docs/05-execution-logs/acceptance/2026-07-13-content-admin-platform-pic-coverage-and-exception-ledger.md`
- `docs/05-execution-logs/evidence/2026-07-14-content-admin-platform-e6-cumulative-audit.md`
- `docs/05-execution-logs/audits-reviews/2026-07-14-content-admin-platform-e6-cumulative-audit-audit.md`
- `docs/05-execution-logs/handoffs/2026-07-10-0704-private-account-usage-guide.md`
- `docs/05-execution-logs/evidence/2026-07-10-0704-role-credential-catalog-consolidation-evidence.md`
- `docs/05-execution-logs/evidence/2026-07-12-user-led-b9-cumulative-acceptance-closeout.md`
- `docs/05-execution-logs/audits-reviews/2026-07-12-user-led-b9-cumulative-acceptance-closeout-audit.md`
- Canonical private index and its referenced catalog under `D:/tiku-local-private/acceptance/`, read in process memory
  only under the current user's explicit 0704DB credential authorization.
- Current session/auth/AI-availability route handlers, role guards, F1-F4 target pages and their representative tests.

The source hierarchy and chronology resolve earlier fixture gaps: the 2026-07-07 supplement and 2026-07-10 canonical
catalog supersede the earlier partial seven-role preparation. A01-A30 and current AI classes remain closed absent fresh
current-baseline failure evidence.

## Readiness Matrix

| Owner | Roles                                             | Read-only preparation categories                                                                         | Later acceptance owner                                  |
| ----- | ------------------------------------------------- | -------------------------------------------------------------------------------------------------------- | ------------------------------------------------------- |
| F1    | `content_admin`                                   | question/material/paper/resource/knowledge and Provider-closed AI draft/review entry readiness           | representative content workflows                        |
| F2    | `ops_admin`, `super_admin`                        | user/organization/auth/`redeem_code`/audit route and eligible-role boundary readiness                    | representative operations and cross-workspace workflows |
| F3    | organization standard/advanced admin and employee | organization scope, edition, training visibility/analytics and Provider-closed organization AI readiness | representative organization workflows                   |
| F4    | personal standard/advanced student                | practice/mock/report/profile and Provider-closed personal AI readiness                                   | representative learner workflows                        |

The historical `paperAssembly` sample is a separately reported conditional input. F0 may perform only a redacted
readiness determination. X1 remains untriggered unless F0 or F4 proves that representative acceptance requires a valid
persisted resume sample and the current 0704DB still has none.

## Execution

1. Confirm E6's real commit/ff-only merge/push/cleanup checkpoint and claim only F0.
2. Read the private index first, then the canonical catalog; retain credentials and connection values only in process
   memory and record only file-presence hashes, role labels and safe status categories.
3. Launch an isolated localhost process with the canonical 0704DB target substituted into the process environment only,
   `AI_PROVIDER_ENABLED=false`, no Provider approval gates, and no `.env.local` change.
4. Run the nine-role login/session/authorization preflight through normal product endpoints, then revoke the temporary
   sessions. Stop before business acceptance if any required role is not `ready_0704_verified`; never retry a failing
   credential repeatedly.
5. Run bounded read-only route/data probes for the four acceptance families. Record only status/envelope/category/count
   booleans; never record rows, identifiers, content, phone, card plaintext or auth/session material.
6. Confirm Provider availability is `closed` for eligible representative roles and standard roles fail closed without
   attempting generation. Record the historical-resume conditional separately.
7. Stop the localhost process, verify ports and repository-private artifacts are clean, then run focused unit, lint,
   typecheck, changed-doc format, diff, recovery/serial/security and Module Run gates.

## Boundary Guards

- Credentials, passwords, cookies, sessions, tokens, headers, localStorage, env values, DB URLs, raw rows, internal ids,
  phone, plaintext `redeem_code`, Prompt/provider payloads, generated content, screenshots, raw DOM and traces never enter
  chat, repository artifacts or retained logs.
- Database use is through the localhost product runtime. Only the normal temporary login/logout session lifecycle and
  bounded read-only product endpoints are allowed. Direct SQL, business-data mutation, fixture/account changes,
  schema/migration/seed and private-file writes are blocked.
- Provider calls, generation submits, Cost Calibration, external services, staging, production and deployment are
  blocked. Deployment still requires fresh user approval.
- Authorization, edition, organization scope, training ownership, phone/card visibility, audit redaction and historical
  resume semantics are observed, never inferred from UI visibility or modified in F0.
- If a fresh product defect appears, capture only a redacted reproducible failure and route it through X2; do not mix a
  repair into the readiness commit or reopen historical findings without current evidence.

## Allowed Changes

- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/04-agent-system/state/active-state-history-index.yaml`
- `docs/05-execution-logs/task-plans/2026-07-14-content-admin-platform-f0-acceptance-readiness.md`
- `docs/05-execution-logs/evidence/2026-07-14-content-admin-platform-f0-acceptance-readiness.md`
- `docs/05-execution-logs/audits-reviews/2026-07-14-content-admin-platform-f0-acceptance-readiness-audit.md`
- `docs/05-execution-logs/acceptance/2026-07-13-content-admin-platform-pic-coverage-and-exception-ledger.md`

## Validation And Review

- Focused preflight: nine roles, expected authorization-context categories, four acceptance-family data-readiness
  categories, Provider closed, zero generation submit/business-data write, and temporary session cleanup.
- Focused unit proof: local session bootstrap, session/authorization boundary, AI availability and workspace role guards.
- No product/config/test change is planned, so build and full regression remain impact-triggered and are not mechanical
  F0 gates unless a qualifying impact appears.
- Round 1 attacks account/DB-target correctness, authorization/edition/data integrity, requirement-to-matrix mapping and
  evidence redaction. Round 2 attacks cross-role escalation, stale sessions, error/empty paths, sensitive leakage,
  conditional-sample overreach, repeated credential attempts and false acceptance claims.

Closeout uses one docs/state commit, ff-only merge to `master`, authorized push to `origin/master`, equality proof and
isolated-resource cleanup. F1 starts automatically. No deployment.
