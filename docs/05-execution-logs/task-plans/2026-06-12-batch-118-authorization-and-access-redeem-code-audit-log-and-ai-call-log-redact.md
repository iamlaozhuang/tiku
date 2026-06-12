# Batch 118 Redeem Code Audit Log Ai Call Log Redacted References Plan

## Scope

- Task: `batch-118-authorization-and-access-redeem-code-audit-log-and-ai-call-log-redact`
- Target closure: `redeem_code`, `audit_log`, and `ai_call_log` redacted references in the authorization-and-access local contract surface.
- Allowed code surfaces: `src/server/models/**`, `src/server/contracts/**`, `src/server/validators/**`, `src/server/services/**`.
- Allowed governance surfaces: task plan, evidence, audit review, `project-state.yaml`, and `task-queue.yaml`.
- Blocked surfaces: `.env*`, package and lock files, `src/db/schema/**`, `drizzle/**`, provider calls/configuration, deploy, payment, external service, PR, force push, and Cost Calibration Gate.

## Read Documents

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/04-agent-system/operating-manual.md`
- `docs/04-agent-system/sop/automated-advancement-governance.md`
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
- Batch 115, Batch 116, and Batch 117 execution evidence.

## Implementation Plan

1. Add a focused RED test around the existing authorization local contract summary proving the aggregate DTO exposes a dedicated, redaction-safe evidence reference group for `redeem_code`, `audit_log`, and `ai_call_log`.
2. Extend only the local contract model/contract/validator/service surfaces needed to normalize optional public-id references and return camelCase DTO fields.
3. Preserve existing standalone `redeem_code` and `audit_log`/`ai_call_log` reference services; do not introduce repositories, schema, routes, provider calls, env reads, package changes, or migrations.
4. Run the focused tests first, then required Batch 118 validation commands.
5. Write redacted evidence and audit review before closeout.

## Risk Defense

- DTOs expose only public identifiers and redaction statuses; no numeric `id`, plaintext `redeem_code`, code hash, raw `audit_log` metadata, raw prompt, raw generated AI content, provider payload, token, secret, Authorization header, database URL, full `paper`, or full `material` content.
- Existing API envelope remains `{ code, message, data }`.
- Cost Calibration Gate remains blocked.
