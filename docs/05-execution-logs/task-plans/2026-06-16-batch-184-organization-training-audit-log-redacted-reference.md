# Task Plan: batch-184 organization-training audit_log redacted reference

## Scope

- Task id: `batch-184-organization-training-audit-log-redacted-reference`
- Branch: `codex/organization-training-batch-184-audit-log-redacted-reference`
- Goal: add a local organization-training `audit_log` redacted reference boundary that can point to training draft, published version, employee answer, source context, or summary audit events without exposing row ids, raw content, answers, prompt/provider payloads, or private data.

## Read Before Edit

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/adr-001-tech-stack-selection.md`
- `docs/02-architecture/adr/adr-002-runtime-architecture-and-multi-client-contract.md`
- `docs/02-architecture/adr/adr-003-workplace-desktop-web-compatibility.md`
- `docs/02-architecture/adr/adr-004-environment-isolation-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-005-staging-architecture-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-006-runtime-dependency-alignment.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/04-agent-system/sop/docs-only-fast-lane-governance.md`
- `docs/05-execution-logs/evidence/2026-06-15-module-run-v2-docs-only-fast-lane-mechanism.md`
- `docs/05-execution-logs/audits-reviews/2026-06-15-module-run-v2-docs-only-fast-lane-mechanism.md`
- `src/server/models/organization-training.ts`
- `src/server/contracts/organization-training-contract.ts`
- `src/server/services/organization-training-service.ts`
- `src/server/services/organization-training-service.test.ts`
- `src/server/services/redeem-code-reference-service.ts`
- `src/server/services/redeem-code-reference-service.test.ts`

## Implementation Plan

1. Write a failing unit test first in `src/server/services/organization-training-service.test.ts` for a redacted `audit_log` reference read model.
2. Add the minimum model and contract types needed for an organization-training audit reference:
   - allowed target resource types for organization-training audit references;
   - redacted audit reference metadata;
   - nullable contextual public ids.
3. Add a validator that normalizes public ids and target resource type, rejects missing audit log references, and ignores raw/private fields.
4. Add a service read-model builder returning the standard API response envelope.
5. Run the focused unit test and then the task-declared closeout validation commands.

## Risk Controls

- No `.env*` reads or edits.
- No DB access, no schema/drizzle changes, no migrations.
- No provider/model calls and no Cost Calibration Gate.
- No e2e/browser/dev-server work.
- No package or lockfile changes.
- No staging/prod/cloud/deploy/payment/external-service.
- Evidence must record only command outcomes and redacted summaries.

## TDD Notes

- RED: first test must fail because the new service/contract does not exist.
- GREEN: implement only the behavior covered by the focused tests.
- Refactor only after green, preserving existing organization-training behavior.
