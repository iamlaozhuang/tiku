# Task Plan: phase-11-mvp-content-ops-question-material-write-loop

## Task Claim

- Task id: `phase-11-mvp-content-ops-question-material-write-loop`
- Branch: `codex/phase-11-mvp-content-ops-question-material-write-loop`
- Phase: `phase-11-staging-release-planning`
- Human approval: user approved continuing the 16 MVP gap tasks with commit, merge, push, and safe cleanup. This task is limited to the local question/material write loop.

## Boundary

This task may modify local question/material API, service, contracts, admin UI, tests, task plan/evidence, and queue state only.

This task must not:

- change dependencies, `package.json`, or lockfiles;
- read or output `.env.local`;
- change secrets or env files;
- change schema, migration, or scripts;
- create cloud resources;
- deploy;
- connect to `staging` or `prod`;
- call external providers;
- record secrets, tokens, Authorization headers, raw provider payloads, raw prompts, raw answers, raw model responses, full paper/material/OCR text, generated plaintext `redeem_code` values, or private data.

If completing a requirement requires schema, migration, script, dependency, real upload storage, or major permission-model work, stop and record a blocked follow-up instead of bypassing the gate.

## Required Reading

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/04-agent-system/sop/mvp-queue-runner.md`
- `docs/04-agent-system/sop/repository-hygiene-closeout-checklist.md`
- `docs/01-requirements/modules/02-question-paper.md`
- `docs/01-requirements/modules/06-admin-ops.md`
- `docs/01-requirements/stories/epic-02-question-paper.md`
- `docs/05-execution-logs/audits-reviews/2026-05-24-phase-11-mvp-functional-completeness-gap-audit.md`
- `docs/05-execution-logs/evidence/2026-05-24-phase-11-mvp-queue-runner-mechanism-hardening.md`

## AC-to-Runtime Matrix

| Acceptance criterion                                                                                                             | Runtime surface                                           | Current state   | Implementation evidence                                             | Downstream effect                                    | Remaining gap                                                                                      | Decision                                                                          |
| -------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------- | --------------- | ------------------------------------------------------------------- | ---------------------------------------------------- | -------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| US-02-01 AC-1/4/5/6/7: create and edit questions with structured fields, material binding, objective answers, and scoring points | `/api/v1/questions`, `question-service`, admin UI         | partial_runtime | Add focused UI tests and reuse existing route/service tests         | Content ops can create and update local questions    | P1 for rich text image/table editor and full 16-field authoring if it requires editor/storage work | implement local structured form subset; defer storage/editor expansion if blocked |
| US-02-02 AC-1/2/3: disable and copy questions                                                                                    | `/api/v1/questions/{publicId}/disable`, `/copy`, admin UI | partial_runtime | UI tests prove actions call runtime and refresh list                | Content ops can manage local question lifecycle      | none for local runtime if UI closes                                                                | implement                                                                         |
| US-02-06 AC-1/2/3/4: create, edit, disable, copy materials and show references/lock state                                        | `/api/v1/materials`, `material-service`, admin UI         | partial_runtime | UI tests prove material write actions call runtime and refresh list | Content ops can maintain reusable materials          | P1 for real image/table/file storage if storage work is needed                                     | implement local structured form subset; defer storage expansion if blocked        |
| Admin ops audit rule: key content writes produce redacted audit_log                                                              | `content-question-material-runtime` route tests           | partial_runtime | Existing and updated route/service tests                            | Audit evidence exists for question/material mutation | none for current write actions                                                                     | verify                                                                            |

## TDD Plan

1. RED: add failing UI tests proving question/material action buttons are enabled for `content_admin`, open a local form, submit to the approved REST runtime, and refresh rows without exposing token or numeric ids.
2. GREEN: wire the existing admin UI action bar to local create/edit/disable/copy flows using existing API routes.
3. RED/GREEN as needed for material actions and locked edit messaging.
4. Verify existing service/route tests still cover permission and redacted audit behavior.
5. Record residual gaps honestly: no real image upload/storage, no schema/migration, no staging/prod, and no full paper publish propagation in this task.

## Allowed Files

- `src/app/api/v1/questions/**`
- `src/app/api/v1/materials/**`
- `src/features/admin/question-material-management/**`
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

- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-TaskClaimReadiness.ps1 -TaskId phase-11-mvp-content-ops-question-material-write-loop`
- `npm.cmd run test:unit -- --run tests/unit/admin-question-material-ui.test.ts tests/unit/phase-9-content-question-material-runtime.test.ts src/server/services/question-service.test.ts src/server/services/material-service.test.ts`
- `npm.cmd run test:unit`
- `npm.cmd run build`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-AgentSystemReadiness.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-NamingConventions.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`

## Risk Controls

- Use existing local REST routes and services; do not invent schema fields.
- Keep forms small and structured around current DTO/validator fields.
- Use `publicId` only in UI and tests; do not expose internal numeric ids.
- Keep audit evidence redacted; do not log token, prompt, answer, or raw content beyond bounded fixture snippets.
- Preserve loading, empty, unauthorized, error, and action feedback states.
