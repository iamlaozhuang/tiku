# 2026-07-06 Admin Route Observability Safe Error Fix Evidence

## Scope

- Task: `admin-route-observability-safe-error-fix-2026-07-06`
- Branch: `codex/admin-route-observability-fix-2026-07-06`
- Base: stacked on `codex/admin-content-route-observability-audit-2026-07-06`
- User approval: current user approved the independent fix branch, merge, push, and cleanup on 2026-07-06.
- Goal: keep admin AI generation route `409015` and no-persistence behavior while exposing a redacted safe rejection reason that the frontend can map to clearer business wording.
- Boundary: source/test/docs/state/evidence only; no dependency change; no schema/migration; no DB operation; no Provider call; no dev server/browser matrix; no staging/prod/deploy; no Cost Calibration.

## Read Gate

- Read `AGENTS.md`.
- Read `docs/04-agent-system/state/project-state.yaml`.
- Read `docs/04-agent-system/state/task-queue.yaml`.
- Read `docs/03-standards/code-taste-ten-commandments.md`.
- Read ADR files under `docs/02-architecture/adr/`.
- Read requirements indexes, advanced edition index, edition-aware authorization requirements, and ADR-007.
- Read AI generation traceability files dated 2026-07-02 and 2026-07-05.
- Read latest admin route observability root-cause evidence/audit.

## TDD / Root Cause Evidence

| Step                                                                                                                                                                  | Result                                                                            |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| Added failing route tests for `409015` safe rejection data on provider-disabled, missing credential, insufficient grounding, and unacceptable structured output paths | RED confirmed: existing route returned `data: null` for each path                 |
| Added failing UI test for mapped Provider-unavailable business wording                                                                                                | RED confirmed: UI displayed only the generic `409015` route message               |
| Implemented minimal fix                                                                                                                                               | GREEN: route returns mapped safe rejection reason, UI maps it to business wording |

Root cause retained from prior audit: runtimeBridge was resolved, but the acceptability gate returned a static `409015` response and discarded the safe failure context.

## Source Changes

| Area         | Change                                                                                                                                                                                                               |
| ------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Contract     | Added `AdminAiGenerationRejectedErrorDto` with `rejectionReason`, runtime bridge status booleans, `costCalibrationExecuted:false`, and `redactionStatus:redacted`.                                                   |
| Route        | Replaced static `409015` response with `createUnacceptableAdminAiGenerationResultResponse(runtimeBridge)`.                                                                                                           |
| Safe mapping | Mapped internal runtime bridge failures to safe reasons: provider execution unavailable, provider credential unavailable, grounding evidence insufficient, provider execution failed, generated output unacceptable. |
| Frontend     | Added a guarded formatter that only reads the safe rejected-error DTO and appends mapped business wording.                                                                                                           |
| Tests        | Updated route tests to assert safe rejection reason and unchanged no-persistence; added UI test to assert clearer message and no internal failure category leakage.                                                  |

## Validation

| Command                                                                                                                                                              | Result                       |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------- |
| `npm.cmd run test:unit -- src/server/services/admin-ai-generation-local-contract-route.test.ts src/features/admin/ai-generation/AdminAiGenerationEntryPage.test.tsx` | pass, 2 files / 33 tests     |
| `npm.cmd run typecheck`                                                                                                                                              | pass                         |
| `npm.cmd run lint`                                                                                                                                                   | pass                         |
| `npm.cmd run test:unit`                                                                                                                                              | pass, 333 files / 1665 tests |
| `npm.cmd run format:check`                                                                                                                                           | pass                         |
| `git diff --check`                                                                                                                                                   | pass                         |
| `Test-ModuleRunV2PreCommitHardening.ps1 -TaskId admin-route-observability-safe-error-fix-2026-07-06`                                                                 | pass                         |
| `Test-ModuleRunV2PrePushReadiness.ps1 -TaskId admin-route-observability-safe-error-fix-2026-07-06 -SkipRemoteAheadCheck`                                             | pass                         |

Note: an earlier parallel run of full unit and format check hit the local command timeout and was not used as pass evidence. Residual `vitest` / `prettier --check` processes from that timed-out attempt were terminated before the sequential passing reruns.

## Behavioral Result

- `409015` is preserved.
- Rejected admin AI generation still creates no task/result persistence in covered failure paths.
- Frontend can distinguish no-Provider / missing Provider credential from generic output rejection through a mapped safe reason.
- No Provider payload, prompt, raw AI output, complete material, complete question, complete paper, DB row, internal id, credential, env value, token, session, cookie, screenshot, DOM dump, or private fixture value is recorded.

## Non-Claims

- DB-backed runtime: not executed.
- Browser matrix: not executed.
- Provider-disabled runtime outside unit coverage: not executed.
- Provider-enabled sample: not executed.
- Release readiness: not claimed.
- Production usability: not claimed.
- Staging/prod/deploy: not executed; requires fresh approval.
- Cost Calibration: not executed; requires fresh approval.
