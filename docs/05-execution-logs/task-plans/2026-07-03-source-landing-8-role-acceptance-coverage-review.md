# 2026-07-03 Source Landing 8 Role Acceptance Coverage Review Plan

## Task

- Task ID: `source-landing-8-role-acceptance-coverage-review-2026-07-03`
- Branch: `codex/source-landing-8-role-acceptance-coverage-review-2026-07-03`
- Depends on: `source-landing-8-role-local-acceptance-rerun-2026-07-03`
- Goal: produce a read-only credential-backed versus fixture-first coverage acceptance checklist, then recommend the next serial work orchestration.

## Read Sources

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/01-requirements/00-index.md`
- `docs/01-requirements/advanced-edition/00-index.md`
- `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`
- `docs/02-architecture/adr/adr-007-edition-aware-authorization-source-of-truth.md`
- `docs/01-requirements/traceability/2026-07-03-source-landing-16-package-execution-map.md`
- `docs/01-requirements/traceability/2026-07-02-ui-ux-requirement-design-baseline-gap-analysis.md`
- `docs/01-requirements/traceability/2026-07-02-role-auth-training-ops-decision-package.md`
- `docs/01-requirements/traceability/2026-07-02-current-thread-requirement-reconciliation-ledger.md`
- Current 8-role rerun report/evidence/audit and the 16-package acceptance materials.
- Read-only e2e source inspection by safe pattern search only; no credential values recorded.

## Execution Rules

- This task is docs/state only.
- Do not run acceptance, Playwright, browser, dev server, DB, Provider, env-secret access, staging/prod, or deployment.
- Do not modify product source, test source, schema, migrations, scripts, package manifests, or lockfiles.
- Classify each role by coverage mode instead of treating every `pass` as identical.
- Use adversarial review: route-fulfilled and fixture-first coverage can support current local acceptance evidence only when explicitly named; it cannot be silently upgraded to seeded credential-backed coverage.

## Outputs

- Coverage acceptance checklist.
- Next-work orchestration recommendation.
- Redacted evidence and audit.
- `project-state.yaml` and `task-queue.yaml` task metadata.

## Validation

- Scoped Prettier check.
- `git diff --check`.
- Module Run v2 pre-commit hardening.
- Module Run v2 pre-push readiness.
