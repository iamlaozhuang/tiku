# 2026-07-10 0704 Model Prompt Log Governance Acceptance Plan

## Scope

- taskId: `0704-model-prompt-log-governance-acceptance-2026-07-10`
- branch: `codex/0704-model-prompt-log-governance-acceptance`
- mode: validation-only localhost/source/test acceptance
- goal: prove model configuration governance, first-release Prompt registry rules, redacted `ai_call_log` and `audit_log` behavior, and Provider-disabled/failure degradation without browser login, direct DB, Provider, staging/prod/deploy, env/secret, package, lockfile, schema, migration, or seed work.

## Required Reading Completed

- `AGENTS.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/02-architecture/interfaces/ai-rag-contract.md`
- `docs/01-requirements/00-index.md`
- `docs/01-requirements/modules/04-ai-scoring.md`
- `docs/01-requirements/modules/06-admin-ops.md`
- `docs/01-requirements/advanced-edition/00-index.md`
- `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`
- `docs/01-requirements/advanced-edition/modules/02-ai-task-domain.md`
- `docs/01-requirements/advanced-edition/modules/03-personal-ai-generation.md`
- `docs/01-requirements/advanced-edition/modules/07-retention-log-governance.md`
- `docs/01-requirements/advanced-edition/modules/08-organization-ai-generation.md`
- `docs/01-requirements/advanced-edition/stories/epic-06-retention-log-governance.md`
- `docs/01-requirements/traceability/2026-07-02-admin-model-prompt-log-governance-ui-ux-contract.md`
- `docs/01-requirements/traceability/2026-07-02-ai-generation-requirements-ssot-alignment.md`
- `docs/05-execution-logs/acceptance/2026-07-10-0704-post-peripheral-acceptance-ledger.md`
- recent 2026-07-02/2026-07-03 admin model Prompt log governance evidence

## Readiness

- Private credential index preflight: metadata-only, pass, 9 core role labels found.
- Credential values output: none.
- Browser login, direct DB access, Provider execution, staging/prod/deploy/env/secret/Cost Calibration: blocked.

## Acceptance Targets

- `super_admin` owns model provider/config management and connection-test governance.
- `ops_admin` can view only permitted model/config and cost/log summaries, without config mutation or Prompt full-text visibility.
- `content_admin`, organization admins, employees, learners, and unauthenticated users cannot access global model config, Prompt governance, global `ai_call_log`, or global `audit_log` surfaces.
- Prompt registry is read-only in first release; editable Prompt UI, export/copy/delete/archive, and raw Prompt evidence remain unavailable.
- `super_admin` may view registered Prompt full text in product UI, but Prompt full text is not written to evidence, logs, exports, screenshots, or non-super views.
- `ai_call_log` and `audit_log` surfaces show status/use categories, duration/count summaries, object references, redacted summaries, and failure categories only.
- Provider-disabled, unavailable, timeout, quota, empty-result, and permission-denied states degrade safely without leaking Provider payload, raw Prompt, raw AI input/output, stack, env, or secret content.

## Validation Plan

1. Inspect source and route/test markers for model config write role, ops read-only summaries, Prompt read-only/full-text role split, global log role boundaries, raw-view/export/delete/archive absence, and Provider-disabled/failure redaction.
2. Run focused tests for admin model/Prompt/log UI, AI audit/log route handlers, provider-disabled task flows, redacted AI call log references, model config runtime/fallback behavior, and Prompt registry behavior.
3. Record only redacted role labels, route/control labels, state categories, command names, and test counts.
4. If a true product defect is found, stop this validation task, record redacted evidence, and open a separate repair branch before continuing the queue.

## Adversarial Review Checklist

- Role boundary: non-super roles cannot mutate model config; non-ops/global roles cannot read global logs.
- Prompt boundary: full registered Prompt text does not leak outside `super_admin` product view and never appears in evidence.
- Provider boundary: no Provider-enabled execution, env/secret read, payload output, or Cost Calibration claim.
- Log boundary: `ai_call_log` and `audit_log` expose only redacted summaries and no raw viewer/export/delete/archive controls.
- Failure boundary: disabled, timeout, unavailable, quota, empty, and permission states are categorized and redacted.
- Organization/employee boundary: organization admins cannot see learner raw AI content, global AI logs, Prompt text, Provider payloads, or enterprise AI quota consumption summaries.

## Planned Gates

- metadata-only private credential index preflight
- source marker summary checks
- focused `vitest` pack
- `corepack pnpm@10.26.1 prettier --write --ignore-unknown` on scoped docs
- `corepack pnpm@10.26.1 run lint`
- `corepack pnpm@10.26.1 run typecheck`
- `git diff --check`
- Module Run v2 pre-commit hardening
- Module Run v2 pre-push readiness
