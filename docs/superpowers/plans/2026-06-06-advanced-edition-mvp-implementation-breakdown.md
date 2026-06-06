# Advanced Edition MVP Implementation Breakdown Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Prepare Phase 30 advanced edition MVP requirements for later implementation without approving provider, environment, deployment, payment, or production default value work.

**Architecture:** Future implementation must follow the existing Next.js monolith layering: route handlers / server actions -> service -> repository -> model. Business rules stay in services, database access stays in repositories, transport responses stay mapped to the standard API contract, and generated AI learning content remains separate from formal `question`, `paper`, `practice`, `mock_exam`, `exam_report`, and `mistake_book` domains.

**Tech Stack:** Next.js 15 App Router, TypeScript, Better Auth, Drizzle ORM, PostgreSQL, Vercel AI SDK boundary abstractions, shadcn/ui + Tailwind CSS, existing local quality gates.

---

## Source Requirements

- `docs/superpowers/specs/2026-06-05-advanced-edition-ai-generation-design.md`
- `docs/superpowers/specs/2026-06-06-advanced-edition-mvp-requirements.md`
- `docs/superpowers/specs/2026-06-06-advanced-edition-ops-config-contract.md`
- `docs/05-execution-logs/audits-reviews/2026-06-06-advanced-edition-requirements-freeze-review.md`
- `docs/05-execution-logs/audits-reviews/2026-06-06-advanced-edition-supplemental-decision-traceability-review.md`

## Global Implementation Boundaries

- Do not execute `Cost Calibration Gate`.
- Do not call a real `model_provider`.
- Do not create or edit env/secret files.
- Do not touch staging/prod/cloud/deploy/payment/external-service configuration.
- Do not hard-code production quota points, AI behavior cost points, concurrency thresholds, timeout thresholds, retry limits, idempotency windows, peak thresholds, or peak degradation mappings.
- Do not let AI-generated learning content directly write into formal `question`, `paper`, `practice`, `mock_exam`, `exam_report`, or `mistake_book`.
- Do not expose auto-increment primary keys in external URLs.
- Do not let organization admins see employee question-level, answer-level, mistake-level, prompt-level, provider-payload-level, or single-AI-task detail data.

## Candidate File Ownership

The paths below are implementation planning anchors. Future task plans must confirm exact files after reading the current code at execution time.

| Area                          | Likely Ownership                                                             |
| ----------------------------- | ---------------------------------------------------------------------------- |
| Database schema               | `src/db/schema/**`                                                           |
| Domain models                 | `src/server/models/**`                                                       |
| Repositories                  | `src/server/repositories/**`                                                 |
| Services                      | `src/server/services/**`                                                     |
| Validators                    | `src/server/validators/**`                                                   |
| API contracts                 | `src/server/contracts/**`                                                    |
| API mappers                   | `src/server/mappers/**`                                                      |
| Web routes and server actions | `src/app/**`                                                                 |
| Unit tests                    | `tests/unit/**`                                                              |
| E2E tests                     | `e2e/**`                                                                     |
| Task plans and evidence       | `docs/05-execution-logs/task-plans/**`, `docs/05-execution-logs/evidence/**` |

## Implementation Task Groups

### Task Group 1: Authorization Context And Advanced Capability Gate

**Goal:** Resolve the effective `authorization` context for personal users, organization employees, organization admins, platform operations admins, and platform content teachers.

**Requirement Sources:**

- `Authorization Context API Contract`
- `Role And Data Boundary Matrix`
- `Operations Configuration Contract`

**Expected Work:**

- Add or extend service-level authorization context resolution.
- Keep `personal_auth` and `org_auth` distinct.
- Return public identifiers, not auto-increment primary keys.
- Expose only capability flags needed by the caller.

**Required Tests:**

- Personal advanced user receives personal AI capability flags.
- Employee using organization authorization receives organization quota owner context.
- User without valid authorization receives blocked capability state.
- Organization admin cannot receive employee private AI task details through authorization context.

**Blocked Work:**

- Production quota point default values.
- Payment.
- External purchase flow.
- Real provider enablement.

### Task Group 2: AI Generation Task Domain

**Goal:** Build the local task state model for AI question generation, AI paper generation, and organization training generation without real provider execution.

**Requirement Sources:**

- `AI Generation Task Model`
- `Worker Runtime And Recovery`
- `Cancellation`
- `Retry`
- `Default Value Governance`

**Expected Work:**

- Represent `pending`, `running`, `succeeded`, `failed`, `cancelled`, and recovery states.
- Record actor, owner, quota owner, authorization source, snapshots, retry count, failure category, and redacted audit summary.
- Keep implementation provider-agnostic behind local service boundaries.

**Required Tests:**

- `pending` task can be cancelled without quota consumption.
- `running` task cannot be cancelled as if it never ran.
- Failed task records a redacted failure summary.
- Retry respects the configured value source and refuses missing production configuration.

**Blocked Work:**

- Real provider call.
- Provider pricing.
- Production timeout, retry, concurrency, or peak threshold defaults.

### Task Group 3: Personal AI Question And Paper Generation

**Goal:** Let an advanced personal user create AI learning questions and AI learning `paper` content in a non-formal content domain.

**Requirement Sources:**

- `AI Generated Content Governance`
- `Question Type Scope`
- `AI Paper Generation Scope`
- `Content Domains`

**Expected Work:**

- Store generated learning content separately from formal `question` and `paper`.
- Keep AI learning `paper` separate from formal `mock_exam`.
- Preserve source, citation, validation status, and retention status.
- Provide user-facing list/detail access only to the owner.

**Required Tests:**

