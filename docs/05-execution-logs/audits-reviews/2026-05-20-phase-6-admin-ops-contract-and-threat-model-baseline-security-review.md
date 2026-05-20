# Phase 6 Admin Ops Contract And Threat Model Baseline Security Review

## Metadata

- Task id: `phase-6-admin-ops-contract-and-threat-model-baseline`
- Branch: `codex/phase-6-admin-ops-contract-and-threat-model-baseline`
- Base: `master`
- Reviewer: Codex
- Review date: 2026-05-20
- Verdict: `APPROVE`

## Files Reviewed

- `docs/02-architecture/interfaces/admin-ops-contract.md`
- `docs/05-execution-logs/task-plans/2026-05-20-phase-6-admin-ops-contract-and-threat-model-baseline.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/01-requirements/stories/epic-06-admin-ops.md`
- `docs/02-architecture/interfaces/global-db-api-skeleton.md`
- `docs/02-architecture/interfaces/question-paper-contract.md`
- `docs/02-architecture/interfaces/student-experience-contract.md`
- `docs/02-architecture/interfaces/ai-rag-contract.md`
- `docs/04-agent-system/sop/security-review-gate.md`

## Risk Types Reviewed

- `authorization`
- `api_contract`
- `admin`
- `audit_log`
- `ai_call_log`
- `threat_model`

## Abuse Cases Considered

- A disabled or non-admin user accesses an admin route.
- An admin changes a `publicId` to access another `organization`, `employee`, `authorization`, `redeem_code`, `audit_log`, or `ai_call_log` outside role or scope.
- A role performs an operation outside its intended boundary, such as an `ops_admin` editing model configuration or a `content_admin` changing authorization.
- Two requests race to create overlapping `org_auth` records.
- A redeem code batch is partially committed or generated twice after a retry.
- Clear-text `redeem_code` values are exposed to unauthorized roles or browser logs.
- `audit_log` records are edited, deleted, or used as a sink for passwords, session tokens, provider secrets, or raw request bodies.
- `ai_call_log` exposes raw prompts, user answers, model outputs, citations, chunks, provider payloads, provider errors, or secrets.
- `model_config` changes leak provider credentials or affect in-flight AI work without redaction-safe snapshotting.
- External URLs expose auto-increment numeric ids.

## Data Exposure Review

The contract requires public identifiers for external surfaces and keeps numeric database ids internal. It explicitly blocks password hashes, session internals, bearer tokens, provider API keys, provider secrets, object storage keys, raw prompts, raw user answers, raw model outputs, raw citations, raw chunks, provider headers, provider payloads, and provider errors from admin DTOs unless a later task defines a safe retention policy and passes security review.

The `redeem_code` clear-text display exception is limited to authorized operations admins for first-release distribution, and the contract requires role gating, audit logging, and avoidance of client log exposure in implementation.

## Authorization Boundary Review

The contract requires every admin API to authenticate `admin` context and enforce role-specific service-level permission checks. It treats `publicId` as a lookup handle only, not a permission mechanism.

The contract requires public identifier lookups to be combined with session, role, organization scope, ownership, and resource state checks. It also requires authorization state handling for active, expired, cancelled, disabled, and not-yet-started records where relevant.

## API Contract Review

The contract preserves:

- `/api/v1/` path versioning.
- Kebab-case plural REST paths.
- CamelCase JSON fields.
- Standard response envelope `{ code, message, data, pagination? }`.
- ISO 8601 time values.
- `null` for optional empty fields and `[]` for empty lists.
- External public identifiers such as `publicId`.
- No numeric auto-increment ids in external URLs.
- Route handler and Server Action thin-adapter boundaries from ADR-002.

## Required Security Controls For Later Tasks

- Admin auth: every route must require authenticated `admin` context.
- Role checks: `super_admin`, `ops_admin`, and `content_admin` permissions must be enforced in service code.
- Organization scope: organization, employee, authorization, redeem code, log, report, and cost views must not cross permitted boundaries by changing public identifiers.
- Concurrency: authorization creation or adjustment, employee bulk import, and redeem code generation need atomic operations or optimistic locking.
- Audit logging: account, organization, authorization, redeem code, content, vector rebuild, and model config mutations need `audit_log` entries.
- Log redaction: `audit_log` and `ai_call_log` must not expose secrets, sessions, raw prompts, raw answers, raw chunks, raw model outputs, or provider payloads.
- Model config safety: provider credentials must stay server-side, displays must be redacted, and AI work must snapshot redaction-safe config metadata.

## Test Coverage And Accepted Gaps

This task is documentation and contract-only. No runtime behavior, schema, migrations, provider integration, source files, UI files, or tests are changed. Runtime tests are therefore not added in this task.

Accepted gaps for this task:

- No automated enforcement of the new Admin Ops contract exists yet.
- No admin route, service, repository, mapper, validator, or UI tests exist for the Phase 6 surfaces in this task.
- No database-level concurrency test exists yet for authorization overlap, employee import, or redeem code generation.
- No log redaction tests are added in this task.

These gaps are non-blocking because follow-up Phase 6 queue tasks are scoped to implement the corresponding UI, route, service, contract, mapper, validator, tests, and security reviews.

## Verdict

`APPROVE`

The reviewed changes define security requirements and do not introduce runtime behavior. The contract covers the required `authorization`, `api_contract`, `admin`, `audit_log`, `ai_call_log`, and `threat_model` risks, preserves public identifier safety, and requires redaction and service-level authorization controls for later implementation tasks.
