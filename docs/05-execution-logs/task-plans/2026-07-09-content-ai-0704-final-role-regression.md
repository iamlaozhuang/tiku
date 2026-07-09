# 2026-07-09 Content AI 0704 Final Role Regression Plan

## Task

- Task id: `content-ai-0704-final-role-regression-2026-07-09`
- Branch: `codex/content-ai-0704-final-role-regression`
- Goal contribution: after the content AI question and paper publish replays, run a final localhost role-boundary regression so the content-admin closed loop remains compatible with personal advanced learner, organization advanced employee, and organization advanced admin AI/training paths.
- Scope type: localhost 0704 regression and state/evidence closeout only. No product source repair in this branch.

## Required Reading

- `AGENTS.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/03-standards/ui-code.md`
- `docs/02-architecture/adr/adr-001-tech-stack-selection.md`
- `docs/02-architecture/adr/adr-002-runtime-architecture-and-multi-client-contract.md`
- `docs/02-architecture/adr/adr-003-workplace-desktop-web-compatibility.md`
- `docs/02-architecture/adr/adr-004-environment-isolation-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-005-staging-architecture-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-006-runtime-dependency-alignment.md`
- `docs/02-architecture/adr/adr-007-edition-aware-authorization-source-of-truth.md`
- `docs/01-requirements/00-index.md`
- `docs/01-requirements/advanced-edition/00-index.md`
- `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`
- `docs/01-requirements/traceability/2026-07-02-ai-generation-requirements-ssot-alignment.md`
- `docs/01-requirements/traceability/2026-07-02-phase4-requirements-agent-baseline-alignment.md`
- `docs/01-requirements/traceability/2026-07-05-ai-generation-closed-loop-target-alignment.md`
- `docs/01-requirements/traceability/2026-07-06-ai-generation-recontract-requirements-materialization.md`
- `docs/01-requirements/traceability/2026-07-02-role-auth-training-ops-decision-package.md`
- `docs/01-requirements/traceability/2026-07-02-current-thread-requirement-reconciliation-ledger.md`
- `docs/01-requirements/traceability/2026-07-02-ui-ux-requirement-design-baseline-gap-analysis.md`
- `docs/05-execution-logs/evidence/2026-07-09-content-ai-0704-question-publish-replay.md`
- `docs/05-execution-logs/evidence/2026-07-09-content-ai-0704-paper-publish-replay.md`
- `docs/05-execution-logs/evidence/2026-07-08-org-ai-training-loop-regression.md`
- `docs/05-execution-logs/evidence/2026-07-09-content-ai-local-e2e-regression.md`
- `src/app/api/v1/content-ai-generation-requests/**`
- `src/app/api/v1/questions/**`
- `src/app/api/v1/papers/**`
- `src/app/api/v1/student-papers/**`
- `src/app/api/v1/personal-ai-generation-requests/**`
- `src/app/api/v1/organization-ai-generation-requests/**`
- `src/app/api/v1/organization-trainings/**`
- `src/server/services/**`
- `src/server/repositories/**`
- `src/server/contracts/**`
- `src/server/validators/**`
- private acceptance account files under `D:/tiku-local-private/acceptance/**`, in memory only.

## Boundaries

- Localhost only: `127.0.0.1:3000` / `localhost`.
- Use existing local service only; do not output DB URL, env values, or credentials.
- Use private credentials only in memory for product login probes.
- Do not record session, cookie, token, localStorage, Authorization header, plaintext card, password, private file contents, raw DB rows, internal numeric ids, Provider payload, raw prompt, raw AI output, or full question/paper/material/resource/chunk content.
- No screenshots, raw DOM dumps, traces, Provider execution, staging/prod/deploy, Cost Calibration, package/lockfile, dependency, schema, migration, seed, direct DB mutation, destructive DB operation, PR, or force push.
- Product-route writes are not planned except ordinary login/session behavior needed for localhost probes. No publish, takedown, submit, account, card, fixture, or content mutation is planned.
- If a current code defect is reproduced, stop this branch at redacted symptom/root-cause evidence and open a separate single-issue `codex/` repair branch from latest `origin/master`.

## Execution Steps

1. Confirm branch, master/origin alignment, and clean working tree.
2. Confirm the task pointer and queue entry are active for this branch.
3. Run redacted localhost API probes:
   - content AI question history has a target-ready formal question and the formal question is available;
   - content AI paper history has a target-ready formal paper and the formal paper is published;
   - content published paper list contains the target;
   - authorized learner paper list contains the published target from the prior paper replay fixture;
   - organization training and AI boundaries are checked at aggregate/status level only where private accounts permit safe login.
4. Run targeted regression tests for content AI/formal content, personal learner AI, and organization training/role boundaries.
5. Run lint, typecheck, `git diff --check`, scoped Prettier check, Module Run v2 precommit, and prepush readiness.
6. Write redacted evidence and adversarial review.
7. Commit, fast-forward merge to `master`, run master gates, push `origin/master`, delete the short branch, and confirm clean/aligned.

## Expected Validation

- Redacted localhost content AI question/paper target status probe: pass.
- Redacted learner published paper visibility probe: pass.
- Adjacent personal learner AI regression: pass.
- Adjacent organization training and organization AI role-boundary regression: pass.
- `corepack pnpm@10.26.1 lint`: pass.
- `corepack pnpm@10.26.1 typecheck`: pass.
- `git diff --check`: pass.
- `corepack pnpm@10.26.1 exec prettier --check --ignore-unknown <scoped files>`: pass.
- Module Run v2 precommit hardening: pass.
- Module Run v2 prepush readiness: pass.

## Adversarial Review Focus

- Content AI adoption/publish closure stays in content/formal draft domain and does not bypass publish validation.
- Content AI组卷 remains plan-and-select from eligible formal sources; no Provider full-question paper generation is claimed.
- Standard personal, organization standard employee, and organization standard admin remain denied or unavailable for advanced AI/training paths.
- Personal advanced learner, organization advanced employee, and organization advanced admin paths are not regressed by content-admin publish replay.
- Enterprise training remains separate from platform formal `paper`, `question`, `mock_exam`, `exam_report`, and `mistake_book`.
- Evidence remains redacted and records only route labels, role labels, status categories, aggregate counts, and pass/fail outcomes.
