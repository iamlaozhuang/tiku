# Content Organization AI Generation Product Loop Implementation Plan Package

Package id: `CONTENT_ORGANIZATION_AI_GENERATION_PRODUCT_LOOP_IMPLEMENTATION_PLAN_2026_06_26`

This is a docs-only implementation plan package. It does not change runtime behavior, read credentials, call Provider,
execute Cost Calibration, touch DB/schema, or claim MVP final Pass.

## Entry Conditions

- Local Provider smoke passed on 2026-06-26 with exactly one redacted local dev call.
- Content and organization admin AI generation surfaces remain `entry_only`.
- Cost Calibration remains blocked.
- Staging/prod/payment/external-service work remains blocked.

## Current Source State

| Area                  | Current state  | Evidence                                                                                                           |
| --------------------- | -------------- | ------------------------------------------------------------------------------------------------------------------ |
| Content `AI出题`      | entry-only     | `src/app/(admin)/content/ai-question-generation/page.tsx` renders `AdminAiGenerationEntryPage`.                    |
| Content `AI组卷`      | entry-only     | `src/app/(admin)/content/ai-paper-generation/page.tsx` renders `AdminAiGenerationEntryPage`.                       |
| Organization `AI出题` | entry-only     | `src/app/(admin)/organization/ai-question-generation/page.tsx` renders `AdminAiGenerationEntryPage`.               |
| Organization `AI组卷` | entry-only     | `src/app/(admin)/organization/ai-paper-generation/page.tsx` renders `AdminAiGenerationEntryPage`.                  |
| Admin UI              | boundary cards | `AdminAiGenerationEntryPage` checks role and displays boundary copy, but no submit/request/result loop.            |
| API routes            | missing        | Only `personal-ai-generation-*` APIs exist under `src/app/api/v1`; no content/org generation request API observed. |
| Task domain           | partial shared | `ai-generation-task` and request policy contracts exist and are provider-agnostic.                                 |
| Provider execution    | smoke-passed   | One local dev Provider smoke passed; this does not approve future production calls or Cost Calibration.            |

## Implementation Principle

Build the product loop in layers:

1. Contract and local request loop.
2. Durable task/result persistence, only after schema/persistence approval if required.
3. Draft/review queues for content and organization.
4. Optional Provider execution integration behind explicit task-scoped gates.
5. Formal adoption only through separate review governance.

Do not start with direct formal `question` or `paper` writes.

## Minimum Future Source Task

Recommended first source task:

`content-organization-ai-generation-admin-local-contract-loop-source-repair-2026-06-26`

Goal:

- move content/org admin AI pages from entry-only to a local contract request loop;
- add visible submit controls for `AI出题` and `AI组卷`;
- add redacted request/result summaries;
- keep Provider calls disabled by default;
- keep generated content summary-only and not formal content.

Suggested allowed source files for that task:

- `src/features/admin/ai-generation/AdminAiGenerationEntryPage.tsx`
- new or existing admin AI generation contract/model/service files under `src/server/contracts`, `src/server/models`,
  `src/server/services`, and `src/server/validators`
- new local API route handlers under `src/app/api/v1/content-ai-generation-requests/` and
  `src/app/api/v1/organization-ai-generation-requests/`
- focused unit tests under `tests/unit/` and colocated server service tests

Blocked in the first source task unless separately approved:

- DB schema/migration/persistence tables;
- real Provider calls;
- `.env*` or credential reads;
- Cost Calibration;
- browser/e2e runtime;
- formal `question` or `paper` writes.

Expected first-task acceptance:

- content admin can submit a local contract AI question or AI `paper` request and see a redacted task/result summary;
- organization advanced admin can submit a local contract organization-owned request and see a redacted task/result
  summary;
- organization standard admin gets denied/unavailable state;
- no raw generated output, prompt, Provider payload, or secret appears in API or UI evidence;
- generated output is summary-only and separated from formal content.

## Persistence And Schema Gate

Full product-loop completion likely requires durable task/result and draft/review storage. That requires a separate
approval if new tables, columns, migrations, seed changes, or DB writes are needed.

Future schema/persistence gate must define:

- tables or reuse strategy;
- public id strategy;
- owner model for content/platform vs `organization`;
- draft/result lifecycle;
- audit and redaction columns;
- migration/rollback plan;
- seed and test data policy.

Without this gate, implementation must stay local-contract or reuse existing approved persistence only.

## Provider Integration Gate

Provider smoke pass makes local SDK reachability credible, but it does not approve unrestricted Provider execution.

Any future source task that calls a real Provider must define:

- exact model/provider;
- max call count;
- credential source;
- redacted evidence fields;
- retry policy;
- failure categories;
- whether the call is a smoke, local dev implementation proof, or product runtime path.

Unit tests should use fake runners unless the task explicitly approves a real runtime call.

## Cost Calibration Gate

Cost Calibration remains separate.

The 2026-06-26 smoke recorded usage counters, including reasoning token counters that exceeded the requested output
token budget. This must be handled by a future Cost Calibration Gate before quota, pricing, or production cost defaults
are decided.

## Suggested Task Sequence

1. `content-organization-ai-generation-admin-local-contract-loop-source-repair-2026-06-26`
2. `content-organization-ai-generation-durable-persistence-gate-package-2026-06-26`
3. `content-ai-generation-draft-review-queue-source-repair-2026-06-26`
4. `organization-ai-generation-owned-draft-lifecycle-source-repair-2026-06-26`
5. `content-organization-ai-generation-provider-integration-gate-package-2026-06-26`
6. `ai-generation-cost-calibration-gate-execution-2026-06-26`
7. `content-organization-ai-generation-formal-adoption-governance-plan-2026-06-26`

The first task is the only immediately recommended source repair. Later tasks depend on owner approval for persistence,
Provider, or Cost gates.

## Final Boundary

This package prepares the implementation path only. It does not claim content/org AI generation completion, Provider
production readiness, Cost Calibration readiness, staging/prod readiness, payment readiness, or MVP final Pass.
