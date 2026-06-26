# Learner Employee AI Paper Action Enabled-State Repair Task Plan

Task id: `learner-employee-ai-paper-action-enabled-state-repair-2026-06-25`

## Fresh Approval

The active goal approves continuing with the next smallest local source repair after the full eight-row browser rerun
remained blocked. DB/seed/schema/migration, Provider/Cost, staging/prod, payment, external service, dependency changes,
and final MVP Pass remain blocked unless separately approved.

## Runtime Input

- Full eight-row rerun showed the organization-training visible-list 500 blocker closed.
- Focused follow-up browser read confirmed standard personal learner and standard organization employee direct
  `/ai-generation` render the unavailable state; they are not the current source repair target.
- Advanced personal learner and advanced organization employee both show `AI出题` enabled and `AI组卷` disabled.

## Task Type

Small frontend local-contract source repair plus focused unit/browser rerun.

## SSOT Read List

- `AGENTS.md`
- `docs/04-agent-system/operating-manual.md`
- `docs/04-agent-system/sop/requirement-ssot-reading-governance.md`
- `docs/04-agent-system/sop/task-lifecycle-governance.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/01-requirements/traceability/2026-06-24-role-separated-mvp-requirement-alignment.md`
- `docs/01-requirements/traceability/role-experience-fulfillment-matrix.md`
- `docs/05-execution-logs/evidence/2026-06-25-role-separated-full-8-row-post-org-training-visible-list-repair-browser-rerun.md`

## Allowed Scope

- `src/features/student/ai-generation/StudentPersonalAiGenerationPage.tsx`
- `tests/unit/student-personal-ai-generation-ui.test.ts`
- This task plan, evidence, audit-review, `project-state.yaml`, and `task-queue.yaml`.
- Local browser rerun for the four learner/employee AI rows using approved local private credentials with redacted
  evidence.

## Blocked Scope

- DB writes, seed writes, schema/migration, account/user/employee/authorization mutation.
- Provider configuration, Provider/model calls, Cost/quota/pricing measurement, staging/prod/deploy, payment, external
  services.
- `.env*`, package/lockfile, dependency changes, unrelated source files, screenshots/traces/raw DOM/raw credentials.
- Standard/Advanced MVP final Pass claim.

## Implementation Approach

- Keep the existing authorization guard and unavailable state.
- Add a second local-contract request draft for `taskType: "ai_paper_generation"` using the same safe local browser
  experience route.
- Enable `AI组卷` only when the page has a valid advanced AI session and is not checking/loading/unavailable.
- Reuse the existing submit path with a task-kind parameter so both buttons re-check session and effective
  authorization before posting.
- Add focused unit coverage proving advanced rows can trigger `ai_paper_generation` and standard/unavailable rows still
  cannot.

## Validation Plan

- `npm.cmd run test:unit -- tests/unit/student-personal-ai-generation-ui.test.ts`
- Focused browser rerun for `personal_standard_student`, `personal_advanced_student`, `org_standard_employee`, and
  `org_advanced_employee` on `/ai-generation`.
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `npx.cmd prettier --check --ignore-unknown` on scoped files.
- `git diff --check`
- Module Run v2 pre-commit hardening and pre-push readiness.
