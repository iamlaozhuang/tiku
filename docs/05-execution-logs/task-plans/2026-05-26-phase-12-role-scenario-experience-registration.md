# Phase 12 Role Scenario Experience Registration Task Plan

## Task

- TaskId: `phase-12-role-scenario-experience-registration`
- Branch: `codex/phase-12-role-scenario-experience-registration`
- Goal: register the multi-role, scenario-based real-browser experience simulation and gap scan task group before any actual scan work begins.

## Read Standards

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/adr-001-tech-stack-selection.md`
- `docs/02-architecture/adr/adr-002-runtime-architecture-and-multi-client-contract.md`
- `docs/02-architecture/adr/adr-003-workplace-desktop-web-compatibility.md`
- `docs/02-architecture/adr/adr-004-environment-isolation-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-005-staging-architecture-and-release-boundaries.md`
- `docs/02-architecture/interfaces/student-experience-contract.md`
- `docs/02-architecture/interfaces/admin-ops-contract.md`
- `docs/02-architecture/interfaces/ai-rag-contract.md`
- `docs/02-architecture/interfaces/question-paper-contract.md`
- `docs/02-architecture/interfaces/runtime-slice-contract.md`
- `docs/02-architecture/interfaces/phase-11-role-based-full-flow-acceptance-contract.md`
- `docs/01-requirements/00-index.md`
- `docs/01-requirements/stories/epic-01-user-auth.md`
- `docs/01-requirements/stories/epic-02-question-paper.md`
- `docs/01-requirements/stories/epic-03-student-experience.md`
- `docs/01-requirements/stories/epic-04-ai-scoring.md`
- `docs/01-requirements/stories/epic-05-rag-knowledge.md`
- `docs/01-requirements/stories/epic-06-admin-ops.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/evidence/2026-05-25-phase-12-mvp-requirements-runtime-audit.md`
- `docs/05-execution-logs/evidence/2026-05-26-phase-12-model-config-local-mock-runtime.md`
- `docs/05-execution-logs/evidence/2026-05-26-phase-12-secret-env-provider-approval-plan.md`

## allowedFiles

- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/2026-05-26-phase-12-role-scenario-experience-registration.md`
- `docs/05-execution-logs/evidence/2026-05-26-phase-12-role-scenario-experience-registration.md`

## blockedFiles

- `package.json`
- `pnpm-lock.yaml`
- `package-lock.yaml`
- `package-lock.json`
- `.env.example`
- `.env.local`
- `src/**`
- `src/db/schema/**`
- `drizzle/**`
- `scripts/**`

## Roles And Scenario Scope

- `student`: login, authorization scopes, practice, mock_exam, exam_report, mistake_book, AI-assisted feedback surfaces.
- `admin`: `super_admin`, `ops_admin`, and `content_admin` admin surfaces for content, question, paper, authorization, organization, employee, model_config, logs.
- `organization` / `employee`: organization tree, employee binding, org_auth, occupancy, authorization loss, and account status boundaries.
- Unauthenticated and insufficient-permission users: route guards, API denial, no metadata leakage, and protected UI behavior.

## Experience Script Design

Register a task group that first writes role-specific scripts, then executes split gap scans:

1. `phase-12-role-scenario-script-plan`
   - Output role scripts with preconditions, steps, expected results, verification method, and risks.
2. `phase-12-student-experience-gap-scan`
   - Verify student flows against scripts with code inspection and local browser actions.
3. `phase-12-admin-experience-gap-scan`
   - Verify admin/content/ops/super-admin flows with code inspection and local browser actions.
4. `phase-12-auth-organization-boundary-gap-scan`
   - Verify no-login, insufficient-permission, organization, employee, and authorization boundary cases.
5. `phase-12-ai-redaction-runtime-gap-scan`
   - Verify mock AI, model_config, prompt_template, audit_log, ai_call_log, masking, and redaction boundaries.
6. `phase-12-experience-gap-closeout-plan`
   - Consolidate gap list and seed follow-up tasks by severity and scope.

## Browser Verification Plan

- Registration task: no browser operation.
- Follow-up scan tasks: use localhost only, no staging/prod/cloud/provider access.
- Verify critical paths with real browser operations and record only redaction-safe public labels, route names, counts, statuses, and observations.
- Do not record screenshots or traces containing secrets, tokens, Authorization headers, raw prompt/answer/model response/provider payload, full paper, full textbook, OCR full text, or customer-like private data.

## Code Cross-Check Paths

Follow-up tasks may read these paths but should not modify them unless a later task explicitly permits business fixes:

- `src/app`
- `src/features/student`
- `src/features/admin`
- `src/app/api/v1`
- `src/server/contracts`
- `src/server/services`
- `src/server/repositories`
- `src/server/mappers`
- `tests/unit`
- `e2e`

## Risk Defenses

- Register before scanning because the recovered queue has no pending task for this work.
- Keep registration docs-only and state-only.
- Do not modify runtime, UI, tests, package/lockfile, env, schema, migration, scripts, or deployment config.
- Leave real provider, secret, staging, prod, cloud, and deployment work blocked.
- Each follow-up task must close independently with task plan, evidence, validation, commit, merge, push, and branch cleanup.

## Validation Commands

- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-AgentSystemReadiness.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-NamingConventions.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`
- `git diff --check`

## Sensitive Information Red Lines

- Do not read, modify, or output `.env.local` or `.env.example`.
- Do not connect to provider/cloud/staging/prod or deploy.
- Do not record secrets, tokens, Authorization headers, database URLs, raw provider payloads, raw prompts, raw answers, raw model responses, full教材, full试卷, OCR full text, or customer-like private data.
