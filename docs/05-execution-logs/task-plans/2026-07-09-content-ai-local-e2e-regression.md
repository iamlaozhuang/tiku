# 2026-07-09 content AI local e2e regression plan

## Task

- Task id: `content-ai-local-e2e-regression-2026-07-09`
- Branch: `codex/content-ai-local-e2e-regression`
- Base: `origin/master` at `476379dbd`
- Goal: run localhost-only acceptance regression for content-admin AI出题/AI组卷 closed loops and adjacent advanced-role AI/training boundaries before claiming the serial goal complete.

## Read Before Action

- `AGENTS.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/03-standards/ui-code.md`
- `docs/02-architecture/adr/adr-001-tech-stack-selection.md` through `adr-007-edition-aware-authorization-source-of-truth.md`
- `docs/01-requirements/00-index.md`
- `docs/01-requirements/modules/02-question-paper.md`
- `docs/01-requirements/modules/03-student-experience.md`
- `docs/01-requirements/modules/05-rag-knowledge.md`
- `docs/01-requirements/modules/06-admin-ops.md`
- `docs/01-requirements/advanced-edition/00-index.md`
- `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`
- `docs/01-requirements/advanced-edition/modules/02-ai-task-domain.md`
- `docs/01-requirements/advanced-edition/modules/03-personal-ai-generation.md`
- `docs/01-requirements/advanced-edition/modules/04-organization-training.md`
- `docs/01-requirements/advanced-edition/modules/08-organization-ai-generation.md`
- `docs/01-requirements/advanced-edition/stories/epic-01-personal-ai-generation.md`
- `docs/01-requirements/advanced-edition/stories/epic-02-organization-training.md`
- `docs/01-requirements/advanced-edition/stories/epic-05-formal-content-separation.md`
- `docs/01-requirements/advanced-edition/stories/epic-07-organization-ai-generation.md`
- `docs/01-requirements/traceability/2026-07-02-ai-generation-requirements-ssot-alignment.md`
- `docs/01-requirements/traceability/2026-07-02-phase4-requirements-agent-baseline-alignment.md`
- `docs/01-requirements/traceability/2026-07-05-ai-generation-closed-loop-target-alignment.md`
- `docs/01-requirements/traceability/2026-07-06-ai-generation-recontract-requirements-materialization.md`
- `docs/01-requirements/traceability/2026-07-07-full-role-uiux-source-implementation-entry.md`
- `docs/01-requirements/traceability/2026-07-07-full-role-ui-remediation-baseline.md`
- `docs/01-requirements/traceability/2026-07-07-full-role-uiux-batch-5-content-admin-cross-role-closure.md`
- `docs/01-requirements/traceability/2026-07-08-knowledge-node-resource-ai-closure-plan.md`
- Recent 2026-07-08 and 2026-07-09 evidence/audit for content AI adoption/detail/publish/traceability, organization AI parameter/RAG/section validation, and organization training loop regression.
- Relevant route, UI, service, and test files for content AI, learner AI, organization AI, and organization training.

## Safety Boundary

- Localhost / `127.0.0.1` only.
- No Provider-enabled execution.
- No env, secret, DB URL, session, cookie, token, localStorage, or Auth header value reading or recording.
- No direct DB connection or mutation unless separately approved; this branch will not use direct DB access.
- No screenshots, raw DOM dumps, traces, or browser storage capture without fresh approval.
- No package, lockfile, schema, migration, seed, fixture, staging, production, deploy, or Cost Calibration action.
- Evidence records only route names, role labels, visible state labels, aggregate counts, command names, and pass/fail status.

## Acceptance Matrix

- Content backend:
  - AI出题 current closed loop visible: current result can be reviewed, adopted/rejected, entered as formal question draft, published through formal question path, and not immediately user-usable before publish.
  - AI组卷 current closed loop visible: current result uses platform formal question references, lands as formal paper draft with section/question composition, and publishes through formal paper path.
  - Traceability summary visible without raw AI/provider/material/question/paper content.
- Enterprise training:
  - `org_advanced_admin` AI出题 and AI组卷 outputs can be copied into organization training draft semantics.
  - Training list filters, states, detail, copy, publish/takedown boundaries remain distinct for question training and paper training.
  - `org_advanced_employee` sees only published organization training and can answer within employee boundary.
- Role and edition boundary:
  - `personal_advanced_student` and `org_advanced_employee` keep learner `AI训练` paths.
  - `personal_standard_student`, `org_standard_employee`, and `org_standard_admin` remain hidden, denied, upgrade-guided, or unavailable for advanced AI/training capabilities.
  - `super_admin` does not bypass content lifecycle or organization-context requirements.
  - `content_admin` content AI semantics are not mixed with enterprise training semantics.

## Execution Plan

1. Confirm branch, baseline, and clean state.
2. Run source-level regression groups that cover content AI closed loops and adjacent personal/organization role boundaries.
3. If browser tooling is needed, use the in-app browser only after reading the browser-control skill; collect only redacted visible-state evidence.
4. If a current code defect is observed, stop acceptance, record the phenomenon with redacted evidence, locate root cause by read-only code investigation, then open a separate single-issue `codex/*` fix branch from latest `origin/master`.
5. If no blocker is observed, write evidence/audit, run quality gates, commit, fast-forward merge, master gates, push, delete branch, and confirm clean/aligned.

## Validation Commands

- `corepack pnpm@10.26.1 exec vitest run tests/unit/admin-ai-generation-entry-surface.test.ts tests/unit/admin-question-material-ui.test.ts tests/unit/admin-paper-ui.test.ts --reporter=dot`
- `corepack pnpm@10.26.1 exec vitest run src/server/services/admin-ai-generation-formal-draft-adapter.test.ts src/lib/admin-ai-generation-formal-draft-payload.test.ts src/server/services/paper-draft-service.test.ts src/server/services/admin-ai-generation-local-contract-route.test.ts --reporter=dot`
- `corepack pnpm@10.26.1 exec vitest run src/server/services/personal-ai-generation-request-route.test.ts src/server/services/personal-ai-generation-result-route.test.ts src/features/student/ai-generation/StudentPersonalAiGenerationPage.test.tsx tests/unit/student-personal-ai-generation-ui.test.ts --reporter=dot`
- `corepack pnpm@10.26.1 exec vitest run src/server/services/organization-training-route.test.ts src/server/services/organization-training-service.test.ts tests/unit/organization-training-admin-entry-surface.test.ts tests/unit/organization-training-employee-entry-surface.test.ts tests/unit/organization-portal-admin-entry-surface.test.ts tests/unit/admin-dashboard-layout-navigation.test.ts --reporter=dot`
- `corepack pnpm@10.26.1 run typecheck`
- `corepack pnpm@10.26.1 run lint`
- `git diff --check`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId content-ai-local-e2e-regression-2026-07-09`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId content-ai-local-e2e-regression-2026-07-09 -SkipRemoteAheadCheck`

## Adversarial Checks

- Role boundary: no standard role gains advanced AI or enterprise training capability.
- Data boundary: no internal numeric id, credential, session material, DB row, Provider payload, prompt, raw AI output, or complete content appears in evidence.
- Domain boundary: content-admin formal draft review/publish remains separate from organization training draft/publish and learner AI training.
- Regression boundary: shared AI generation parameter/RAG/plan validation changes are not weakened.
- Release boundary: no release readiness, production usability, staging/prod, Provider-enabled, or Cost Calibration claim.
