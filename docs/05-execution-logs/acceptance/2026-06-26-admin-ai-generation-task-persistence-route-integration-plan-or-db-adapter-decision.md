# Admin AI Generation Task Persistence Route Integration Or DB Adapter Decision

Task id: `admin-ai-generation-task-persistence-route-integration-plan-or-db-adapter-decision`

Decision type: `docs_only_route_integration_or_db_adapter_decision`

## Decision Summary

Do not wire fake/local persistence into the production admin AI generation routes as the next product implementation.

Next step should be a DB adapter/schema mapping approval package before route-level persistence is implemented:

`admin-ai-generation-task-persistence-db-schema-mapping-approval-package-2026-06-26`

## Rationale

Fake/local persistence can prove route wiring in a unit test, but it does not satisfy the product requirement for
trackable tasks. If it is exposed through production routes, it creates a misleading signal: the API would appear to
persist admin AI generation work while no durable task exists after process restart or across instances.

The current repository port records admin-specific metadata:

- `workspace`
- `generationKind`
- runtime bridge status and Provider-disabled flags
- formal content write boundary
- source question/paper public ids
- platform or organization owner and quota owner semantics

Current `ai_generation_task` schema can hold some shared task fields, but not the full admin persistence contract without
lossy mapping:

- no explicit `workspace`;
- no explicit `generation_kind`;
- no explicit runtime bridge status or execution boundary flags;
- no explicit formal content boundary fields;
- `question_public_id` is not nullable, which is awkward for AI `paper` generation and admin review tasks that do not
  start from a source question;
- `ai_func_type` is oriented to AI scoring/explanation/hint/recommendation/suggestion, not admin AI generation.

Therefore, directly creating a real adapter against the existing table would either hide important admin metadata or
invent placeholder values. Both options make later review, audit, and migration harder.

## Approved Direction

Prepare a docs-only DB adapter/schema mapping approval package next.

That package should decide one of these explicit storage shapes:

1. Extend `ai_generation_task` with nullable admin AI metadata fields.
2. Keep `ai_generation_task` as the shared lifecycle table and add a dedicated admin AI generation metadata table linked by task public id or internal FK.
3. Reject schema change and define a consciously lossy adapter only if the owner accepts the audit tradeoff.

The preferred technical direction is option 2 unless schema review finds a simpler non-lossy extension:

- shared lifecycle remains in `ai_generation_task`;
- admin-specific route/workspace/formal-boundary/runtime-bridge metadata stays isolated;
- later result/review draft storage can attach without polluting personal AI request history.

## Explicitly Rejected For Next Product Step

`fake/local persistence in production admin routes`

Reason:

- not durable;
- can mask missing DB adapter work;
- risks a false acceptance signal for "trackable tasks";
- does not help Provider/Cost smoke because product-chain persistence remains non-durable.

## Allowed Narrow Use Later

A future source task may still use a fake gateway in focused unit tests to prove route-service integration, but production
route defaults must remain persistence-disabled until a real adapter/schema decision is approved.

## Seeded Follow-Up

Recommended next task:

`admin-ai-generation-task-persistence-db-schema-mapping-approval-package-2026-06-26`

Required output:

- compare existing `ai_generation_task` columns against the admin persistence contract;
- decide table extension versus companion metadata table;
- define exact allowed files and blocked gates for the later source task;
- state whether local schema/migration approval is requested or still deferred.

## Non-Decision Statement

This package does not implement route persistence, DB adapter, schema, migration, seed, Provider execution, Cost
Calibration, formal content adoption, staging/prod readiness, payment, external-service readiness, release readiness, or
final Pass.
