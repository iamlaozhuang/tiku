# 2026-07-03 Organization Analytics Source Landing Plan

## Task

`organization-analytics-source-landing-2026-07-03`

## SSOT Read List

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/03-standards/ui-code.md`
- `docs/02-architecture/adr/adr-001-tech-stack-selection.md`
- `docs/02-architecture/adr/adr-002-runtime-architecture-and-multi-client-contract.md`
- `docs/02-architecture/adr/adr-003-workplace-desktop-web-compatibility.md`
- `docs/02-architecture/adr/adr-004-environment-isolation-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-005-staging-architecture-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-006-runtime-dependency-alignment.md`
- `docs/02-architecture/adr/adr-007-edition-aware-authorization-source-of-truth.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/01-requirements/00-index.md`
- `docs/01-requirements/advanced-edition/00-index.md`
- `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`
- `docs/01-requirements/advanced-edition/modules/05-organization-analytics.md`
- `docs/01-requirements/advanced-edition/stories/epic-03-employee-answer-statistics.md`
- `docs/01-requirements/traceability/2026-07-02-ui-ux-requirement-design-baseline-gap-analysis.md`
- `docs/01-requirements/traceability/2026-07-02-role-auth-training-ops-decision-package.md`
- `docs/01-requirements/traceability/2026-07-02-current-thread-requirement-reconciliation-ledger.md`
- `docs/01-requirements/traceability/2026-07-02-organization-analytics-ui-ux-contract.md`
- `docs/05-execution-logs/evidence/2026-07-02-organization-analytics-ui-ux-contract.md`
- `docs/05-execution-logs/audits-reviews/2026-07-02-organization-analytics-ui-ux-contract.md`

## Requirement Mapping Result

- `UX-REQ-07`, `CT-REQ-020`: organization overview, training detail, employee summary, default 30-day range, 7/30/90/custom filters, weak-point summaries, small-sample warning, no export, no enterprise AI quota consumption summary.
- `UX-REQ-19`, `CT-REQ-038`, `CT-REQ-047`: enterprise-training analytics and formal `practice` / `mock_exam` aggregate signals must be shown as separate labeled sections.
- `CT-REQ-058`: current implementation must not preserve generic organization-admin wording or organization-admin enterprise AI quota summaries.
- Organization analytics UI/UX contract gaps `ORG-ANALYTICS-UX-GAP-01` through `ORG-ANALYTICS-UX-GAP-12` are the source landing checklist.

## Implementation Boundary

Allowed:

- Update the organization analytics admin UI to match the confirmed first-release contract.
- Update contracts/models/services/routes/repository validators and focused unit tests only where needed to support source-level contract proof.
- Redirect or deny the content-workspace organization analytics alias.
- Record redacted evidence and two adversarial review passes.

Blocked:

- No schema, migration, seed, direct database connection, raw row evidence, Provider call, model config read/write, prompt payload, dependency change, browser/e2e runtime, staging/prod deploy, export generation, release readiness, final Pass, production usability, or Cost Calibration.

## Implementation Plan

1. Materialize state and queue entry for this task.
2. Replace historical fixed timestamp inputs with dynamic 30-day defaults and 7/30/90/custom date-range controls.
3. Split enterprise-training analytics, formal learning aggregate signals, knowledge weak points, training detail, and employee summary into distinct sections.
4. Remove organization-admin enterprise AI quota consumption summary from route DTO/service UI.
5. Add small-sample/low-confidence and privacy panels using business wording, not policy-key primary copy.
6. Add employee summary pagination with page-size choices `20`, `50`, and `100` at the UI/source-contract level.
7. Redirect `/content/organization-analytics` away from content workspace ownership.
8. Run focused unit tests, `typecheck`, `lint`, `format:check`, `git diff --check`, and Module Run v2 gates.

## Risk Controls

- Keep changes narrow to existing organization analytics source contracts and tests.
- Keep formal learning signals aggregate-only and separated from enterprise-training metrics.
- Keep employee summaries redacted; do not expose raw answers, prompt, Provider payloads, raw AI output, cross-organization scope arrays, or internal ids.
- Preserve `org_standard_admin` unavailable state and `org_advanced_admin` service-enforced access.
