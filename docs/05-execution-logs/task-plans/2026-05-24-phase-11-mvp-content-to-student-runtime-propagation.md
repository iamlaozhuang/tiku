# Task Plan: phase-11-mvp-content-to-student-runtime-propagation

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:test-driven-development for runtime changes and superpowers:verification-before-completion before commit/merge/push. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Prove and close the local propagation loop from newly published content ops paper snapshots into authorized student `student-papers`, `practice`, `mock_exam`, `exam_report`, and `mistake_book` runtime surfaces without relying on read-only, entry-only, or seed-only assumptions.

**Architecture:** Preserve ADR-002 route-handler -> service -> repository/model layering and the local Next.js REST boundary. Reuse existing student paper, practice, mock_exam, exam_report, and mistake_book services/contracts where possible. Keep the task local-dev only; do not add dependencies, schema, migrations, scripts, staging/prod connections, deployments, cloud resources, or real providers.

**Tech Stack:** Next.js App Router route handlers, React student UI, TypeScript service layer, Vitest + Testing Library, existing e2e where applicable.

---

## Task Claim

- Task id: `phase-11-mvp-content-to-student-runtime-propagation`
- Branch: `codex/phase-11-mvp-content-to-student-runtime-propagation`
- Phase: `phase-11-staging-release-planning`
- Human approval: user approved continuing the 16 MVP gap tasks with commit, merge, push, and safe branch cleanup. This task is limited to local propagation from published content to student runtime flows.

## Boundary

This task may modify student paper/practice/mock_exam/exam_report/mistake_book API, service, contract, student UI, tests, task plan/evidence, and queue state only.

This task must not:

- change dependencies, `package.json`, or lockfiles;
- read or output `.env.local`;
- change secrets or env files;
- change schema, migration, or scripts;
- create cloud resources or object storage buckets;
- deploy;
- connect to `staging` or `prod`;
- call external providers;
- record secrets, tokens, Authorization headers, raw provider payloads, raw prompts, raw answers, raw model responses, full paper/material/OCR text, generated plaintext `redeem_code` values, or private data.

If completing propagation requires schema, migration, script, dependency, real provider, storage, or major permission-model work, stop and record an approval-gated follow-up.

## Required Reading

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/02-architecture/interfaces/phase-11-staging-release-planning-contract.md`
- `docs/04-agent-system/sop/mvp-queue-runner.md`
- `docs/04-agent-system/sop/repository-hygiene-closeout-checklist.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/01-requirements/modules/02-question-paper.md`
- `docs/01-requirements/modules/03-student-experience.md`
- `docs/01-requirements/stories/epic-02-question-paper.md`
- `docs/01-requirements/stories/epic-03-student-experience.md`
- `docs/05-execution-logs/audits-reviews/2026-05-24-phase-11-mvp-functional-completeness-gap-audit.md`
- `docs/05-execution-logs/evidence/2026-05-24-phase-11-mvp-content-ops-paper-composition-publish-loop.md`

## AC-to-Runtime Matrix

| Acceptance criterion                                                                                                      | Runtime surface                                              | Current state   | Implementation evidence                                                                            | Downstream effect                                       | Remaining gap | Decision                                   |
| ------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------ | --------------- | -------------------------------------------------------------------------------------------------- | ------------------------------------------------------- | ------------- | ------------------------------------------ |
| MVP-GAP-003: newly authored/published content appears in authorized student flows                                         | `/api/v1/student-papers`, `/home`, student paper service     | fixture-only    | Add RED test proving a newly published local paper publicId is absent or not propagated before fix | Student sees content ops output, not only seeded papers | Pending       | implement                                  |
| US-03-01 AC-1/3/4/5: authorized paper list by profession/level/subject with practice/mock entries and publish ordering    | `/api/v1/student-papers`, student home UI                    | partial_runtime | Targeted unit/API tests and existing UI tests                                                      | Student home reflects current published content         | Pending       | implement                                  |
| US-03-02/03 and US-03-05/06 entry propagation: selected published paper starts practice/mock_exam with correct snapshot   | `/api/v1/practices`, `/api/v1/mock-exams`, student UI routes | partial_runtime | RED/GREEN service and UI tests for newly published paper publicId                                  | Fresh content enters answer workflows                   | Pending       | implement                                  |
| US-03-07/08/09 downstream records: submitted mock/practice creates report and mistake_book behavior from current snapshot | `/api/v1/exam-reports`, `/api/v1/mistake-books`              | partial_runtime | Targeted tests if local runtime already supports it; otherwise record bounded residual             | Reports and mistake_book reflect propagated content     | Pending       | implement or defer with evidence           |
| Authorization and archive boundary: unauthorized/archived content is hidden or terminates active flows                    | student services and API routes                              | partial_runtime | Tests for allowed local states without changing permission model                                   | Prevents stale or unauthorized content exposure         | Pending       | implement within existing permission model |

## TDD Plan

1. [x] RED: inspect current student services/tests and add a failing test that starts from a newly published content paper publicId rather than seed-only student fixtures.
2. [x] GREEN: wire propagation through existing services/contracts so `student-papers`, `practice`, and `mock_exam` can consume the newly published paper snapshot locally.
3. [x] Extend or add focused tests for authorization visibility, publish ordering, and archive/termination behavior where existing runtime supports it.
4. [x] Verify downstream `exam_report` and `mistake_book` behavior from the propagated snapshot; record any residual gaps with P-level grading.
5. [ ] Run queue validation commands, update evidence, closeout checklist, commit, merge, push, cleanup, then claim the next queued task only from a clean repo.

## Allowed Files

- `src/app/api/v1/student-papers/**`
- `src/app/api/v1/practices/**`
- `src/app/api/v1/mock-exams/**`
- `src/app/api/v1/exam-reports/**`
- `src/app/api/v1/mistake-books/**`
- `src/features/student/**`
- `src/server/contracts/**`
- `src/server/services/**`
- `tests/unit/**`
- `e2e/**`
- `docs/05-execution-logs/task-plans/**`
- `docs/05-execution-logs/evidence/**`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`

## Blocked Files

- `package.json`
- `pnpm-lock.yaml`
- `package-lock.json`
- `.env.example`
- `.env.local`
- `drizzle/**`
- `scripts/**`

## Validation Commands

- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-TaskClaimReadiness.ps1 -TaskId phase-11-mvp-content-to-student-runtime-propagation`
- `npm.cmd run test:unit`
- `npm.cmd run test:e2e`
- `npm.cmd run build`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-AgentSystemReadiness.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-NamingConventions.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`

## Risk Controls

- Treat seed-only success as insufficient; tests must use a newly published/local content paper publicId or clearly mark remaining fixture-only behavior.
- Do not change the authorization permission model beyond existing local surfaces.
- Do not introduce real provider, schema, migration, dependency, storage, staging/prod, deployment, or script work.
- Keep evidence redacted and avoid full paper/question/material content.
- Preserve student loading, empty, unauthorized, terminated, and error states.
