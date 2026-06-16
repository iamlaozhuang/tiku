# Advanced Organization Training Publish-Version Route Boundary Readonly Audit Plan

## Goal

Readonly audit the future organization training publish-version route/API boundary before any route implementation.

## Required Reading

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/*.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/01-requirements/traceability/capability-catalog.md`
- `docs/04-agent-system/state/advanced-edition-code-stage-seeding-plan.yaml`
- `docs/superpowers/plans/2026-06-06-advanced-edition-organization-training-implementation-plan.md`
- Recent service runtime wiring readonly recheck evidence and audit.
- Current organization training service, contract, model, validator, repository, mapper, and adjacent route handler patterns.

## Scope

- Review current route namespace conventions under `src/app/api/v1/**`.
- Review adjacent publish/formal adoption route handler patterns.
- Review `OrganizationTrainingPublishedVersionDto` and publish service boundary for metadata-only DTO semantics.
- Confirm ADR-002 route handler to service to repository layering constraints.
- Confirm public-id-only URL policy and no internal numeric id exposure.
- Confirm formal target write remains blocked.

## Out Of Scope

- No product source implementation.
- No route/API runtime change.
- No service, repository, mapper, validator, model, schema, drizzle, script, package, or lockfile change.
- No DB access, row/private data read, provider/model call, dev server, Browser, Playwright, e2e, staging/prod/cloud/deploy/payment/external-service, quota/cost, formal content write, or formal target write.

## Review Steps

1. Confirm repository readiness from `master` and create a short branch.
2. Read required governance docs and task queue entry.
3. Inspect route namespace conventions and adjacent route handlers.
4. Inspect organization training publish DTO/service/repository/mapper boundaries.
5. Record route boundary findings and needs_recheck.
6. Run scoped unit tests and Module Run v2 gates.
7. Commit, fast-forward merge, push, and clean the short branch only if all gates pass.

## Risk Controls

- Evidence records file paths, field names, command names, and redacted conclusions only.
- Public identifier values, raw provider content, private rows, tokens, cookies, Authorization headers, DB URLs, raw prompts, and raw answers must not appear in evidence.
- If route boundary audit finds a blocking contract gap, stop before recommending implementation.
