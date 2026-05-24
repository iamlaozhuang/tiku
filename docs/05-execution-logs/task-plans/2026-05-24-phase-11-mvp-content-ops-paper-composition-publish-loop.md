# Task Plan: phase-11-mvp-content-ops-paper-composition-publish-loop

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:test-driven-development for runtime changes and superpowers:verification-before-completion before commit/merge/push. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Close the local content ops paper draft/composition/publish loop enough for a content admin to create a draft paper, add a question snapshot, publish with validation, archive/copy, and bind paper_asset metadata through the approved local REST runtime.

**Architecture:** Keep the existing Next.js REST route-handler boundary and service layer from ADR-002. Reuse `paper-composition-lifecycle-runtime`, `paper-draft-service`, and `paper-asset-service`; this task should primarily wire the admin paper UI to existing local runtime paths and add focused tests. Do not add storage, schema, migration, dependency, script, staging/prod, or deployment work.

**Tech Stack:** Next.js App Router route handlers, React client UI, Vitest + Testing Library, existing TypeScript services/contracts.

---

## Task Claim

- Task id: `phase-11-mvp-content-ops-paper-composition-publish-loop`
- Branch: `codex/phase-11-mvp-content-ops-paper-composition-publish-loop`
- Phase: `phase-11-staging-release-planning`
- Human approval: user approved continuing the 16 MVP gap tasks with commit, merge, push, and safe branch cleanup. This task is limited to local paper draft/composition/publish/paper_asset metadata wiring.

## Boundary

This task may modify local paper/paper_asset API, service, contracts, admin paper UI, tests, task plan/evidence, and queue state only.

This task must not:

- change dependencies, `package.json`, or lockfiles;
- read or output `.env.local`;
- change secrets or env files;
- change schema, migration, or scripts;
- create cloud resources or object storage buckets;
- upload real files or create public object URLs;
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
- `docs/05-execution-logs/evidence/2026-05-24-phase-11-mvp-content-ops-question-material-write-loop.md`

## AC-to-Runtime Matrix

| Acceptance criterion                                                                                                                                | Runtime surface                                                                                | Current state   | Implementation evidence                                                                       | Downstream effect                                                              | Remaining gap                         | Decision                                                    |
| --------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- | --------------- | --------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ | ------------------------------------- | ----------------------------------------------------------- |
| US-02-07 AC-1/2/3/4/5: draft paper composition copies question snapshot, allows score/order/section adjustment, and keeps mother question immutable | `/api/v1/papers`, `/api/v1/papers/{publicId}/questions`, `paper-draft-service`, admin paper UI | partial_runtime | Add failing UI tests, reuse existing service/route tests                                      | Content ops can compose a local draft paper from existing questions            | Pending                               | implement local structured subset                           |
| US-02-08 AC-1/2/3/5/6/7/8: publish validation, publish lock/snapshot behavior                                                                       | `/api/v1/papers/{publicId}/publish`, `paper-draft-service`, admin paper UI                     | partial_runtime | UI tests plus existing route/service publish tests                                            | Content ops can publish valid local papers and see validation failure feedback | Pending                               | implement                                                   |
| US-02-09 AC-1/2/3/4: archive/delete constraints                                                                                                     | `/api/v1/papers/{publicId}/archive`, existing delete service, admin paper UI                   | partial_runtime | UI tests for archive; service tests for delete constraints                                    | Content ops can close published papers locally                                 | Pending                               | implement archive UI; defer delete UI if outside short loop |
| US-02-10 AC-1/2/3: copy published/archived paper to new draft                                                                                       | `/api/v1/papers/{publicId}/copy`, `paper-draft-service`, admin paper UI                        | partial_runtime | UI tests plus existing copy service tests                                                     | Content ops can create a new draft from prior paper                            | Pending                               | implement                                                   |
| US-02-11 AC-1/2/3/4: metadata and paper_asset binding                                                                                               | `/api/v1/paper-assets`, `paper-asset-service`, admin paper UI                                  | partial_runtime | UI tests for metadata binding with safe object key fixture; route/service tests for redaction | Content ops can bind local paper_asset metadata                                | P1 if real upload/storage is required | implement metadata-only binding; defer real storage         |
| Admin ops audit rule: key paper writes produce redacted audit_log                                                                                   | `paper-composition-lifecycle-runtime` route tests                                              | partial_runtime | Existing and updated route/service tests                                                      | audit_log evidence exists for paper mutation                                   | Pending                               | verify                                                      |

## TDD Plan

1. [ ] RED: add failing UI tests proving `content_admin` can create a draft paper through `/api/v1/papers`, add a question through `/api/v1/papers/{publicId}/questions`, publish, archive, copy, and bind paper_asset metadata without exposing token, object key, or numeric ids in the DOM.
2. [ ] GREEN: wire `AdminPaperManagementClient.tsx` action buttons and row actions to existing REST routes using local session token.
3. [ ] RED/GREEN: add validation-error feedback for publish failures and paper_asset create failures if not covered by the first test.
4. [ ] Verify existing service/route tests still cover permission denial, publish validation, copy constraints, paper_asset metadata redaction, and audit summaries.
5. [ ] Record residual gaps honestly: no real upload/storage, no schema/migration, no staging/prod, and no student propagation proof in this task.

## Allowed Files

- `src/app/api/v1/papers/**`
- `src/app/api/v1/paper-assets/**`
- `src/features/admin/paper-management/**`
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

- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-TaskClaimReadiness.ps1 -TaskId phase-11-mvp-content-ops-paper-composition-publish-loop`
- `npm.cmd run test:unit -- --run tests/unit/admin-paper-ui.test.ts tests/unit/phase-9-paper-composition-lifecycle-runtime.test.ts src/server/services/paper-draft-service.test.ts src/server/services/paper-asset-service.test.ts`
- `npm.cmd run test:unit`
- `npm.cmd run build`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-AgentSystemReadiness.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-NamingConventions.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`

## Risk Controls

- Use existing local REST routes and services; do not invent schema fields.
- Keep paper_asset binding metadata-only and use bounded dev object-key fixtures in tests; no real upload/storage calls.
- Use `publicId` only in UI and tests; do not expose internal numeric ids.
- Keep audit evidence redacted; do not log token, prompt, answer, raw content, object keys, or full paper text.
- Preserve loading, empty, unauthorized, error, and action feedback states.
