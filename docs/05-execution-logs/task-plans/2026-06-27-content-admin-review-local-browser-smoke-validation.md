# Content Admin Review Local Browser Smoke Validation

Task: `content-admin-review-local-browser-smoke-validation-approval-2026-06-27`

## Governance Inputs

- Fresh user approval: `current_user_fresh_serial_tasks_1_and_2_approval_2026_06_27`.
- Queue source: `docs/04-agent-system/state/task-queue.yaml`.
- Project state: `docs/04-agent-system/state/project-state.yaml`.
- Code taste rules: `docs/03-standards/code-taste-ten-commandments.md`.
- ADRs read before work: `docs/02-architecture/adr/adr-001` through `adr-007`.
- SOPs read before work:
  - `docs/04-agent-system/operating-manual.md`
  - `docs/04-agent-system/sop/task-lifecycle-governance.md`
  - `docs/04-agent-system/sop/requirement-ssot-reading-governance.md`
  - `docs/04-agent-system/sop/local-first-validation-governance.md`
- Requirement SSOT read before work:
  - `docs/01-requirements/00-index.md`
  - `docs/01-requirements/modules/06-admin-ops.md`
  - `docs/01-requirements/stories/epic-06-admin-ops.md`
  - `docs/01-requirements/advanced-edition/00-index.md`
  - `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`

## Scope

- Allowed: task state, plan, redacted evidence, audit, acceptance, localhost Browser smoke, existing `npm.cmd run dev` script.
- Blocked: source changes, unit/e2e spec changes, `.env*`, package or lockfile edits, schema/drizzle/migration/seed, DB connection/read/write, Provider call or credential read, mutation, publish, student-visible runtime, staging/prod/deploy/payment/external service, PR, force push, release readiness, final Pass.

## Route Correction

The queued task originally referenced `/admin/content/...`. The source route is under `src/app/(admin)/content/...`, where `(admin)` is a Next.js route group and is not part of the URL. The smoke target is therefore:

- `/content/ai-question-generation`
- `/content/ai-paper-generation`

This correction is limited to task state and evidence. No source file is changed.

## Execution Plan

1. Start the existing dev server script on `127.0.0.1:3000`.
2. Use the in-app Browser runtime against localhost only.
3. Visit the two content admin AI generation routes.
4. Record only redacted summary evidence: route reachable, final URL class, visible state category, and whether navigation produced blank page, runtime crash, or mutation risk.
5. Do not click submit/generation controls. Do not inspect tokens, credentials, raw Provider payload, prompt, generated output, DB rows, or screenshots.
6. Stop the local dev server after smoke collection.
7. Run scoped Prettier write/check, `git diff --check`, lint, typecheck, Module Run v2 pre-commit, project status, and pre-push readiness.

## Risk Controls

- Browser runtime is restricted to `http://127.0.0.1:3000`.
- Evidence is summary-only and redacted.
- If authentication, local data, or runtime setup blocks full surface validation, record `blocked` or `partial` evidence and do not repair product code in this task.
- If a source defect is observed, seed or recommend a separate scoped repair task rather than editing source here.