- Generated question is not visible as formal `question`.
- Generated `paper` is not visible as formal `mock_exam`.
- Owner can access their own generated learning content.
- Another user cannot access the generated content.

**Blocked Work:**

- Direct formal content adoption without platform content teacher review.
- Real provider call.
- Production behavior cost point defaults.

### Task Group 4: Organization Training Lifecycle

**Goal:** Build organization training draft, publish, takedown, copy-to-new-draft, and versioned employee answering lifecycle.

**Requirement Sources:**

- `Organization Training Minimum Loop`
- `Organization Hierarchy`
- `Supplemental Decision Traceability`
- `Main Acceptance Chains`

**Expected Work:**

- Keep organization training content independent from formal `question`, `paper`, `practice`, and `mock_exam`.
- Snapshot organization scope at publish and answer time.
- Prevent direct edit after publish.
- Allow takedown and copy-to-new-draft for new version creation.
- Allow each employee one formal submission per training version.

**Required Tests:**

- Published training cannot be directly edited.
- Copying a published training creates a draft without overwriting the original.
- Employee can save draft answers before formal submit.
- Employee cannot formally submit the same training version twice.
- Takedown prevents new answering and detail re-entry while preserving historical result summary.

**Blocked Work:**

- Forced deadline.
- Retake.
- Best-score or latest-score policy.
- Question-level organization admin visibility.

### Task Group 5: Organization Analytics Summary

**Goal:** Provide organization admin statistics summaries without exposing employee sensitive details.

**Requirement Sources:**

- `Organization Portal Analytics`
- `Organization Portal Homepage Metrics`
- `Employee Detail Field Visibility`
- `Privacy Boundary`

**Expected Work:**

- Provide training-level summaries.
- Provide employee-level record summaries.
- Provide quota consumption summaries.
- Use organization hierarchy snapshots for aggregation.
- Block item-level, answer-level, prompt-level, and single AI task detail visibility.

**Required Tests:**

- Organization admin sees only their bound organization and descendant organizations.
- Organization admin sees completion count, completion rate, score summary, and quota summary.
- Organization admin cannot read employee question text, standard answer, employee answer, mistake detail, or single AI task detail.
- Export route or export command is absent for first release.

**Blocked Work:**

- Employee statistic export.
- Diagnostic detail beyond approved summaries.

### Task Group 6: Operations Authorization And Quota Management

**Goal:** Give platform operations admins governed tools for `authorization`, `redeem_code`, quota package, quota ledger, manual adjustment, and audit summary management.

**Requirement Sources:**

- `Authorization Upgrade`
- `Edition Upgrade Redeem Code Relationship`
- `Quota Package And Ledger Rules`
- `Operations Configuration Contract`

**Expected Work:**

- Keep purchase registration and bonus/manual adjustment reason requirements.
- Record quota ledger entries immutably.
- Use `audit_log` for every governance action.
- Do not expose plaintext `redeem_code` after creation or import.

**Required Tests:**

- Operations adjustment requires reason, direction, quota point, and operator.
- Purchase-style grant requires external reference and operations note.
- Quota ledger is append-only.
- Plaintext `redeem_code` is not returned from ordinary read endpoints.

**Blocked Work:**

- Payment integration.
- External service purchase confirmation.
- Production quota package default point values.

### Task Group 7: Retention, Expired Hidden, Audit Log, And AI Call Log Governance

**Goal:** Implement confirmed retention and log governance values while preserving blocked production configuration boundaries.

**Requirement Sources:**

- `Retention Domain Decision`
- `Expired Hidden Grace Decision`
- `Audit Log Retention Decision`
- `AI Call Log Retention Decision`

**Expected Work:**

- Apply 90-day retention to personal/employee AI learning generated content.
- Apply 90-day retention to unpublished organization training drafts.
- Keep published organization training under long-term retention.
- Keep formal `question` / `paper` drafts governed by existing formal content rules.
- Apply 30-day expired hidden recovery window.
- Apply `audit_log` 1095-day and `ai_call_log` 180-day retention policies.
- Keep sensitive fields out of logs and evidence.

**Required Tests:**

- Expired content becomes hidden from ordinary user entrances.
- Operations recovery within 30 days requires reason and writes `audit_log`.
- Recovery does not bypass `authorization`, organization scope, or redaction rules.
- `audit_log` and `ai_call_log` reject known sensitive fields in ordinary logging paths.

**Blocked Work:**

- Automatic hard delete without approval flow.
- Provider payload logging.
- Prompt or raw AI input/output logging.

## Recommended Implementation Order

1. Task Group 1: authorization context and capability gate.
2. Task Group 2: AI generation task domain.
3. Task Group 3: personal AI question and `paper` generation.
4. Task Group 4: organization training lifecycle.
5. Task Group 5: organization analytics summary.
6. Task Group 6: operations authorization and quota management.
7. Task Group 7: retention and log governance.

## Required Gates Per Future Task

- Create a task plan before implementation.
- Run `git diff --check`.
- Run available lint/typecheck/test/build gates relevant to touched code.
- Write evidence before conclusion.
- Keep provider, env/secret, staging/prod/cloud/deploy, payment, and external-service actions out of scope unless separately approved.

## Self-Review

- Spec coverage: all four MVP main loops and cross-cutting governance areas map to task groups.
- Placeholder scan: no future task is allowed to rely on unstated production default values.
- Type and naming consistency: project terms remain `authorization`, `personal_auth`, `org_auth`, `redeem_code`, `question`, `paper`, `mock_exam`, `audit_log`, and `ai_call_log`.
- Blocked work isolation: `Cost Calibration Gate` and production default value decisions remain excluded.
