# Task Plan: advanced-admin-ai-ops-model-config-public-identifier-redaction-affordance

## Scope

- Task kind: TDD UI-only implementation.
- Branch: `codex/advanced-admin-ai-ops-model-config-public-identifier-redaction-affordance`.
- Baseline: `master == origin/master == 5d29b6005b826eb7cf99046137d560d8758f8864` before branch creation.
- Objective: collapse or redact default model-config public identifier display on the admin AI ops page while preserving
  admin configuration binding through existing local readonly/mutation contracts.

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
- `docs/05-execution-logs/evidence/2026-06-15-advanced-admin-ai-ops-model-config-public-identifier-display-policy-readonly-audit.md`
- `docs/05-execution-logs/audits-reviews/2026-06-15-advanced-admin-ai-ops-model-config-public-identifier-display-policy-readonly-audit.md`

## Allowed Writes

- `src/features/admin/model-config-management/AdminModelConfigManagement.tsx`
- `src/app/(admin)/ops/ai-audit-logs/AdminAiAuditLogOpsBaseline.test.tsx`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/2026-06-15-advanced-admin-ai-ops-model-config-public-identifier-redaction-affordance.md`
- `docs/05-execution-logs/evidence/2026-06-15-advanced-admin-ai-ops-model-config-public-identifier-redaction-affordance.md`
- `docs/05-execution-logs/audits-reviews/2026-06-15-advanced-admin-ai-ops-model-config-public-identifier-redaction-affordance.md`

## Blocked Gates

- No `.env*` read/write/output.
- No DB access or direct row/private data read.
- No provider/model call or provider configuration.
- No provider payload, raw prompt, or raw answer inspection.
- No quota/cost measurement and no Cost Calibration Gate work.
- No dev server, Browser, Playwright, or e2e.
- No staging/prod/cloud/deploy/payment/external-service access.
- No schema, drizzle, scripts, package, lockfile, dependency, route, service, repository, or API contract changes.
- No formal adoption target write.
- No public identifier value list exposure in evidence.
- No PR and no force push.

## TDD Plan

1. RED: add a focused unit test against `AdminAiAuditLogOpsBaseline` requiring the model-config management surface to:
   - hide visible model provider/config/template public identifier values by default;
   - keep non-visible `data-public-id` metadata for row/action binding;
   - display `metadata-only` and `redacted` semantics on the model-config row;
   - preserve existing loading/error/formal-review coverage.
2. Verify RED by running the scoped unit test and recording the expected failure.
3. GREEN: implement the smallest UI-only change in `AdminModelConfigManagement.tsx`.
4. Verify GREEN with the scoped unit test, then run diff check, lint, typecheck, and Module Run v2 closeout gates.

## Implementation Notes

- Keep form inputs for provider/fallback public identifier references; they are configuration inputs, not default row text.
- Default row display should describe identifier fields as folded/redacted metadata, not render identifier values.
- Keep existing toggle callbacks and route parameter binding unchanged.
- Do not add dependencies or route/service/repository changes.
