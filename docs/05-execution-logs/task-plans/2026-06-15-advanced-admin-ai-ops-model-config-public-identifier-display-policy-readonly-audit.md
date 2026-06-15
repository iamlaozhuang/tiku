# Task Plan: advanced-admin-ai-ops-model-config-public-identifier-display-policy-readonly-audit

## Scope

- Task kind: readonly audit and policy decision.
- Branch: `codex/advanced-admin-ai-ops-model-config-public-identifier-display-policy-readonly-audit`.
- Baseline: `master == origin/master == 974f46f0c718f432b7c44963b727fa53ece822f4` before branch creation.
- Objective: decide whether same-page admin AI ops model-config public identifier display is an allowed admin diagnostics
  exception or should be hidden/collapsed by default.

## Required Reading

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
- `docs/01-requirements/traceability/capability-catalog.md`
- `docs/04-agent-system/state/advanced-edition-code-stage-seeding-plan.yaml`
- `docs/05-execution-logs/evidence/2026-06-15-advanced-admin-ai-audit-log-public-identifier-redaction-affordance.md`
- `docs/05-execution-logs/audits-reviews/2026-06-15-advanced-admin-ai-audit-log-public-identifier-redaction-affordance.md`
- `docs/05-execution-logs/evidence/2026-06-15-advanced-admin-ai-audit-log-public-identifier-redaction-readonly-recheck.md`
- `docs/05-execution-logs/audits-reviews/2026-06-15-advanced-admin-ai-audit-log-public-identifier-redaction-readonly-recheck.md`

## Readonly Files

- `src/app/(admin)/ops/ai-audit-logs/page.tsx`
- `src/app/(admin)/ops/ai-audit-logs/AdminAiAuditLogOpsBaseline.tsx`
- `src/app/(admin)/ops/ai-audit-logs/AdminAiAuditLogOpsBaseline.test.tsx`
- `src/features/admin/model-config-management/AdminModelConfigManagement.tsx`
- `src/server/contracts/admin-ai-audit-log-ops-contract.ts`
- `src/server/services/admin-ai-audit-log-runtime.ts`
- `src/server/services/admin-ai-audit-log-ops-route.ts`
- `src/server/services/admin-ai-audit-log-ops-service.ts`
- `src/server/services/model-config-runtime.ts`
- `src/app/api/v1/model-providers/**`
- `src/app/api/v1/model-configs/**`
- `src/app/api/v1/prompt-templates/**`

## Allowed Writes

- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/2026-06-15-advanced-admin-ai-ops-model-config-public-identifier-display-policy-readonly-audit.md`
- `docs/05-execution-logs/evidence/2026-06-15-advanced-admin-ai-ops-model-config-public-identifier-display-policy-readonly-audit.md`
- `docs/05-execution-logs/audits-reviews/2026-06-15-advanced-admin-ai-ops-model-config-public-identifier-display-policy-readonly-audit.md`

## Blocked Gates

- No `.env*` read/write/output.
- No DB access or direct row/private data read.
- No provider/model call or provider configuration.
- No provider payload, raw prompt, or raw answer inspection.
- No quota/cost measurement and no Cost Calibration Gate work.
- No dev server, Browser, Playwright, or e2e.
- No staging/prod/cloud/deploy/payment/external-service access.
- No schema, drizzle, scripts, package, lockfile, dependency, route, service, repository, UI, test, or API contract changes.
- No formal adoption target write.
- No public identifier value list exposure in evidence.
- No PR and no force push.

## Audit Method

1. Confirm admin AI ops page-level copy and embedded model-config management surface.
2. Compare audit-log-row redaction policy with model-config fields, visible labels, row metadata, and route path use.
3. Check ADR-002 layering and API contract implications without changing product code.
4. Record a clear policy decision and any needs_recheck item.
5. Run scoped local validation and closeout gates.

## Expected Output

- Evidence and audit review with a clear policy conclusion.
- No product implementation.
- Recommendation for the next task only if the policy decision requires a follow-up.
