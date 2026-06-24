# 2026-06-23 Advanced AI Entry UI/UX Contract Task Plan

## Task

- Task id: `acceptance-advanced-ai-entry-ui-ux-contract-2026-06-23`
- Branch: `codex/advanced-ai-entry-ui-ux-contract-20260623`
- Baseline commit: `6897ee2d4be167298e50dfab761041a04d368d49`
- Owner model: laozhuang is the acceptance owner; Codex is execution and evidence assistant only.

## Goal

Create a clear UI/UX acceptance contract for advanced AI entries so later implementation can be judged without ambiguity. The contract must explain, in natural language, where personal advanced learners, organization advanced employees, advanced organization admins, and content admins should find AI question generation and AI paper generation. It must also record related navigation blockers found during owner walkthrough: hidden URL-only access, wrong admin landing route, missing backend logout, and unclear content/ops workspace separation.

## Standards Read

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/**`
- `docs/03-standards/ui-code.md`
- `docs/02-architecture/system-design/frontend/01-style-tone.md`
- `docs/02-architecture/system-design/frontend/03-component-inventory.md`
- `docs/02-architecture/system-design/frontend/04-page-wireframes.md`
- Product Design skills:
  - `product-design:index`
  - `product-design:get-context`
  - `product-design:user-context`
  - `product-design` critical overrides

## Source Context

- `docs/01-requirements/traceability/2026-06-23-advanced-ai-generation-scope-clarification.md`
- `docs/01-requirements/traceability/2026-06-21-content-admin-ai-generation-scope-decision.md`
- `docs/01-requirements/traceability/capability-catalog.md`
- `docs/01-requirements/use-cases/use-case-catalog.md`
- `src/components/StudentAppLayout/StudentAppLayout.tsx`
- `src/features/student/home/StudentHomePage.tsx`
- `src/features/student/ai-generation/StudentPersonalAiGenerationPage.tsx`
- `src/features/student/organization-training/StudentOrganizationTrainingPage.tsx`
- `src/components/AdminDashboardLayout/AdminDashboardLayout.tsx`
- `src/server/contracts/user-auth/session-boundary.ts`
- Relevant unit tests for student home, personal AI generation, organization training, and admin dashboard navigation.

## Scope

Allowed:

- Create the UI/UX acceptance contract.
- Record static evidence and owner-walkthrough findings.
- Register this task in project state and queue.
- Run docs/static validation only.

Blocked:

- Source code, UI route, component, hook, service, fixture, or e2e changes.
- Browser runtime, Playwright runtime, dev server start, database seed/write, schema/migration, Provider/model calls, env/secret access, dependency changes, staging/prod/deploy, payment, PR, force push, Cost Calibration, or final acceptance Pass.

## Plan

1. Read existing requirement decisions and UI standards.
2. Scan current learner and backend navigation implementation.
3. Write the acceptance contract in natural language.
4. Record evidence and audit review.
5. Update project state and task queue.
6. Run docs validation and record results.

## Risk Controls

- Do not expose credentials, tokens, provider payloads, raw prompts, generated AI content, database rows, or private content.
- Treat URL-only availability as a blocker, not as entry acceptance.
- Separate learner AI generation, organization-owned AI generation, content-admin draft adoption, and ops audit/log surfaces.
- Keep this task docs-only so implementation can be approved separately.

## Closeout Addendum

- 2026-06-24: Owner asked Codex to handle remaining unprocessed branches and keep the repository clean.
- This task may be committed, merged to `master`, pushed to `origin/master`, and cleaned up as a docs-only contract artifact.
- This closeout does not approve runtime acceptance, Provider/model execution, Cost Calibration, staging/prod, payment, source implementation, or final MVP Pass.
