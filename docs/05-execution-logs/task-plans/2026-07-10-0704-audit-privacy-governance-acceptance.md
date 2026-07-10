# 2026-07-10 0704 Audit Privacy Governance Acceptance Plan

## Scope

- taskId: `0704-audit-privacy-governance-acceptance-2026-07-10`
- branch: `codex/0704-audit-privacy-governance-acceptance`
- mode: validation-only localhost/source/test acceptance
- goal: prove `audit_log` event coverage and privacy boundaries for authorization, upgrade, revocation, employee import,
  employee disable, training publish, resource publish, model config changes, role-scoped log views, and employee/learner
  raw-content exclusion.

## Required Reading Completed

- `AGENTS.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/01-requirements/00-index.md`
- `docs/01-requirements/modules/06-admin-ops.md`
- `docs/01-requirements/advanced-edition/00-index.md`
- `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`
- `docs/01-requirements/advanced-edition/modules/06-ops-authorization-quota.md`
- `docs/01-requirements/advanced-edition/modules/07-retention-log-governance.md`
- `docs/01-requirements/advanced-edition/modules/08-organization-ai-generation.md`
- `docs/01-requirements/advanced-edition/stories/epic-06-retention-log-governance.md`
- `docs/01-requirements/traceability/2026-07-02-role-auth-training-ops-decision-package.md`
- `docs/01-requirements/traceability/2026-07-02-current-thread-requirement-reconciliation-ledger.md`
- `docs/01-requirements/traceability/2026-07-02-ui-ux-requirement-design-baseline-gap-analysis.md`
- `docs/01-requirements/traceability/2026-07-02-admin-model-prompt-log-governance-ui-ux-contract.md`
- `docs/01-requirements/traceability/2026-07-02-ai-generation-requirements-ssot-alignment.md`
- `docs/05-execution-logs/acceptance/2026-07-10-0704-post-peripheral-acceptance-ledger.md`
- recent 2026-07-10 organization admin surface and model/Prompt/log governance evidence

## Readiness

- Private credential index preflight: metadata-only, pass, 9 core role labels found.
- Credential values output: none.
- Browser login, direct DB access, Provider execution, staging/prod/deploy/env/secret/Cost Calibration: blocked.

## Acceptance Targets

- Governed operations emit or preserve `audit_log` categories for authorization creation/upgrade/revocation, employee
  import/disable, training publish, resource publish, and model configuration changes.
- Global `audit_log` / `ai_call_log` views remain scoped to `super_admin` and `ops_admin`.
- Content, organization, learner, and employee views do not expose global audit/log data.
- Organization admins cannot see employee raw answers, learner AI raw results, Provider payloads, Prompt bodies, full
  question/paper/material/resource/chunk content, or plaintext `redeem_code` through logs.
- Eligible operations plaintext `redeem_code` product UI exception does not leak into evidence, runtime logs, audit
  summaries, exports, screenshots, or non-eligible role views.
- Audit DTOs and UI surfaces expose redacted metadata, business action/status categories, public references where
  allowed, and summary-only visibility.

## Validation Plan

1. Inspect source and tests for audit event category coverage across authorization, employee, training, resource, model,
   and card-governance operations.
2. Inspect route/service/contract markers for global log role scoping, summary-only DTOs, blocked export/delete/archive
   controls, and raw-content denial.
3. Run focused tests for audit log route handlers, admin AI audit/log baseline, card plaintext audit redaction,
   organization admin privacy, resource lifecycle audit markers, training/analytics privacy, and model config audit
   metadata.
4. Record only role labels, route/control labels, status categories, command names, and test counts.
5. If a true product defect is found, stop this validation task, record redacted evidence, and open a separate repair
   branch before continuing the queue.

## Adversarial Review Checklist

- Role boundary: non-super/non-ops roles cannot access global `audit_log` or `ai_call_log`.
- Data boundary: audit/log DTOs exclude raw request bodies, secrets, Provider payloads, Prompt bodies, raw AI content,
  raw employee answers, full content payloads, and database rows.
- Employee/admin boundary: organization admins see summaries/status only and cannot access employee raw answers or
  learner AI raw results through any log path.
- Plaintext exception boundary: eligible operations UI card reveal remains a product UI exception only and does not enter
  audit summaries or evidence.
- Export/delete/archive boundary: first-release logs remain read-only and do not expose export, archive, hard-delete, or
  raw sensitive-content viewer controls.
- Environment boundary: no direct DB, Provider, env/secret, staging/prod/deploy, browser screenshot/raw DOM, package, or
  lockfile action.

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
