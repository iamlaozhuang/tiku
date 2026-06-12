# Batch 117 Paper And Mock Exam Access Context Plan

**Task id:** `batch-117-authorization-and-access-paper-and-mock-exam-access-context-without-c`

**Branch:** `codex/batch-117-authorization-and-access-paper-and-mock-exam-access-context-without-c`

**Task kind:** `implementation`

## Sources Read

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/04-agent-system/operating-manual.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/04-agent-system/state/autodrive-control-schema.yaml`
- `docs/04-agent-system/state/mechanism-source-of-truth-index.yaml`
- `docs/04-agent-system/state/advanced-edition-domain-module-run-matrix.yaml`
- `docs/superpowers/specs/2026-06-06-advanced-edition-mvp-requirements.md`
- `docs/superpowers/specs/2026-06-06-advanced-edition-ops-config-contract.md`
- `docs/superpowers/plans/2026-06-06-advanced-edition-requirements-to-implementation-handoff.md`
- `docs/superpowers/plans/2026-06-06-advanced-edition-doc-source-of-truth-index.md`
- `docs/superpowers/plans/2026-06-06-advanced-edition-auth-context-implementation-plan.md`
- `docs/05-execution-logs/evidence/batch-103-authorization-and-access-paper-and-mock-exam-access-context-without-c.md`
- `docs/05-execution-logs/evidence/batch-116-authorization-and-access-personal-auth-and-org-auth-local-summaries.md`

## Goal

Harden the local `authorization` access-context read model for `paper` and `mock_exam` references so downstream advanced-edition flows can consume public, redacted context summaries without changing real permission behavior.

## Scope

Allowed implementation surfaces:

- `src/server/models/**`
- `src/server/contracts/**`
- `src/server/validators/**`
- `src/server/services/**`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/**`
- `docs/05-execution-logs/evidence/**`
- `docs/05-execution-logs/audits-reviews/**`

Blocked surfaces and actions:

- `.env.local`, `.env.example`
- `package.json`, lockfiles
- `src/db/schema/**`, `drizzle/**`
- repository, mapper, route, Server Action, UI, or e2e expansion
- real authorization permission model changes
- provider calls or configuration
- schema/migration or destructive database work
- staging/prod/cloud/deploy, payment, external-service, PR, force push
- Cost Calibration Gate

## Implementation Plan

1. Inspect the existing `authorization-paper-mock-exam-access-context` model, contract, validator, service, and focused tests.
2. Add RED coverage for Batch 117-specific hardening:
   - effective edition and source metadata remain explicit in the context summary.
   - `paper` and `mock_exam` references stay public-id-only.
   - context mismatch remains a summary status and does not deny or enforce access.
   - invalid context inputs are rejected.
3. Extend model/contract/validator/service only as needed for the new local summary fields.
4. Preserve `accessContextStatus: "context_summary_only"` and `permissionBehaviorStatus: "unchanged"`.
5. Run focused unit tests, auto-seed readiness, lint, typecheck, and `git diff --check`.
6. Update evidence and audit review with RED/GREEN, validation results, redaction, and blocked remainder.

## Risk Defenses

- Use project terminology: `authorization`, `paper`, `mock_exam`, `personal_auth`, `org_auth`.
- Use camelCase DTO fields and public identifiers only.
- Return `null` for absent optional context references, never empty strings.
- Do not infer or implement real permission, quota, entitlement, or authorization enforcement changes.
- Keep evidence redacted; never record secrets, provider payloads, raw prompts, raw generated content, plaintext `redeem_code`, DB URLs, Authorization headers, full `paper` content, or raw DB rows.
- Cost Calibration Gate remains blocked.
